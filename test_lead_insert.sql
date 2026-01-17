-- Test Lead Insert for Kevin Laronda
-- Run this in your Supabase SQL Editor

-- First, check if lead already exists
SELECT id, company_name, email, website_url, status 
FROM lead_sites 
WHERE email = 'hollaronda@gmail.com' OR website_url = 'donewellco.com';

-- If no results, insert the test lead
INSERT INTO lead_sites (
  company_name,
  first_name,
  last_name,
  email,
  website_url,
  status
) VALUES (
  'DoneWell Design Co',
  'Kevin',
  'Laronda',
  'hollaronda@gmail.com',
  'donewellco.com',
  'new'
) 
ON CONFLICT DO NOTHING
RETURNING id, company_name, email, website_url, status;

-- After insert, the trigger should automatically call process-lead
-- Check the queue to see if it was added:
SELECT 
  q.id as queue_id,
  q.lead_id,
  q.status,
  q.scheduled_send_at,
  ls.company_name,
  ls.email
FROM lead_processing_queue q
JOIN lead_sites ls ON q.lead_id = ls.id
WHERE ls.email = 'hollaronda@gmail.com'
ORDER BY q.created_at DESC
LIMIT 1;
