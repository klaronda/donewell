-- Automated Website Audit & Outreach System Schema
-- Migration: 003_audit_outreach_schema.sql
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE lead_status AS ENUM ('new', 'audited', 'emailed', 'archived');
CREATE TYPE email_draft_status AS ENUM ('draft', 'approved', 'sent', 'archived');

-- Table: lead_sites
CREATE TABLE IF NOT EXISTS lead_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website_url TEXT NOT NULL,
  industry TEXT,
  
  -- UI-friendly fields
  status lead_status NOT NULL DEFAULT 'new',
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  tags TEXT[] DEFAULT '{}',
  
  -- UI metadata
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: site_audits
CREATE TABLE IF NOT EXISTS site_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES lead_sites(id) ON DELETE CASCADE,
  
  -- Core Lighthouse scores
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  accessibility_score INTEGER CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  best_practices_score INTEGER CHECK (best_practices_score >= 0 AND best_practices_score <= 100),
  
  -- Core Web Vitals
  lcp NUMERIC, -- Largest Contentful Paint (seconds)
  cls NUMERIC, -- Cumulative Layout Shift
  inp NUMERIC, -- Interaction to Next Paint (milliseconds)
  
  -- Raw data
  raw_json JSONB,
  
  -- UI-friendly fields
  overall_score INTEGER GENERATED ALWAYS AS (
    ROUND((COALESCE(performance_score, 0) + 
           COALESCE(accessibility_score, 0) + 
           COALESCE(seo_score, 0) + 
           COALESCE(best_practices_score, 0)) / 4.0)
  ) STORED,
  grade TEXT GENERATED ALWAYS AS (
    CASE
      WHEN ROUND((COALESCE(performance_score, 0) + 
                  COALESCE(accessibility_score, 0) + 
                  COALESCE(seo_score, 0) + 
                  COALESCE(best_practices_score, 0)) / 4.0) >= 90 THEN 'A'
      WHEN ROUND((COALESCE(performance_score, 0) + 
                  COALESCE(accessibility_score, 0) + 
                  COALESCE(seo_score, 0) + 
                  COALESCE(best_practices_score, 0)) / 4.0) >= 75 THEN 'B'
      WHEN ROUND((COALESCE(performance_score, 0) + 
                  COALESCE(accessibility_score, 0) + 
                  COALESCE(seo_score, 0) + 
                  COALESCE(best_practices_score, 0)) / 4.0) >= 60 THEN 'C'
      WHEN ROUND((COALESCE(performance_score, 0) + 
                  COALESCE(accessibility_score, 0) + 
                  COALESCE(seo_score, 0) + 
                  COALESCE(best_practices_score, 0)) / 4.0) >= 45 THEN 'D'
      ELSE 'F'
    END
  ) STORED,
  insights JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  -- UI metadata
  is_latest BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  
  audit_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: email_drafts
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES lead_sites(id) ON DELETE CASCADE,
  
  -- Core fields
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status email_draft_status NOT NULL DEFAULT 'draft',
  
  -- UI-friendly fields
  edited_body TEXT,
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  
  -- UI metadata
  last_edited_at TIMESTAMP WITH TIME ZONE,
  last_edited_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for UI queries
CREATE INDEX IF NOT EXISTS idx_lead_sites_status ON lead_sites(status);
CREATE INDEX IF NOT EXISTS idx_lead_sites_priority ON lead_sites(priority);
CREATE INDEX IF NOT EXISTS idx_lead_sites_created_at ON lead_sites(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_sites_company_name ON lead_sites(company_name);
CREATE INDEX IF NOT EXISTS idx_lead_sites_website_url ON lead_sites(website_url);

CREATE INDEX IF NOT EXISTS idx_site_audits_lead_id ON site_audits(lead_id);
CREATE INDEX IF NOT EXISTS idx_site_audits_audit_run_at ON site_audits(audit_run_at);
CREATE INDEX IF NOT EXISTS idx_site_audits_overall_score ON site_audits(overall_score);
CREATE INDEX IF NOT EXISTS idx_site_audits_is_latest ON site_audits(is_latest) WHERE is_latest = true;

CREATE INDEX IF NOT EXISTS idx_email_drafts_lead_id ON email_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_drafts_status ON email_drafts(status);
CREATE INDEX IF NOT EXISTS idx_email_drafts_created_at ON email_drafts(generated_at);
CREATE INDEX IF NOT EXISTS idx_email_drafts_priority ON email_drafts(priority);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lead_sites updated_at
CREATE TRIGGER update_lead_sites_updated_at
  BEFORE UPDATE ON lead_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to maintain is_latest flag on site_audits
CREATE OR REPLACE FUNCTION update_latest_audit_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Set all audits for this lead to is_latest = false
  UPDATE site_audits
  SET is_latest = false
  WHERE lead_id = NEW.lead_id AND id != NEW.id;
  
  -- Set this audit to is_latest = true
  NEW.is_latest = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain is_latest flag
CREATE TRIGGER update_site_audits_latest_flag
  BEFORE INSERT OR UPDATE ON site_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_latest_audit_flag();

-- Function to check if domain can be audited (rate limiting: 30 days)
CREATE OR REPLACE FUNCTION can_audit_domain(url_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  domain_to_check TEXT;
  last_audit_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extract domain from URL (simple extraction)
  domain_to_check := regexp_replace(
    regexp_replace(url_to_check, '^https?://', '', 'i'),
    '/.*$', '', 'g'
  );
  
  -- Get the most recent audit for this domain
  SELECT MAX(sa.audit_run_at)
  INTO last_audit_date
  FROM site_audits sa
  JOIN lead_sites ls ON sa.lead_id = ls.id
  WHERE regexp_replace(
    regexp_replace(ls.website_url, '^https?://', '', 'i'),
    '/.*$', '', 'g'
  ) = domain_to_check;
  
  -- If no previous audit, allow
  IF last_audit_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if 30 days have passed
  RETURN (NOW() - last_audit_date) >= INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get daily audit count
CREATE OR REPLACE FUNCTION get_daily_audit_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM site_audits
    WHERE audit_run_at >= NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limits(url_to_check TEXT)
RETURNS TABLE(can_proceed BOOLEAN, reason TEXT) AS $$
DECLARE
  daily_count INTEGER;
  domain_allowed BOOLEAN;
BEGIN
  -- Check daily limit (max 50 audits per day)
  daily_count := get_daily_audit_count();
  IF daily_count >= 50 THEN
    RETURN QUERY SELECT false, 'Daily audit limit reached (50 audits per day)'::TEXT;
    RETURN;
  END IF;
  
  -- Check domain rate limit (30 days)
  domain_allowed := can_audit_domain(url_to_check);
  IF NOT domain_allowed THEN
    RETURN QUERY SELECT false, 'Domain audited within last 30 days'::TEXT;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT true, 'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Helper view: lead_audit_summary
CREATE OR REPLACE VIEW lead_audit_summary AS
SELECT 
  ls.id AS lead_id,
  ls.company_name,
  ls.website_url,
  ls.status AS lead_status,
  sa.overall_score,
  sa.grade,
  sa.performance_score,
  sa.accessibility_score,
  sa.seo_score,
  sa.best_practices_score,
  sa.insights,
  sa.audit_run_at,
  sa.id AS audit_id
FROM lead_sites ls
LEFT JOIN site_audits sa ON ls.id = sa.lead_id AND sa.is_latest = true;

-- Helper view: review_queue
CREATE OR REPLACE VIEW review_queue AS
SELECT 
  ed.*,
  ls.company_name,
  ls.contact_name,
  ls.email,
  ls.website_url,
  sa.overall_score,
  sa.grade,
  sa.insights
FROM email_drafts ed
JOIN lead_sites ls ON ed.lead_id = ls.id
LEFT JOIN site_audits sa ON ls.id = sa.lead_id AND sa.is_latest = true
WHERE ed.status = 'draft'
ORDER BY ed.priority DESC, ed.generated_at ASC;

-- Helper view: audit_history
CREATE OR REPLACE VIEW audit_history AS
SELECT 
  sa.*,
  ls.company_name,
  ls.website_url,
  ls.contact_name
FROM site_audits sa
JOIN lead_sites ls ON sa.lead_id = ls.id
ORDER BY sa.audit_run_at DESC;

-- Helper view: lead_overview
CREATE OR REPLACE VIEW lead_overview AS
SELECT 
  ls.*,
  sa.overall_score AS latest_overall_score,
  sa.grade AS latest_grade,
  sa.audit_run_at AS latest_audit_date,
  ed.status AS latest_email_status,
  ed.generated_at AS latest_email_date,
  (SELECT COUNT(*) FROM site_audits WHERE lead_id = ls.id) AS audit_count,
  (SELECT COUNT(*) FROM email_drafts WHERE lead_id = ls.id) AS email_count
FROM lead_sites ls
LEFT JOIN site_audits sa ON ls.id = sa.lead_id AND sa.is_latest = true
LEFT JOIN LATERAL (
  SELECT status, generated_at
  FROM email_drafts
  WHERE lead_id = ls.id
  ORDER BY generated_at DESC
  LIMIT 1
) ed ON true;

-- Enable Row Level Security (RLS)
ALTER TABLE lead_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to write, public read for audits
CREATE POLICY "Allow authenticated write access on lead_sites"
  ON lead_sites FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on lead_sites"
  ON lead_sites FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated write access on site_audits"
  ON site_audits FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on site_audits"
  ON site_audits FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated write access on email_drafts"
  ON email_drafts FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on email_drafts"
  ON email_drafts FOR SELECT
  USING (true);

-- Comments for documentation
COMMENT ON TABLE lead_sites IS 'Stores lead/company information for website audit outreach';
COMMENT ON TABLE site_audits IS 'Stores Lighthouse/PageSpeed Insights audit results';
COMMENT ON TABLE email_drafts IS 'Stores generated email drafts for outreach';
COMMENT ON VIEW lead_audit_summary IS 'Latest audit summary per lead for UI display';
COMMENT ON VIEW review_queue IS 'Email drafts ready for review, sorted by priority';
COMMENT ON VIEW audit_history IS 'Complete audit timeline for all leads';
COMMENT ON VIEW lead_overview IS 'Complete lead information with latest audit and email status';

