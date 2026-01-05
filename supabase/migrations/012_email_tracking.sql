-- Email Tracking Migration
-- Migration: 012_email_tracking.sql
-- Adds support for tracking email opens, clicks, and other events via Resend webhooks

-- Step 1: Add resend_message_id column to email_drafts
ALTER TABLE email_drafts
ADD COLUMN IF NOT EXISTS resend_message_id TEXT;

-- Create index for looking up emails by Resend message ID
CREATE INDEX IF NOT EXISTS idx_email_drafts_resend_message_id 
ON email_drafts(resend_message_id) 
WHERE resend_message_id IS NOT NULL;

-- Step 2: Create email_events table to store webhook events
CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resend_message_id TEXT NOT NULL,
  email_draft_id UUID REFERENCES email_drafts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES lead_sites(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
  event_data JSONB, -- Full event payload from Resend
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_events_resend_message_id ON email_events(resend_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_draft_id ON email_events(email_draft_id);
CREATE INDEX IF NOT EXISTS idx_email_events_lead_id ON email_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_email_events_draft_type ON email_events(email_draft_id, event_type);

-- Enable RLS
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated read access on email_events"
  ON email_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access on email_events"
  ON email_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Comments
COMMENT ON TABLE email_events IS 'Stores email tracking events from Resend webhooks (opens, clicks, bounces, etc.)';
COMMENT ON COLUMN email_events.resend_message_id IS 'The unique message ID from Resend API';
COMMENT ON COLUMN email_events.email_draft_id IS 'Reference to the email_drafts record (if found)';
COMMENT ON COLUMN email_events.lead_id IS 'Reference to the lead_sites record (extracted from tags)';
COMMENT ON COLUMN email_events.event_type IS 'Type of event: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained';
COMMENT ON COLUMN email_events.event_data IS 'Full JSON payload from the Resend webhook';

-- Step 3: Create a view for email analytics
CREATE OR REPLACE VIEW email_analytics AS
SELECT 
  ed.id AS email_draft_id,
  ed.lead_id,
  ls.company_name,
  ls.email AS recipient_email,
  ed.subject,
  ed.sent_at,
  ed.resend_message_id,
  -- Count events by type
  COUNT(CASE WHEN ee.event_type = 'email.sent' THEN 1 END) AS sent_count,
  COUNT(CASE WHEN ee.event_type = 'email.delivered' THEN 1 END) AS delivered_count,
  COUNT(CASE WHEN ee.event_type = 'email.opened' THEN 1 END) AS open_count,
  COUNT(CASE WHEN ee.event_type = 'email.clicked' THEN 1 END) AS click_count,
  COUNT(CASE WHEN ee.event_type = 'email.bounced' THEN 1 END) AS bounce_count,
  COUNT(CASE WHEN ee.event_type = 'email.complained' THEN 1 END) AS complaint_count,
  -- First event timestamps
  MIN(CASE WHEN ee.event_type = 'email.delivered' THEN ee.created_at END) AS first_delivered_at,
  MIN(CASE WHEN ee.event_type = 'email.opened' THEN ee.created_at END) AS first_opened_at,
  MIN(CASE WHEN ee.event_type = 'email.clicked' THEN ee.created_at END) AS first_clicked_at
FROM email_drafts ed
LEFT JOIN lead_sites ls ON ed.lead_id = ls.id
LEFT JOIN email_events ee ON ed.id = ee.email_draft_id
WHERE ed.status = 'sent'
GROUP BY ed.id, ed.lead_id, ls.company_name, ls.email, ed.subject, ed.sent_at, ed.resend_message_id;

COMMENT ON VIEW email_analytics IS 'Aggregated email tracking analytics per sent email';

