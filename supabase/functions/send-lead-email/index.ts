import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'DoneWell <onboarding@resend.dev>'

interface LeadEmailData {
  to: string
  firstName: string
  lastName: string
  businessName?: string
  message?: string
  bookedConsult: boolean
}

function getEmailTemplate(data: LeadEmailData): { subject: string; html: string } {
  const { firstName, lastName, businessName, message, bookedConsult } = data
  const businessText = businessName ? ` at ${businessName}` : ''

  if (bookedConsult) {
    // Email for booked_consult=true
    return {
      subject: 'Your consult is booked — DoneWell',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your consult is booked — DoneWell</title>
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
                        <td style="padding: 40px 40px 32px; text-align: center; background-color: #1B4D2E;">
                            <div style="font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em;">DoneWell</div>
                        </td>
                    </tr>
                    
                    <!-- Confirmation Section -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 600; color: #292524; line-height: 1.2;">Your consult is booked</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; color: #57534e; line-height: 1.5;">We're looking forward to talking with you. You'll receive a calendar invite shortly with all the details.</p>
                            <p style="margin: 0; font-size: 14px; color: #78716c;">If you need to reschedule, just use the link in your calendar invite.</p>
                        </td>
                    </tr>
                    
                    <!-- What You Shared -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #292524;">Here's what we have so far</h2>
                            <div style="background-color: #fafaf9; border-left: 3px solid #1B4D2E; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #78716c; font-weight: 500;">Name</p>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #292524;">${firstName} ${lastName}</p>
                                
                                ${businessName ? `
                                <p style="margin: 0 0 12px; font-size: 14px; color: #78716c; font-weight: 500;">Business</p>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #292524;">${businessName}</p>
                                ` : ''}
                                ${message ? `
                                <p style="margin: 0 0 12px; font-size: 14px; color: #78716c; font-weight: 500;">What you're looking to accomplish</p>
                                <p style="margin: 0; font-size: 16px; color: #292524; line-height: 1.6;">${message}</p>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Pre-Call Questions -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #292524;">These questions help us make the most of our time together</h2>
                            <p style="margin: 0 0 24px; font-size: 14px; color: #57534e; line-height: 1.5;">You can keep your answers brief — just enough context so we can jump right into what matters on the call.</p>
                            
                            <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px;">
                                <ol style="margin: 0; padding-left: 20px; color: #292524;">
                                    <li style="margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">What are you hoping to accomplish?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(New website, rebuild, app idea, consulting, roadmap clarity, etc.)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Who is this for?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(Your audience or customer — who needs this to work?)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">What's your ideal timeline?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(Is there a deadline or event driving this?)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Do you have anything already built?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(Website, prototype, platform, CMS, no-code tool, etc.)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">Are you open to improving or changing your current setup?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(Migration, rebuild, or starting fresh)</span>
                                    </li>
                                    
                                    <li style="margin-bottom: 0; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #292524;">What does "done well" mean to you for this project?</strong><br>
                                        <span style="font-size: 14px; color: #78716c;">(Expectations, quality bar, outcomes)</span>
                                    </li>
                                </ol>
                            </div>
                            
                            <p style="margin: 16px 0 0; font-size: 14px; color: #57534e; font-style: italic;">Just reply directly to this email with your thoughts — no need to be formal.</p>
                        </td>
                    </tr>
                    
                    <!-- What Happens Next -->
                    <tr>
                        <td style="padding: 32px 40px 40px; background-color: #fafaf9; border-top: 1px solid #e7e5e4;">
                            <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #292524;">What happens next</h2>
                            <p style="margin: 0 0 12px; font-size: 15px; color: #57534e; line-height: 1.6;">We'll use the call to understand your needs and clarify the scope. After we talk, you'll get a recommended approach and a clear quote — usually within 24 hours.</p>
                            <p style="margin: 0; font-size: 15px; color: #57534e; line-height: 1.6;">No pressure, no sales pitch. Just clarity so you can make an informed decision.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #1B4D2E; border-top: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; opacity: 0.9;">DoneWell</div>
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
                                                    <p style="margin: 0;"><a href="mailto:hello@donewellco.com" style="color: #ffffff; text-decoration: none; font-size: 14px; opacity: 0.9;">hello@donewellco.com</a></p>
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
                                            © ${new Date().getFullYear()} DoneWell. All rights reserved.
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
  } else {
    // Email for booked_consult=false
    return {
      subject: 'Thanks for reaching out — DoneWell',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanks for reaching out — DoneWell</title>
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
                        <td style="padding: 40px 40px 32px; text-align: center; background-color: #ffffff;">
                            <div style="font-size: 28px; font-weight: 600; color: #1B4D2E; letter-spacing: -0.02em;">DoneWell</div>
                        </td>
                    </tr>
                    
                    <!-- Thank You Section -->
                    <tr>
                        <td style="padding: 0 40px 24px;">
                            <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 600; color: #292524; line-height: 1.2;">Thanks for reaching out</h1>
                            <p style="margin: 0 0 12px; font-size: 16px; color: #57534e; line-height: 1.5;">We appreciate you taking the time to share what you're working on. We'll reply within 24 hours.</p>
                            <p style="margin: 0; font-size: 15px; color: #78716c; line-height: 1.5;">Whether you're ready to talk or just exploring, you're in the right place.</p>
                        </td>
                    </tr>
                    
                    <!-- Brand Promise -->
                    <tr>
                        <td style="padding: 24px 40px 32px;">
                            <p style="margin: 0; font-size: 18px; color: #1B4D2E; font-weight: 500; line-height: 1.4; text-align: center;">Thoughtful planning. Clear execution. Built to last.</p>
                        </td>
                    </tr>
                    
                    <!-- What You Sent Us -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #292524;">What you sent us</h2>
                            <div style="background-color: #fafaf9; border-left: 3px solid #1B4D2E; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #78716c; font-weight: 500;">Name</p>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #292524;">${firstName} ${lastName}</p>
                                
                                ${businessName ? `
                                <p style="margin: 0 0 12px; font-size: 14px; color: #78716c; font-weight: 500;">Business</p>
                                <p style="margin: 0 0 20px; font-size: 16px; color: #292524;">${businessName}</p>
                                ` : ''}
                                
                                ${message ? `
                                <p style="margin: 0 0 12px; font-size: 14px; color: #78716c; font-weight: 500;">Your message</p>
                                <p style="margin: 0; font-size: 16px; color: #292524; line-height: 1.6;">${message}</p>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Optional Call CTA -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px; text-align: center;">
                                <p style="margin: 0 0 16px; font-size: 16px; color: #57534e; line-height: 1.5;">If you'd like to talk this through, we're happy to schedule a quick call.</p>
                                <a href="https://donewellco.com" style="display: inline-block; background-color: #1B4D2E; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 500;">Schedule a call</a>
                                <p style="margin: 16px 0 0; font-size: 14px; color: #78716c;">No obligation — just a conversation.</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Social Proof Section -->
                    <tr>
                        <td style="padding: 40px 40px 32px; background-color: #fafaf9; border-top: 1px solid #e7e5e4;">
                            <h2 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #292524; text-align: center;">What it's like working with DoneWell</h2>
                            
                            <!-- Testimonial 1 -->
                            <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 32px; margin-bottom: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);">
                                <div style="margin-bottom: 16px;">
                                    <div style="display: flex; gap: 4px;">
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                    </div>
                                </div>
                                <p style="margin: 0 0 24px; font-size: 15px; color: #292524; line-height: 1.7;">"DoneWell took our scattered ideas and turned them into a website that actually works. They asked the right questions, kept us in the loop, and delivered exactly what we needed — no drama, no delays. It's rare to find a team that just gets it done well."</p>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #1B4D2E 0%, #345a45 100%); overflow: hidden; flex-shrink: 0;"></div>
                                    <div>
                                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #292524;">Sarah Mitchell</p>
                                        <p style="margin: 0; font-size: 14px; color: #57534e;">Founder, Bloom Wellness</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Testimonial 2 -->
                            <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 32px; margin-bottom: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);">
                                <div style="margin-bottom: 16px;">
                                    <div style="display: flex; gap: 4px;">
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                    </div>
                                </div>
                                <p style="margin: 0 0 24px; font-size: 15px; color: #292524; line-height: 1.7;">"I've worked with several agencies before, and DoneWell was different from day one. They listened more than they talked, explained things in plain English, and delivered a platform that our clients love. It felt like having a technical partner who actually cared about the outcome."</p>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #345a45 0%, #1B4D2E 100%); overflow: hidden; flex-shrink: 0;"></div>
                                    <div>
                                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #292524;">Marcus Chen</p>
                                        <p style="margin: 0; font-size: 14px; color: #57534e;">Principal, Chen Consulting Group</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Testimonial 3 -->
                            <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);">
                                <div style="margin-bottom: 16px;">
                                    <div style="display: flex; gap: 4px;">
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                        <span style="color: #fbbf24; font-size: 18px; line-height: 1;">★</span>
                                    </div>
                                </div>
                                <p style="margin: 0 0 24px; font-size: 15px; color: #292524; line-height: 1.7;">"We needed a simple app for internal use, and every other developer wanted to overcomplicate it. DoneWell understood the scope, built exactly what we asked for, and made sure we could maintain it ourselves. Professional, straightforward, and completely reliable."</p>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #1B4D2E 0%, #78716c 100%); overflow: hidden; flex-shrink: 0;"></div>
                                    <div>
                                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #292524;">Jennifer Alvarez</p>
                                        <p style="margin: 0; font-size: 14px; color: #57534e;">Director of Operations, Ridgeline Partners</p>
                                    </div>
                                </div>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #1B4D2E; border-top: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <div style="font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; opacity: 0.9;">DoneWell</div>
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
                                                    <p style="margin: 0;"><a href="mailto:hello@donewellco.com" style="color: #ffffff; text-decoration: none; font-size: 14px; opacity: 0.9;">hello@donewellco.com</a></p>
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
                                            © ${new Date().getFullYear()} DoneWell. All rights reserved.
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
    const data: LeadEmailData = await req.json()

    // Validate required fields
    if (!data || !data.to || !data.firstName || !data.lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, firstName, lastName' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if Resend API key is configured
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

    // Get email template
    const { subject, html } = getEmailTemplate(data)

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: data.to,
        subject,
        html,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.json()
      console.error('Resend API error:', error)
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

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
