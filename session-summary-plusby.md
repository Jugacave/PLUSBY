# Resumen de sesión — PlusBy AI Image Generation

## Contexto del proyecto
**PlusBy** — SaaS dropshipping para Latinoamérica. Stack: Next.js 16.2.6 + TypeScript + Supabase + Tailwind v4.

Dos ramas con historia divergente:
- `claude/dropshipping-platform-build-a0HDg-2J6cg` → rama de trabajo (dev)
- `claude/dropshipping-platform-build-a0HDg` → rama de Vercel (producción)

---

## Rutas API modificadas

| Ruta | Función |
|------|---------|
| `src/app/api/landing/generate-banner-image/route.ts` | Generación de banners en el **editor** (secciones de landing) |
| `src/app/api/landing/generate-studio/route.ts` | Generación de banners en el **Studio** (sección individual) |
| `src/app/(dashboard)/landing/[id]/editor/page.tsx` | Frontend del editor con selector de modelos |

---

## Problemas resueltos y cambios

### 1. Editor generaba imágenes mal vs Studio

**Causa:** Studio usaba modo "edit" de gpt-image-1 (ve las imágenes de referencia). El editor usaba modo "generate" (solo texto, sin ver imágenes). Además, el editor enviaba tamaño `1024x1792` que es inválido para gpt-image-1 — solo acepta `1024x1024`, `1024x1536`, `1536x1024`.

**Fix aplicado:**
- Se añadió `callGptImage1Edit()` al editor que llama a `/v1/images/edits` con la plantilla + fotos del producto via FormData (`image[]`)
- Tamaño corregido a `1024x1536` (vertical 9:16 válido para gpt-image-1)

---

### 2. Paleta de marca ignorada — usaba colores de plantilla

**Causa:** El prompt decía `"COLORS: same background color(s)... DO NOT change the color scheme"` — copiaba los colores de la plantilla rosa/verde en vez de usar la paleta de marca del usuario.

**Fix aplicado (en ambas rutas):**

En `generate-banner-image/route.ts` — función `buildImagePrompt()`:
```
PALETA DE MARCA OBLIGATORIA (usa SOLO estos colores, NO los de la plantilla):
- Color principal / acento: {brandColors[0]}
- Color secundario / oscuro: {brandColors[1]}
- Color de texto / claro: {brandColors[2]}
```
La plantilla ahora aporta solo ESTRUCTURA/LAYOUT. Los colores vienen de `body.colors` (array de 3 hex que el usuario configura en el editor).

En `generate-studio/route.ts` — función `buildStudioPrompt()`:
```
BRAND COLOR (mandatory): {bgColor}. Use this as the dominant background/accent color throughout the entire banner. Do NOT use the template's original colors.
```
Los colores vienen de `body.bgColor` (color de fondo elegido en Studio).

---

### 3. API key de OpenAI no encontrada en el editor

**Causa:** La página de Ajustes guarda la key de OpenAI como `ai_key_gpt_image` (campo: `gpt_image`). El editor buscaba `ai_key_openai` — campo inexistente.

Studio sí leía `ai_key_gpt_image` correctamente, por eso Studio funcionaba y el editor no.

**Fix aplicado en `generate-banner-image/route.ts`:**
```typescript
// ANTES (incorrecto):
const openaiKey = user.user_metadata?.ai_key_openai;

// DESPUÉS (correcto):
const openaiKey = user.user_metadata?.ai_key_gpt_image
  ?? user.user_metadata?.ai_key_openai
  ?? process.env.OPENAI_API_KEY;
```

---

### 4. Todos los modelos Fal.ai caían a Ideogram

**Causa:** El handler no distinguía entre `fal-flux-ultra`, `fal-imagen3`, etc. — todos usaban la misma función de Ideogram.

**Fix aplicado:**
```typescript
const FAL_ENDPOINTS: Record<string, string> = {
  "fal-ideogram2":  "fal-ai/ideogram/v3",
  "fal-flux-ultra": "fal-ai/flux-pro/v1/ultra",
  "fal-imagen3":    "fal-ai/imagen3",
  "fal-flux-pro":   "fal-ai/flux-pro/v1.1",
  "fal-flux-dev":   "fal-ai/flux/dev",
  "fal-sd-xl":      "fal-ai/stable-diffusion-xl",
};
```
Se añadió `callFalModel()` genérico que redirige al endpoint correcto según el modelo seleccionado.

---

### 5. Selector de modelos — desplegable con precios

**Cambio de UX en el editor:** El selector de modelos ahora es un dropdown colapsable que muestra solo el modelo activo con su precio, y al expandir lista todos los modelos con precio por imagen.

**Modelos disponibles en el editor (AI_MODELS):**
| ID | Nombre | Precio |
|----|--------|--------|
| `gemini-nano-banana-2` | Nano Banana 2 | ~$0.03 |
| `gemini-nano-banana-pro` | Nano Banana Pro | ~$0.04 |
| `openai-gpt-image-2` | GPT Image 2 | ~$0.06 |
| `openai-gpt-image-1` | GPT Image 1 | ~$0.04 |
| `fal-ideogram2` | Ideogram v3 | ~$0.08 |
| `fal-flux-ultra` | Flux Pro Ultra | ~$0.06 |
| `fal-imagen3` | Google Imagen 3 | ~$0.04 |
| `fal-flux-pro` | Flux Pro 1.1 | ~$0.05 |
| `fal-flux-dev` | Flux Dev | ~$0.03 |
| `openai-dalle3` | DALL·E 3 HD | ~$0.04 |
| `fal-sd-xl` | Stable Diffusion XL | ~$0.02 |

---

### 6. Nano Banana 2 y Nano Banana Pro (Google Gemini)

**Causa del error inicial:** Los model IDs de Google Gemini para generación de imágenes eran incorrectos (`gemini-3-pro-image-preview` no existe, `gemini-2.5-flash-image` no existe, `gemini-2.0-flash-preview-image-generation` fue removido de v1beta).

**Fix aplicado en ambas rutas:**
```typescript
// ANTES (inválidos):
const GEMINI_MODELS = {
  "gemini-nano-banana-2":   ["gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"],
  "gemini-nano-banana-pro": ["gemini-3-pro-image-preview", ...],
};

// DESPUÉS (correcto):
const GEMINI_MODELS = {
  "gemini-nano-banana-2":   ["gemini-2.0-flash-exp-image-generation", "gemini-2.0-flash-preview-image-generation"],
  "gemini-nano-banana-pro": ["gemini-2.5-flash-exp-image-generation", "gemini-2.0-flash-exp-image-generation", ...],
};
```

Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

Body:
```json
{
  "contents": [{ "parts": [{ "text": "..." }, { "inlineData": {...} }] }],
  "generationConfig": { "responseModalities": ["TEXT", "IMAGE"] }
}
```

**Nota:** Si el error de model ID vuelve a aparecer, Google renombró el modelo nuevamente. Consultar la lista actual en: https://ai.google.dev/api/generate-content#models

---

### 7. GPT Image 2 añadido al editor

**Causa:** Studio tenía selector "Gemini | GPT-1 | GPT-2" y GPT-2 daba mejor calidad. El editor solo tenía GPT-1.

**Fix:**
- Añadido `openai-gpt-image-2` al selector del editor
- En la API, cuando se selecciona gpt-image-2 se usa tamaño `1088x1920` (múltiplo de 16, requerido por ese modelo)
- Funciona en modo edit (con plantilla/fotos) y en modo generate (sin imágenes)

---

## Arquitectura IMAGE ROLES (crítica para calidad)

El prompt de imagen tiene una sección "IMAGE ROLES" que le explica al modelo qué es cada imagen:

```
IMAGEN 1 = PLANTILLA DE DISEÑO
→ Aporta: layout, estructura, tipografía, elementos gráficos, composición
→ NO aporta: colores (ignorar paleta de plantilla)
→ NO renderizar: el producto de la plantilla (es un producto distinto, eliminar)

IMAGEN 2+ = FOTOS DEL PRODUCTO REAL
→ Renderizar fielmente: forma, proporciones, color, materiales, etiqueta, branding
→ Es la estrella del banner
```

Sin esta distinción, el modelo mezcla el producto de la plantilla con el producto real, o copia los colores de la plantilla.

---

## Campos de API keys en Supabase user_metadata

| Campo | Qué es |
|-------|--------|
| `ai_key_gpt_image` | Key de OpenAI (GPT Image 1 y 2) — el que guarda la página de Ajustes |
| `ai_key_gemini` | Key de Google AI (Gemini / Nano Banana) |
| `ai_key_fal` | Key de Fal.ai (Ideogram, Flux, Imagen 3, etc.) |
| `ai_key_openai` | Campo legado (no usado actualmente en Ajustes) |

**Importante:** Siempre leer `ai_key_gpt_image` para OpenAI, no `ai_key_openai`.

---

## Routing del handler (generate-banner-image)

```
POST /api/landing/generate-banner-image
  ↓
1. Claude Vision analiza plantilla + escribe copy en español (analyzeAndWriteCopy)
2. buildImagePrompt() — construye prompt con IMAGE ROLES + paleta de marca + textos
  ↓ routing por aiModel:
  ├── GEMINI_MODELS[aiModel] → callGeminiImage() → Gemini Flash image generation
  ├── openai-dalle3 → callDalle3HD() → DALL-E 3 HD
  ├── openai-gpt-image-1 / openai-gpt-image-2 → callGptImage1Edit() (con imgs) o callGptImage1Generate()
  └── fal-* → callFalModel() con endpoint correcto del FAL_ENDPOINTS map
              → fallback a ideogram si falla
```

---

## Notas para continuar

- Si Gemini sigue fallando: verificar model IDs en https://ai.google.dev/api/generate-content#models
- El editor siempre genera en 9:16 (1080x1920). Studio permite elegir tamaño.
- Studio (Gemini) usa `callGeminiFlashImage` en `generate-studio/route.ts` — modelo hardcodeado
- El editor (Gemini) usa `callGeminiImage` con fallback automático entre model IDs en `GEMINI_MODELS`
