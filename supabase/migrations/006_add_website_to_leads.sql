-- Add website column to leads table
-- Migration: 006_add_website_to_leads.sql
-- Run this in your Supabase SQL Editor

-- Step 1: Add website column to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS website TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leads.website IS 'Optional website URL provided by the lead';

-- Step 2: Reorder columns to place website after business_name and before email
-- Note: PostgreSQL doesn't support column positioning in ALTER TABLE,
-- so we need to recreate the table with the desired column order

-- First, create new table with desired column order
CREATE TABLE leads_new (
  id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  business_name TEXT,
  website TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  booked_consult BOOLEAN NOT NULL DEFAULT false,
  calendly_event_uri TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy all data from old table to new table
INSERT INTO leads_new (
  id, first_name, last_name, business_name, website, email, phone,
  message, booked_consult, calendly_event_uri, created_at, updated_at
)
SELECT 
  id, first_name, last_name, business_name, website, email, phone,
  message, booked_consult, calendly_event_uri, created_at, updated_at
FROM leads;

-- Drop old table (this will also drop any dependent objects like indexes, constraints, etc.)
DROP TABLE leads CASCADE;

-- Rename new table to original name
ALTER TABLE leads_new RENAME TO leads;

-- Recreate any indexes that were on the original table
-- (Add your indexes here if you had any on the leads table)
