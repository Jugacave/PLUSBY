# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build + TypeScript check
npm run lint       # ESLint
```

**Always run `npm run build` before pushing.** The Vercel deployment fails silently on any TypeScript error.

Modelo de dos branches con historia divergente — ver skill `plusby-deployment` antes de cualquier push.

## Architecture

### Route groups

```
src/app/
  (auth)/          # login, register, forgot-password — no sidebar/topbar
  (dashboard)/     # all protected pages — wrapped by DashboardLayout
  api/             # server-side only: chat, copys/generate, landing/generate-section
  l/[slug]/        # public landing page viewer
```

`src/middleware.ts` protects all non-public routes and guards `/admin` — only `user_metadata.role === "superadmin"` users can access it.

### Dashboard layout

`(dashboard)/layout.tsx` renders `<Sidebar>` + `<Topbar>` + `<main>`. All dashboard pages use `"use client"` and sit inside this shell. Pages manage their own state locally with `useState`.

### Auth

Two Supabase clients — use the correct one per context:
- `src/lib/supabase/client.ts` → `createClient()` for browser/client components
- `src/lib/supabase/server.ts` → `createClient()` for server components and API routes

Super admin role lives in `user.user_metadata.role`. Set it with:
```sql
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "superadmin"}'::jsonb WHERE email = 'email@example.com';
```

### AI integration

All AI calls go through `src/lib/anthropic.ts` (`getAnthropicClient()`, model `claude-opus-4-7`). API routes must declare `export const runtime = "nodejs"` — never Edge runtime for Anthropic calls.

### State management

Zustand (`src/store/sidebar.ts`) is used only for mobile sidebar open/close state. All other state lives in page-level `useState`.

### Design tokens

Design tokens viven en `src/app/globals.css`. La paleta completa está en la skill `plusby-design-tokens`.

### TypeScript pitfalls

Pitfalls de TypeScript documentados en la skill `plusby-typescript-pitfalls`. Activarla antes de cualquier `npm run build`.

## Environment variables required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
```
