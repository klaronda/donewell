import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ProcessLeadRequest {
  lead_id: string
}

interface StepResult {
  success: boolean
  error?: string
  data?: any
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

    // Validate lead exists
    const { data: lead, error: leadError } = await supabase
      .from('lead_sites')
      .select('id, website_url, status, email')
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

    // Check if email is suppressed - skip entire process if suppressed
    if (lead.email) {
      const normalizedEmail = lead.email.toLowerCase().trim()
      const { data: suppressed, error: suppressionError } = await supabase
        .from('email_suppression')
        .select('id, reason, suppressed_at')
        .eq('email', normalizedEmail)
        .limit(1)
        .single()

      if (!suppressionError && suppressed) {
        // Update lead status to 'suppressed'
        await supabase
          .from('lead_sites')
          .update({ status: 'suppressed' })
          .eq('id', lead_id)

        console.log(`🚫 Email not delivered - customer on suppression list: ${lead.email} (suppressed at: ${suppressed.suppressed_at}, reason: ${suppressed.reason || 'none'})`)
        
        return new Response(
          JSON.stringify({ 
            success: false,
            lead_id: lead_id,
            error: 'Email is suppressed',
            message: 'This email address has been unsubscribed and will not receive emails',
            suppressed_at: suppressed.suppressed_at,
            suppression_reason: suppressed.reason,
            steps: {
              audit: { success: false, skipped: true, reason: 'Email suppressed - customer on suppression list' },
              insights: { success: false, skipped: true, reason: 'Email suppressed - customer on suppression list' },
              email: { success: false, skipped: true, reason: 'Email suppressed - customer on suppression list' },
              send: { success: false, skipped: true, reason: 'Email suppressed - customer on suppression list' },
            }
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
    }

    const results: {
      audit: StepResult
      insights: StepResult
      email: StepResult
      send: StepResult
    } = {
      audit: { success: false },
      insights: { success: false },
      email: { success: false },
      send: { success: false },
    }

    const baseUrl = SUPABASE_URL.replace('/rest/v1', '')
    // Headers for functions that require JWT verification (run-pagespeed-audit)
    const authHeaders = {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    }
    // Headers for internal functions with JWT verification disabled
    // (generate-insights, generate-email, send-audit-email)
    // Note: Some Supabase setups still require an Authorization header even when JWT is disabled
    // Using service role key as a workaround
    const internalHeaders = {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    }

    // Step 1: Run PageSpeed Audit
    console.log('Step 1: Running PageSpeed audit for lead:', lead_id)
    try {
      const auditResponse = await fetch(`${baseUrl}/functions/v1/run-pagespeed-audit`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          url: lead.website_url,
          lead_id: lead_id,
        }),
      })

      const auditData = await auditResponse.json()

      if (!auditResponse.ok || !auditData.success) {
        results.audit = {
          success: false,
          error: auditData.error || 'Audit failed',
        }
        return new Response(
          JSON.stringify({
            success: false,
            lead_id: lead_id,
            error: 'Audit step failed',
            steps: results,
          }),
          {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      }

      results.audit = {
        success: true,
        data: {
          audit_id: auditData.audit_id,
          scores: auditData.scores,
        },
      }

      const auditId = auditData.audit_id
      console.log('✅ Audit completed:', auditId)

      // Step 2: Generate Insights
      console.log('Step 2: Generating insights for audit:', auditId)
      try {
        const insightsResponse = await fetch(`${baseUrl}/functions/v1/generate-insights`, {
          method: 'POST',
          headers: internalHeaders,
          body: JSON.stringify({
            audit_id: auditId,
          }),
        })

        const insightsData = await insightsResponse.json()

        if (!insightsResponse.ok || !insightsData.success) {
          // Non-critical: log warning but continue
          const errorMsg = insightsData.error || insightsData.details || `HTTP ${insightsResponse.status}: ${insightsResponse.statusText}`
          console.warn('⚠️ Insights generation failed:', errorMsg)
          results.insights = {
            success: false,
            error: errorMsg,
          }
        } else {
          results.insights = {
            success: true,
            data: {
              insights: insightsData.insights,
            },
          }
          console.log('✅ Insights generated')
        }
      } catch (insightsError) {
        console.warn('⚠️ Insights generation error:', insightsError)
        results.insights = {
          success: false,
          error: insightsError instanceof Error ? insightsError.message : 'Unknown error',
        }
      }

      // Step 3: Generate Email
      console.log('Step 3: Generating email for lead:', lead_id)
      try {
        const emailResponse = await fetch(`${baseUrl}/functions/v1/generate-email`, {
          method: 'POST',
          headers: internalHeaders,
          body: JSON.stringify({
            lead_id: lead_id,
          }),
        })

        const emailData = await emailResponse.json()

        if (!emailResponse.ok || !emailData.success) {
          results.email = {
            success: false,
            error: emailData.error || 'Email generation failed',
          }
          return new Response(
            JSON.stringify({
              success: false,
              lead_id: lead_id,
              error: 'Email generation step failed',
              steps: results,
            }),
            {
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }

        results.email = {
          success: true,
          data: {
            email_draft_id: emailData.email_draft_id,
            subject: emailData.subject,
          },
        }

        const emailDraftId = emailData.email_draft_id
        console.log('✅ Email generated:', emailDraftId)

        // Step 4: Send Email
        console.log('Step 4: Sending email:', emailDraftId)
        try {
          const sendResponse = await fetch(`${baseUrl}/functions/v1/send-audit-email`, {
            method: 'POST',
            headers: internalHeaders,
            body: JSON.stringify({
              email_draft_id: emailDraftId,
            }),
          })

          const sendData = await sendResponse.json()

          if (!sendResponse.ok || !sendData.success) {
            // Non-critical: log error but keep email as draft
            console.error('❌ Email send failed:', sendData.error)
            results.send = {
              success: false,
              error: sendData.error || 'Email send failed',
            }
          } else {
            results.send = {
              success: true,
              data: {
                message_id: sendData.message_id,
                sent_to: sendData.sent_to,
                sent_at: sendData.sent_at,
              },
            }
            console.log('✅ Email sent successfully')
          }
        } catch (sendError) {
          console.error('❌ Email send error:', sendError)
          results.send = {
            success: false,
            error: sendError instanceof Error ? sendError.message : 'Unknown error',
          }
        }
      } catch (emailError) {
        console.error('❌ Email generation error:', emailError)
        results.email = {
          success: false,
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        }
        return new Response(
          JSON.stringify({
            success: false,
            lead_id: lead_id,
            error: 'Email generation step failed',
            steps: results,
          }),
          {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      }
    } catch (auditError) {
      console.error('❌ Audit error:', auditError)
      results.audit = {
        success: false,
        error: auditError instanceof Error ? auditError.message : 'Unknown error',
      }
      return new Response(
        JSON.stringify({
          success: false,
          lead_id: lead_id,
          error: 'Audit step failed',
          steps: results,
        }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Determine overall success
    const overallSuccess = results.audit.success && results.email.success

    return new Response(
      JSON.stringify({
        success: overallSuccess,
        lead_id: lead_id,
        steps: results,
        message: overallSuccess
          ? 'Workflow completed successfully'
          : 'Workflow completed with some errors (check steps for details)',
      }),
      {
        status: overallSuccess ? 200 : 207, // 207 = Multi-Status (partial success)
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('❌ Orchestrator error:', error)
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

