/**
 * DoneWell Health Adapter - Error Log Endpoint
 * POST /api/health/log
 * 
 * Internal endpoint for pushing critical runtime errors to monitoring.
 * Requires X-DoneWell-Secret header for authentication.
 * 
 * Required environment variables:
 * - DONEWELL_LOG_SECRET
 */

// CORS headers for cross-origin monitoring
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-DoneWell-Secret',
}

interface LogPayload {
  site_id: string
  severity: 'sev-1' | 'sev-2' | 'sev-3'
  type: string
  message: string
  path?: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

interface LogResponse {
  status: 'ok' | 'error'
  logged: boolean
  error?: string
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value))
    return res.status(204).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value))

  const secret = process.env.DONEWELL_LOG_SECRET
  const providedSecret = req.headers['x-donewell-secret']

  // Validate secret header
  if (!secret) {
    console.error('[DoneWell Log] DONEWELL_LOG_SECRET not configured')
    return res.status(500).json({
      status: 'error',
      logged: false,
      error: 'Log endpoint not configured'
    } as LogResponse)
  }

  if (!providedSecret || providedSecret !== secret) {
    return res.status(401).json({
      status: 'error',
      logged: false,
      error: 'Unauthorized'
    } as LogResponse)
  }

  try {
    const payload: LogPayload = req.body

    // Validate required fields
    if (!payload.site_id || !payload.severity || !payload.type || !payload.message) {
      return res.status(400).json({
        status: 'error',
        logged: false,
        error: 'Missing required fields: site_id, severity, type, message'
      } as LogResponse)
    }

    // Validate severity
    const validSeverities = ['sev-1', 'sev-2', 'sev-3']
    if (!validSeverities.includes(payload.severity)) {
      return res.status(400).json({
        status: 'error',
        logged: false,
        error: 'Invalid severity. Must be: sev-1, sev-2, sev-3'
      } as LogResponse)
    }

    // Log structured error (picked up by Vercel logs)
    const logEntry = {
      level: payload.severity === 'sev-1' ? 'error' : payload.severity === 'sev-2' ? 'warn' : 'info',
      source: 'donewell-health-adapter',
      site_id: payload.site_id,
      severity: payload.severity,
      type: payload.type,
      message: payload.message,
      path: payload.path || null,
      timestamp: payload.timestamp || new Date().toISOString(),
      metadata: payload.metadata || {}
    }

    // Use structured logging for Vercel
    console.log(JSON.stringify(logEntry))

    const response: LogResponse = {
      status: 'ok',
      logged: true
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.status(200).json(response)
  } catch (err) {
    console.error('[DoneWell Log] Error processing log:', err)
    return res.status(500).json({
      status: 'error',
      logged: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    } as LogResponse)
  }
}

