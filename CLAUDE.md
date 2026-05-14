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

## Two-branch deployment model

| Branch | Purpose |
|---|---|
| `claude/dropshipping-platform-build-a0HDg-2J6cg` | Local working branch — push with `git push` |
| `claude/dropshipping-platform-build-a0HDg` | Vercel production branch — push with `mcp__github__push_files` |

Every commit must be pushed to **both** branches. The Vercel branch has diverged history so normal git push fails — always use `mcp__github__push_files` for it.

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

Defined in `src/app/globals.css` under `@theme inline` (Tailwind v4). The codebase uses inline hex values throughout:

| Role | Hex |
|---|---|
| Background | `#0A0A0F` |
| Card/surface | `#13131A` |
| Elevated surface | `#1C1C26` |
| Border | `#2A2A3A` |
| Primary text | `#F0F0F5` |
| Secondary text | `#8888A0` |
| Muted text | `#555568` |
| Orange (primary) | `#FF6B35` / hover `#FF8C5A` |
| Purple | `#8B5CF6` / `#7C3AED` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |

### Known TypeScript pitfalls

- Icons typed as `React.ComponentType<{ size?: number; className?: string }>` will error if you pass `style`. Add `style?: React.CSSProperties` to the prop type explicitly.
- Helper functions returning `string` via `.toFixed()` must be wrapped in `parseFloat()` before passing to `Math.max` / `Math.min`.

### Environment variables required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
```
