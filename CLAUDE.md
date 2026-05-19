# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **This is NOT the Next.js you know.** This project runs Next.js 16.2.6 — a version with breaking changes that may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code. Heed deprecation notices.

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build + TypeScript check
npm run lint       # ESLint
```

**Always run `npm run build` before pushing.** The Vercel deployment fails silently on any TypeScript error.

Modelo de dos branches con historia divergente — ver skill `plusby-deployment` antes de cualquier push.

---

## Platform Vision

**PlusBy** is a modular premium SaaS platform for Latin American ecommerce and dropshipping. Stack:

- **Framework**: Next.js 16.2.6 + TypeScript strict + App Router
- **Database + Auth**: Supabase (PostgreSQL, RLS enabled, Supabase Auth)
- **Styles**: Tailwind CSS v4 — dark/light mode via CSS vars + `html.dark` / `html.light` class
- **Deploy**: Vercel (env vars configured)
- **Payments**: MercadoPago (subscriptions + one-time)
- **Storage**: Supabase Storage (videos, images, templates)
- **Global state**: Zustand
- **Email**: Resend (planned)

---

## Architecture

### Route groups

```
src/app/
  (auth)/           # login, register, forgot-password, pendiente, rechazado — no sidebar/topbar
  (dashboard)/      # all protected pages — wrapped by DashboardLayout
  api/              # server-side only (AI, landing, etc.)
  l/[slug]/         # public landing page viewer
```

### Dashboard layout

`(dashboard)/layout.tsx` renders `<Sidebar>` + `<Topbar>` + `<main>`. All dashboard pages use `"use client"` and sit inside this shell. Pages manage their own state locally with `useState`.

### Auth & Roles

Two Supabase clients — use the correct one per context:
- `src/lib/supabase/client.ts` → `createClient()` for browser/client components
- `src/lib/supabase/server.ts` → `createClient()` for server components and API routes

#### Roles (stored in `profiles.role` AND `user_metadata.role`)
| Role | Access |
|---|---|
| `superadmin` | Full control — all of /admin, can do everything |
| `admin` | /admin access — manages modules, users, content |
| `user` | Standard dashboard access according to plan |

Set roles with SQL:
```sql
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "superadmin"}'::jsonb WHERE email = 'email@example.com';
-- or "admin" for admin role
```

#### Registration approval flow
New users start with `profiles.status = 'pending'`. Middleware redirects pending users to `/pendiente`. Superadmin or admin approves in `/admin` → Usuarios tab. Rejected users go to `/rechazado`.

`src/middleware.ts` logic:
1. Unauthenticated → `/login`
2. Authenticated on login/register → `/dashboard`
3. `/admin` → only `superadmin` or `admin` roles
4. Non-superadmin authenticated → check `profiles.status`; `pending` → `/pendiente`, `rejected` → `/rechazado`
5. Null profile (legacy user) → let through

---

## Database Schema

### profiles (extends auth.users)
```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  email text,
  avatar_url text,
  role text DEFAULT 'user',          -- user | admin | superadmin
  plan text DEFAULT 'free',          -- free | starter | pro | enterprise
  status text DEFAULT 'pending',     -- pending | approved | rejected
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

Auto-created via trigger on `auth.users` INSERT (SECURITY DEFINER function).
RLS: users read own row; superadmin/admin read+update all.

**Migration file**: `supabase/migrations/001_profiles_plans.sql`

### plans
```sql
CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,                          -- free | starter | pro | enterprise
  price_monthly numeric,
  price_yearly numeric,
  mercadopago_price_id_monthly text,
  mercadopago_price_id_yearly text,
  features jsonb
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  plan_id uuid REFERENCES plans(id),
  mercadopago_subscription_id text,
  status text,                        -- active | canceled | past_due
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);
```

---

## Admin Panel (/admin)

Access: `superadmin` OR `admin` roles only.

### Tabs
| Tab | Purpose |
|---|---|
| Overview | Platform metrics: users, revenue, pending approvals |
| Usuarios | Pending approval queue (real Supabase data) + active users list |
| Academia | Create/edit courses, modules, lessons |
| Proveedores | Supplier management |
| Suscripciones | Plan and subscription management |

The Usuarios tab loads `profiles` table with `status = 'pending'` on mount. Approve/reject buttons update `profiles.status` directly via browser Supabase client (RLS allows admin+superadmin).

---

## AI Integration

All AI calls go through `src/lib/anthropic.ts` (`getAnthropicClient()`, model `claude-opus-4-7`). API routes must declare `export const runtime = "nodejs"` — never Edge runtime for Anthropic calls.

---

## Dark / Light Mode

- Theme stored in `localStorage` key `plusby-theme` (`"dark"` | `"light"`)
- Applied as class `dark` or `light` on `<html>` element
- CSS variables defined in `globals.css` under `:root` (dark default) and `html.light`
- Toggle button lives in Sidebar (bottom) and Topbar (mobile)
- Theme store: `src/store/theme.ts`
- **Rule**: when writing new UI, use CSS variable classes (`bg-[var(--bg-surface)]` etc.) so components respond to theme changes. Hardcoded hex values do NOT respond to theme.

### CSS variable mapping
| Variable | Dark | Light |
|---|---|---|
| `--bg-base` | `#0A0A0F` | `#F8FAFC` |
| `--bg-surface` | `#13131A` | `#FFFFFF` |
| `--bg-elevated` | `#1C1C26` | `#F1F5F9` |
| `--border-color` | `#2A2A3A` | `#E2E8F0` |
| `--text-primary` | `#F0F0F5` | `#0F172A` |
| `--text-secondary` | `#8888A0` | `#475569` |
| `--text-muted` | `#555568` | `#94A3B8` |

---

## State Management

- Zustand: `src/store/sidebar.ts` (mobile sidebar), `src/store/theme.ts` (dark/light)
- All other state: page-level `useState`

---

## Design Tokens

See skill `plusby-design-tokens` for the full palette. **Never introduce colors outside the defined palette without asking.**

## TypeScript Pitfalls

See skill `plusby-typescript-pitfalls`. Activate before any `npm run build`.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
# Planned:
# MERCADOPAGO_ACCESS_TOKEN
# RESEND_API_KEY
# SUPABASE_SERVICE_ROLE_KEY
```
