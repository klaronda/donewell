import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * DoneWell Essentials - Severity Classifier
 * POST /functions/v1/classify-severity
 * 
 * Called when a health check fails.
 * Determines severity (SEV-1, SEV-2, SEV-3) based on:
 * - Check type
 * - Consecutive failure count
 * - Deploy suppression window
 * 
 * Creates incidents and triggers notifications.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ClassifyRequest {
  site_id: string
  check_type: string
  event_id: string
}

// SEV-1 triggers (Critical)
const SEV1_CHECK_TYPES = ['uptime', 'health_api', 'ssl']

// SEV-2 triggers (Degraded)  
const SEV2_CHECK_TYPES = ['cms', 'form']

// SEV-3 triggers (Informational)
const SEV3_CHECK_TYPES = ['seo']

// Consecutive failures needed to trigger incident
const FAILURE_THRESHOLD = 2

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

  try {
    const payload: ClassifyRequest = await req.json()

    if (!payload.site_id || !payload.check_type || !payload.event_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: site_id, check_type, event_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get site info
    const { data: site, error: siteError } = await supabase
      .from('monitored_sites')
      .select('id, site_id, site_name, subscription_tier, last_deploy_at, deploy_suppression_minutes')
      .eq('id', payload.site_id)
      .single()

    if (siteError || !site) {
      console.error('Site not found:', payload.site_id)
      return new Response(
        JSON.stringify({ error: 'Site not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if in deploy suppression window
    const isInSuppression = site.last_deploy_at && 
      new Date() < new Date(new Date(site.last_deploy_at).getTime() + site.deploy_suppression_minutes * 60 * 1000)

    if (isInSuppression) {
      console.log(`⏸️ ${site.site_name}: In deploy suppression window, skipping incident creation`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          suppressed: true, 
          reason: 'Deploy suppression window active' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get consecutive failure count
    const { data: recentEvents } = await supabase
      .from('health_events')
      .select('result')
      .eq('site_id', payload.site_id)
      .eq('check_type', payload.check_type)
      .order('created_at', { ascending: false })
      .limit(5)

    let consecutiveFailures = 0
    if (recentEvents) {
      for (const event of recentEvents) {
        if (event.result === 'fail') {
          consecutiveFailures++
        } else {
          break
        }
      }
    }

    console.log(`🔢 ${site.site_name} [${payload.check_type}]: ${consecutiveFailures} consecutive failures`)

    // Not enough failures to trigger incident
    if (consecutiveFailures < FAILURE_THRESHOLD) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          incident_created: false,
          reason: `Only ${consecutiveFailures} consecutive failures (threshold: ${FAILURE_THRESHOLD})`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine severity
    let severity: 'sev-1' | 'sev-2' | 'sev-3'
    if (SEV1_CHECK_TYPES.includes(payload.check_type)) {
      severity = 'sev-1'
    } else if (SEV2_CHECK_TYPES.includes(payload.check_type)) {
      severity = 'sev-2'
    } else {
      severity = 'sev-3'
    }

    // Check for existing open incident of same type
    const { data: existingIncident } = await supabase
      .from('incidents')
      .select('id, trigger_event_ids')
      .eq('site_id', payload.site_id)
      .eq('status', 'open')
      .eq('trigger_check_type', payload.check_type)
      .single()

    const now = new Date().toISOString()
    let incidentId: string

    if (existingIncident) {
      // Update existing incident with new event
      const updatedEventIds = [...(existingIncident.trigger_event_ids || []), payload.event_id]
      
      await supabase
        .from('incidents')
        .update({ 
          trigger_event_ids: updatedEventIds,
          updated_at: now
        })
        .eq('id', existingIncident.id)

      incidentId = existingIncident.id
      console.log(`📎 Added event to existing incident: ${incidentId}`)

    } else {
      // Create new incident
      const title = generateIncidentTitle(payload.check_type, severity)
      const description = generateIncidentDescription(payload.check_type, site.site_name, consecutiveFailures)

      const { data: newIncident, error: incidentError } = await supabase
        .from('incidents')
        .insert({
          site_id: payload.site_id,
          severity,
          status: 'open',
          title,
          description,
          trigger_check_type: payload.check_type,
          trigger_event_ids: [payload.event_id],
          opened_at: now
        })
        .select()
        .single()

      if (incidentError || !newIncident) {
        console.error('Failed to create incident:', incidentError)
        return new Response(
          JSON.stringify({ error: 'Failed to create incident', details: incidentError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      incidentId = newIncident.id
      console.log(`🚨 Created ${severity} incident for ${site.site_name}: ${incidentId}`)

      // Trigger notification
      try {
        const notifyUrl = `${SUPABASE_URL}/functions/v1/send-notification`
        await fetch(notifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            incident_id: incidentId,
            site_id: payload.site_id,
            severity,
            is_new: true
          })
        })
      } catch (notifyError) {
        console.error('Failed to call send-notification:', notifyError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        incident_created: !existingIncident,
        incident_id: incidentId,
        severity,
        consecutive_failures: consecutiveFailures
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ classify-severity error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateIncidentTitle(checkType: string, severity: string): string {
  const titles: Record<string, string> = {
    uptime: 'Site Unreachable',
    health_api: 'Health API Failing',
    ssl: 'SSL Certificate Issue',
    cms: 'CMS Health Degraded',
    form: 'Form Submission Failing',
    seo: 'SEO Issue Detected'
  }
  return `${severity.toUpperCase()}: ${titles[checkType] || 'Health Check Failing'}`
}

function generateIncidentDescription(checkType: string, siteName: string, failures: number): string {
  const descriptions: Record<string, string> = {
    uptime: `${siteName} is not responding to requests.`,
    health_api: `The /api/health endpoint is returning errors.`,
    ssl: `SSL certificate validation failed.`,
    cms: `The CMS health check is failing. Content may not be loading.`,
    form: `Form submission test is failing. Lead capture may be broken.`,
    seo: `SEO-related issues detected (robots.txt, sitemap, etc).`
  }
  return `${descriptions[checkType] || 'A health check is failing.'} (${failures} consecutive failures)`
}



