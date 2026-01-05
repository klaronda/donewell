import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'DoneWell Design Co <contact@donewellco.com>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface SendEmailRequest {
  email_draft_id: string
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
    // Validate API key
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { email_draft_id }: SendEmailRequest = await req.json()

    if (!email_draft_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: email_draft_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch email draft with lead information
    const { data: emailDraft, error: draftError } = await supabase
      .from('email_drafts')
      .select(`
        *,
        lead_id,
        lead_sites (
          company_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', email_draft_id)
      .single()

    if (draftError || !emailDraft) {
      return new Response(
        JSON.stringify({ error: 'Email draft not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if already sent
    if (emailDraft.status === 'sent') {
      return new Response(
        JSON.stringify({ error: 'Email already sent' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get lead information
    const lead = emailDraft.lead_sites
    if (!lead || !lead.email) {
      return new Response(
        JSON.stringify({ error: 'Lead email not found' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if email is suppressed
    const normalizedEmail = lead.email.toLowerCase().trim()
    const { data: suppressed, error: suppressionError } = await supabase
      .from('email_suppression')
      .select('id, reason, suppressed_at')
      .eq('email', normalizedEmail)
      .limit(1)
      .single()

    if (!suppressionError && suppressed) {
      // Update lead status to 'suppressed'
      if (emailDraft.lead_id) {
        await supabase
          .from('lead_sites')
          .update({ status: 'suppressed' })
          .eq('id', emailDraft.lead_id)
      }

      console.log(`🚫 Email not delivered - customer on suppression list: ${lead.email} (suppressed at: ${suppressed.suppressed_at}, reason: ${suppressed.reason || 'none'})`)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email is suppressed',
          message: 'This email address has been unsubscribed and will not receive emails',
          suppressed_at: suppressed.suppressed_at,
          suppression_reason: suppressed.reason
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

    // Use edited_body if available, otherwise use original body
    const emailBody = emailDraft.edited_body || emailDraft.body

    // Send email via Resend API
    console.log('📧 Sending email via Resend to:', lead.email)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: lead.email,
        bcc: 'contact@donewellco.com',
        subject: emailDraft.subject,
        html: emailBody, // HTML email with formatting
        // Add tags for tracking - these will be included in webhook events
        tags: [
          { name: 'lead_id', value: emailDraft.lead_id },
          { name: 'email_draft_id', value: email_draft_id },
          { name: 'campaign', value: 'audit-outreach' }
        ]
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.json()
      console.error('❌ Resend API error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: error
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const result = await emailResponse.json()
    console.log('✅ Email sent successfully:', result.id)

    // Update email draft status to 'sent', record sent_at timestamp, and store Resend message ID
    const { error: updateError } = await supabase
      .from('email_drafts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        resend_message_id: result.id // Store Resend's message ID for tracking
      })
      .eq('id', email_draft_id)

    if (updateError) {
      console.error('Warning: Failed to update email draft status:', updateError)
      // Don't fail the request if update fails - email was sent
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: result.id,
        email_draft_id: email_draft_id,
        sent_to: lead.email,
        sent_at: new Date().toISOString()
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



