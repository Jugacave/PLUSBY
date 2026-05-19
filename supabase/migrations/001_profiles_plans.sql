-- ============================================================
-- PLUSBY — Migration 001: profiles, plans, subscriptions
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- ─── 1. profiles ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  full_name     text,
  avatar_url    text,
  role          text NOT NULL DEFAULT 'user'    CHECK (role IN ('user', 'admin', 'superadmin')),
  plan          text NOT NULL DEFAULT 'free'    CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at   timestamptz,
  rejected_at   timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- ─── 2. RLS ──────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins and superadmins can read all profiles
CREATE POLICY "admins_read_all" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- Admins and superadmins can update all profiles
CREATE POLICY "admins_update_all" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  ) WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ─── 3. Trigger: auto-create profile on signup ──────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. Approve existing users (run once after migration) ────
-- This prevents existing users from getting locked out.
-- Adjust the WHERE clause if you want to be selective.

UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';

-- ─── 5. plans ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.plans (
  id                               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                             text NOT NULL UNIQUE,  -- free | starter | pro | enterprise
  price_monthly                    numeric DEFAULT 0,
  price_yearly                     numeric DEFAULT 0,
  mercadopago_price_id_monthly     text,
  mercadopago_price_id_yearly      text,
  features                         jsonb DEFAULT '[]'::jsonb,
  created_at                       timestamptz DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read plans
CREATE POLICY "plans_public_read" ON public.plans
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only superadmin can modify plans
CREATE POLICY "superadmin_manage_plans" ON public.plans
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

-- Seed default plans
INSERT INTO public.plans (name, price_monthly, price_yearly, features) VALUES
  ('free',       0,    0,    '["Acceso básico", "1 landing page", "Herramientas IA limitadas"]'),
  ('starter',    29,   290,  '["5 landing pages", "Creativos IA", "Proveedores verificados", "Academia completa"]'),
  ('pro',        59,   590,  '["Landings ilimitadas", "Todas las herramientas IA", "Soporte prioritario", "Informe financiero"]'),
  ('enterprise', 149,  1490, '["Todo Pro", "Coaching personalizado", "API access", "White label"]')
ON CONFLICT (name) DO NOTHING;

-- ─── 6. subscriptions ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id                      uuid REFERENCES public.plans(id),
  mercadopago_subscription_id  text,
  status                       text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end           timestamptz,
  created_at                   timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "users_read_own_sub" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all subscriptions
CREATE POLICY "admins_read_all_subs" ON public.subscriptions
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ─── Done ─────────────────────────────────────────────────────
-- After running: go to /admin → Usuarios to manage pending approvals.
