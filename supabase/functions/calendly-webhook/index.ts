import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CALENDLY_WEBHOOK_SECRET = Deno.env.get('CALENDLY_WEBHOOK_SECRET')
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'DoneWell <onboarding@resend.dev>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// Discovery call event type slug (from URL: calendly.com/contact-donewellco/discovery-call)
const DISCOVERY_CALL_SLUG = Deno.env.get('CALENDLY_DISCOVERY_CALL_SLUG') || 'discovery-call'

interface CalendlyWebhookPayload {
  event: string
  created_at: string
  payload: {
    event_uri?: string
    event?: {
      uri: string
      name: string
      start_time: string
      end_time: string
      event_type?: string
    }
    invitee?: {
      uri: string
      name: string
      email: string
      scheduled_event?: {
        uri: string
        start_time: string
        end_time: string
        event_type?: string
      }
    }
  }
}

interface PrepEmailData {
  firstName: string
  lastName: string
  email: string
  scheduledTime?: string
  eventUri?: string
}

// Verify Calendly webhook signature
// Calendly sends signature in format: t=<timestamp>,v1=<signature>
// Payload to sign: {timestamp}.{request_body}
async function verifyWebhookSignature(
  body: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!CALENDLY_WEBHOOK_SECRET) {
    console.error('CALENDLY_WEBHOOK_SECRET is not set')
    return false
  }
  
  if (!signatureHeader) {
    console.error('Signature header is missing')
    return false
  }

  try {
    // Parse signature header: t=<timestamp>,v1=<signature>
    const parts = signatureHeader.split(',')
    if (parts.length !== 2) {
      console.error('Invalid signature header format - expected 2 parts, got:', parts.length)
      console.error('Header value:', signatureHeader.substring(0, 50))
      return false
    }

    const timestampMatch = parts[0].match(/t=(\d+)/)
    const signatureMatch = parts[1].match(/v1=([a-f0-9]+)/)

    if (!timestampMatch || !signatureMatch) {
      console.error('Could not parse signature header parts')
      console.error('Part 0:', parts[0])
      console.error('Part 1:', parts[1]?.substring(0, 20))
      return false
    }

    const timestamp = timestampMatch[1]
    const receivedSignature = signatureMatch[1]

    // Check timestamp tolerance (5 minutes = 300 seconds)
    const currentTime = Math.floor(Date.now() / 1000)
    const requestTime = parseInt(timestamp, 10)
    const tolerance = 300 // 5 minutes
    const timeDiff = Math.abs(currentTime - requestTime)

    if (timeDiff > tolerance) {
      console.error(`Webhook timestamp outside tolerance window. Current: ${currentTime}, Request: ${requestTime}, Diff: ${timeDiff}s`)
      return false
    }

    // Construct payload: {timestamp}.{request_body}
    const payload = `${timestamp}.${body}`

    // Compute HMAC SHA256 signature
    const encoder = new TextEncoder()
    const keyData = encoder.encode(CALENDLY_WEBHOOK_SECRET)
    const payloadData = encoder.encode(payload)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, payloadData)
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Constant-time comparison
    if (receivedSignature.length !== computedSignature.length) {
      console.error(`Signature length mismatch. Received: ${receivedSignature.length}, Computed: ${computedSignature.length}`)
      return false
    }

    let match = true
    for (let i = 0; i < receivedSignature.length; i++) {
      if (receivedSignature[i] !== computedSignature[i]) {
        match = false
      }
    }

    if (!match) {
      console.error('Signature mismatch. First 20 chars - Received:', receivedSignature.substring(0, 20), 'Computed:', computedSignature.substring(0, 20))
    }

    return match
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Parse name into first and last name
function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  return { firstName, lastName }
}

// Format scheduled time for display
function formatScheduledTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return isoString
  }
}

// Get prep email template
function getPrepEmailTemplate(data: PrepEmailData): { subject: string; html: string } {
  const { firstName, lastName, scheduledTime, eventUri } = data
  const scheduledTimeText = scheduledTime ? formatScheduledTime(scheduledTime) : 'your scheduled time'

  return {
    subject: 'Your Discovery session is booked — DoneWell',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Discovery session is booked — DoneWell</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #faf8f5; line-height: 1.6;">
    
    <!-- Email Container -->
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #faf8f5;">
        <tr>
            <td style="padding: 40px 20px;">
                
                <!-- Main Content Card -->
                <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 34px 40px 34px; text-align: left; background-color: #1B4D2E;">
                            <img src="https://udiskjjuszutgpvkogzw.supabase.co/storage/v1/object/public/site-assets/Assets/Logo_wh.png" alt="DoneWell" style="height: 32px; display: block;">
                        </td>
                    </tr>
                    
                    <!-- Confirmation Section -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <h1 style="margin: 0 0 12px; padding-top: 24px; font-size: 32px; font-weight: 600; color: #292524; line-height: 1.2;">Your Discovery session is booked</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; color: #57534e; line-height: 1.5;">We're looking forward to talking with you. You'll receive a calendar invite shortly with all the details.</p>
                            <p style="margin: 0; font-size: 14px; color: #78716c;">If you need to reschedule, just use the link in your calendar invite.</p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <div style="border-top: 1px solid #e7e5e4;"></div>
                        </td>
                    </tr>
                    
                    <!-- Prep Questions Section -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #292524;">A few questions to help us make the most of our time</h2>
                            <p style="margin: 0 0 24px; font-size: 14px; color: #57534e; line-height: 1.5;">You don't need perfect answers — short, gut-reaction responses are more than enough.<br>Just reply directly to this email.</p>
                            
                            <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px;">
                                <ol style="margin: 0; padding-left: 20px; color: #292524;">
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">In one sentence, what is this website for?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(For example: generate leads, explain a service, sell a product, build trust.)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Who is this site primarily for?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">Your main customer or audience — the group this needs to work for most.</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">When someone lands on your site, what should they understand in the first 5 seconds?</strong>
                                    </li>
                                    
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">What is the single most important action you want visitors to take?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(Booking a call, contacting you, buying something, etc.)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Are there any websites you like (inside or outside your industry)?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">What do you like about them?</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">What should people <em>not</em> feel when they visit your site?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(For example: confused, overwhelmed, unsure, skeptical.)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Do you already have anything we should work from or build around?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">This could include a logo, brand colors, an existing website, written copy, photos, or other assets — or nothing at all.</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 0; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Is there anything you already know you <em>don't</em> want?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">Features, styles, layouts, or directions you want to avoid.</span>
                                    </li>
                                </ol>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <div style="border-top: 1px solid #e7e5e4;"></div>
                        </td>
                    </tr>
                    
                    <!-- What Happens Next -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #292524;">What happens next</h2>
                            <p style="margin: 0 0 12px; font-size: 15px; color: #57534e; line-height: 1.6;">We'll use the Discovery call to align on goals, define scope, and talk through what makes sense for an initial MVP.</p>
                            <p style="margin: 0 0 16px; font-size: 15px; color: #57534e; line-height: 1.6;">After the call, you'll receive:</p>
                            <ul style="margin: 0 0 12px; padding-left: 20px; color: #57534e;">
                                <li style="margin-bottom: 8px; font-size: 15px; line-height: 1.6;">A clear written roadmap</li>
                                <li style="margin-bottom: 8px; font-size: 15px; line-height: 1.6;">A recommended approach</li>
                                <li style="margin-bottom: 0; font-size: 15px; line-height: 1.6;">A final quote (usually within 24 hours)</li>
                            </ul>
                            <p style="margin: 0; font-size: 15px; color: #57534e; line-height: 1.6;">No pressure and no sales pitch — just clarity so you can decide what's right for you.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #1B4D2E; border-top: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; opacity: 0.9;">DoneWell Design Co</div>
                                        <p style="margin: 0 0 8px; font-size: 14px; color: #ffffff; opacity: 0.9;">Professional websites designed, built, and launched with care.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="width: 33.33%; vertical-align: top;">
                                                    <p style="margin: 0 0 8px; font-size: 12px; color: #ffffff; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Navigation</p>
                                                    <p style="margin: 0 0 4px;"><a href="https://donewellco.com" style="color: #ffffff; text-decoration: none; font-size: 14px; opacity: 0.9;">Home</a></p>
                                                    <p style="margin: 0 0 4px;"><a href="https://donewellco.com/work" style="color: #ffffff; text-decoration: none; font-size: 14px; opacity: 0.9;">Work</a></p>
                                                    <p style="margin: 0;"><a href="https://donewellco.com/about" style="color: #ffffff; text-decoration: none; font-size: 14px; opacity: 0.9;">About</a></p>
                                                </td>
                                                <td style="width: 33.33%; vertical-align: top;">
                                                    <p style="margin: 0 0 8px; font-size: 12px; color: #ffffff; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Connect</p>
                                                    <p style="margin: 0;"><a href="mailto:contact@donewellco.com" style="color: #ffffff; text-decoration: none; font-size: 14px; opacity: 0.9;">contact@donewellco.com</a></p>
                                                </td>
                                                <td style="width: 33.33%; vertical-align: top;">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #ffffff; opacity: 0.7;">
                                            © ${new Date().getFullYear()} DoneWell Design Co. All rights reserved.
                                        </p>
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
    `,
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, calendly-webhook-signature',
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
    // Check for required environment variables
    // Note: CALENDLY_WEBHOOK_SECRET is optional - signature verification only happens if both
    // the secret is configured AND Calendly sends a signature header
    if (!CALENDLY_WEBHOOK_SECRET) {
      console.warn('CALENDLY_WEBHOOK_SECRET is not configured - signature verification disabled')
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get webhook signature from header (Calendly uses Calendly-Webhook-Signature)
    // Check all possible header name variations (case-insensitive)
    let signatureHeader: string | null = null
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() === 'calendly-webhook-signature') {
        signatureHeader = value
        break
      }
    }

    // Read request body
    const body = await req.text()

    // Log webhook receipt
    console.log('📩 Webhook received from Calendly')

    // Signature verification (optional - only verify if header is present)
    // Calendly webhooks created via UI don't support signing keys
    if (signatureHeader && CALENDLY_WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(body, signatureHeader)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      console.log('✅ Webhook signature verified')
    } else {
      // No signature - still process (Calendly UI webhooks don't support signing)
      console.log('ℹ️ Processing webhook without signature verification')
    }

    // Parse webhook payload
    const payload: CalendlyWebhookPayload = JSON.parse(body)

    // Only handle invitee.created events
    if (payload.event !== 'invitee.created') {
      console.log(`Ignoring event type: ${payload.event}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract invitee data
    // Calendly webhook structure: payload.payload contains the invitee data directly
    // (not nested under payload.payload.invitee)
    const inviteeData = payload.payload
    if (!inviteeData || !inviteeData.email || !inviteeData.name) {
      console.error('Missing required invitee data:', JSON.stringify(payload.payload, null, 2))
      return new Response(
        JSON.stringify({ error: 'Missing required invitee data' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const { firstName, lastName } = parseName(inviteeData.name)
    const email = inviteeData.email.toLowerCase().trim()
    const eventUri = inviteeData.scheduled_event?.uri || inviteeData.event || null
    const scheduledTime = inviteeData.scheduled_event?.start_time || null

    // Filter: Only process Discovery Call events (discovery-call)
    // Check event name and event type URI to determine if this is a Discovery call
    const eventName = inviteeData.scheduled_event?.name || ''
    const eventTypeUri = inviteeData.scheduled_event?.event_type || null
    
    // Check if this is the Discovery call event type
    // Discovery call URL: https://calendly.com/contact-donewellco/discovery-call
    // We check:
    // 1. Event type URI contains the discovery-call slug
    // 2. Event name contains "discovery" (case-insensitive)
    const isDiscoveryCall = 
      (eventTypeUri && eventTypeUri.includes(DISCOVERY_CALL_SLUG)) ||
      eventName.toLowerCase().includes('discovery')

    if (!isDiscoveryCall) {
      console.log(`Ignoring non-Discovery call event. Event name: "${eventName}", Event type URI: ${eventTypeUri || 'not provided'}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Event ignored - not a Discovery call',
          event_name: eventName,
          event_type_uri: eventTypeUri || null
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get invitee URI for idempotency check (unique per booking)
    const inviteeUri = inviteeData.uri || null
    
    console.log(`Processing Discovery Call booking: ${email} (${firstName} ${lastName})`)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Idempotency check: If this exact event was already processed, skip
    // We check if a lead exists with this specific calendly_event_uri
    if (eventUri) {
      const { data: alreadyProcessed } = await supabase
        .from('leads')
        .select('id, calendly_event_uri')
        .eq('calendly_event_uri', eventUri)
        .maybeSingle()
      
      if (alreadyProcessed) {
        console.log(`⏭️ Already processed this booking (event: ${eventUri}), skipping duplicate`)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Already processed',
            lead_id: alreadyProcessed.id
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Find existing lead by email (case-insensitive)
    const { data: existingLead, error: findError } = await supabase
      .from('leads')
      .select('*')
      .ilike('email', email)
      .maybeSingle()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine, other errors are not
      console.error('Error finding lead:', findError)
      return new Response(
        JSON.stringify({ error: 'Database error', details: findError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    let leadId: string

    if (existingLead) {
      // Check if this lead already has a calendly event (idempotency for existing leads)
      if (existingLead.calendly_event_uri === eventUri) {
        console.log(`⏭️ Lead already has this event, skipping duplicate`)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Already processed',
            lead_id: existingLead.id
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      
      // Update existing lead
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({
          booked_consult: true,
          calendly_event_uri: eventUri,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating lead:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update lead', details: updateError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      leadId = updatedLead.id
      console.log(`Updated existing lead: ${leadId}`)
    } else {
      // Create new lead
      const { data: newLead, error: createError } = await supabase
        .from('leads')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          booked_consult: true,
          calendly_event_uri: eventUri,
          message: '',
          business_name: null,
          website: null,
          phone: null,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating lead:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create lead', details: createError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      leadId = newLead.id
      console.log(`Created new lead: ${leadId}`)
    }

    // Prepare email data
    const emailData: PrepEmailData = {
      firstName,
      lastName,
      email,
      scheduledTime,
      eventUri: eventUri || undefined,
    }

    // Get email template
    const { subject, html } = getPrepEmailTemplate(emailData)

    // Send prep email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: email,
        bcc: 'contact@donewellco.com',
        subject,
        html,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.json()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to send prep email',
          details: error,
          lead_id: leadId,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log(`Prep email sent successfully: ${emailResult.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        email_sent: true,
        message_id: emailResult.id,
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
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
