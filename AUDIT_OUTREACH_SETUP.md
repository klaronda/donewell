# Automated Website Audit & Outreach System Setup Guide

This guide will help you set up the automated website audit and outreach system for DoneWell.

## Overview

The system consists of:
1. **Database Schema** - Three tables (`lead_sites`, `site_audits`, `email_drafts`) with helper views
2. **Edge Functions** - Three functions for auditing, generating insights, and creating email drafts
3. **Rate Limiting** - Prevents duplicate audits and enforces daily limits

## Prerequisites

- Supabase project set up
- Google Cloud account (for PageSpeed Insights API)
- OpenAI account (for AI-generated insights and emails)

## Step 1: Get API Keys

### Google PageSpeed Insights API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **PageSpeed Insights API**:
   - Navigate to **APIs & Services** → **Library**
   - Search for "PageSpeed Insights API"
   - Click **Enable**
4. Create an API key:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key (you'll add it to Supabase in Step 2)
   - (Optional) Restrict the API key to PageSpeed Insights API only for security

**Note:** PageSpeed Insights API has a free tier with generous limits. Check [pricing](https://developers.google.com/speed/docs/insights/v5/get-started#pricing) for details.

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** in the sidebar
4. Click **Create new secret key**
5. Give it a name (e.g., "DoneWell Audit System")
6. Copy the API key (you'll only see it once!)

**Note:** The system uses `gpt-4o-mini` model for cost efficiency. Check [OpenAI pricing](https://openai.com/api/pricing/) for current rates.

## Step 2: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Open the file: `supabase/migrations/003_audit_outreach_schema.sql`
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This creates:
- Three tables: `lead_sites`, `site_audits`, `email_drafts`
- Helper views: `lead_audit_summary`, `review_queue`, `audit_history`, `lead_overview`
- Rate limiting functions: `can_audit_domain()`, `get_daily_audit_count()`, `check_rate_limits()`
- Triggers for maintaining `is_latest` flag and `updated_at` timestamps
- Indexes for optimal query performance
- RLS policies for security

## Step 3: Set Environment Variables

Add the following secrets to your Supabase Edge Functions:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add each secret:

### Required Secrets

**PAGESPEED_API_KEY**
- Name: `PAGESPEED_API_KEY`
- Value: Your Google PageSpeed Insights API key
- Description: `API key for Google PageSpeed Insights`

**OPENAI_API_KEY**
- Name: `OPENAI_API_KEY`
- Value: Your OpenAI API key
- Description: `API key for OpenAI GPT models`

**SUPABASE_URL** (usually already set)
- Name: `SUPABASE_URL`
- Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- Description: `Supabase project URL`

**SUPABASE_SERVICE_ROLE_KEY** (usually already set)
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Supabase service role key (found in Settings → API)
- Description: `Supabase service role key for admin operations`

**Note:** The service role key has elevated permissions. Keep it secure and never expose it in client-side code.

## Step 4: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /Users/kevoo/Cursor/donewell/donewell_ui_4
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy run-pagespeed-audit
supabase functions deploy generate-insights
supabase functions deploy generate-email
supabase functions deploy send-audit-email
supabase functions deploy process-lead  # Orchestrator function
```

### Option B: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase dashboard
2. For each function:
   - Click **Create a new function**
   - Name it: `run-pagespeed-audit`, `generate-insights`, `generate-email`, `send-audit-email`, or `process-lead`
   - Copy the contents from the corresponding `index.ts` file
   - Paste into the editor
   - Click **Deploy**

**Functions to deploy:**
- `run-pagespeed-audit` - Runs PageSpeed Insights audit
- `generate-insights` - Generates business-friendly insights
- `generate-email` - Creates email draft
- `send-audit-email` - Sends the email via Resend
- `process-lead` - Orchestrator that runs all steps automatically (recommended)

## Step 5: Test the System

### Testing Tips

**Rate Limiting:** The system prevents auditing the same domain within 30 days. For testing:
- Use different URLs/domains for each test
- Or clear test audits using the SQL script: `supabase/migrations/004_clear_test_audits.sql`
- Or temporarily modify the rate limit in the database function

### 1. Create a Test Lead

Via Supabase Dashboard:
1. Go to **Table Editor** → `lead_sites`
2. Click **Insert row**
3. Fill in:
   - `company_name`: "Test Company"
   - `contact_name`: "John Doe"
   - `email`: "john@testcompany.com"
   - `website_url`: "https://example.com"
   - `status`: "new"
4. Click **Save** and copy the `id` (UUID)

### 2. Run an Audit

```bash
curl -X POST https://udiskjjuszutgpvkogzw.supabase.co/functions/v1/run-pagespeed-audit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXNramp1c3p1dGdwdmtvZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTQ3NTQsImV4cCI6MjA4MTU3MDc1NH0.StYBeyYIVUqiknAnl-bRY7hICoOYH5B2sRau7ginbKg" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://kevinlaronda.com",
    "lead_id": "8c03a9e2-2fbb-4ea5-8538-0f52a15a2724"
  }'
```

Expected response:
```json
{
  "success": true,
  "audit_id": "uuid",
  "scores": {
    "performance": 85,
    "accessibility": 90,
    "seo": 88,
    "best_practices": 92,
    "overall": 89,
    "grade": "B"
  },
  "core_web_vitals": {
    "lcp": 2.5,
    "cls": 0.1,
    "inp": 150
  }
}
```

### 3. Generate Insights

**Finding the audit_id:**
- Copy the `audit_id` from the audit response (see Step 2 above)
- Or find it in Supabase: Table Editor → `site_audits` → copy the `id` column
- Or query: `SELECT id FROM site_audits ORDER BY audit_run_at DESC LIMIT 1;`

```bash
curl -X POST https://udiskjjuszutgpvkogzw.supabase.co/functions/v1/generate-insights \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXNramp1c3p1dGdwdmtvZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTQ3NTQsImV4cCI6MjA4MTU3MDc1NH0.StYBeyYIVUqiknAnl-bRY7hICoOYH5B2sRau7ginbKg" \
  -H "Content-Type: application/json" \
  -d '{
    "audit_id": "7aaa9ca4-8fdb-4407-a82d-4807a03f46f5"
  }'
```

Expected response:
```json
{
  "success": true,
  "insights": [
    "The site takes several seconds to load on mobile, which can cause visitors to leave early.",
    "Some accessibility signals suggest parts of the site may be harder to navigate for all users.",
    "Search engines may not be fully understanding the structure of key pages."
  ],
  "audit_id": "uuid"
}
```

### 4. Generate Email Draft

```bash
curl -X POST https://udiskjjuszutgpvkogzw.supabase.co/functions/v1/generate-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXNramp1c3p1dGdwdmtvZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTQ3NTQsImV4cCI6MjA4MTU3MDc1NH0.StYBeyYIVUqiknAnl-bRY7hICoOYH5B2sRau7ginbKg" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "8c03a9e2-2fbb-4ea5-8538-0f52a15a2724"
  }'
```

Expected response:
```json
{
  "success": true,
  "email_draft_id": "uuid",
  "subject": "Quick note about your website",
  "body": "Hi John,\n\nI came across Test Company's website...",
  "lead_id": "uuid"
}
```

## Usage Workflow

### Complete Workflow

1. **Create Lead** (via Supabase dashboard or API)
   ```sql
   INSERT INTO lead_sites (company_name, contact_name, email, website_url)
   VALUES ('Acme Corp', 'Jane Smith', 'jane@acme.com', 'https://acme.com');
   ```

2. **Run Audit**
   ```bash
   POST /functions/v1/run-pagespeed-audit
   { "url": "https://acme.com", "lead_id": "..." }
   ```
   - Checks rate limits automatically
   - Stores results in `site_audits`
   - Updates lead status to 'audited'

3. **Generate Insights**
   ```bash
   POST /functions/v1/generate-insights
   { "audit_id": "..." }
   ```
   - Converts technical metrics to business-friendly insights
   - Stores in `site_audits.insights`

4. **Generate Email Draft**
   ```bash
   POST /functions/v1/generate-email
   { "lead_id": "..." }
   ```
   - Creates personalized email based on insights
   - Stores in `email_drafts` with status='draft'
   - Updates lead status to 'emailed'

5. **Review & Edit** (via Supabase dashboard)
   - View email drafts in `email_drafts` table
   - Edit `edited_body` if needed
   - Add `notes` for context
   - Update `status` to 'approved' when ready

6. **Send Email** (external system)
   - Query `email_drafts` where `status='approved'`
   - Send via your email service
   - Update `status='sent'` and `sent_at` timestamp

## Automated Workflow (Recommended)

Instead of calling each function manually, you can use the orchestrator function to run all steps automatically.

### Option 1: Manual Orchestrator Call

Call the `process-lead` function with a `lead_id` to automatically run all 4 steps:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-lead \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "your-lead-id-here"
  }'
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid",
  "steps": {
    "audit": { "success": true, "data": { "audit_id": "uuid", "scores": {...} } },
    "insights": { "success": true, "data": { "insights": [...] } },
    "email": { "success": true, "data": { "email_draft_id": "uuid", "subject": "..." } },
    "send": { "success": true, "data": { "message_id": "uuid", "sent_to": "..." } }
  },
  "message": "Workflow completed successfully"
}
```

**What it does:**
1. Runs PageSpeed audit
2. Generates insights (continues even if this fails)
3. Generates email draft
4. Sends email automatically

**Error Handling:**
- If audit fails → workflow stops, returns error
- If insights fail → logs warning, continues without insights
- If email generation fails → workflow stops, returns error
- If send fails → logs error, keeps email as draft for manual retry

### Option 2: Automatic Database Trigger

To automatically process leads when they're inserted into the database:

1. **Deploy the orchestrator function first:**
   ```bash
   supabase functions deploy process-lead
   ```

2. **Run the trigger migration:**
   - Open `supabase/migrations/005_auto_process_lead_trigger.sql`
   - **IMPORTANT:** Update the function with your actual values:
     - Replace `'udiskjjuszutgpvkogzw'` with your Supabase project reference
     - Replace `'YOUR_ANON_KEY_HERE'` with your Supabase anon key
   - Run the SQL in Supabase SQL Editor

3. **Test it:**
   ```sql
   INSERT INTO lead_sites (company_name, contact_name, email, website_url)
   VALUES ('Test Company', 'John Doe', 'john@test.com', 'https://example.com');
   ```
   
   The trigger will automatically call `process-lead` and run the full workflow.

**To disable the trigger:**
```sql
DROP TRIGGER IF EXISTS auto_process_lead_trigger ON lead_sites;
```

**To re-enable:**
```sql
CREATE TRIGGER auto_process_lead_trigger
  AFTER INSERT ON lead_sites
  FOR EACH ROW
  WHEN (NEW.status = 'new')
  EXECUTE FUNCTION auto_process_lead();
```

**Note:** The trigger is fire-and-forget (async), so errors won't block the INSERT. Check Edge Function logs if the workflow doesn't run.

## Rate Limiting

The system includes built-in rate limiting:

- **Per Domain**: Maximum 1 audit per domain per 30 days
- **Daily Limit**: Maximum 50 audits per day (across all domains)

Rate limits are checked automatically before each audit. If exceeded, the API returns:
```json
{
  "error": "Rate limit exceeded",
  "reason": "Domain audited within last 30 days"
}
```

## Helper Views

The schema includes helper views for easy querying:

### `lead_audit_summary`
Latest audit per lead with scores and insights:
```sql
SELECT * FROM lead_audit_summary WHERE lead_id = '...';
```

### `review_queue`
Email drafts ready for review, sorted by priority:
```sql
SELECT * FROM review_queue;
```

### `audit_history`
Complete audit timeline for all leads:
```sql
SELECT * FROM audit_history WHERE lead_id = '...';
```

### `lead_overview`
Complete lead info with latest audit and email status:
```sql
SELECT * FROM lead_overview WHERE status = 'emailed';
```

## Troubleshooting

### "PAGESPEED_API_KEY not configured"
- Check that the secret is set in Supabase Edge Functions
- Verify the key name is exactly `PAGESPEED_API_KEY`

### "OPENAI_API_KEY not configured"
- Check that the secret is set in Supabase Edge Functions
- Verify the key name is exactly `OPENAI_API_KEY`

### "Rate limit exceeded"
- **For testing:** Use a different URL/domain, or clear test audits
- **In production:** Wait 30 days before auditing the same domain again
- Check daily limit (max 50 audits per day)
- To clear test audits, run: `supabase/migrations/004_clear_test_audits.sql` in SQL Editor

### "Lead not found"
- Verify the `lead_id` exists in `lead_sites` table
- Check that the UUID is correct

### "No audit found"
- Run `run-pagespeed-audit` first before generating insights or emails
- Verify `audit_id` exists in `site_audits` table

### "No insights found"
- Run `generate-insights` first before generating emails
- Check that `site_audits.insights` is not empty

### OpenAI API Errors
- Check your OpenAI account balance
- Verify API key is valid and has permissions
- Check OpenAI status page for outages

### PageSpeed Insights API Errors
- Verify API key is valid
- Check that PageSpeed Insights API is enabled in Google Cloud
- Verify URL is publicly accessible (not behind authentication)

## Schema Reference

### Tables

**lead_sites**
- Stores company/contact information
- Status: 'new', 'audited', 'emailed', 'archived'
- Includes UI-friendly fields: `status`, `notes`, `priority`, `tags`

**site_audits**
- Stores Lighthouse/PageSpeed Insights results
- Includes computed fields: `overall_score`, `grade`
- Stores insights as JSONB array

**email_drafts**
- Stores generated email drafts
- Status: 'draft', 'approved', 'sent', 'archived'
- Includes `edited_body` for manual edits

### Computed Fields

- `overall_score`: Average of 4 category scores (0-100)
- `grade`: Letter grade based on overall score (A-F)
- `is_latest`: Boolean flag for latest audit per lead (maintained via trigger)

## Security Notes

- Service role key has admin access - never expose in client code
- RLS policies allow public read, authenticated write
- API keys stored as Supabase secrets (encrypted)
- Rate limiting prevents abuse

## Quick Reference: All API Endpoints

### Individual Functions

1. **Run Audit**
   ```bash
   POST /functions/v1/run-pagespeed-audit
   { "url": "https://example.com", "lead_id": "uuid" }
   ```

2. **Generate Insights**
   ```bash
   POST /functions/v1/generate-insights
   { "audit_id": "uuid" }
   ```

3. **Generate Email**
   ```bash
   POST /functions/v1/generate-email
   { "lead_id": "uuid" }
   ```

4. **Send Email**
   ```bash
   POST /functions/v1/send-audit-email
   { "email_draft_id": "uuid" }
   ```

### Orchestrator Function (Recommended)

**Process Complete Workflow:**
```bash
POST /functions/v1/process-lead
{ "lead_id": "uuid" }
```

This single call runs all 4 steps automatically:
1. Audit → 2. Insights → 3. Email → 4. Send

## Next Steps

- Set up a lightweight review UI (future enhancement)
- Integrate with email sending service (Resend, SendGrid, etc.)
- Add webhook for external systems to query approved emails
- Set up monitoring/alerting for API failures

## Support

For issues or questions:
1. Check Edge Function logs in Supabase dashboard
2. Review this documentation
3. Check API status pages (OpenAI, Google Cloud)

