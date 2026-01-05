-- Set up pg_cron to run process-queue every 5 minutes
-- Migration: 011_setup_queue_scheduler.sql
-- Run this in your Supabase SQL Editor

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to call process-queue Edge Function
CREATE OR REPLACE FUNCTION call_process_queue()
RETURNS void AS $$
DECLARE
  project_ref TEXT := 'udiskjjuszutgpvkogzw';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXNramp1c3p1dGdwdmtvZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTQ3NTQsImV4cCI6MjA4MTU3MDc1NH0.StYBeyYIVUqiknAnl-bRY7hICoOYH5B2sRau7ginbKg';
  function_url TEXT;
BEGIN
  -- Construct function URL
  function_url := format('https://%s.supabase.co/functions/v1/process-queue', project_ref);
  
  -- Make HTTP request to process-queue function
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', format('Bearer %s', anon_key),
        'apikey', anon_key
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 300000
    );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Failed to call process-queue: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Remove existing job if it exists
SELECT cron.unschedule('process-lead-queue') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-lead-queue'
);

-- Schedule job to run every 5 minutes
SELECT cron.schedule(
  'process-lead-queue',
  '*/5 * * * *', -- Every 5 minutes
  'SELECT call_process_queue();'
);

-- Comments
COMMENT ON FUNCTION call_process_queue() IS 'Calls the process-queue Edge Function to process queued leads';

