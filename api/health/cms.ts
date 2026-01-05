import { createClient } from '@supabase/supabase-js'

/**
 * DoneWell Health Adapter - CMS Health Endpoint
 * GET /api/health/cms
 * 
 * Provides detailed CMS health status with latency measurement.
 * Allows monitoring to distinguish "site up" vs "content broken."
 */

// CORS headers for cross-origin monitoring
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

interface CMSHealthResponse {
  status: 'ok' | 'error'
  provider: string
  latency_ms: number
  last_publish_check: string
  error?: string
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value))
    return res.status(204).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value))

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const response: CMSHealthResponse = {
      status: 'error',
      provider: 'supabase',
      latency_ms: 0,
      last_publish_check: new Date().toISOString(),
      error: 'CMS configuration missing'
    }
    return res.status(503).json(response)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const startTime = Date.now()

  try {
    // Lightweight query to measure CMS latency (just check if table is accessible)
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1)

    const latency = Date.now() - startTime

    if (error) {
      const response: CMSHealthResponse = {
        status: 'error',
        provider: 'supabase',
        latency_ms: latency,
        last_publish_check: new Date().toISOString(),
        error: error.message
      }
      return res.status(503).json(response)
    }

    const response: CMSHealthResponse = {
      status: 'ok',
      provider: 'supabase',
      latency_ms: latency,
      last_publish_check: new Date().toISOString()
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.status(200).json(response)
  } catch (err) {
    const latency = Date.now() - startTime
    const response: CMSHealthResponse = {
      status: 'error',
      provider: 'supabase',
      latency_ms: latency,
      last_publish_check: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error'
    }
    return res.status(503).json(response)
  }
}

