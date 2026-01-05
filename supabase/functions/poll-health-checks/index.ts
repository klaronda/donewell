import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * DoneWell Essentials - Health Check Polling Engine
 * POST /functions/v1/poll-health-checks
 * 
 * Called by pg_cron every 5 minutes.
 * Polls all enabled health checks and records results.
 * Triggers severity classification when failures detected.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface HealthCheck {
  id: string
  site_id: string
  check_type: string
  target: string
  timeout_ms: number
  expected_status: number
  site: {
    id: string
    site_id: string
    site_name: string
    primary_domain: string
    status: string
  }
}

function createAbortController(timeoutMs: number): { controller: AbortController; clear: () => void } {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return { controller, clear: () => clearTimeout(timeoutId) }
}

async function executeCheck(check: HealthCheck): Promise<{
  result: 'ok' | 'warn' | 'fail'
  latency_ms: number
  http_status: number | null
  error_message: string | null
  raw_payload: Record<string, unknown> | null
}> {
  const startTime = Date.now()
  const { controller, clear } = createAbortController(check.timeout_ms)
  
  try {
    // Build the full URL
    let url = check.target
    if (!url.startsWith('http')) {
      url = `${check.site.primary_domain}${check.target}`
    }

    // Form checks need POST with test payload
    const fetchOptions: RequestInit = { signal: controller.signal }
    if (check.check_type === 'form') {
      fetchOptions.method = 'POST'
      fetchOptions.headers = { 'Content-Type': 'application/json' }
      fetchOptions.body = JSON.stringify({
        first_name: 'DoneWell',
        last_name: 'Monitor',
        email: 'monitor@donewell.co',
        message: 'Automated health check'
      })
    }
    
    const response = await fetch(url, fetchOptions)
    clear()
    const latency = Date.now() - startTime
    
    // For health endpoints, parse the JSON response
    let rawPayload: Record<string, unknown> | null = null
    let result: 'ok' | 'warn' | 'fail' = 'ok'

    if (check.check_type === 'health_api' || check.check_type === 'cms') {
      try {
        rawPayload = await response.json()
        
        // Check the status field in the response
        if (rawPayload && typeof rawPayload === 'object') {
          const status = (rawPayload as Record<string, unknown>).status
          if (status === 'error') {
            result = 'fail'
          } else if (status === 'degraded') {
            result = 'warn'
          }
        }
      } catch {
        // JSON parse failed, check HTTP status
        if (!response.ok) {
          result = 'fail'
        }
      }
    } else {
      // For uptime checks, just check HTTP status
      if (!response.ok) {
        result = 'fail'
      } else if (response.status !== check.expected_status) {
        result = 'warn'
      }
    }

    // Override if HTTP status is bad
    if (response.status >= 500) {
      result = 'fail'
    } else if (response.status >= 400) {
      result = 'warn'
    }

    return {
      result,
      latency_ms: latency,
      http_status: response.status,
      error_message: null,
      raw_payload: rawPayload
    }

  } catch (error) {
    clear()
    const latency = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Timeout or network error = fail
    return {
      result: 'fail',
      latency_ms: latency,
      http_status: null,
      error_message: errorMessage,
      raw_payload: null
    }
  }
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const results: Array<{ check_id: string; site_name: string; result: string }> = []

  try {
    // Get all enabled health checks for active sites
    const { data: checks, error: checksError } = await supabase
      .from('health_checks')
      .select(`
        id,
        site_id,
        check_type,
        target,
        timeout_ms,
        expected_status,
        site:monitored_sites!inner(
          id,
          site_id,
          site_name,
          primary_domain,
          status
        )
      `)
      .eq('enabled', true)
      .eq('site.status', 'active')

    if (checksError) {
      console.error('Failed to fetch health checks:', checksError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch health checks', details: checksError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!checks || checks.length === 0) {
      console.log('No health checks to run')
      return new Response(
        JSON.stringify({ success: true, message: 'No health checks configured', checks_run: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Running ${checks.length} health checks...`)

    // Execute all checks in parallel (with reasonable concurrency)
    const checkPromises = (checks as unknown as HealthCheck[]).map(async (check) => {
      const checkResult = await executeCheck(check)
      
      // Record the health event
      const { data: event, error: eventError } = await supabase
        .from('health_events')
        .insert({
          site_id: check.site.id,
          check_id: check.id,
          check_type: check.check_type,
          result: checkResult.result,
          latency_ms: checkResult.latency_ms,
          http_status: checkResult.http_status,
          error_message: checkResult.error_message,
          raw_payload: checkResult.raw_payload
        })
        .select()
        .single()

      if (eventError) {
        console.error(`Failed to record event for ${check.site.site_name}:`, eventError)
      }

      // If failure, call classify-severity
      if (checkResult.result === 'fail' && event) {
        try {
          const classifyUrl = `${SUPABASE_URL}/functions/v1/classify-severity`
          await fetch(classifyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              site_id: check.site.id,
              check_type: check.check_type,
              event_id: event.id
            })
          })
        } catch (classifyError) {
          console.error('Failed to call classify-severity:', classifyError)
        }
      }

      results.push({
        check_id: check.id,
        site_name: check.site.site_name,
        result: checkResult.result
      })

      const emoji = checkResult.result === 'ok' ? '✅' : checkResult.result === 'warn' ? '⚠️' : '❌'
      console.log(`${emoji} ${check.site.site_name} [${check.check_type}]: ${checkResult.result} (${checkResult.latency_ms}ms)`)
    })

    await Promise.all(checkPromises)

    const failCount = results.filter(r => r.result === 'fail').length
    const warnCount = results.filter(r => r.result === 'warn').length
    const okCount = results.filter(r => r.result === 'ok').length

    console.log(`📊 Polling complete: ${okCount} ok, ${warnCount} warn, ${failCount} fail`)

    return new Response(
      JSON.stringify({
        success: true,
        checks_run: results.length,
        summary: { ok: okCount, warn: warnCount, fail: failCount },
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ poll-health-checks error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

