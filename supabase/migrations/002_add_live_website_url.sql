-- Add live_website_url column to projects table
-- Run this in your Supabase SQL Editor if you already ran 001_initial_schema.sql

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS live_website_url TEXT;



