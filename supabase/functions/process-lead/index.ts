import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ProcessLeadRequest {
  lead_id: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Parse request body
    const { lead_id }: ProcessLeadRequest = await req.json()

    if (!lead_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: lead_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('lead_sites')
      .select('id, status')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Use atomic enqueue function (calculates time AND inserts in one transaction)
    // This prevents race conditions when multiple leads are queued simultaneously
    const { data: enqueueResult, error: enqueueError } = await supabase
      .rpc('enqueue_lead', { p_lead_id: lead_id })

    if (enqueueError) {
      console.error('Error enqueuing lead:', enqueueError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to enqueue lead',
          details: enqueueError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // RPC returns array, get first row
    const queueItem = enqueueResult?.[0]

    if (!queueItem) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to enqueue lead',
          details: 'No result returned'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (queueItem.already_queued) {
      console.log('ℹ️ Lead already in queue:', queueItem.queue_id)
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Lead already in queue',
          queue_id: queueItem.queue_id,
          scheduled_send_at: queueItem.scheduled_send_at
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    console.log('✅ Lead added to processing queue:', queueItem.queue_id, 'scheduled for:', queueItem.scheduled_send_at)

    return new Response(
      JSON.stringify({
        success: true,
        queue_id: queueItem.queue_id,
        lead_id: lead_id,
        scheduled_send_at: queueItem.scheduled_send_at,
        status: 'scheduled'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('❌ Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

