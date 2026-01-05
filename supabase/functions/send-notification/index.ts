import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * DoneWell Essentials - Notification Sender
 * POST /functions/v1/send-notification
 * 
 * Sends notifications based on incident severity and subscription tier.
 * Gates client notifications by tier (Essentials vs Care).
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'DoneWell Monitoring <monitoring@resend.dev>'

interface NotifyRequest {
  incident_id: string
  site_id: string
  severity: 'sev-1' | 'sev-2' | 'sev-3'
  is_new: boolean
  is_resolved?: boolean
}

interface Site {
  id: string
  site_id: string
  site_name: string
  primary_domain: string
  subscription_tier: 'none' | 'essentials' | 'care'
  client_email: string | null
  internal_email: string
}

interface Incident {
  id: string
  severity: string
  status: string
  title: string
  description: string
  opened_at: string
  resolved_at: string | null
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return { success: false, error: JSON.stringify(error) }
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function getInternalAlertEmail(incident: Incident, site: Site): { subject: string; html: string } {
  const severityColors: Record<string, string> = {
    'sev-1': '#dc2626',
    'sev-2': '#f59e0b',
    'sev-3': '#3b82f6'
  }
  const color = severityColors[incident.severity] || '#6b7280'

  return {
    subject: `🚨 ${incident.severity.toUpperCase()}: ${site.site_name} - ${incident.title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Incident Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px; background-color: ${color}; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${incident.severity.toUpperCase()} Incident
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #1f2937;">${incident.title}</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Site:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <a href="${site.primary_domain}" style="color: #1B4D2E;">${site.site_name}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Severity:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="display: inline-block; padding: 2px 8px; background-color: ${color}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      ${incident.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Status:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    ${incident.status}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Opened:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    ${new Date(incident.opened_at).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Tier:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    ${site.subscription_tier}
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #f9fafb; border-left: 4px solid ${color}; padding: 16px; border-radius: 4px;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">${incident.description}</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                DoneWell Essentials Monitoring
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

function getClientAlertEmail(incident: Incident, site: Site): { subject: string; html: string } {
  return {
    subject: `Website Issue Detected - ${site.site_name}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Website Issue</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background-color: #1B4D2E; text-align: left;">
              <img src="https://udiskjjuszutgpvkogzw.supabase.co/storage/v1/object/public/site-assets/Assets/Logo_wh.png" alt="DoneWell" style="height: 32px;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; color: #292524;">We detected an issue with your website</h1>
              
              <p style="margin: 0 0 24px; font-size: 16px; color: #57534e; line-height: 1.6;">
                Our monitoring system detected a potential issue with <strong>${site.site_name}</strong>. 
                Our team has been notified and is looking into it.
              </p>
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Issue:</strong> ${incident.title}
                </p>
              </div>
              
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #292524;">What's happening?</h2>
              <p style="margin: 0 0 24px; font-size: 15px; color: #57534e; line-height: 1.6;">
                ${incident.description}
              </p>
              
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #292524;">What we're doing</h2>
              <p style="margin: 0 0 24px; font-size: 15px; color: #57534e; line-height: 1.6;">
                We're investigating the issue and will update you when it's resolved. 
                No action is needed from you at this time.
              </p>
              
              <p style="margin: 0; font-size: 14px; color: #78716c;">
                If you have questions, just reply to this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f5f5f4; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-align: center;">
                This is an automated message from DoneWell Essentials monitoring.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

function getResolutionEmail(incident: Incident, site: Site, isClient: boolean): { subject: string; html: string } {
  const subject = isClient 
    ? `Issue Resolved - ${site.site_name}`
    : `✅ RESOLVED: ${site.site_name} - ${incident.title}`

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Issue Resolved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0fdf4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background-color: #16a34a; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Issue Resolved ✓</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #292524;">${incident.title}</h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; color: #57534e; line-height: 1.6;">
                The issue affecting <strong>${site.site_name}</strong> has been resolved. 
                Your website is back to normal operation.
              </p>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Opened:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    ${new Date(incident.opened_at).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #6b7280;">Resolved:</strong>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    ${incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'Just now'}
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 14px; color: #78716c;">
                No further action is needed. We'll continue monitoring your site.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f5f5f4; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #78716c; text-align: center;">
                DoneWell Essentials Monitoring
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

serve(async (req) => {
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
    const payload: NotifyRequest = await req.json()

    if (!payload.incident_id || !payload.site_id || !payload.severity) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: incident_id, site_id, severity' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get site info
    const { data: site, error: siteError } = await supabase
      .from('monitored_sites')
      .select('id, site_id, site_name, primary_domain, subscription_tier, client_email, internal_email')
      .eq('id', payload.site_id)
      .single()

    if (siteError || !site) {
      return new Response(
        JSON.stringify({ error: 'Site not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get incident info
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('id, severity, status, title, description, opened_at, resolved_at')
      .eq('id', payload.incident_id)
      .single()

    if (incidentError || !incident) {
      return new Response(
        JSON.stringify({ error: 'Incident not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notifications: Array<{ recipient: string; channel: string; success: boolean }> = []

    // Always notify internal for new incidents
    if (payload.is_new && !payload.is_resolved) {
      const { subject, html } = getInternalAlertEmail(incident as Incident, site as Site)
      const result = await sendEmail(site.internal_email, subject, html)
      
      // Record notification
      await supabase.from('notifications').insert({
        incident_id: incident.id,
        site_id: site.id,
        recipient: 'internal',
        channel: 'email',
        recipient_address: site.internal_email,
        subject,
        body: html,
        delivered: result.success,
        delivery_error: result.error || null
      })

      notifications.push({ recipient: 'internal', channel: 'email', success: result.success })
      console.log(`📧 Internal notification: ${result.success ? 'sent' : 'failed'}`)
    }

    // Resolution notifications
    if (payload.is_resolved) {
      // Internal resolution
      const internalEmail = getResolutionEmail(incident as Incident, site as Site, false)
      const internalResult = await sendEmail(site.internal_email, internalEmail.subject, internalEmail.html)
      
      await supabase.from('notifications').insert({
        incident_id: incident.id,
        site_id: site.id,
        recipient: 'internal',
        channel: 'email',
        recipient_address: site.internal_email,
        subject: internalEmail.subject,
        body: internalEmail.html,
        delivered: internalResult.success,
        delivery_error: internalResult.error || null
      })

      notifications.push({ recipient: 'internal', channel: 'email', success: internalResult.success })

      // Client resolution (Care tier only)
      if (site.subscription_tier === 'care' && site.client_email) {
        const clientEmail = getResolutionEmail(incident as Incident, site as Site, true)
        const clientResult = await sendEmail(site.client_email, clientEmail.subject, clientEmail.html)
        
        await supabase.from('notifications').insert({
          incident_id: incident.id,
          site_id: site.id,
          recipient: 'client',
          channel: 'email',
          recipient_address: site.client_email,
          subject: clientEmail.subject,
          body: clientEmail.html,
          delivered: clientResult.success,
          delivery_error: clientResult.error || null
        })

        notifications.push({ recipient: 'client', channel: 'email', success: clientResult.success })
      }
    }

    // Client notifications for new incidents (tier-gated)
    if (payload.is_new && !payload.is_resolved && site.client_email) {
      const shouldNotifyClient = 
        // Care tier: immediate notification for SEV-1 and SEV-2
        (site.subscription_tier === 'care' && (payload.severity === 'sev-1' || payload.severity === 'sev-2')) ||
        // Essentials tier: only SEV-1 (thresholded - handled by caller)
        (site.subscription_tier === 'essentials' && payload.severity === 'sev-1')

      if (shouldNotifyClient) {
        const { subject, html } = getClientAlertEmail(incident as Incident, site as Site)
        const result = await sendEmail(site.client_email, subject, html)
        
        await supabase.from('notifications').insert({
          incident_id: incident.id,
          site_id: site.id,
          recipient: 'client',
          channel: 'email',
          recipient_address: site.client_email,
          subject,
          body: html,
          delivered: result.success,
          delivery_error: result.error || null
        })

        notifications.push({ recipient: 'client', channel: 'email', success: result.success })
        console.log(`📧 Client notification: ${result.success ? 'sent' : 'failed'}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        notifications
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ send-notification error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

