-- Create helper functions for rate limiting and scheduling
-- Migration: 009_create_helper_functions.sql
-- Run this in your Supabase SQL Editor

-- Function to check if current time is within business hours (9am-5pm EST)
CREATE OR REPLACE FUNCTION is_business_hours()
RETURNS BOOLEAN AS $$
DECLARE
  current_hour_est INTEGER;
  current_dow INTEGER; -- Day of week (0=Sunday, 6=Saturday)
BEGIN
  -- Get current hour in EST/EDT
  -- Convert UTC to EST (UTC-5) or EDT (UTC-4) depending on DST
  -- Using AT TIME ZONE 'America/New_York' handles DST automatically
  SELECT EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/New_York') INTO current_hour_est;
  SELECT EXTRACT(DOW FROM NOW() AT TIME ZONE 'America/New_York') INTO current_dow;
  
  -- Check if it's a weekday (Monday=1 to Friday=5)
  -- And if hour is between 9 (9am) and 16 (4pm, since hour is 0-23, so 16 means 4pm-5pm)
  -- Actually, we want 9am-5pm, so hours 9-16 inclusive means 9am to 4:59:59pm
  -- But we want to include up to 5pm, so we check hours 9-16 (9am to 4:59pm) OR hour 17 with minute < 1
  -- Actually simpler: check hour >= 9 AND hour < 17 (9am to 4:59:59pm)
  -- But we want to include 5pm, so hour >= 9 AND hour <= 16 (9am to 4:59:59pm)
  -- Actually, 5pm is hour 17, so we want hour >= 9 AND hour < 17
  RETURN (current_dow BETWEEN 1 AND 5) AND (current_hour_est >= 9 AND current_hour_est < 17);
END;
$$ LANGUAGE plpgsql;

-- Function to get today's date in EST
CREATE OR REPLACE FUNCTION get_today_est()
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'America/New_York')::DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get count of emails sent today (EST)
CREATE OR REPLACE FUNCTION get_today_processing_count()
RETURNS INTEGER AS $$
DECLARE
  today_est DATE;
  count_result INTEGER;
BEGIN
  today_est := get_today_est();
  
  SELECT COALESCE(emails_sent_count, 0) INTO count_result
  FROM daily_processing_stats
  WHERE processing_date = today_est;
  
  RETURN COALESCE(count_result, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get the last email send time (for calculating next delay)
CREATE OR REPLACE FUNCTION get_last_email_sent_at()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  today_est DATE;
  last_sent TIMESTAMP WITH TIME ZONE;
BEGIN
  today_est := get_today_est();
  
  SELECT last_email_sent_at INTO last_sent
  FROM daily_processing_stats
  WHERE processing_date = today_est;
  
  RETURN last_sent;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next send time with random 20-45 minute delay
-- Uses the latest scheduled_send_at from queue OR last email sent time, whichever is later
-- This ensures sequential scheduling when multiple leads are queued at once
-- Enforces daily limit of 5 emails per day
CREATE OR REPLACE FUNCTION get_next_send_time()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  last_sent TIMESTAMP WITH TIME ZONE;
  last_scheduled TIMESTAMP WITH TIME ZONE;
  base_time TIMESTAMP WITH TIME ZONE;
  random_minutes INTEGER;
  next_send TIMESTAMP WITH TIME ZONE;
  today_est DATE;
  current_time_est TIMESTAMP WITH TIME ZONE;
  business_hours_start TIMESTAMP WITH TIME ZONE;
  next_send_est TIMESTAMP WITH TIME ZONE;
  next_send_time_est TIME;
  base_date_est_check DATE;
  latest_on_date TIMESTAMP WITH TIME ZONE;
  latest_today TIMESTAMP WITH TIME ZONE;
  base_date_est DATE;
  target_date_est DATE;
  latest_on_target_date TIMESTAMP WITH TIME ZONE;
  conflicting_time TIMESTAMP WITH TIME ZONE;
  time_window_start TIMESTAMP WITH TIME ZONE;
  time_window_end TIMESTAMP WITH TIME ZONE;
  retry_count INTEGER;
  today_count INTEGER;
  target_date_count INTEGER;
  max_per_day INTEGER := 5;
BEGIN
  -- Use advisory lock to serialize concurrent calls and prevent race conditions
  -- This ensures each call sees the previous insert before calculating the next time
  PERFORM pg_advisory_xact_lock(hashtext('get_next_send_time'));
  
  today_est := get_today_est();
  current_time_est := NOW() AT TIME ZONE 'America/New_York';
  
  -- Get count of emails sent today (from stats)
  today_count := get_today_processing_count();
  
  -- Add count of items scheduled for today in the queue
  SELECT COUNT(*) INTO target_date_count
  FROM lead_processing_queue
  WHERE status IN ('pending', 'scheduled', 'processing')
    AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = today_est;
  
  today_count := today_count + target_date_count;
  
  -- If today is at limit, schedule for next business day
  IF today_count >= max_per_day THEN
    -- Find next business day at 9am EST
    business_hours_start := (today_est + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
    WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
      business_hours_start := business_hours_start + INTERVAL '1 day';
    END LOOP;
    
    base_time := business_hours_start AT TIME ZONE 'UTC';
    target_date_est := (base_time AT TIME ZONE 'America/New_York')::DATE;
    
    -- Check how many are already scheduled for the target date
    SELECT COUNT(*) INTO target_date_count
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
    
    -- If target date is also at limit, move to next day
    WHILE target_date_count >= max_per_day LOOP
      business_hours_start := business_hours_start + INTERVAL '1 day';
      WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
        business_hours_start := business_hours_start + INTERVAL '1 day';
      END LOOP;
      base_time := business_hours_start AT TIME ZONE 'UTC';
      target_date_est := (base_time AT TIME ZONE 'America/New_York')::DATE;
      
      SELECT COUNT(*) INTO target_date_count
      FROM lead_processing_queue
      WHERE status IN ('pending', 'scheduled', 'processing')
        AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
    END LOOP;
    
      -- Get the latest scheduled time for the target date
      SELECT MAX(scheduled_send_at) INTO latest_on_target_date
      FROM lead_processing_queue
      WHERE status IN ('pending', 'scheduled', 'processing')
        AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
      
      IF latest_on_target_date IS NOT NULL AND latest_on_target_date >= base_time THEN
        base_time := latest_on_target_date;
      END IF;
      
      -- Generate random delay and calculate next send time
      random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER;
      next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
      
      -- Check business hours (should be fine since we started at 9am, but verify)
      next_send_est := next_send AT TIME ZONE 'America/New_York';
      next_send_time_est := next_send_est::TIME;
      
      IF EXTRACT(DOW FROM next_send_est) IN (0, 6) OR next_send_time_est < '09:00:00'::TIME OR next_send_time_est >= '17:00:00'::TIME THEN
        -- Shouldn't happen since we set to 9am, but safety check - move to next day
        business_hours_start := (next_send_est::DATE + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
        WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
          business_hours_start := business_hours_start + INTERVAL '1 day';
        END LOOP;
        next_send := business_hours_start AT TIME ZONE 'UTC';
        
        -- Re-check queue for this new date
        target_date_est := (next_send AT TIME ZONE 'America/New_York')::DATE;
        SELECT MAX(scheduled_send_at) INTO latest_on_target_date
        FROM lead_processing_queue
        WHERE status IN ('pending', 'scheduled', 'processing')
          AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
        
        IF latest_on_target_date IS NOT NULL AND latest_on_target_date >= next_send THEN
          base_time := latest_on_target_date;
          random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER;
          next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
        END IF;
      END IF;
      
      RETURN next_send;
  ELSE
    -- Today is not at limit, proceed with normal scheduling
    -- Get last email sent time
    last_sent := get_last_email_sent_at();
    
    -- Get the latest scheduled_send_at from the queue (for today or future)
    -- This ensures sequential scheduling when multiple leads are queued
    SELECT MAX(scheduled_send_at) INTO last_scheduled
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing');
    
    -- Use the later of: last_sent, last_scheduled, or NOW()
    -- This ensures we schedule sequentially
    base_time := GREATEST(
      COALESCE(last_sent, '1970-01-01'::TIMESTAMP WITH TIME ZONE),
      COALESCE(last_scheduled, '1970-01-01'::TIMESTAMP WITH TIME ZONE),
      NOW()
    );
  
  -- If base_time is in the past (no emails sent and no queue items), 
  -- and we're not in business hours, schedule for next business day
  IF base_time < NOW() AND NOT is_business_hours() THEN
    -- Use today at 9am EST (or next business day if today is weekend)
    business_hours_start := today_est::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
    -- If today is weekend or past 5pm, move to next business day
    IF EXTRACT(DOW FROM business_hours_start) IN (0, 6) OR (current_time_est::TIME >= '17:00:00'::TIME) THEN
      business_hours_start := (today_est + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
      WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
        business_hours_start := business_hours_start + INTERVAL '1 day';
      END LOOP;
    END IF;
    base_time := business_hours_start AT TIME ZONE 'UTC';
    
    -- Check if there are already items scheduled for this day in the queue
    -- If so, use the latest scheduled time for that day as the base
    base_date_est := (base_time AT TIME ZONE 'America/New_York')::DATE;
    SELECT MAX(scheduled_send_at) INTO latest_today
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = base_date_est;
    
    IF latest_today IS NOT NULL AND latest_today >= base_time THEN
      base_time := latest_today;
    END IF;
  END IF;
  
    -- Also check if we're scheduling for a future day - need to check queue for that specific day
    base_date_est_check := (base_time AT TIME ZONE 'America/New_York')::DATE;
    -- Only check if this is a future date (not today)
    IF base_date_est_check > today_est THEN
      SELECT MAX(scheduled_send_at) INTO latest_on_date
      FROM lead_processing_queue
      WHERE status IN ('pending', 'scheduled', 'processing')
        AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = base_date_est_check;
      
      IF latest_on_date IS NOT NULL AND latest_on_date >= base_time THEN
        base_time := latest_on_date;
      END IF;
    END IF;
    
    -- Generate random delay between 20-45 minutes
    -- Using random() which returns 0.0 to 1.0
    random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER; -- 20 + (0-25) = 20-45
    
    -- Calculate next send time
    next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
  END IF;
  
  -- Final check: ensure we're not scheduling at the same time as another item
  -- Check for any items scheduled within 20 minutes of our calculated time
  -- If found, use the latest one as base and recalculate with minimum delay
  retry_count := 0;
  -- Retry up to 3 times to avoid conflicts
  WHILE retry_count < 3 LOOP
    time_window_start := next_send - INTERVAL '20 minutes';
    time_window_end := next_send + INTERVAL '20 minutes';
    
    SELECT MAX(scheduled_send_at) INTO conflicting_time
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND scheduled_send_at BETWEEN time_window_start AND time_window_end;
    
    IF conflicting_time IS NOT NULL AND conflicting_time > (next_send - INTERVAL '20 minutes') THEN
      -- Use the conflicting time as base and add minimum delay (20 minutes)
      base_time := conflicting_time;
      random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER;
      next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
      
      -- Re-check business hours
      next_send_est := next_send AT TIME ZONE 'America/New_York';
      next_send_time_est := next_send_est::TIME;
      
      IF EXTRACT(DOW FROM next_send_est) IN (0, 6) OR next_send_time_est < '09:00:00'::TIME OR next_send_time_est >= '17:00:00'::TIME THEN
        business_hours_start := (next_send_est::DATE + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
        WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
          business_hours_start := business_hours_start + INTERVAL '1 day';
        END LOOP;
        next_send := business_hours_start AT TIME ZONE 'UTC';
      END IF;
      
      retry_count := retry_count + 1;
    ELSE
      -- No conflict, exit loop
      EXIT;
    END IF;
  END LOOP;
  
  -- Final check: if we're scheduling for today, verify we haven't exceeded the limit
  -- This catches race conditions where multiple leads are queued simultaneously
  base_date_est_check := (next_send AT TIME ZONE 'America/New_York')::DATE;
  IF base_date_est_check = today_est THEN
    -- Re-count items for today (including this one we're about to schedule)
    SELECT COUNT(*) INTO target_date_count
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = today_est;
    
    today_count := get_today_processing_count() + target_date_count;
    
    -- If today is now at limit, move to next business day
    IF today_count >= max_per_day THEN
      business_hours_start := (today_est + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
      WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
        business_hours_start := business_hours_start + INTERVAL '1 day';
      END LOOP;
      
      base_time := business_hours_start AT TIME ZONE 'UTC';
      target_date_est := (base_time AT TIME ZONE 'America/New_York')::DATE;
      
      -- Check count for target date
      SELECT COUNT(*) INTO target_date_count
      FROM lead_processing_queue
      WHERE status IN ('pending', 'scheduled', 'processing')
        AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
      
      -- If target date is also at limit, move to next day
      WHILE target_date_count >= max_per_day LOOP
        business_hours_start := business_hours_start + INTERVAL '1 day';
        WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
          business_hours_start := business_hours_start + INTERVAL '1 day';
        END LOOP;
        base_time := business_hours_start AT TIME ZONE 'UTC';
        target_date_est := (base_time AT TIME ZONE 'America/New_York')::DATE;
        
        SELECT COUNT(*) INTO target_date_count
        FROM lead_processing_queue
        WHERE status IN ('pending', 'scheduled', 'processing')
          AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
      END LOOP;
      
      -- Get latest scheduled time for target date
      SELECT MAX(scheduled_send_at) INTO latest_on_target_date
      FROM lead_processing_queue
      WHERE status IN ('pending', 'scheduled', 'processing')
        AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
      
      IF latest_on_target_date IS NOT NULL AND latest_on_target_date >= base_time THEN
        base_time := latest_on_target_date;
      END IF;
      
      -- Recalculate with new base time
      random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER;
      next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
    END IF;
  END IF;
  
  -- Convert to EST for business hours check
  next_send_est := next_send AT TIME ZONE 'America/New_York';
  next_send_time_est := next_send_est::TIME;
  
  -- If next_send is outside business hours, move to next business day 9am EST
  IF EXTRACT(DOW FROM next_send_est) IN (0, 6) OR next_send_time_est < '09:00:00'::TIME OR next_send_time_est >= '17:00:00'::TIME THEN
    -- Find next business day at 9am EST
    -- Start from the day after next_send
    business_hours_start := (next_send_est::DATE + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
    
    -- If that day is Saturday (6) or Sunday (0), move to Monday
    WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
      business_hours_start := business_hours_start + INTERVAL '1 day';
    END LOOP;
    
    -- Convert back to UTC
    next_send := business_hours_start AT TIME ZONE 'UTC';
    
    -- Check if there are already items scheduled for this target day in the queue
    -- If so, use the latest scheduled time for that day as the base
    target_date_est := (next_send AT TIME ZONE 'America/New_York')::DATE;
    SELECT MAX(scheduled_send_at) INTO latest_on_target_date
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
    
    IF latest_on_target_date IS NOT NULL AND latest_on_target_date >= next_send THEN
      -- Use the latest scheduled time as base, then add random delay
      base_time := latest_on_target_date;
      random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER;
      next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
      
      -- Re-check business hours after recalculating
      next_send_est := next_send AT TIME ZONE 'America/New_York';
      next_send_time_est := next_send_est::TIME;
      
      -- If still outside business hours, move to next day (shouldn't happen, but safety check)
      IF EXTRACT(DOW FROM next_send_est) IN (0, 6) OR next_send_time_est < '09:00:00'::TIME OR next_send_time_est >= '17:00:00'::TIME THEN
        business_hours_start := (next_send_est::DATE + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
        WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
          business_hours_start := business_hours_start + INTERVAL '1 day';
        END LOOP;
        next_send := business_hours_start AT TIME ZONE 'UTC';
      END IF;
    END IF;
  END IF;
  
  -- FINAL CHECK: Enforce daily limit on the target date
  -- This catches cases where we scheduled for a future day that's already at limit
  LOOP
    target_date_est := (next_send AT TIME ZONE 'America/New_York')::DATE;
    
    -- Count items scheduled for the target date
    SELECT COUNT(*) INTO target_date_count
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
    
    -- If under limit, we're done
    IF target_date_count < max_per_day THEN
      EXIT;
    END IF;
    
    -- Target date is at limit, move to next business day
    business_hours_start := (target_date_est + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
    WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
      business_hours_start := business_hours_start + INTERVAL '1 day';
    END LOOP;
    
    base_time := business_hours_start AT TIME ZONE 'UTC';
    target_date_est := (base_time AT TIME ZONE 'America/New_York')::DATE;
    
    -- Check for existing items on the new target date
    SELECT MAX(scheduled_send_at) INTO latest_on_target_date
    FROM lead_processing_queue
    WHERE status IN ('pending', 'scheduled', 'processing')
      AND (scheduled_send_at AT TIME ZONE 'America/New_York')::DATE = target_date_est;
    
    IF latest_on_target_date IS NOT NULL AND latest_on_target_date >= base_time THEN
      base_time := latest_on_target_date;
    END IF;
    
    -- Calculate new send time
    random_minutes := 20 + FLOOR(RANDOM() * 26)::INTEGER;
    next_send := base_time + (random_minutes || ' minutes')::INTERVAL;
    
    -- Check business hours
    next_send_est := next_send AT TIME ZONE 'America/New_York';
    next_send_time_est := next_send_est::TIME;
    
    IF EXTRACT(DOW FROM next_send_est) IN (0, 6) OR next_send_time_est < '09:00:00'::TIME OR next_send_time_est >= '17:00:00'::TIME THEN
      -- Move to next day 9am
      business_hours_start := (next_send_est::DATE + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/New_York' + INTERVAL '9 hours';
      WHILE EXTRACT(DOW FROM business_hours_start) IN (0, 6) LOOP
        business_hours_start := business_hours_start + INTERVAL '1 day';
      END LOOP;
      next_send := business_hours_start AT TIME ZONE 'UTC';
    END IF;
    
    -- Loop will re-check this new date
  END LOOP;
  
  RETURN next_send;
END;
$$ LANGUAGE plpgsql;

-- Function to check if we can process a lead right now
CREATE OR REPLACE FUNCTION can_process_lead()
RETURNS BOOLEAN AS $$
DECLARE
  today_count INTEGER;
  max_per_day INTEGER := 5;
BEGIN
  -- Check business hours
  IF NOT is_business_hours() THEN
    RETURN FALSE;
  END IF;
  
  -- Check daily limit
  today_count := get_today_processing_count();
  IF today_count >= max_per_day THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment daily stats (called after successful email send)
CREATE OR REPLACE FUNCTION increment_daily_stats()
RETURNS VOID AS $$
DECLARE
  today_est DATE;
BEGIN
  today_est := get_today_est();
  
  -- Upsert daily stats
  INSERT INTO daily_processing_stats (processing_date, emails_sent_count, last_email_sent_at)
  VALUES (today_est, 1, NOW())
  ON CONFLICT (processing_date)
  DO UPDATE SET
    emails_sent_count = daily_processing_stats.emails_sent_count + 1,
    last_email_sent_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to enqueue a lead atomically (calculates time AND inserts in one transaction)
-- This prevents race conditions by holding a lock across both operations
CREATE OR REPLACE FUNCTION enqueue_lead(p_lead_id UUID)
RETURNS TABLE(queue_id UUID, scheduled_send_at TIMESTAMP WITH TIME ZONE, already_queued BOOLEAN) AS $$
DECLARE
  v_next_send TIMESTAMP WITH TIME ZONE;
  v_queue_id UUID;
  v_existing_id UUID;
BEGIN
  -- Use advisory lock to serialize concurrent calls
  PERFORM pg_advisory_xact_lock(hashtext('enqueue_lead'));
  
  -- Check if lead is already in queue
  SELECT id INTO v_existing_id
  FROM lead_processing_queue
  WHERE lead_id = p_lead_id
    AND status IN ('pending', 'scheduled', 'processing')
  LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    -- Return existing queue item
    RETURN QUERY
    SELECT lpq.id, lpq.scheduled_send_at, TRUE
    FROM lead_processing_queue lpq
    WHERE lpq.id = v_existing_id;
    RETURN;
  END IF;
  
  -- Calculate next send time (this now sees all previous inserts due to the lock)
  v_next_send := get_next_send_time();
  
  -- Insert into queue
  INSERT INTO lead_processing_queue (lead_id, status, scheduled_send_at)
  VALUES (p_lead_id, 'scheduled', v_next_send)
  RETURNING id INTO v_queue_id;
  
  -- Return the new queue item
  RETURN QUERY
  SELECT v_queue_id, v_next_send, FALSE;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION is_business_hours() IS 'Returns true if current time is 9am-5pm EST on a weekday';
COMMENT ON FUNCTION get_today_est() IS 'Returns today''s date in EST timezone';
COMMENT ON FUNCTION get_today_processing_count() IS 'Returns count of emails sent today (EST calendar date)';
COMMENT ON FUNCTION get_last_email_sent_at() IS 'Returns timestamp of last email sent today, or NULL if none';
COMMENT ON FUNCTION get_next_send_time() IS 'Calculates next send time with random 20-45 minute delay, respecting business hours';
COMMENT ON FUNCTION can_process_lead() IS 'Checks if we can process a lead now (business hours + under daily limit)';
COMMENT ON FUNCTION increment_daily_stats() IS 'Increments daily email count and updates last send time';
COMMENT ON FUNCTION enqueue_lead(UUID) IS 'Atomically calculates send time and inserts lead into queue';

