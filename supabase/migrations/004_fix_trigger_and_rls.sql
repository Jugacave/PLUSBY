-- ============================================================
-- PLUSBY — Migration 004: Fix trigger + RLS for admin panel
-- Run this in Supabase SQL Editor if users don't appear in admin.
-- Safe to run multiple times (idempotent).
-- ============================================================

-- ─── 1. Re-create trigger to auto-create profile on signup ───

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

-- ─── 2. Backfill profiles for existing auth.users without one ─

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

-- ─── 3. Ensure RLS is enabled ─────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─── 4. Drop and re-create all policies cleanly ───────────────

DROP POLICY IF EXISTS "users_read_own"      ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all"     ON public.profiles;
DROP POLICY IF EXISTS "admins_update_all"   ON public.profiles;
DROP POLICY IF EXISTS "users_update_own"    ON public.profiles;
DROP POLICY IF EXISTS "service_role_all"    ON public.profiles;

-- Users read their own profile
CREATE POLICY "users_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins and superadmins read ALL profiles (needed for the admin panel)
CREATE POLICY "admins_read_all" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- Users update their own profile (name, avatar, etc.)
CREATE POLICY "users_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins and superadmins update ALL profiles (approve/reject/role change)
CREATE POLICY "admins_update_all" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  ) WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ─── 5. Helper: set your own account as superadmin ────────────
-- Uncomment and replace the email, then run:
--
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "superadmin"}'::jsonb
-- WHERE email = 'your@email.com';
--
-- UPDATE public.profiles SET role = 'superadmin', status = 'approved'
-- WHERE email = 'your@email.com';
