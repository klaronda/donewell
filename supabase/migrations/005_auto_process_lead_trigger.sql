-- Auto-process Lead Trigger
-- Migration: 005_auto_process_lead_trigger.sql
-- This trigger automatically calls the process-lead orchestrator function when a new lead is inserted

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call the orchestrator Edge Function
-- IMPORTANT: Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with your actual values before running
CREATE OR REPLACE FUNCTION auto_process_lead()
RETURNS TRIGGER AS $$
DECLARE
  project_ref TEXT := 'udiskjjuszutgpvkogzw'; -- Replace with your Supabase project reference
  anon_key TEXT := 'YOUR_ANON_KEY_HERE'; -- Replace with your Supabase anon key
  function_url TEXT;
BEGIN
  -- Only process if status is 'new' (to avoid re-processing)
  IF NEW.status != 'new' THEN
    RETURN NEW;
  END IF;

  -- Build the function URL
  function_url := 'https://' || project_ref || '.supabase.co/functions/v1/process-lead';

  -- Call the orchestrator Edge Function asynchronously
  -- This is fire-and-forget, so errors won't block the INSERT
  -- Errors will be logged but won't prevent the lead from being created
  -- Timeout set to 2 minutes (120000ms) to allow for audit + insights + email generation + sending
  PERFORM
    net.http_post(
      url := function_url,
      body := jsonb_build_object(
        'lead_id', NEW.id
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      timeout_milliseconds := 120000
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the INSERT
    RAISE WARNING 'Failed to trigger auto_process_lead for lead_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires AFTER INSERT on lead_sites
CREATE TRIGGER auto_process_lead_trigger
  AFTER INSERT ON lead_sites
  FOR EACH ROW
  WHEN (NEW.status = 'new')
  EXECUTE FUNCTION auto_process_lead();

-- Comments
COMMENT ON FUNCTION auto_process_lead() IS 'Automatically calls the process-lead orchestrator function when a new lead is inserted';
COMMENT ON TRIGGER auto_process_lead_trigger ON lead_sites IS 'Triggers automatic audit workflow when a new lead is created';

-- IMPORTANT: Before enabling this trigger, update the function with your actual values:
-- 1. Replace 'udiskjjuszutgpvkogzw' with your Supabase project reference
-- 2. Replace 'YOUR_ANON_KEY_HERE' with your Supabase anon key (from Settings → API)
--
-- To update the function:
-- ALTER FUNCTION auto_process_lead() SET project_ref = 'your_project_ref';
-- (Note: This syntax may not work - you may need to recreate the function with correct values)

-- To disable this trigger, run:
-- DROP TRIGGER IF EXISTS auto_process_lead_trigger ON lead_sites;

-- To re-enable after disabling:
-- CREATE TRIGGER auto_process_lead_trigger
--   AFTER INSERT ON lead_sites
--   FOR EACH ROW
--   WHEN (NEW.status = 'new')
--   EXECUTE FUNCTION auto_process_lead();

