---
name: plusby-deployment
description: Use when committing, pushing, deploying, or fixing deployment-related issues in Plusby. Triggers on git push, deploy, Vercel, branch operations, or when the user mentions "push", "deploy", "Vercel", or "production".
---

# Plusby Deployment Workflow

Plusby tiene un modelo de dos branches con historiales divergentes. Esto es crítico — un push mal hecho rompe producción.

## Las dos branches

| Branch | Para qué |
|---|---|
| `claude/dropshipping-platform-build-a0HDg-2J6cg` | Branch de trabajo — `git push` normal |
| `claude/dropshipping-platform-build-a0HDg` | Branch de Vercel (producción) — `mcp__github__push_files` |

## Reglas

1. **Cada commit va a las dos branches.** No solo a una.
2. **Para la branch de Vercel SIEMPRE usar `mcp__github__push_files`** (la herramienta del MCP de GitHub). Tiene historia divergente, `git push` normal va a fallar o forzar.
3. **Antes de pushear a Vercel: `npm run build`.** Si falla local, falla en producción silenciosamente.
4. Si la herramienta MCP no está disponible, parar y preguntar — no improvisar con `git push --force`.
