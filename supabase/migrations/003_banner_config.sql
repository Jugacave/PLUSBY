-- Run in Supabase SQL Editor (after 002_landing_mode.sql)
ALTER TABLE landings ADD COLUMN IF NOT EXISTS banner_config JSONB DEFAULT '{}';
ALTER TABLE landings ADD COLUMN IF NOT EXISTS banner_images JSONB DEFAULT '{}';
