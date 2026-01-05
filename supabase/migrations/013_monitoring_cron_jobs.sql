-- DoneWell Essentials Monitoring - Cron Jobs
-- Migration: 013_monitoring_cron_jobs.sql
-- Sets up pg_cron jobs for health polling and monthly reports

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =============================================================================
-- HEALTH POLLING JOB (Every 5 minutes)
-- =============================================================================

-- Function to call poll-health-checks Edge Function
CREATE OR REPLACE FUNCTION call_poll_health_checks()
RETURNS void AS $$
DECLARE
  project_ref TEXT := 'udiskjjuszutgpvkogzw';
  service_key TEXT;
  function_url TEXT;
BEGIN
  -- Get service role key from vault (or use anon key for now)
  service_key := current_setting('app.supabase_service_role_key', true);
  
  -- If no service key, skip (function will handle auth)
  IF service_key IS NULL THEN
    service_key := '';
  END IF;
  
  function_url := format('https://%s.supabase.co/functions/v1/poll-health-checks', project_ref);
  
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', service_key)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to call poll-health-checks: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Remove existing job if it exists
DO $$
BEGIN
  PERFORM cron.unschedule('poll-health-checks');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule health polling every 30 minutes (Essentials tier)
-- Care tier could use more frequent polling (e.g., */5 for 5 minutes)
SELECT cron.schedule(
  'poll-health-checks',
  '*/30 * * * *',
  'SELECT call_poll_health_checks();'
);

-- =============================================================================
-- MONTHLY REPORT JOB (1st of each month at 9am UTC)
-- =============================================================================

-- Function to call generate-monthly-report Edge Function
CREATE OR REPLACE FUNCTION call_generate_monthly_report()
RETURNS void AS $$
DECLARE
  project_ref TEXT := 'udiskjjuszutgpvkogzw';
  service_key TEXT;
  function_url TEXT;
BEGIN
  service_key := current_setting('app.supabase_service_role_key', true);
  
  IF service_key IS NULL THEN
    service_key := '';
  END IF;
  
  function_url := format('https://%s.supabase.co/functions/v1/generate-monthly-report', project_ref);
  
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', service_key)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to call generate-monthly-report: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Remove existing job if it exists
DO $$
BEGIN
  PERFORM cron.unschedule('generate-monthly-reports');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule monthly report on 1st of each month at 9am UTC (2am PST)
SELECT cron.schedule(
  'generate-monthly-reports',
  '0 9 1 * *',
  'SELECT call_generate_monthly_report();'
);

-- =============================================================================
-- AUTO-RESOLVE STALE INCIDENTS (Every hour)
-- =============================================================================

-- Function to auto-resolve incidents that have been quiet for 30+ minutes
CREATE OR REPLACE FUNCTION auto_resolve_stale_incidents()
RETURNS void AS $$
DECLARE
  v_incident RECORD;
  v_last_failure TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR v_incident IN
    SELECT i.id, i.site_id, i.trigger_check_type
    FROM incidents i
    WHERE i.status = 'open'
    AND i.opened_at < NOW() - INTERVAL '30 minutes'
  LOOP
    -- Check if there have been any failures in the last 30 minutes
    SELECT MAX(created_at) INTO v_last_failure
    FROM health_events
    WHERE site_id = v_incident.site_id
    AND check_type = v_incident.trigger_check_type
    AND result = 'fail'
    AND created_at > NOW() - INTERVAL '30 minutes';
    
    -- If no recent failures, auto-resolve
    IF v_last_failure IS NULL THEN
      UPDATE incidents
      SET 
        status = 'resolved',
        resolved_at = NOW(),
        auto_resolved = true,
        resolution_notes = 'Auto-resolved: No failures detected for 30+ minutes'
      WHERE id = v_incident.id;
      
      RAISE NOTICE 'Auto-resolved incident: %', v_incident.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Remove existing job if it exists
DO $$
BEGIN
  PERFORM cron.unschedule('auto-resolve-incidents');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule auto-resolve check every hour
SELECT cron.schedule(
  'auto-resolve-incidents',
  '0 * * * *',
  'SELECT auto_resolve_stale_incidents();'
);

-- =============================================================================
-- CLEANUP OLD HEALTH EVENTS (Weekly)
-- =============================================================================

-- Function to clean up old health events (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_events()
RETURNS void AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM health_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % old health events', v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Remove existing job if it exists
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-health-events');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule cleanup every Sunday at 3am UTC
SELECT cron.schedule(
  'cleanup-health-events',
  '0 3 * * 0',
  'SELECT cleanup_old_health_events();'
);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION call_poll_health_checks() IS 'Calls poll-health-checks Edge Function every 5 minutes';
COMMENT ON FUNCTION call_generate_monthly_report() IS 'Calls generate-monthly-report Edge Function on 1st of each month';
COMMENT ON FUNCTION auto_resolve_stale_incidents() IS 'Auto-resolves incidents with no failures for 30+ minutes';
COMMENT ON FUNCTION cleanup_old_health_events() IS 'Cleans up health events older than 90 days';

