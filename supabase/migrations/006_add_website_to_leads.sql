-- Add website column to leads table
-- Migration: 006_add_website_to_leads.sql
-- Run this in your Supabase SQL Editor

-- Add website column to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS website TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leads.website IS 'Optional website URL provided by the lead';
