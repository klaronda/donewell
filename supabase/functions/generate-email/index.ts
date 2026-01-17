import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EmailRequest {
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
    // Validate API key
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { lead_id }: EmailRequest = await req.json()

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

    // Fetch lead data
    const { data: lead, error: leadError } = await supabase
      .from('lead_sites')
      .select('*')
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

    // Check if email is suppressed
    const { data: suppressed, error: suppressionError } = await supabase
      .from('email_suppression')
      .select('id')
      .eq('email', lead.email.toLowerCase().trim())
      .limit(1)
      .single()

    if (!suppressionError && suppressed) {
      console.log('⏭️ Skipping email generation - email is suppressed:', lead.email)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email is suppressed',
          message: 'This email address has been unsubscribed and will not receive emails'
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

    // Fetch latest audit with insights
    const { data: audit, error: auditError } = await supabase
      .from('site_audits')
      .select('*')
      .eq('lead_id', lead_id)
      .eq('is_latest', true)
      .single()

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: 'No audit found for this lead. Run audit first.' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Use only first name for email greeting
    const firstName = lead.first_name || 'there'

    // Check if all scores are 80 or above - use high-score template
    // If any score is below 80, use improvement-focused template
    const allScoresHigh = 
      (audit.performance_score && audit.performance_score >= 80) &&
      (audit.accessibility_score && audit.accessibility_score >= 80) &&
      (audit.seo_score && audit.seo_score >= 80) &&
      (audit.best_practices_score && audit.best_practices_score >= 80)

    if (allScoresHigh) {
      // Generate high-score email template
      const unsubscribeUrl = `https://donewellco.com/unsubscribe?email=${encodeURIComponent(lead.email)}`
      const highScoreSubject = `Your website is built very well`
      const highScoreBody = `<p>Hi ${firstName},</p>

<p>I took a few minutes to look under the hood of ${lead.company_name}'s homepage with Google's developer tools, mimicking a typical phone user.</p>

<p>Your scores were very nice:<br>- <b>Performance:</b> ${audit.performance_score}<br>- <b>Best Practices:</b> ${audit.best_practices_score}<br>- <b>SEO:</b> ${audit.seo_score}</p>

<p>In Laymen's terms: content shows up quickly, works well on phones, and is easy for search engines to understand. From a technical standpoint, there's nothing urgent to fix.</p>

<p>Improving and stabilizing sites is part of we do, but we mostly specialize in getting new ideas off the ground (and quickly): like landing pages, iOS and Android apps, or side projects that have been been sitting on the back burner.</p>

<p>Here are our project averages:<br>- <b>Idea-to-launch time:</b> 14 days<br>- <b>Performance:</b> 99.1<br>- <b>Best Practices:</b> 98.3<br>- <b>SEO:</b> 96.7<br>- <b>Client satisfaction:</b> 97.25%</p>

<p>If there's something you've been wanting to get going, we'd be happy to help.</p>

<p>Let's chat,<br><b>Kevin L.</b><br><a href="https://donewellco.com">DoneWell Design Co</a></p>

<p>—</p>

<p style="color: #AAAAAA;">If you'd rather not receive messages like this, I won't take it personal. You can opt out <a href="${unsubscribeUrl}">here</a>.</p>`

      // Store email draft in database
      const { data: emailDraft, error: draftError } = await supabase
        .from('email_drafts')
        .insert({
          lead_id: lead_id,
          subject: highScoreSubject,
          body: highScoreBody,
          status: 'draft',
          generated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (draftError) {
        console.error('Error storing email draft:', draftError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to store email draft',
            details: draftError.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Update lead status to 'emailed'
      await supabase
        .from('lead_sites')
        .update({ status: 'emailed' })
        .eq('id', lead_id)

      console.log('✅ High-score email draft generated and stored:', emailDraft.id)

      return new Response(
        JSON.stringify({
          success: true,
          email_draft_id: emailDraft.id,
          subject: highScoreSubject,
          body: highScoreBody,
          lead_id: lead_id
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

    // Check if insights exist (for improvement-focused emails)
    // If no insights, use a simplified template without OpenAI
    if (!audit.insights || !Array.isArray(audit.insights) || audit.insights.length === 0) {
      console.log('No insights found, using simplified email template')
      
      // Determine the lowest score for messaging
      const scores = [
        { name: 'Performance', value: audit.performance_score, label: 'performance' },
        { name: 'SEO', value: audit.seo_score, label: 'seo' },
        { name: 'Accessibility', value: audit.accessibility_score, label: 'accessibility' }
      ].filter(s => s.value != null)
      
      const lowestScore = scores.length > 0 
        ? scores.reduce((lowest, current) => (current.value < lowest.value) ? current : lowest, scores[0])
        : { name: 'Performance', value: 0, label: 'performance' }
      
      const unsubscribeUrl = `https://donewellco.com/unsubscribe?email=${encodeURIComponent(lead.email)}`
      
      // Build score display (only show scores that exist)
      const scoreLines = []
      if (audit.performance_score != null) scoreLines.push(`- <b>Performance:</b> ${audit.performance_score}`)
      if (audit.seo_score != null) scoreLines.push(`- <b>SEO:</b> ${audit.seo_score}`)
      if (audit.accessibility_score != null) scoreLines.push(`- <b>Accessibility:</b> ${audit.accessibility_score}`)
      if (audit.best_practices_score != null) scoreLines.push(`- <b>Best Practices:</b> ${audit.best_practices_score}`)
      const scoresDisplay = scoreLines.join('<br>')
      
      const simplifiedSubject = `I reviewed your website, and here were the results`
      const simplifiedBody = `<p>Hi ${firstName},</p>

<p>I took a peek under the hood of ${lead.company_name}'s homepage using Google's developer tools, which measure performance for the average person using their phone.</p>

<p>Here's what came back:<br>${scoresDisplay}</p>

<p>A ${lowestScore.label} score in this range usually means the homepage takes too long to load or simple-fix errors in the code. Since the homepage is often your customer's first impression, that delay can cause people to bounce before they understand what you offer.</p>

<p>The good news is: these are easy fixes and I'm happy to walk you through them in 15 minutes or less.</p>

<p>Let's chat,<br><b>Kevin L.</b><br><a href="https://donewellco.com">DoneWell Design Co</a></p>

<p>—</p>

<p style="color: #AAAAAA;">If you'd prefer not to receive notes like this, you can ask to be removed <a href="${unsubscribeUrl}">here</a>.</p>`

      // Store email draft in database
      const { data: emailDraft, error: draftError } = await supabase
        .from('email_drafts')
        .insert({
          lead_id: lead_id,
          subject: simplifiedSubject,
          body: simplifiedBody,
          status: 'draft',
          generated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (draftError) {
        console.error('Error storing email draft:', draftError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to store email draft',
            details: draftError.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Update lead status to 'emailed'
      await supabase
        .from('lead_sites')
        .update({ status: 'emailed' })
        .eq('id', lead_id)

      console.log('✅ Simplified email draft generated and stored:', emailDraft.id)

      return new Response(
        JSON.stringify({
          success: true,
          email_draft_id: emailDraft.id,
          subject: simplifiedSubject,
          body: simplifiedBody,
          lead_id: lead_id
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

    // Build prompt for OpenAI (improvement-focused email)
    const insightsText = audit.insights.join('\n')
    
    // Extract domain from website URL for display
    const websiteUrl = lead.website_url || ''
    const websiteDomain = websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    
    // Determine which score is lowest for adaptive messaging
    const scores = [
      { name: 'Performance', value: audit.performance_score, label: 'performance' },
      { name: 'SEO', value: audit.seo_score, label: 'seo' },
      { name: 'Accessibility', value: audit.accessibility_score, label: 'accessibility' }
    ].filter(s => s.value != null)
    
    const lowestScore = scores.reduce((lowest, current) => 
      (current.value < lowest.value) ? current : lowest, scores[0] || { name: 'Performance', value: 0, label: 'performance' })

    const prompt = `You are a senior client-services writer for DoneWell Design Co, a calm, trust-focused digital studio that helps non-technical professionals quietly improve their websites.

You do not sell aggressively. You do not sound like marketing copy. You write like a thoughtful human who noticed something worth sharing.

Context:
The recipient owns or manages a business website. You are writing after running Google's PageSpeed Insights tool on their homepage, which measures performance for mobile visitors on a typical 4G connection.

Recipient details:
- first_name: ${lead.first_name || 'there'}
- last_name: ${lead.last_name || ''}
- company_name: ${lead.company_name}
- website_url: ${lead.website_url}
- performance_score: ${audit.performance_score || 'N/A'}
- seo_score: ${audit.seo_score || 'N/A'}
- accessibility_score: ${audit.accessibility_score || 'N/A'}
- best_practices_score: ${audit.best_practices_score || 'N/A'}
- lowest_score: ${lowestScore.label} (${lowestScore.value})

Email Structure (REQUIRED - Follow This Template, But Adapt Based on Scores):

Subject Line: "I reviewed your website, and here were the results"

Body Structure (HTML Format):
<p>Hi ${firstName},</p>

<p>I took a peek under the hood of ${lead.company_name}'s homepage using Google's developer tools, which measure performance for the average person using their phone.</p>

<p>Here's what came back:<br>- <b>Performance:</b> ${audit.performance_score}<br>- <b>SEO:</b> ${audit.seo_score}<br>- <b>Accessibility:</b> ${audit.accessibility_score}</p>

<p>[ADAPT THIS PARAGRAPH BASED ON LOWEST SCORE - see instructions below]</p>

<p>The good news is: these are easy fixes and I'm happy to walk you through them in 15 minutes or less.</p>

<p>Let's chat,<br><b>Kevin L.</b><br><a href="https://donewellco.com">DoneWell Design Co</a></p>

<p>—</p>

<p style="color: #AAAAAA;">If you'd prefer not to receive notes like this, you can ask to be removed <a href="https://donewellco.com/unsubscribe?email=${encodeURIComponent(lead.email)}">here</a>.</p>

Adaptive Instructions (CRITICAL - Adapt Based on Which Score is Lowest):

1. Always include exact scores provided (Performance, SEO, Accessibility) - use the actual numbers from the audit

2. For the paragraph that explains what the lowest score means, adapt based on which score is actually lowest:
   - If Performance is lowest: "A performance score in this range usually means the homepage takes a bit too long to feel ready on a phone. Since the homepage is often a customer's *first impression*, that delay can cause people to lose interest before they understand what you offer."
   - If SEO is lowest: Explain in terms of how search engines understand the homepage and how this affects visibility. Tie to first impressions and people finding the site.
   - If Accessibility is lowest: Explain in terms of how easy the homepage is for all visitors to use, and how this affects first impressions and trust.

3. If scores are mixed (e.g., good performance but bad SEO), acknowledge what's working:
   - "Your homepage loads quickly, which is great for first impressions. However, the SEO score suggests search engines may have trouble understanding what the site offers..."
   - Frame the lowest score as the thing limiting the site's potential, while acknowledging strengths

4. Tie the issue to first impressions, trust, or people leaving early
   - Use phrases like "first impression", "lose interest before they understand what you offer"
   - Connect to homepage being the entry point

5. Describe causes at a conceptual level only (no jargon)
   - "large images" not "unoptimized image assets"
   - "too much loading up front" not "render-blocking resources"
   - "content that appears later than expected" not "deferred rendering"

6. Emphasize that fixes are contained and do not require a redesign
   - "this isn't a redesign problem"
   - "usually slowed down by a small number of things"

7. Keep the tone calm, factual, and human
   - No urgency, no hype, no sales pressure
   - Write like you're emailing a peer

8. Never recommend tools, techniques, or implementation details
   - No mention of specific tools, frameworks, or technical solutions
   - Focus on outcomes and user experience, not how to fix it

Language Rules:
❌ NO technical jargon whatsoever
❌ NO tool recommendations
❌ NO implementation details
❌ NO urgency or hype
❌ NO marketing language
✅ Use simple, everyday language
✅ Focus on user experience and business impact
✅ Keep it conversational and human
✅ Focus on "homepage" not "website" or "site"

HTML Formatting Rules:
- Use <p>paragraph text</p> tags for each paragraph
- Use <b>text</b> for bold (scores, signature name, emphasis)
- Use <a href="url">link text</a> for links
- Use <br> for line breaks within paragraphs (like in the scores list and signature)
- Use <i>text</i> for italics if needed (e.g., "first impression")
- Keep HTML simple - only use <p>, <b>, <a>, <br>, and <i> tags

Return ONLY valid JSON (no markdown, no extra commentary):
{
  "subject": "I reviewed your website, and here were the results",
  "body": "string (with HTML formatting: <p> for paragraphs, <b> for bold, <a> for links, <br> for line breaks)"
}

CRITICAL REQUIREMENTS:
1. Subject MUST be exactly: "I reviewed your website, and here were the results"
2. Include all three scores: Performance, SEO, Accessibility (use exact numbers provided)
3. Adapt the explanation paragraph based on which score is actually lowest (${lowestScore.label} with score ${lowestScore.value})
4. If scores are mixed, acknowledge strengths while focusing on the lowest score
5. Tie to first impressions, trust, or people leaving early
6. Emphasize fixes are contained, no redesign needed
7. Signature exactly: <p>Let's chat,<br><b>Kevin L.</b><br><a href="https://donewellco.com">DoneWell Design Co</a></p>
8. Include unsubscribe link at bottom: <p>—</p><p style="color: #AAAAAA;">If you'd prefer not to receive notes like this, you can ask to be removed <a href="https://donewellco.com/unsubscribe?email=${encodeURIComponent(lead.email)}">here</a>.</p>
9. NO technical jargon, tools, or implementation details
10. Focus on "homepage" throughout, not "website" or "site"`

    console.log('Calling OpenAI API to generate email for lead:', lead_id)

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior client-services writer for DoneWell Design Co. You write calm, factual, human emails in simple, non-technical language. You NEVER use technical jargon, tool recommendations, or implementation details. You write like you\'re emailing a peer. Always return valid JSON only: {"subject": "string", "body": "string"}. The subject MUST be exactly "I reviewed your website, and here were the results". The body MUST use HTML formatting: <p> tags for paragraphs, <b> for bold, <a> for links, and <br> for line breaks. Always include exact scores (Performance, SEO, Accessibility). Adapt your explanation based on which score is actually lowest - focus on that score while acknowledging strengths if scores are mixed. Explain what the lowest score means in plain language, focusing on "homepage" not "website". Tie issues to first impressions, trust, or people leaving early. Emphasize fixes are contained, no redesign needed. The signature MUST be exactly: "<p>Let\'s chat,<br><b>Kevin L.</b><br><a href=\\"https://donewellco.com\\">DoneWell Design Co</a></p>". Include unsubscribe link at bottom: "<p>—</p><p style="color: #AAAAAA;">If you\'d prefer not to receive notes like this, you can ask to be removed <a href=\\"[unsubscribe_url]\\">here</a>.</p>" - make "here" the link text, not the full URL, and use a period instead of a colon. No markdown or extra commentary.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API error',
          details: errorText
        }),
        {
          status: openaiResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content returned from OpenAI' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse JSON from response
    let emailData: { subject: string; body: string }
    try {
      // Extract JSON object from response (handle cases where response includes markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[0])
      } else {
        emailData = JSON.parse(content)
      }

      // Validate email data
      if (!emailData.subject || !emailData.body) {
        throw new Error('Invalid email format: missing subject or body')
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, 'Content:', content)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse email from OpenAI response',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Unsubscribe link is already included in the email body from OpenAI prompt
    const emailBodyWithUnsubscribe = emailData.body

    // Store email draft in database
    const { data: emailDraft, error: draftError } = await supabase
      .from('email_drafts')
      .insert({
        lead_id: lead_id,
        subject: emailData.subject,
        body: emailBodyWithUnsubscribe,
        status: 'draft',
        generated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (draftError) {
      console.error('Error storing email draft:', draftError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store email draft',
          details: draftError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Update lead status to 'emailed'
    await supabase
      .from('lead_sites')
      .update({ status: 'emailed' })
      .eq('id', lead_id)

    console.log('✅ Email draft generated and stored:', emailDraft.id)

    return new Response(
      JSON.stringify({
        success: true,
        email_draft_id: emailDraft.id,
        subject: emailData.subject,
        body: emailBodyWithUnsubscribe,
        lead_id: lead_id
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

