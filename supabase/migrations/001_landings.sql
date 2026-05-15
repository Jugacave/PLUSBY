-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Landings table
CREATE TABLE IF NOT EXISTS landings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users NOT NULL,
  name          TEXT        NOT NULL,
  product       TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  template      TEXT        DEFAULT 'impact',
  published     BOOLEAN     DEFAULT FALSE,
  views         INTEGER     DEFAULT 0,
  conversions   INTEGER     DEFAULT 0,
  accent_color  TEXT        DEFAULT '#FF6B35',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Landing sections table
CREATE TABLE IF NOT EXISTS landing_sections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id  UUID        REFERENCES landings(id) ON DELETE CASCADE NOT NULL,
  type        TEXT        NOT NULL,
  position    INTEGER     NOT NULL,
  headline    TEXT,
  subtext     TEXT,
  cta_text    TEXT,
  items       JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE landings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

-- 4. Landings policies
-- Owners can do everything on their own landings
CREATE POLICY "owners_all_landings" ON landings
  FOR ALL USING (auth.uid() = user_id);

-- Anyone (including anon) can read published landings
CREATE POLICY "public_read_published_landings" ON landings
  FOR SELECT USING (published = TRUE);

-- 5. Sections policies
-- Owners can do everything on sections of their landings
CREATE POLICY "owners_all_sections" ON landing_sections
  FOR ALL USING (
    landing_id IN (SELECT id FROM landings WHERE user_id = auth.uid())
  );

-- Anyone can read sections of published landings
CREATE POLICY "public_read_published_sections" ON landing_sections
  FOR SELECT USING (
    landing_id IN (SELECT id FROM landings WHERE published = TRUE)
  );

-- 6. Auto-update updated_at on landings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS landings_updated_at ON landings;
CREATE TRIGGER landings_updated_at
  BEFORE UPDATE ON landings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
