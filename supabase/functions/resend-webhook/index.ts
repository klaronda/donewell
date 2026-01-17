import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Resend webhook event types
type ResendEventType = 
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.opened'
  | 'email.clicked'
  | 'email.bounced'
  | 'email.complained'

interface ResendWebhookEvent {
  type: ResendEventType
  created_at: string
  data: {
    id?: string  // Resend uses 'id' as the message ID
    email_id?: string  // Some webhooks may use 'email_id'
    from: string
    to: string | string[]  // Can be string or array
    subject: string
    created_at: string
    tags?: Record<string, string>
    // Additional fields for specific events
    click?: {
      link: string
      timestamp: string
    }
    bounce?: {
      message: string
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
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
    // Parse the webhook payload
    const event: ResendWebhookEvent = await req.json()

    // Resend uses 'id' as the message ID (or 'email_id' in some cases)
    // Handle both formats for compatibility
    const messageId = event.data.id || event.data.email_id

    if (!messageId) {
      console.error('❌ Webhook missing message ID:', JSON.stringify(event))
      return new Response(
        JSON.stringify({ error: 'Missing message ID in webhook payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('📨 Received Resend webhook:', event.type, 'for email:', messageId)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Extract tags from the event
    const tags = event.data.tags || {}
    const leadId = tags.lead_id || null
    const emailDraftId = tags.email_draft_id || null

    // If we don't have the email_draft_id from tags, try to find it by resend_message_id
    let resolvedEmailDraftId = emailDraftId
    if (!resolvedEmailDraftId && messageId) {
      const { data: emailDraft } = await supabase
        .from('email_drafts')
        .select('id')
        .eq('resend_message_id', messageId)
        .single()
      
      if (emailDraft) {
        resolvedEmailDraftId = emailDraft.id
      }
    }

    // Store the event in email_events table
    const { data: insertedEvent, error: insertError } = await supabase
      .from('email_events')
      .insert({
        resend_message_id: messageId,
        email_draft_id: resolvedEmailDraftId,
        lead_id: leadId,
        event_type: event.type,
        event_data: event
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error storing email event:', insertError)
      // Don't fail the webhook - Resend will retry
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to store event',
          details: insertError.message
        }),
        {
          status: 200, // Return 200 to prevent Resend from retrying
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('✅ Email event stored:', insertedEvent.id)

    // Handle bounces and complaints - add to suppression list
    if (event.type === 'email.bounced' || event.type === 'email.complained') {
      // Handle 'to' field as either string or array
      const toField = event.data.to
      const recipientEmail = typeof toField === 'string' 
        ? toField.toLowerCase().trim()
        : Array.isArray(toField) 
          ? toField[0]?.toLowerCase().trim()
          : null
      
      if (recipientEmail) {
        const reason = event.type === 'email.bounced' 
          ? `Bounced: ${event.data.bounce?.message || 'Unknown reason'}`
          : 'Spam complaint'

        // Check if already suppressed
        const { data: existingSuppression } = await supabase
          .from('email_suppression')
          .select('id')
          .eq('email', recipientEmail)
          .single()

        if (!existingSuppression) {
          const { error: suppressionError } = await supabase
            .from('email_suppression')
            .insert({
              email: recipientEmail,
              reason: reason,
              suppressed_at: new Date().toISOString()
            })

          if (suppressionError) {
            console.error('⚠️ Failed to add to suppression list:', suppressionError)
          } else {
            console.log('🚫 Added to suppression list:', recipientEmail, '-', reason)
          }

          // Also update the lead status to 'suppressed' if we have the lead_id
          if (leadId) {
            await supabase
              .from('lead_sites')
              .update({ status: 'suppressed' })
              .eq('id', leadId)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: insertedEvent.id,
        event_type: event.type
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
    console.error('❌ Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 200, // Return 200 to prevent Resend from retrying on parse errors
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

