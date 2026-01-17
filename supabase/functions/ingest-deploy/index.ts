import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * DoneWell Essentials - Deploy Ingestion Endpoint
 * POST /functions/v1/ingest-deploy
 * 
 * Receives deploy webhooks from monitored sites.
 * Updates last_deploy_at to suppress alerts during deploy window.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface DeployPayload {
  site_id: string
  deploy_id: string
  environment: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-secret',
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
    const payload: DeployPayload = await req.json()

    // Validate required fields
    if (!payload.site_id || !payload.deploy_id || !payload.environment) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['site_id', 'deploy_id', 'environment']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find the monitored site by site_id
    const { data: site, error: siteError } = await supabase
      .from('monitored_sites')
      .select('id, site_name, status')
      .eq('site_id', payload.site_id)
      .single()

    if (siteError || !site) {
      console.error('Site not found:', payload.site_id)
      return new Response(
        JSON.stringify({ error: 'Site not found', site_id: payload.site_id }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (site.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Site is not active', status: site.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date().toISOString()

    // Update last_deploy_at on the site (for alert suppression)
    const { error: updateError } = await supabase
      .from('monitored_sites')
      .update({ last_deploy_at: now })
      .eq('id', site.id)

    if (updateError) {
      console.error('Failed to update last_deploy_at:', updateError)
    }

    // Insert deploy event
    const { data: deployEvent, error: insertError } = await supabase
      .from('deploy_events')
      .insert({
        site_id: site.id,
        deploy_id: payload.deploy_id,
        environment: payload.environment,
        metadata: payload.metadata || {},
        created_at: payload.timestamp || now
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert deploy event:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to record deploy event', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Deploy recorded for ${site.site_name}: ${payload.deploy_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deploy event recorded',
        deploy_event_id: deployEvent.id,
        suppression_active: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ingest-deploy error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})



