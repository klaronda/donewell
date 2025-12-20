# Resend Email Setup

This project uses Resend via Supabase Edge Functions to send automated emails when leads are created or when they book a consultation.

## Environment Variables

Add the following environment variables to your Supabase project (not Vercel):

### Required Variables

1. **RESEND_API_KEY**
   - Get your API key from [Resend Dashboard](https://resend.com/api-keys)
   - Add it to Supabase: Settings → Edge Functions → Environment Variables
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (e.g., `re_xxxxxxxxxxxxx`)

2. **RESEND_FROM_EMAIL** (Optional)
   - The email address to send from
   - Format: `"Name <email@domain.com>"`
   - Default: `"DoneWell <onboarding@resend.dev>"` (uses Resend's default domain)
   - To use your own domain, verify it in Resend first
   - Add to Supabase: Settings → Edge Functions → Environment Variables
   - Name: `RESEND_FROM_EMAIL`
   - Value: `"DoneWell <noreply@donewellco.com>"` (or your verified domain)

## Email Templates

Two email templates are automatically sent:

1. **booked_consult=false** (Initial lead creation)
   - Sent when a lead is first created
   - Subject: "Thanks for reaching out!"
   - Thanks them for reaching out and mentions 24-hour response time

2. **booked_consult=true** (Consultation booked)
   - Sent when a lead books a consultation via Calendly
   - Subject: "Your consultation is confirmed!"
   - Confirms the booking and mentions calendar invitation

## Setup Steps

1. **Create a Resend account**
   - Go to [resend.com](https://resend.com) and sign up (free tier includes 3,000 emails/month)
   - Optionally verify your domain (donewellco.com) in the Resend dashboard for custom sender

2. **Get your API key**
   - Navigate to API Keys in Resend dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add environment variables to Supabase**
   - Go to your Supabase project dashboard
   - Navigate to Settings → Edge Functions
   - Click on Environment Variables
   - Add `RESEND_API_KEY` with your API key
   - Add `RESEND_FROM_EMAIL` (optional, defaults to `onboarding@resend.dev` if not set)

4. **Deploy the Edge Function**
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project (get project ref from Supabase dashboard URL)
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Deploy the function
   supabase functions deploy send-lead-email
   ```
   
   **Note**: Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`)

5. **Test the function**
   - Submit a lead through your form
   - Check if the email is sent successfully

## Testing

To test the email functionality:

1. Submit a lead through the "Get Started" form
   - Should receive "Thanks for reaching out!" email

2. Book a consultation via Calendly
   - Should receive "Your consultation is confirmed!" email

## Troubleshooting

- **Emails not sending**: Check that `RESEND_API_KEY` is set correctly in Supabase Edge Functions environment variables
- **Domain not verified**: If using a custom domain, make sure it's verified in Resend dashboard. Otherwise, use `onboarding@resend.dev` (default)
- **Check logs**: View Supabase Edge Function logs in the dashboard: Edge Functions → send-lead-email → Logs
- **Function not found**: Make sure the Edge Function is deployed: `supabase functions deploy send-lead-email`
- **CORS errors**: The function includes CORS headers, but if you see CORS issues, check the function logs

## Edge Function

The email sending is handled by `supabase/functions/send-lead-email/index.ts`, which:
- Accepts POST requests with lead data
- Uses Resend API directly (no SDK needed in Deno)
- Returns success/error responses
- Handles CORS for browser requests
