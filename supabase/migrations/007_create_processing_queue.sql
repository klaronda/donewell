-- Create lead_processing_queue table
-- Migration: 007_create_processing_queue.sql
-- Run this in your Supabase SQL Editor

-- Create enum for queue status (if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE queue_status AS ENUM ('pending', 'scheduled', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create lead_processing_queue table
CREATE TABLE IF NOT EXISTS lead_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  status queue_status NOT NULL DEFAULT 'pending',
  scheduled_send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lead_processing_queue_lead_id_fkey'
  ) THEN
    ALTER TABLE lead_processing_queue
      ADD CONSTRAINT lead_processing_queue_lead_id_fkey 
      FOREIGN KEY (lead_id) REFERENCES lead_sites(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_lead_processing_queue_status ON lead_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_lead_processing_queue_scheduled_send_at ON lead_processing_queue(scheduled_send_at);
CREATE INDEX IF NOT EXISTS idx_lead_processing_queue_lead_id ON lead_processing_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_processing_queue_status_scheduled ON lead_processing_queue(status, scheduled_send_at) WHERE status IN ('scheduled', 'pending');

-- Enable RLS
ALTER TABLE lead_processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated write access on lead_processing_queue"
  ON lead_processing_queue FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on lead_processing_queue"
  ON lead_processing_queue FOR SELECT
  USING (true);

-- Comments
COMMENT ON TABLE lead_processing_queue IS 'Queue for processing leads with rate limiting and scheduling';
COMMENT ON COLUMN lead_processing_queue.status IS 'Status: pending (just added), scheduled (ready to process), processing (in progress), completed (done), failed (error)';
COMMENT ON COLUMN lead_processing_queue.scheduled_send_at IS 'When the email should be sent (includes random delay)';
COMMENT ON COLUMN lead_processing_queue.processed_at IS 'When processing actually completed';
COMMENT ON COLUMN lead_processing_queue.error_message IS 'Error message if processing failed';

