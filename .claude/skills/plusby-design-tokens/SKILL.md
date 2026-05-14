---
name: plusby-design-tokens
description: Use when writing or modifying UI code in Plusby — any .tsx file with styling, Tailwind classes, inline styles, or color references. Triggers on tasks involving components, landing pages, Estudio IA UI, dashboard layout, or anything visual. Also triggers when user mentions colors, theme, dark mode, or design system.
---

# Plusby Design Tokens

Defined in `src/app/globals.css` under `@theme inline` (Tailwind v4). The codebase uses inline hex values throughout — match this pattern, don't introduce CSS variables ad-hoc.

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

## Reglas

- Nunca introducir colores fuera de esta paleta sin preguntar.
- El fondo principal es `#0A0A0F` (negro azulado), no `#000`.
- Para hover states usar la variante hover indicada (ej: `#FF8C5A` para orange).
- Texto secundario en cards usa `#8888A0`, no opacity en blanco.
