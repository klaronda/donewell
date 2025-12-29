import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAGESPEED_API_KEY = Deno.env.get('PAGESPEED_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface AuditRequest {
  url: string
  lead_id: string
}

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number | null }
      accessibility?: { score: number | null }
      'best-practices'?: { score: number | null }
      seo?: { score: number | null }
    }
    audits?: {
      'largest-contentful-paint'?: { numericValue?: number }
      'cumulative-layout-shift'?: { numericValue?: number }
      'interaction-to-next-paint'?: { numericValue?: number }
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
    // Validate API key
    if (!PAGESPEED_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'PAGESPEED_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { url, lead_id }: AuditRequest = await req.json()

    if (!url || !lead_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: url, lead_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check rate limits using database function
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc('check_rate_limits', {
      url_to_check: url
    })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limits', details: rateLimitError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!rateLimitCheck || !Array.isArray(rateLimitCheck) || rateLimitCheck.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Rate limit check failed - no data returned' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const rateLimitResult = rateLimitCheck[0]
    if (!rateLimitResult || typeof rateLimitResult.can_proceed !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Rate limit check failed - invalid response format' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!rateLimitResult.can_proceed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          reason: rateLimitResult.reason || 'Rate limit exceeded'
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('lead_sites')
      .select('id, website_url')
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

    // Call PageSpeed Insights API
    // Note: PageSpeed Insights API uses Navigation mode by default (appropriate for initial page load)
    // Throttling is built into strategy: mobile = "Slow 4G" (simulates typical 4G connection), desktop = faster network
    // Mobile strategy provides more realistic assessment of how most users experience the site
    const pagespeedUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
    pagespeedUrl.searchParams.set('url', url)
    pagespeedUrl.searchParams.set('strategy', 'mobile')
    // Use append() to add multiple category parameters
    pagespeedUrl.searchParams.append('category', 'performance')
    pagespeedUrl.searchParams.append('category', 'accessibility')
    pagespeedUrl.searchParams.append('category', 'seo')
    pagespeedUrl.searchParams.append('category', 'best-practices')
    pagespeedUrl.searchParams.set('key', PAGESPEED_API_KEY)

    console.log('Calling PageSpeed Insights API for:', url)
    const pagespeedResponse = await fetch(pagespeedUrl.toString())

    if (!pagespeedResponse.ok) {
      const errorText = await pagespeedResponse.text()
      console.error('PageSpeed API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'PageSpeed Insights API error',
          details: errorText
        }),
        {
          status: pagespeedResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const pagespeedData: PageSpeedResponse = await pagespeedResponse.json()

    // Log raw response for debugging
    console.log('PageSpeed API response structure:', {
      hasCategories: !!pagespeedData.lighthouseResult?.categories,
      categoryKeys: pagespeedData.lighthouseResult?.categories ? Object.keys(pagespeedData.lighthouseResult.categories) : [],
      hasAudits: !!pagespeedData.lighthouseResult?.audits
    })

    // Extract scores - handle null/undefined scores properly
    const categories = pagespeedData.lighthouseResult?.categories || {}
    const performanceScore = (categories.performance?.score != null && categories.performance.score !== undefined)
      ? Math.round(categories.performance.score * 100) 
      : null
    const accessibilityScore = (categories.accessibility?.score != null && categories.accessibility.score !== undefined)
      ? Math.round(categories.accessibility.score * 100) 
      : null
    const seoScore = (categories.seo?.score != null && categories.seo.score !== undefined)
      ? Math.round(categories.seo.score * 100) 
      : null
    const bestPracticesScore = (categories['best-practices']?.score != null && categories['best-practices'].score !== undefined)
      ? Math.round(categories['best-practices'].score * 100) 
      : null

    console.log('Extracted scores:', {
      performance: performanceScore,
      accessibility: accessibilityScore,
      seo: seoScore,
      bestPractices: bestPracticesScore
    })

    // Extract Core Web Vitals
    const audits = pagespeedData.lighthouseResult?.audits || {}
    const lcpAudit = audits['largest-contentful-paint']
    const lcp = (lcpAudit?.numericValue != null && lcpAudit.numericValue !== undefined)
      ? lcpAudit.numericValue / 1000 // Convert ms to seconds
      : null
    
    const clsAudit = audits['cumulative-layout-shift']
    const cls = (clsAudit?.numericValue != null && clsAudit.numericValue !== undefined)
      ? clsAudit.numericValue
      : null
    
    const inpAudit = audits['interaction-to-next-paint']
    const inp = (inpAudit?.numericValue != null && inpAudit.numericValue !== undefined)
      ? inpAudit.numericValue
      : null

    console.log('Extracted Core Web Vitals:', { lcp, cls, inp })

    // Store audit results
    const { data: audit, error: auditError } = await supabase
      .from('site_audits')
      .insert({
        lead_id: lead_id,
        performance_score: performanceScore,
        accessibility_score: accessibilityScore,
        seo_score: seoScore,
        best_practices_score: bestPracticesScore,
        lcp: lcp,
        cls: cls,
        inp: inp,
        raw_json: pagespeedData,
        audit_run_at: new Date().toISOString()
      })
      .select()
      .single()

    if (auditError) {
      console.error('Error storing audit:', auditError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store audit results',
          details: auditError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Update lead status to 'audited'
    await supabase
      .from('lead_sites')
      .update({ status: 'audited' })
      .eq('id', lead_id)

    console.log('✅ Audit completed and stored:', audit.id)

    return new Response(
      JSON.stringify({
        success: true,
        audit_id: audit.id,
        scores: {
          performance: performanceScore,
          accessibility: accessibilityScore,
          seo: seoScore,
          best_practices: bestPracticesScore,
          overall: audit.overall_score,
          grade: audit.grade
        },
        core_web_vitals: {
          lcp: lcp,
          cls: cls,
          inp: inp
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

