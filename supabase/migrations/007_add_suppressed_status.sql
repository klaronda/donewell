-- Add 'suppressed' status to lead_status enum
-- Migration: 007_add_suppressed_status.sql
-- Run this in your Supabase SQL Editor

-- Add 'suppressed' to the lead_status enum
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'suppressed';

-- Comment for documentation
COMMENT ON TYPE lead_status IS 'Lead status: new, audited, emailed, archived, suppressed';

