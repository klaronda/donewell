-- Update auto_process_lead trigger to work with queue system
-- Migration: 010_update_auto_trigger.sql
-- Run this in your Supabase SQL Editor

-- The trigger already calls process-lead, which now adds leads to the queue
-- This migration just updates comments to reflect the new behavior
-- The trigger function itself doesn't need to change

COMMENT ON FUNCTION auto_process_lead() IS 'Automatically calls process-lead Edge Function when a new lead is inserted. process-lead now adds the lead to the processing queue with rate limiting and scheduling.';
COMMENT ON TRIGGER trigger_auto_process_lead ON lead_sites IS 'Triggers process-lead workflow when new lead is inserted with status=new. Leads are added to queue and processed during business hours (9am-5pm EST) with rate limiting (5 per day) and random delays (20-45 min between sends).';




