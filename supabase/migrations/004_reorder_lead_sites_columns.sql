-- Reorder columns in lead_sites table
-- Migration: 004_reorder_lead_sites_columns.sql
-- This will move first_name and last_name to appear right after company_name

-- Step 1: Drop views that depend on the table
DROP VIEW IF EXISTS review_queue;
DROP VIEW IF EXISTS audit_history;
DROP VIEW IF EXISTS lead_overview;

-- Step 2: Create new table with desired column order
CREATE TABLE lead_sites_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  first_name TEXT NOT NULL,  -- Required (NOT NULL)
  last_name TEXT,            -- Optional (nullable)
  email TEXT NOT NULL,
  website_url TEXT NOT NULL,
  industry TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  tags TEXT[] DEFAULT '{}',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Copy all data from old table to new table
-- Handle NULL first_name by using a default value (since first_name is now required)
INSERT INTO lead_sites_new (
  id, company_name, first_name, last_name, email, website_url, industry,
  status, notes, priority, tags, last_reviewed_at, last_reviewed_by,
  created_by, created_at, updated_at
)
SELECT 
  id, 
  company_name, 
  COALESCE(first_name, 'Unknown') as first_name,  -- Default to 'Unknown' if NULL
  last_name, 
  email, 
  website_url, 
  industry,
  status, 
  notes, 
  priority, 
  tags, 
  last_reviewed_at, 
  last_reviewed_by,
  created_by, 
  created_at, 
  updated_at
FROM lead_sites;

-- Step 4: Drop old table
DROP TABLE lead_sites CASCADE;

-- Step 5: Rename new table to original name
ALTER TABLE lead_sites_new RENAME TO lead_sites;

-- Step 6: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_lead_sites_status ON lead_sites(status);
CREATE INDEX IF NOT EXISTS idx_lead_sites_priority ON lead_sites(priority);
CREATE INDEX IF NOT EXISTS idx_lead_sites_created_at ON lead_sites(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_sites_company_name ON lead_sites(company_name);
CREATE INDEX IF NOT EXISTS idx_lead_sites_website_url ON lead_sites(website_url);

-- Step 7: Recreate foreign key constraints that reference lead_sites
-- These were dropped when we dropped the old table, so we need to recreate them
ALTER TABLE email_drafts
  ADD CONSTRAINT email_drafts_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES lead_sites(id) ON DELETE CASCADE;

ALTER TABLE site_audits
  ADD CONSTRAINT site_audits_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES lead_sites(id) ON DELETE CASCADE;

-- Step 8: Recreate RLS policies
ALTER TABLE lead_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated write access on lead_sites"
  ON lead_sites FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on lead_sites"
  ON lead_sites FOR SELECT
  USING (true);

-- Step 9: Recreate trigger for updated_at
CREATE TRIGGER update_lead_sites_updated_at
  BEFORE UPDATE ON lead_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Recreate views
CREATE OR REPLACE VIEW review_queue AS
SELECT 
  ed.*,
  ls.company_name,
  ls.first_name,
  ls.last_name,
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

CREATE OR REPLACE VIEW audit_history AS
SELECT 
  sa.*,
  ls.company_name,
  ls.website_url,
  ls.first_name,
  ls.last_name
FROM site_audits sa
JOIN lead_sites ls ON sa.lead_id = ls.id
ORDER BY sa.audit_run_at DESC;

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

-- Step 11: Add comments
COMMENT ON TABLE lead_sites IS 'Stores lead/company information for website audit outreach';
COMMENT ON COLUMN lead_sites.first_name IS 'Contact first name';
COMMENT ON COLUMN lead_sites.last_name IS 'Contact last name';

