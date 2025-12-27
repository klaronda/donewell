import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface SuppressEmailRequest {
  email: string
  reason?: string
  source?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  // Allow both GET and POST for flexibility
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    let email: string | null = null
    let reason: string | undefined = undefined
    let source: string = 'unsubscribe_page'

    // Handle GET request (from URL query params)
    if (req.method === 'GET') {
      const url = new URL(req.url)
      email = url.searchParams.get('email')
      reason = url.searchParams.get('reason') || undefined
      source = url.searchParams.get('source') || 'unsubscribe_page'
    } else {
      // Handle POST request (from JSON body)
      const body: SuppressEmailRequest = await req.json()
      email = body.email
      reason = body.reason
      source = body.source || 'unsubscribe_page'
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Normalize email (lowercase, trim)
    email = email.toLowerCase().trim()

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Insert email into suppression table (idempotent - ON CONFLICT DO NOTHING)
    const { data, error } = await supabase
      .from('email_suppression')
      .insert({
        email: email,
        reason: reason || null,
        source: source,
        suppressed_at: new Date().toISOString()
      })
      .select()
      .single()

    // If error is a unique constraint violation, that's fine (idempotent)
    if (error && error.code !== '23505') {
      console.error('Error suppressing email:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to suppress email',
          details: error.message
        }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // If email already exists (23505), fetch it to return success
    if (error && error.code === '23505') {
      const { data: existing } = await supabase
        .from('email_suppression')
        .select('*')
        .eq('email', email)
        .single()
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email already suppressed',
          email: email,
          suppressed_at: existing?.suppressed_at || new Date().toISOString()
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

    console.log('✅ Email suppressed:', email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email suppressed successfully',
        email: email,
        suppressed_at: data?.suppressed_at || new Date().toISOString()
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
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
