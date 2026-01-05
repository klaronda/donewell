import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * DoneWell Essentials - Error Log Ingestion Endpoint
 * POST /functions/v1/ingest-error
 * 
 * Receives error logs pushed from monitored sites.
 * Requires X-Site-Secret header for authentication.
 * Can trigger SEV-2 incidents immediately.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ErrorPayload {
  site_id: string
  severity: 'sev-1' | 'sev-2' | 'sev-3'
  type: string
  message: string
  path?: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-secret, x-donewell-secret',
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
    const payload: ErrorPayload = await req.json()
    const providedSecret = req.headers.get('x-site-secret') || req.headers.get('x-donewell-secret')

    // Validate required fields
    if (!payload.site_id || !payload.severity || !payload.type || !payload.message) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['site_id', 'severity', 'type', 'message']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate severity
    const validSeverities = ['sev-1', 'sev-2', 'sev-3']
    if (!validSeverities.includes(payload.severity)) {
      return new Response(
        JSON.stringify({ error: 'Invalid severity. Must be: sev-1, sev-2, sev-3' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find the monitored site by site_id
    const { data: site, error: siteError } = await supabase
      .from('monitored_sites')
      .select('id, site_name, status, site_secret')
      .eq('site_id', payload.site_id)
      .single()

    if (siteError || !site) {
      console.error('Site not found:', payload.site_id)
      return new Response(
        JSON.stringify({ error: 'Site not found', site_id: payload.site_id }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate site secret if configured
    if (site.site_secret && site.site_secret !== providedSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (site.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Site is not active', status: site.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date().toISOString()

    // Insert error log
    const { data: errorLog, error: insertError } = await supabase
      .from('error_logs')
      .insert({
        site_id: site.id,
        severity: payload.severity,
        error_type: payload.type,
        message: payload.message,
        path: payload.path || null,
        metadata: payload.metadata || {},
        processed: false,
        created_at: payload.timestamp || now
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert error log:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to record error', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`⚠️ Error logged for ${site.site_name}: [${payload.severity}] ${payload.type}`)

    // For SEV-1 or SEV-2, check if we should create an incident
    let incidentCreated = false
    let incidentId: string | null = null

    if (payload.severity === 'sev-1' || payload.severity === 'sev-2') {
      // Check for existing open incident of same type
      const { data: existingIncident } = await supabase
        .from('incidents')
        .select('id')
        .eq('site_id', site.id)
        .eq('status', 'open')
        .eq('trigger_check_type', 'health_api')
        .single()

      if (!existingIncident) {
        // Create new incident
        const { data: incident, error: incidentError } = await supabase
          .from('incidents')
          .insert({
            site_id: site.id,
            severity: payload.severity,
            status: 'open',
            title: `${payload.severity.toUpperCase()}: ${payload.type}`,
            description: payload.message,
            trigger_check_type: 'health_api',
            trigger_event_ids: [],
            opened_at: now
          })
          .select()
          .single()

        if (!incidentError && incident) {
          incidentCreated = true
          incidentId = incident.id

          // Link error log to incident
          await supabase
            .from('error_logs')
            .update({ processed: true, incident_id: incident.id })
            .eq('id', errorLog.id)

          console.log(`🚨 Incident created for ${site.site_name}: ${incident.id}`)
        }
      } else {
        // Link to existing incident
        incidentId = existingIncident.id
        await supabase
          .from('error_logs')
          .update({ processed: true, incident_id: existingIncident.id })
          .eq('id', errorLog.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Error logged',
        error_log_id: errorLog.id,
        incident_created: incidentCreated,
        incident_id: incidentId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ingest-error error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

