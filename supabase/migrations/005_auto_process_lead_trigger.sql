-- Auto-trigger process-lead when new lead is inserted
-- Migration: 005_auto_process_lead_trigger.sql
-- Run this in your Supabase SQL Editor

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call process-lead Edge Function
CREATE OR REPLACE FUNCTION auto_process_lead()
RETURNS TRIGGER AS $$
DECLARE
  project_ref TEXT := 'udiskjjuszutgpvkogzw';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXNramp1c3p1dGdwdmtvZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTQ3NTQsImV4cCI6MjA4MTU3MDc1NH0.StYBeyYIVUqiknAnl-bRY7hICoOYH5B2sRau7ginbKg';
  function_url TEXT;
BEGIN
  -- Construct function URL
  function_url := format('https://%s.supabase.co/functions/v1/process-lead', project_ref);
  
  -- Make HTTP request to process-lead function
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', format('Bearer %s', anon_key),
        'apikey', anon_key
      ),
      body := jsonb_build_object(
        'lead_id', NEW.id
      ),
      timeout_milliseconds := 120000
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger auto_process_lead for lead_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires AFTER INSERT on lead_sites
CREATE TRIGGER trigger_auto_process_lead
  AFTER INSERT ON lead_sites
  FOR EACH ROW
  WHEN (NEW.status = 'new')
  EXECUTE FUNCTION auto_process_lead();

-- Comment for documentation
COMMENT ON FUNCTION auto_process_lead() IS 'Automatically calls process-lead Edge Function when a new lead is inserted';
COMMENT ON TRIGGER trigger_auto_process_lead ON lead_sites IS 'Triggers process-lead workflow when new lead is inserted with status=new';
