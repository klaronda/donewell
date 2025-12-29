import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface InsightsRequest {
  audit_id: string
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
    const { audit_id }: InsightsRequest = await req.json()

    if (!audit_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: audit_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch audit data
    const { data: audit, error: auditError } = await supabase
      .from('site_audits')
      .select('*')
      .eq('id', audit_id)
      .single()

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: 'Audit not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if insights already exist
    if (audit.insights && Array.isArray(audit.insights) && audit.insights.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          insights: audit.insights,
          message: 'Insights already generated'
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

    // Build prompt for OpenAI
    const prompt = `Convert these Lighthouse audit results into 2-3 business-friendly insights:

Performance score: ${audit.performance_score ?? 'N/A'}/100
Accessibility score: ${audit.accessibility_score ?? 'N/A'}/100
SEO score: ${audit.seo_score ?? 'N/A'}/100
Best Practices score: ${audit.best_practices_score ?? 'N/A'}/100

Core Web Vitals:
- Largest Contentful Paint (LCP): ${audit.lcp ? audit.lcp.toFixed(2) + 's' : 'N/A'}
- Cumulative Layout Shift (CLS): ${audit.cls ?? 'N/A'}
- Interaction to Next Paint (INP): ${audit.inp ? audit.inp.toFixed(0) + 'ms' : 'N/A'}

Rules:
- Return exactly 2-3 insights (no more, no less)
- Use plain, business-friendly language (no technical jargon)
- Frame as opportunities, not problems
- Each insight should be one sentence
- Focus on user experience and business impact
- Be respectful and non-judgmental

Return ONLY a JSON array of strings, like this:
["First insight here", "Second insight here", "Third insight here"]`

    console.log('Calling OpenAI API to generate insights for audit:', audit_id)

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
            content: 'You are a helpful assistant that converts technical website performance data into clear, business-friendly insights. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
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

    // Parse JSON array from response
    let insights: string[]
    try {
      // Extract JSON array from response (handle cases where response includes markdown code blocks)
      const jsonMatch = content.match(/\[.*\]/s)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      } else {
        insights = JSON.parse(content)
      }

      // Validate insights array
      if (!Array.isArray(insights) || insights.length === 0) {
        throw new Error('Invalid insights format')
      }

      // Limit to 3 insights max
      insights = insights.slice(0, 3)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, 'Content:', content)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse insights from OpenAI response',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Store insights in database
    const { data: updatedAudit, error: updateError } = await supabase
      .from('site_audits')
      .update({ insights: insights })
      .eq('id', audit_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating audit with insights:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store insights',
          details: updateError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('✅ Insights generated and stored:', insights)

    return new Response(
      JSON.stringify({
        success: true,
        insights: insights,
        audit_id: audit_id
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



