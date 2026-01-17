-- Create daily_processing_stats table
-- Migration: 008_create_daily_stats.sql
-- Run this in your Supabase SQL Editor

-- Create daily_processing_stats table
CREATE TABLE IF NOT EXISTS daily_processing_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  processing_date DATE NOT NULL UNIQUE,
  emails_sent_count INTEGER NOT NULL DEFAULT 0,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient date lookups
CREATE INDEX IF NOT EXISTS idx_daily_processing_stats_date ON daily_processing_stats(processing_date DESC);

-- Enable RLS
ALTER TABLE daily_processing_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated write access on daily_processing_stats"
  ON daily_processing_stats FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on daily_processing_stats"
  ON daily_processing_stats FOR SELECT
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_daily_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_processing_stats_updated_at
  BEFORE UPDATE ON daily_processing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats_updated_at();

-- Comments
COMMENT ON TABLE daily_processing_stats IS 'Tracks daily email sending statistics (resets at midnight EST)';
COMMENT ON COLUMN daily_processing_stats.processing_date IS 'Calendar date in EST timezone';
COMMENT ON COLUMN daily_processing_stats.emails_sent_count IS 'Number of emails sent on this date';
COMMENT ON COLUMN daily_processing_stats.last_email_sent_at IS 'Timestamp of the last email sent on this date';




