import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * DoneWell Essentials - Monthly Report Generator
 * POST /functions/v1/generate-monthly-report
 * 
 * Generates and sends monthly status reports for all subscribed sites.
 * Called by pg_cron on the 1st of each month.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'DoneWell <reports@resend.dev>'

interface Site {
  id: string
  site_id: string
  site_name: string
  primary_domain: string
  subscription_tier: string
  client_email: string | null
  internal_email: string
}

interface ReportData {
  site: Site
  uptime_percentage: number
  total_incidents: number
  sev1_count: number
  sev2_count: number
  sev3_count: number
  status: 'all_clear' | 'attention' | 'action_needed'
  summary_bullets: string[]
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
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
      return { success: false, error: JSON.stringify(error) }
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function getMonthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function generateReportEmail(report: ReportData, monthName: string): { subject: string; html: string } {
  const statusColors = {
    all_clear: '#16a34a',
    attention: '#f59e0b',
    action_needed: '#dc2626'
  }
  const statusLabels = {
    all_clear: 'All Clear',
    attention: 'Needs Attention',
    action_needed: 'Action Needed'
  }
  const statusEmojis = {
    all_clear: '✓',
    attention: '⚠',
    action_needed: '!'
  }

  const color = statusColors[report.status]
  const label = statusLabels[report.status]
  const emoji = statusEmojis[report.status]

  const bulletsHtml = report.summary_bullets
    .map(bullet => `<li style="margin-bottom: 8px; color: #374151; line-height: 1.6;">${bullet}</li>`)
    .join('')

  return {
    subject: `${monthName} Website Report - ${report.site.site_name}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Website Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background-color: #1B4D2E;">
              <img src="https://udiskjjuszutgpvkogzw.supabase.co/storage/v1/object/public/site-assets/Assets/Logo_wh.png" alt="DoneWell" style="height: 32px; display: block;">
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding: 32px 32px 0;">
              <h1 style="margin: 0 0 8px; font-size: 28px; color: #292524; font-weight: 600;">
                ${monthName} Report
              </h1>
              <p style="margin: 0; font-size: 16px; color: #78716c;">
                Website health summary for ${report.site.site_name}
              </p>
            </td>
          </tr>
          
          <!-- Status Badge -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="display: inline-block; background-color: ${color}; color: white; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: 600;">
                ${emoji} ${label}
              </div>
            </td>
          </tr>
          
          <!-- Stats Grid -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px 0 0 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #1B4D2E;">${report.uptime_percentage.toFixed(1)}%</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Uptime</div>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb;">
                    <div style="font-size: 32px; font-weight: 700; color: #292524;">${report.total_incidents}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Incidents</div>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb;">
                    <div style="font-size: 32px; font-weight: 700; color: ${report.sev1_count > 0 ? '#dc2626' : '#292524'};">${report.sev1_count}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Critical</div>
                  </td>
                  <td style="width: 25%; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 32px; font-weight: 700; color: ${report.sev2_count > 0 ? '#f59e0b' : '#292524'};">${report.sev2_count}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Degraded</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Summary Bullets -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #292524; font-weight: 600;">Summary</h2>
              <ul style="margin: 0; padding-left: 20px;">
                ${bulletsHtml}
              </ul>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #57534e;">
                  Questions about your website's health?
                </p>
                <a href="mailto:contact@donewellco.com" style="display: inline-block; background-color: #1B4D2E; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 500;">
                  Contact Us
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #1B4D2E; border-top: 1px solid rgba(255,255,255,0.1);">
              <table style="width: 100%;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #ffffff; opacity: 0.9;">DoneWell Design Co</p>
                    <p style="margin: 0; font-size: 12px; color: #ffffff; opacity: 0.7;">Essentials Monitoring</p>
                  </td>
                  <td style="text-align: right;">
                    <a href="https://donewellco.com" style="color: #ffffff; text-decoration: none; font-size: 12px; opacity: 0.7;">donewellco.com</a>
                  </td>
                </tr>
              </table>
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Calculate the previous month's date range
    const now = new Date()
    const reportMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const monthName = getMonthName(reportMonth)

    console.log(`📊 Generating reports for ${monthName}`)

    // Get all active, subscribed sites
    const { data: sites, error: sitesError } = await supabase
      .from('monitored_sites')
      .select('id, site_id, site_name, primary_domain, subscription_tier, client_email, internal_email')
      .eq('status', 'active')
      .in('subscription_tier', ['essentials', 'care'])

    if (sitesError) {
      console.error('Failed to fetch sites:', sitesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sites', details: sitesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!sites || sites.length === 0) {
      console.log('No subscribed sites found')
      return new Response(
        JSON.stringify({ success: true, message: 'No subscribed sites', reports_generated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const reports: Array<{ site_name: string; status: string; sent: boolean }> = []

    for (const site of sites as Site[]) {
      console.log(`📈 Processing ${site.site_name}...`)

      // Get health events for the month
      const { data: events } = await supabase
        .from('health_events')
        .select('result, check_type, created_at')
        .eq('site_id', site.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      // Get incidents for the month
      const { data: incidents } = await supabase
        .from('incidents')
        .select('severity, status, opened_at, resolved_at')
        .eq('site_id', site.id)
        .gte('opened_at', monthStart.toISOString())
        .lte('opened_at', monthEnd.toISOString())

      // Calculate metrics
      const totalChecks = events?.length || 0
      const failedChecks = events?.filter(e => e.result === 'fail').length || 0
      const uptime = totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks) * 100 : 100

      const sev1Count = incidents?.filter(i => i.severity === 'sev-1').length || 0
      const sev2Count = incidents?.filter(i => i.severity === 'sev-2').length || 0
      const sev3Count = incidents?.filter(i => i.severity === 'sev-3').length || 0
      const totalIncidents = (incidents?.length || 0)

      // Determine status
      let status: 'all_clear' | 'attention' | 'action_needed' = 'all_clear'
      if (sev1Count > 0 || uptime < 95) {
        status = 'action_needed'
      } else if (sev2Count > 0 || uptime < 99) {
        status = 'attention'
      }

      // Generate summary bullets
      const bullets: string[] = []
      
      if (uptime >= 99.9) {
        bullets.push('Your website maintained excellent uptime this month.')
      } else if (uptime >= 99) {
        bullets.push(`Your website was available ${uptime.toFixed(1)}% of the time.`)
      } else {
        bullets.push(`Uptime was ${uptime.toFixed(1)}% - below our target of 99.9%.`)
      }

      if (totalIncidents === 0) {
        bullets.push('No incidents were detected.')
      } else {
        bullets.push(`${totalIncidents} incident${totalIncidents > 1 ? 's were' : ' was'} detected and resolved.`)
      }

      if (sev1Count > 0) {
        bullets.push(`${sev1Count} critical issue${sev1Count > 1 ? 's' : ''} required immediate attention.`)
      }

      if (sev2Count > 0) {
        bullets.push(`${sev2Count} minor issue${sev2Count > 1 ? 's' : ''} affected site performance.`)
      }

      bullets.push('Monitoring continues 24/7. We\'ll alert you if anything needs attention.')

      const reportData: ReportData = {
        site,
        uptime_percentage: uptime,
        total_incidents: totalIncidents,
        sev1_count: sev1Count,
        sev2_count: sev2Count,
        sev3_count: sev3Count,
        status,
        summary_bullets: bullets
      }

      // Store report in database
      await supabase.from('monthly_reports').upsert({
        site_id: site.id,
        report_month: reportMonth.toISOString().split('T')[0],
        uptime_percentage: uptime,
        total_incidents: totalIncidents,
        sev1_count: sev1Count,
        sev2_count: sev2Count,
        sev3_count: sev3Count,
        status,
        summary_bullets: bullets
      }, { onConflict: 'site_id,report_month' })

      // Send email
      const recipientEmail = site.client_email || site.internal_email
      const { subject, html } = generateReportEmail(reportData, monthName)
      const emailResult = await sendEmail(recipientEmail, subject, html)

      if (emailResult.success) {
        await supabase
          .from('monthly_reports')
          .update({ sent_at: new Date().toISOString(), recipient_email: recipientEmail })
          .eq('site_id', site.id)
          .eq('report_month', reportMonth.toISOString().split('T')[0])
      }

      reports.push({
        site_name: site.site_name,
        status,
        sent: emailResult.success
      })

      console.log(`✅ ${site.site_name}: ${status} (email ${emailResult.success ? 'sent' : 'failed'})`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        month: monthName,
        reports_generated: reports.length,
        reports
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ generate-monthly-report error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

