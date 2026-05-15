-- Run in Supabase SQL Editor
ALTER TABLE landings ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'page';
