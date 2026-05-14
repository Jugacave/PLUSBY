---
name: plusby-typescript-pitfalls
description: Use when writing TypeScript/TSX code in Plusby, especially when defining icon component props, working with numeric formatting, or before running npm run build. Triggers on type errors, React.ComponentType definitions, .toFixed() calls, or Math.max/Math.min with formatted numbers.
---

# Plusby TypeScript Pitfalls

Estos errores ya rompieron el build de Vercel. NO los repitas.

## 1. Iconos que reciben `style`

Si tipas un icono como `React.ComponentType<{ size?: number; className?: string }>` y luego pasas `style`, TS rompe.

```tsx
// ❌ Rompe el build
type IconProps = { size?: number; className?: string };

// ✅ Correcto
type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};
```

## 2. `.toFixed()` dentro de `Math.max` / `Math.min`

`.toFixed()` devuelve `string`. `Math.max` espera `number`.

```tsx
// ❌ Rompe el build
Math.max(0, valor.toFixed(2))

// ✅ Correcto
Math.max(0, parseFloat(valor.toFixed(2)))
// o mejor aún:
parseFloat(Math.max(0, valor).toFixed(2))
```

## Antes de cualquier push

Correr `npm run build` localmente — el build es el type-check, Vercel falla silencioso.
