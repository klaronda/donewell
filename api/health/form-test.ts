/**
 * DoneWell Health Adapter - Form Test Endpoint
 * POST /api/health/form-test
 * 
 * Synthetic form submission that validates but does NOT persist data.
 * Used to detect silent form failures.
 */

// CORS headers for cross-origin monitoring
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

interface FormTestPayload {
  first_name?: string
  last_name?: string
  email?: string
  business?: string
  phone?: string
  message?: string
}

interface FormTestResponse {
  status: 'ok' | 'error'
  validated: boolean
  submission_path: string
  errors?: string[]
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateFormData(data: FormTestPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push('first_name is required')
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push('last_name is required')
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('email is required')
  } else if (!validateEmail(data.email)) {
    errors.push('email format is invalid')
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('message is required')
  }

  // Optional field validation
  if (data.phone && data.phone.length > 0) {
    // Basic phone validation - allow digits, spaces, dashes, parens, plus
    const phoneRegex = /^[\d\s\-\(\)\+]+$/
    if (!phoneRegex.test(data.phone)) {
      errors.push('phone format is invalid')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
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

  try {
    const payload: FormTestPayload = req.body || {}

    // Run full validation logic (same as production form)
    const validation = validateFormData(payload)

    const response: FormTestResponse = {
      status: validation.valid ? 'ok' : 'error',
      validated: validation.valid,
      submission_path: 'contact_form_v1',
      ...(validation.errors.length > 0 && { errors: validation.errors })
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.status(validation.valid ? 200 : 400).json(response)
  } catch (err) {
    const response: FormTestResponse = {
      status: 'error',
      validated: false,
      submission_path: 'contact_form_v1',
      errors: [err instanceof Error ? err.message : 'Unknown validation error']
    }
    return res.status(500).json(response)
  }
}

