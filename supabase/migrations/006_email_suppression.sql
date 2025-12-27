-- Email Suppression Table
-- Migration: 006_email_suppression.sql
-- Run this in your Supabase SQL Editor

-- Create email_suppression table
CREATE TABLE IF NOT EXISTS email_suppression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT,
  suppressed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'unsubscribe_page'
);

-- Create index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_email_suppression_email ON email_suppression(email);

-- Enable Row Level Security
ALTER TABLE email_suppression ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public insert (for unsubscribe), authenticated read/write
CREATE POLICY "Allow public insert for unsubscribe"
  ON email_suppression FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access on email_suppression"
  ON email_suppression FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access on email_suppression"
  ON email_suppression FOR ALL
  USING (auth.role() = 'authenticated');

-- Comment for documentation
COMMENT ON TABLE email_suppression IS 'Stores suppressed email addresses to prevent future outreach emails';
