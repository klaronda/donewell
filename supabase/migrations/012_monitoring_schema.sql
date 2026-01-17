-- DoneWell Essentials Monitoring Schema
-- Migration: 012_monitoring_schema.sql
-- Core tables for site monitoring, health checks, incidents, and notifications

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Subscription tier enum
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('none', 'essentials', 'care');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Site status enum
DO $$ BEGIN
  CREATE TYPE site_status AS ENUM ('active', 'paused', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Health check type enum
DO $$ BEGIN
  CREATE TYPE health_check_type AS ENUM ('uptime', 'health_api', 'cms', 'form', 'seo', 'ssl');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Check result enum
DO $$ BEGIN
  CREATE TYPE check_result AS ENUM ('ok', 'warn', 'fail');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Severity enum
DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('sev-1', 'sev-2', 'sev-3');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Incident status enum
DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM ('open', 'monitoring', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notification recipient enum
DO $$ BEGIN
  CREATE TYPE notification_recipient AS ENUM ('internal', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notification channel enum
DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'slack');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- SITES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS monitored_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id TEXT NOT NULL UNIQUE,  -- e.g., 'klr_prod_001'
  site_name TEXT NOT NULL,       -- e.g., 'kevinlaronda.com'
  primary_domain TEXT NOT NULL,  -- e.g., 'https://kevinlaronda.com'
  environment TEXT NOT NULL DEFAULT 'production',
  client_id UUID,                -- FK to leads/clients table (optional)
  subscription_tier subscription_tier NOT NULL DEFAULT 'none',
  status site_status NOT NULL DEFAULT 'active',
  
  -- Site secrets for authenticated endpoints
  site_secret TEXT,              -- For /api/health/log endpoint
  
  -- Contact info for notifications
  client_email TEXT,
  internal_email TEXT NOT NULL DEFAULT 'kevin@donewell.co',
  
  -- Deploy suppression window
  last_deploy_at TIMESTAMP WITH TIME ZONE,
  deploy_suppression_minutes INTEGER NOT NULL DEFAULT 15,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- HEALTH CHECKS TABLE (Definitions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  check_type health_check_type NOT NULL,
  target TEXT NOT NULL,          -- URL or endpoint path
  frequency_minutes INTEGER NOT NULL DEFAULT 5,
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Check-specific config
  timeout_ms INTEGER NOT NULL DEFAULT 5000,
  expected_status INTEGER DEFAULT 200,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(site_id, check_type, target)
);

-- =============================================================================
-- HEALTH EVENTS TABLE (Results)
-- =============================================================================

CREATE TABLE IF NOT EXISTS health_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  check_id UUID REFERENCES health_checks(id) ON DELETE SET NULL,
  check_type health_check_type NOT NULL,
  
  result check_result NOT NULL,
  latency_ms INTEGER,
  http_status INTEGER,
  error_message TEXT,
  raw_payload JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partition by month for efficient querying (optional, implement later)
CREATE INDEX IF NOT EXISTS idx_health_events_site_created ON health_events(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_events_result ON health_events(result);
CREATE INDEX IF NOT EXISTS idx_health_events_check_type ON health_events(check_type);

-- =============================================================================
-- INCIDENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  
  severity severity_level NOT NULL,
  status incident_status NOT NULL DEFAULT 'open',
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Trigger info
  trigger_check_type health_check_type,
  trigger_event_ids UUID[] DEFAULT '{}',
  
  -- Timestamps
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Resolution info
  resolution_notes TEXT,
  auto_resolved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_site_status ON incidents(site_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_opened_at ON incidents(opened_at DESC);

-- =============================================================================
-- NOTIFICATIONS TABLE (Audit Trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  
  recipient notification_recipient NOT NULL,
  channel notification_channel NOT NULL,
  
  recipient_address TEXT NOT NULL,  -- Email, phone, or Slack channel
  subject TEXT,
  body TEXT,
  
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  delivery_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_incident ON notifications(incident_id);
CREATE INDEX IF NOT EXISTS idx_notifications_site ON notifications(site_id);

-- =============================================================================
-- DEPLOY EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS deploy_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  
  deploy_id TEXT NOT NULL,       -- Vercel deploy ID
  environment TEXT NOT NULL DEFAULT 'production',
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deploy_events_site ON deploy_events(site_id, created_at DESC);

-- =============================================================================
-- ERROR LOGS TABLE (Push from sites)
-- =============================================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  
  severity severity_level NOT NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  path TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  -- Processing
  processed BOOLEAN DEFAULT false,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_site ON error_logs(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_unprocessed ON error_logs(processed) WHERE processed = false;

-- =============================================================================
-- MONTHLY REPORTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  
  report_month DATE NOT NULL,    -- First day of the month
  
  -- Summary stats
  uptime_percentage DECIMAL(5,2),
  total_incidents INTEGER DEFAULT 0,
  sev1_count INTEGER DEFAULT 0,
  sev2_count INTEGER DEFAULT 0,
  sev3_count INTEGER DEFAULT 0,
  
  -- Latest scores (from PageSpeed)
  performance_score INTEGER,
  accessibility_score INTEGER,
  seo_score INTEGER,
  
  -- Report content
  status TEXT,                   -- 'all_clear', 'attention', 'action_needed'
  summary_bullets JSONB,         -- Array of plain English bullets
  
  -- Delivery
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_email TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(site_id, report_month)
);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if site is in deploy suppression window
CREATE OR REPLACE FUNCTION is_in_deploy_suppression(p_site_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_deploy TIMESTAMP WITH TIME ZONE;
  v_suppression_minutes INTEGER;
BEGIN
  SELECT last_deploy_at, deploy_suppression_minutes
  INTO v_last_deploy, v_suppression_minutes
  FROM monitored_sites
  WHERE id = p_site_id;
  
  IF v_last_deploy IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN NOW() < (v_last_deploy + (v_suppression_minutes || ' minutes')::INTERVAL);
END;
$$ LANGUAGE plpgsql;

-- Function to get recent consecutive failures for a check
CREATE OR REPLACE FUNCTION get_consecutive_failures(p_site_id UUID, p_check_type health_check_type)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_event RECORD;
BEGIN
  FOR v_event IN
    SELECT result
    FROM health_events
    WHERE site_id = p_site_id AND check_type = p_check_type
    ORDER BY created_at DESC
    LIMIT 10
  LOOP
    IF v_event.result = 'fail' THEN
      v_count := v_count + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access (admin)
CREATE POLICY "Allow authenticated access on monitored_sites"
  ON monitored_sites FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on health_checks"
  ON health_checks FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on health_events"
  ON health_events FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on incidents"
  ON incidents FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on notifications"
  ON notifications FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on deploy_events"
  ON deploy_events FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on error_logs"
  ON error_logs FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access on monthly_reports"
  ON monthly_reports FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role full access (for Edge Functions)
CREATE POLICY "Allow service role on monitored_sites"
  ON monitored_sites FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on health_checks"
  ON health_checks FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on health_events"
  ON health_events FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on incidents"
  ON incidents FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on notifications"
  ON notifications FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on deploy_events"
  ON deploy_events FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on error_logs"
  ON error_logs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role on monthly_reports"
  ON monthly_reports FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at
CREATE TRIGGER update_monitored_sites_updated_at
  BEFORE UPDATE ON monitored_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_checks_updated_at
  BEFORE UPDATE ON health_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE monitored_sites IS 'Sites registered for DoneWell monitoring';
COMMENT ON TABLE health_checks IS 'Health check definitions per site';
COMMENT ON TABLE health_events IS 'Results of each health check execution';
COMMENT ON TABLE incidents IS 'Incidents created when severity thresholds are crossed';
COMMENT ON TABLE notifications IS 'Audit trail of all notifications sent';
COMMENT ON TABLE deploy_events IS 'Deploy webhooks received from sites';
COMMENT ON TABLE error_logs IS 'Error logs pushed from sites';
COMMENT ON TABLE monthly_reports IS 'Generated monthly reports per site';



