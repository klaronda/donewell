-- Helper script to clear test audits for development/testing
-- Run this in Supabase SQL Editor when you need to re-test the same URL

-- Option 1: Delete all audits for a specific domain
-- Replace 'example.com' with the domain you want to clear
DELETE FROM site_audits
WHERE lead_id IN (
  SELECT id FROM lead_sites
  WHERE website_url LIKE '%example.com%'
);

-- Option 2: Delete all test audits (use with caution!)
-- Uncomment the line below to delete ALL audits
-- DELETE FROM site_audits;

-- Option 3: Delete audits older than X days (e.g., 1 day for testing)
-- Uncomment and adjust the interval as needed
-- DELETE FROM site_audits
-- WHERE audit_run_at < NOW() - INTERVAL '1 day';

-- After deleting audits, you may also want to reset lead statuses
UPDATE lead_sites
SET status = 'new'
WHERE status = 'audited' OR status = 'emailed';



