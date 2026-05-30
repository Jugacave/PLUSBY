-- ============================================================
-- PLUSBY — Migration 005: Repair profiles (all-in-one)
-- Run this ONCE in Supabase SQL Editor. Safe and idempotent.
-- It fixes any partial/legacy profiles table by adding missing
-- columns, recreating the signup trigger, backfilling, and
-- rebuilding RLS policies.
-- ============================================================

-- ─── 1. Create table if it doesn't exist (bare minimum) ──────

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ─── 2. Add every column we need, idempotently ───────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email        text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name    text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url   text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role         text NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan         text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status       text NOT NULL DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at  timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rejected_at  timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at   timestamptz DEFAULT now();

-- ─── 3. Drop legacy CHECK constraints, then re-add them ──────

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'superadmin'));
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- ─── 4. Re-create signup trigger ─────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, plan, status, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user'),
    'free',
    'pending',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 5. Backfill missing profiles + fix nulls ────────────────

INSERT INTO public.profiles (id, email, full_name, role, plan, status, created_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(u.raw_user_meta_data ->> 'role', 'user'),
  'free',
  'pending',
  u.created_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Fill email for legacy profiles that didn't have it
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- ─── 6. RLS ──────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own"    ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all"   ON public.profiles;
DROP POLICY IF EXISTS "admins_update_all" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own"  ON public.profiles;
DROP POLICY IF EXISTS "service_role_all"  ON public.profiles;

CREATE POLICY "users_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admins_read_all" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

CREATE POLICY "users_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admins_update_all" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  ) WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ─── 7. Promote your own account to superadmin (EDIT EMAIL) ──

UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "superadmin"}'::jsonb
WHERE email = 'jcarranza715@gmail.com';

UPDATE public.profiles
SET role = 'superadmin', status = 'approved', approved_at = NOW()
WHERE email = 'jcarranza715@gmail.com';

-- ─── 8. Diagnostic: verify everything is in place ────────────
-- Run this SELECT separately to check the state:
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- ORDER BY ordinal_position;
--
-- SELECT id, email, role, plan, status, created_at FROM public.profiles ORDER BY created_at DESC;
