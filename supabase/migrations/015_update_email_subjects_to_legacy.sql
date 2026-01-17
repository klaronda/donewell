-- Update existing email subjects to include (Legacy) tag
-- Migration: 015_update_email_subjects_to_legacy.sql
--
-- This migration updates all existing email drafts with the subject
-- "A quick note after reviewing your homepage" to include "(Legacy)"
-- to indicate these were sent before proper email tracking was implemented

UPDATE email_drafts
SET subject = 'A quick note after reviewing your homepage (Legacy)'
WHERE subject = 'A quick note after reviewing your homepage';

-- Add comment
COMMENT ON COLUMN email_drafts.subject IS 'Email subject line. Legacy emails include "(Legacy)" tag.';
