-- Add trial and config columns to monitored_sites
-- Migration: 014_add_site_config_columns.sql

-- Add trial period tracking
ALTER TABLE monitored_sites 
ADD COLUMN IF NOT EXISTS trial_start_date DATE,
ADD COLUMN IF NOT EXISTS trial_end_date DATE;

-- Add CMS configuration (what tables to check)
ALTER TABLE monitored_sites 
ADD COLUMN IF NOT EXISTS cms_table TEXT,
ADD COLUMN IF NOT EXISTS forms_table TEXT;

-- Add index for trial expiration queries
CREATE INDEX IF NOT EXISTS idx_monitored_sites_trial_end 
ON monitored_sites(trial_end_date) 
WHERE trial_end_date IS NOT NULL;

-- Update default internal email
ALTER TABLE monitored_sites 
ALTER COLUMN internal_email SET DEFAULT 'contact@donewellco.com';

COMMENT ON COLUMN monitored_sites.trial_start_date IS 'Start date of trial period';
COMMENT ON COLUMN monitored_sites.trial_end_date IS 'End date of trial period (typically 14 days from start)';
COMMENT ON COLUMN monitored_sites.cms_table IS 'Name of the CMS table to check (e.g., projects, testimonials)';
COMMENT ON COLUMN monitored_sites.forms_table IS 'Name of the forms table to check (e.g., contact_submissions)';



