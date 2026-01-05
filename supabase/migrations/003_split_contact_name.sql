-- Split contact_name into first_name and last_name
-- Migration: 003_split_contact_name.sql
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns for first_name and last_name
ALTER TABLE lead_sites
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Step 2: Migrate existing data from contact_name
-- Split contact_name on the last space (handles multiple middle names)
-- Logic: Everything before the last space = first_name, last word = last_name
UPDATE lead_sites
SET 
  first_name = CASE 
    WHEN contact_name IS NULL OR trim(contact_name) = '' THEN NULL
    WHEN strpos(trim(contact_name), ' ') = 0 THEN trim(contact_name)  -- No space, use whole name as first
    ELSE trim(left(trim(contact_name), length(trim(contact_name)) - strpos(reverse(trim(contact_name)), ' ')))  -- Everything except last word
  END,
  last_name = CASE 
    WHEN contact_name IS NULL OR trim(contact_name) = '' THEN NULL
    WHEN strpos(trim(contact_name), ' ') = 0 THEN NULL  -- No space, no last name
    ELSE trim((string_to_array(trim(contact_name), ' '))[array_length(string_to_array(trim(contact_name), ' '), 1)])  -- Last word from array
  END
WHERE contact_name IS NOT NULL;

-- Step 3: Set defaults for new records
-- Note: We keep first_name nullable to handle edge cases, but it should generally be populated
ALTER TABLE lead_sites
  ALTER COLUMN last_name SET DEFAULT NULL;

-- Step 4: Drop views that depend on contact_name before we can drop the column
DROP VIEW IF EXISTS review_queue;
DROP VIEW IF EXISTS audit_history;
DROP VIEW IF EXISTS lead_overview;

-- Step 5: Drop the contact_name column entirely
ALTER TABLE lead_sites
  DROP COLUMN IF EXISTS contact_name;

-- Step 6: Recreate views with first_name and last_name (no contact_name)
-- Recreate review_queue view
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

-- Recreate audit_history view
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

-- Recreate lead_overview view
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

-- Step 7: Add comment for documentation
COMMENT ON COLUMN lead_sites.first_name IS 'Contact first name';
COMMENT ON COLUMN lead_sites.last_name IS 'Contact last name';

