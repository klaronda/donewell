import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check if we can process (business hours + under limit)
    const { data: canProcess, error: canProcessError } = await supabase
      .rpc('can_process_lead')

    if (canProcessError) {
      console.error('Error checking if can process:', canProcessError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check processing conditions',
          details: canProcessError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!canProcess) {
      console.log('⏸️ Cannot process: outside business hours or daily limit reached')
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Cannot process: outside business hours or daily limit reached',
          processed: false
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

    // Find next queue item ready to process
    // Status must be 'scheduled' and scheduled_send_at <= NOW()
    const { data: queueItems, error: queueError } = await supabase
      .from('lead_processing_queue')
      .select('id, lead_id, scheduled_send_at')
      .eq('status', 'scheduled')
      .lte('scheduled_send_at', new Date().toISOString())
      .order('scheduled_send_at', { ascending: true })
      .limit(1)

    if (queueError) {
      console.error('Error fetching queue items:', queueError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch queue items',
          details: queueError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('✅ No queue items ready to process')
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No queue items ready to process',
          processed: false
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

    const queueItem = queueItems[0]
    console.log('🔄 Processing queue item:', queueItem.id, 'for lead:', queueItem.lead_id)

    // Update status to 'processing'
    const { error: updateError } = await supabase
      .from('lead_processing_queue')
      .update({ status: 'processing' })
      .eq('id', queueItem.id)

    if (updateError) {
      console.error('Error updating queue status:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update queue status',
          details: updateError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    try {
      // Step 0: Check if lead has an audit, if not run one first
      const { data: lead, error: leadError } = await supabase
        .from('lead_sites')
        .select('id, website_url')
        .eq('id', queueItem.lead_id)
        .single()

      if (leadError || !lead) {
        throw new Error(`Lead not found: ${leadError?.message || 'Unknown error'}`)
      }

      const { data: existingAudit, error: auditCheckError } = await supabase
        .from('site_audits')
        .select('id')
        .eq('lead_id', queueItem.lead_id)
        .eq('is_latest', true)
        .single()

      if (auditCheckError && auditCheckError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is expected if no audit exists
        throw new Error(`Failed to check for audit: ${auditCheckError.message}`)
      }

      if (!existingAudit) {
        // No audit exists, run one first
        // Normalize URL - add https:// if missing
        let websiteUrl = lead.website_url || ''
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
          websiteUrl = 'https://' + websiteUrl
        }
        
        console.log('🔍 No audit found, running PageSpeed audit for:', websiteUrl)
        
        const auditResponse = await supabase.functions.invoke('run-pagespeed-audit', {
          body: { 
            url: websiteUrl,
            lead_id: queueItem.lead_id
          }
        })

        if (auditResponse.error) {
          throw new Error(`Failed to run audit: ${auditResponse.error.message}`)
        }

        const auditResult = auditResponse.data
        if (!auditResult || !auditResult.success) {
          throw new Error(`Audit failed: ${auditResult?.error || 'Unknown error'}`)
        }

        console.log('✅ Audit completed, scores:', auditResult.scores)
      } else {
        console.log('✅ Audit already exists for lead')
      }

      // Step 1: Generate email
      console.log('📧 Generating email for lead:', queueItem.lead_id)
      const generateEmailResponse = await supabase.functions.invoke('generate-email', {
        body: { lead_id: queueItem.lead_id }
      })

      if (generateEmailResponse.error) {
        throw new Error(`Failed to generate email: ${generateEmailResponse.error.message}`)
      }

      const generateResult = generateEmailResponse.data
      if (!generateResult || !generateResult.success) {
        throw new Error(`Email generation failed: ${generateResult?.error || 'Unknown error'}`)
      }

      const emailDraftId = generateResult.email_draft_id
      console.log('✅ Email generated, draft ID:', emailDraftId)

      // Step 2: Send email
      console.log('📤 Sending email, draft ID:', emailDraftId)
      const sendEmailResponse = await supabase.functions.invoke('send-audit-email', {
        body: { email_draft_id: emailDraftId }
      })

      if (sendEmailResponse.error) {
        throw new Error(`Failed to send email: ${sendEmailResponse.error.message}`)
      }

      const sendResult = sendEmailResponse.data
      if (!sendResult || !sendResult.success) {
        // Check if suppressed (this is not an error, just skip)
        if (sendResult?.error === 'Email is suppressed') {
          console.log('🚫 Email suppressed, marking as completed')
          await supabase
            .from('lead_processing_queue')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', queueItem.id)

          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Email suppressed',
              processed: true,
              suppressed: true
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
        throw new Error(`Email send failed: ${sendResult?.error || 'Unknown error'}`)
      }

      console.log('✅ Email sent successfully')

      // Step 3: Increment daily stats
      const { error: statsError } = await supabase
        .rpc('increment_daily_stats')

      if (statsError) {
        console.error('Warning: Failed to increment daily stats:', statsError)
        // Don't fail the request if stats update fails
      }

      // Step 4: Update queue item to completed
      await supabase
        .from('lead_processing_queue')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', queueItem.id)

      console.log('✅ Queue item processed successfully:', queueItem.id)

      return new Response(
        JSON.stringify({
          success: true,
          processed: true,
          queue_id: queueItem.id,
          lead_id: queueItem.lead_id,
          email_draft_id: emailDraftId,
          message_id: sendResult.message_id
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
      // Update queue item to failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Error processing queue item:', errorMessage)

      await supabase
        .from('lead_processing_queue')
        .update({ 
          status: 'failed',
          error_message: errorMessage,
          processed_at: new Date().toISOString()
        })
        .eq('id', queueItem.id)

      return new Response(
        JSON.stringify({ 
          error: 'Failed to process queue item',
          details: errorMessage,
          queue_id: queueItem.id
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
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

