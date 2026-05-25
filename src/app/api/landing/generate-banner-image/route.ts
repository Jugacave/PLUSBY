import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 120;

// ─── Section-specific instructions ───────────────────────────────────────────

interface SectionSpec {
  visualDescription: string;
  textElements: Array<"headline" | "subheadline" | "cta" | "price" | "priceOriginal" | "saleLabel" | "bullets" | "beforeAfter" | "stepNumbers" | "trustBadges" | "ourVsOthers" | "rating">;
  maxBullets: number;
}

const SECTION_SPECS: Record<string, SectionSpec> = {
  hero: {
    visualDescription: "Banner hero principal vertical. Producto destacado al centro o derecha. Fondo limpio. Solo TITULAR grande y botón CTA.",
    textElements: ["headline", "cta"],
    maxBullets: 0,
  },
  oferta: {
    visualDescription: "Banner de oferta. Precio grande dominante, etiqueta 'OFERTA' o '50% OFF', producto visible, botón de compra. Sensación de urgencia.",
    textElements: ["saleLabel", "price", "priceOriginal", "cta"],
    maxBullets: 0,
  },
  antes_despues: {
    visualDescription: "Banner antes/después vertical. División horizontal: arriba problema (ANTES), abajo resultado (DESPUÉS). Producto al centro entre las dos zonas. Solo las palabras 'ANTES' y 'DESPUÉS' como texto.",
    textElements: ["beforeAfter"],
    maxBullets: 0,
  },
  beneficios: {
    visualDescription: "Banner de beneficios. Producto al centro con 3 iconos circulares alrededor, cada uno con un texto corto debajo. Layout limpio y aireado.",
    textElements: ["headline", "bullets"],
    maxBullets: 3,
  },
  comparativa: {
    visualDescription: "Banner comparativo. Dos columnas verticales: izquierda 'NOSOTROS' con checks verdes, derecha 'OTROS' con X rojas. Producto destacado en columna izquierda.",
    textElements: ["headline", "ourVsOthers"],
    maxBullets: 0,
  },
  autoridad: {
    visualDescription: "Banner de autoridad. Producto al centro, badges/sellos de certificación alrededor (ej 'TESTEADO', 'DERMATOLÓGICO'). Estilo premium y científico.",
    textElements: ["headline", "trustBadges"],
    maxBullets: 3,
  },
  testimonios: {
    visualDescription: "Banner de testimonio. Foto sonriente de cliente, 5 estrellas doradas grandes, una cita corta entre comillas. Producto pequeño al lado.",
    textElements: ["rating", "headline"],
    maxBullets: 0,
  },
  ingredientes: {
    visualDescription: "Banner de ingredientes. Producto al centro con 3 ingredientes naturales alrededor (frutas, hojas, etc), cada uno con su nombre debajo.",
    textElements: ["headline", "bullets"],
    maxBullets: 3,
  },
  modo_uso: {
    visualDescription: "Banner de modo de uso. Tres pasos numerados con iconos: 1, 2, 3. Cada paso con texto corto de máximo 2 palabras. Producto visible.",
    textElements: ["headline", "stepNumbers"],
    maxBullets: 3,
  },
  logistica: {
    visualDescription: "Banner de logística. Tres iconos en fila: envío, garantía, pago. Cada uno con label corto. Estilo limpio con producto visible.",
    textElements: ["headline", "trustBadges"],
    maxBullets: 3,
  },
  faqs: {
    visualDescription: "Banner de preguntas frecuentes. Dos cards con signo de pregunta '?' grande y un texto MUY corto debajo. Producto pequeño al lado.",
    textElements: ["headline", "bullets"],
    maxBullets: 2,
  },
};

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "México", PA: "Panamá", EC: "Ecuador", PE: "Perú",
  CL: "Chile", PY: "Paraguay", AR: "Argentina", GT: "Guatemala", ES: "España",
};

// ─── Fal.ai model routing ─────────────────────────────────────────────────────

const FAL_ENDPOINTS: Record<string, string> = {
  "fal-ideogram2":  "fal-ai/ideogram/v3",
  "fal-flux-ultra": "fal-ai/flux-pro/v1/ultra",
  "fal-imagen3":    "fal-ai/imagen3",
  "fal-flux-pro":   "fal-ai/flux-pro/v1.1",
  "fal-flux-dev":   "fal-ai/flux/dev",
  "fal-sd-xl":      "fal-ai/stable-diffusion-xl",
};

// ─── Gemini (Nano Banana) model routing ───────────────────────────────────────
// Each selector id maps to a list of candidate Google model ids, tried in order
// so the call survives model-id drift / availability per API key.

const GEMINI_MODELS: Record<string, string[]> = {
  "gemini-nano-banana-2":   ["gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"],
  "gemini-nano-banana-pro": ["gemini-3-pro-image-preview", "gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"],
};

// ─── Body type ────────────────────────────────────────────────────────────────

type RequestBody = {
  sectionType: string;
  templateUrl?: string;
  productImages?: string[];
  productName?: string;
  productDescription: string;
  productBenefits?: string[];
  productProblems?: string[];
  productIngredients?: string[];
  productDifferentiator?: string;
  angle: string;
  colors: string[];
  font: string;
  country: string;
  aiModel: string;
  priceSale?: string;
  priceOriginal?: string;
};

// ─── Stage 1: Claude Vision — analyze template + write Spanish copy ──────────

interface GeneratedCopy {
  layoutDescription: string;
  visualStyle: string;
  productDescription: string;
  headline: string;
  subheadline: string;
  bodyText: string;
  cta: string;
  saleLabel: string;
  ourLabel: string;
  othersLabel: string;
  badges: string[];
  steps: string[];
  bullets: string[];
}

async function analyzeAndWriteCopy(body: RequestBody): Promise<GeneratedCopy | null> {
  try {
    const anthropic = getAnthropicClient();
    const market = COUNTRY_NAMES[body.country] ?? "Latinoamérica";
    const spec = SECTION_SPECS[body.sectionType] ?? SECTION_SPECS.hero;
    const benefits = (body.productBenefits ?? []).filter(Boolean);
    const problems = (body.productProblems ?? []).filter(Boolean);
    const ingredients = (body.productIngredients ?? []).filter(Boolean);

    const priceInfo =
      body.sectionType === "oferta" && body.priceSale
        ? `Precio oferta: ${body.priceSale}${body.priceOriginal ? ` (antes ${body.priceOriginal})` : ""}`
        : "";

    const productSummary = [
      body.productName ? `Producto: ${body.productName}` : "",
      body.productDescription ? `Descripción: ${body.productDescription}` : "",
      benefits.length ? `Beneficios: ${benefits.join(", ")}` : "",
      problems.length ? `Problemas que resuelve: ${problems.join(", ")}` : "",
      ingredients.length ? `Ingredientes: ${ingredients.join(", ")}` : "",
      body.productDifferentiator ? `Diferenciador: ${body.productDifferentiator}` : "",
      priceInfo,
      body.angle ? `Ángulo: ${body.angle}` : "",
    ].filter(Boolean).join("\n");

    const needsField = (f: string) => spec.textElements.includes(f as never);
    const jsonFields: string[] = [];
    if (needsField("headline")) jsonFields.push(`"headline": "TITULAR de máximo 5 palabras, impactante, en español de ${market}"`);
    if (needsField("subheadline")) jsonFields.push(`"subheadline": "SUBTITULAR de máximo 8 palabras"`);
    if (needsField("cta")) jsonFields.push(`"cta": "Botón de acción, máximo 3 palabras (ej Comprar Ya, Pídelo Hoy)"`);
    if (needsField("saleLabel")) jsonFields.push(`"saleLabel": "Etiqueta corta de oferta, máximo 2 palabras (ej OFERTA, 50% OFF, GRAN VENTA)"`);
    if (needsField("ourVsOthers")) jsonFields.push(`"ourLabel": "Palabra única para nuestra columna (ej NOSOTROS, ECHQ)"`, `"othersLabel": "Palabra única para la competencia (ej OTROS, GENÉRICO)"`);
    if (needsField("trustBadges")) jsonFields.push(`"badges": ["3 sellos cortos máx 2 palabras cada uno, ej ENVÍO GRATIS, GARANTÍA 30 DÍAS, PAGO SEGURO"]`);
    if (spec.maxBullets > 0 && needsField("bullets")) jsonFields.push(`"bullets": ["${spec.maxBullets} textos MUY cortos máx 2 palabras cada uno, sin emojis, sin signos raros"]`);
    if (needsField("stepNumbers")) jsonFields.push(`"steps": ["3 textos MUY cortos máx 2 palabras: paso 1, paso 2, paso 3"]`);

    jsonFields.push(`"layoutDescription": "Descripción en español de la disposición visual del banner (1 oración)"`);
    jsonFields.push(`"visualStyle": "Estilo visual: paleta de colores en español, ambiente, mood (1 oración)"`);
    jsonFields.push(`"productDescription": "Descripción visual del producto en español: tipo, color, forma del envase (1 oración corta)"`);

    const userContent: Array<
      | { type: "image"; source: { type: "url"; url: string } }
      | { type: "text"; text: string }
    > = [];

    if (body.templateUrl) {
      userContent.push({ type: "image", source: { type: "url", url: body.templateUrl } });
    }

    userContent.push({
      type: "text",
      text: `${body.templateUrl ? "Analiza la plantilla de banner adjunta para inspirarte en el diseño.\n\n" : ""}Eres copywriter publicitario senior de ecommerce en ${market}.

TIPO DE BANNER: ${spec.visualDescription}

INFORMACIÓN DEL PRODUCTO:
${productSummary}

REGLAS CRÍTICAS:
1. Todo el texto debe estar en ESPAÑOL real de ${market} — palabras correctamente escritas
2. NO inventes palabras. NO mezcles con inglés.
3. Sé EXTREMADAMENTE breve. Mejor 2 palabras que 5.
4. NO uses tildes raras ni caracteres especiales.
5. Si tienes el precio "${body.priceSale ?? ""}", úsalo EXACTAMENTE como está.

Responde ÚNICAMENTE con este JSON (sin markdown):
{${jsonFields.join(",\n")}}`,
    });

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 800,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      layoutDescription: parsed.layoutDescription ?? "",
      visualStyle: parsed.visualStyle ?? "",
      productDescription: parsed.productDescription ?? "",
      headline: (parsed.headline ?? "").trim(),
      subheadline: (parsed.subheadline ?? "").trim(),
      bodyText: "",
      cta: (parsed.cta ?? "").trim(),
      saleLabel: (parsed.saleLabel ?? "").trim(),
      ourLabel: (parsed.ourLabel ?? "").trim(),
      othersLabel: (parsed.othersLabel ?? "").trim(),
      badges: Array.isArray(parsed.badges) ? parsed.badges.map((b: unknown) => String(b).trim()).filter(Boolean) : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps.map((b: unknown) => String(b).trim()).filter(Boolean) : [],
      bullets: Array.isArray(parsed.bullets)
        ? parsed.bullets.map((b: unknown) => String(b).trim()).filter(Boolean)
        : [],
    };
  } catch {
    return null;
  }
}

// ─── Stage 2: Build Spanish prompt with IMAGE ROLES + copy ───────────────────

function buildImagePrompt(body: RequestBody, copy: GeneratedCopy | null): string {
  const spec = SECTION_SPECS[body.sectionType] ?? SECTION_SPECS.hero;
  const productImages = (body.productImages ?? []).filter(Boolean);
  const hasTemplate = !!body.templateUrl;
  const hasPhotos = productImages.length > 0;
  const photoCount = productImages.length;

  if (!copy) {
    const productLine = body.productName ?? body.productDescription ?? "el producto";
    return [
      `Banner publicitario vertical 9:16 de alta calidad.`,
      spec.visualDescription,
      `Producto: ${productLine}.`,
      `Estilo: fotografía publicitaria profesional, iluminación premium, sin texto en inglés.`,
    ].join(" ");
  }

  // ── Brand palette — overrides the template's colors for set consistency ───
  const brandColors = (body.colors ?? []).filter(Boolean);
  const brandPaletteBlock = brandColors.length
    ? `PALETA DE MARCA OBLIGATORIA (usa SOLO estos colores, NO los de la plantilla):
- Color principal / acento (fondos dominantes, badges, botón CTA): ${brandColors[0] ?? "#FF6B35"}
- Color secundario / oscuro (contraste, bloques, sombras): ${brandColors[1] ?? "#1C1C26"}
- Color de texto / claro (titulares y texto sobre fondo oscuro): ${brandColors[2] ?? "#F0F0F5"}
Recolorea TODO el banner con esta paleta de marca de forma coherente. Esta paleta debe ser idéntica en todas las secciones de la landing.`
    : "";

  // ── IMAGE ROLES (critical when using edit mode with reference images) ─────
  const imageRolesParts: string[] = [];
  if (hasTemplate) {
    if (hasPhotos) {
      imageRolesParts.push(
        `ROLES DE IMAGEN — LEE ESTO PRIMERO (es lo más importante):
- IMAGEN 1 es la PLANTILLA DE DISEÑO. Úsala SOLO como referencia de LAYOUT, ESTRUCTURA, tipografía, elementos gráficos y composición — NO copies sus colores. El producto que aparece dentro de IMAGEN 1 es un producto COMPLETAMENTE DIFERENTE y sin relación — debes ignorarlo y eliminarlo por completo. NO renderices el producto de la plantilla en el resultado.
- IMAGEN 2${photoCount > 1 ? ` hasta ${photoCount + 1}` : ""} ${photoCount > 1 ? "son fotos" : "es una foto"} del PRODUCTO REAL a publicitar ("${body.productName ?? "el producto"}"). ESTE es el producto que debe ser la estrella del banner. Renderízalo fielmente — exacta misma forma, proporciones, color, materiales, etiqueta y branding que se aprecia en ${photoCount > 1 ? "estas fotos" : "esta foto"}.`
      );
    } else {
      imageRolesParts.push(
        `PLANTILLA DE DISEÑO: La imagen adjunta es una PLANTILLA DE REFERENCIA de LAYOUT y ESTRUCTURA (NO de colores). Replica su layout, tipografía, elementos gráficos y composición, pero recolorea con la paleta de marca. Sustituye el producto de la plantilla por "${body.productName ?? "el producto"}" descrito abajo.`
      );
    }
    imageRolesParts.push(
      `INSTRUCCIÓN CRÍTICA — Produce una copia casi idéntica de la ESTRUCTURA y el LAYOUT de la plantilla, pero RECOLOREADA con la paleta de marca y publicitando un PRODUCTO DIFERENTE.
REPLICACIÓN OBLIGATORIA (estructura, NO color):
- LAYOUT: misma estructura espacial — posición del titular, del producto, de badges/precio/CTA.
- TIPOGRAFÍA: mismo estilo de peso (bold/condensado/fino), misma jerarquía de tamaños, mismas posiciones de bloques de texto.
- ELEMENTOS GRÁFICOS: replica la forma y posición de badges, círculos, formas geométricas, divisores, overlays, texturas, iconos, stickers — pero coloreados con la paleta de marca.
- COMPOSICIÓN: mismo equilibrio visual, espacio negativo y puntos focales.

COLOR — esto cambia respecto a la plantilla:
- IGNORA por completo los colores de la plantilla. Aplica la PALETA DE MARCA indicada abajo. Conserva la DISTRIBUCIÓN de color de la plantilla (dónde hay fondo, dónde acento, dónde texto) pero sustituyendo cada color por el de la marca.
${brandPaletteBlock ? brandPaletteBlock + "\n" : ""}
CAMBIO DE PRODUCTO:
- Coloca el producto de las FOTOS DEL PRODUCTO (NO el producto de la plantilla) donde se ubica el producto de la plantilla, con tamaño, ángulo y prominencia similares.
- El producto mostrado DEBE verse exactamente como en las fotos. NO lo inventes, rediseñes, ni sustituyas. NO conserves el producto original de la plantilla ni su marca.
- Reemplaza el nombre del producto por "${body.productName ?? "el producto"}" y todos los claims/estadísticas/texto con la información del producto indicada abajo.

NO crees un nuevo layout. Mantén la ESTRUCTURA y COMPOSICIÓN ~95% idéntica a la plantilla, pero RECOLOREA todo con la paleta de marca para mantener consistencia entre secciones.`
    );
  } else if (brandPaletteBlock) {
    imageRolesParts.push(brandPaletteBlock);
  }

  // ── Text elements ──────────────────────────────────────────────────────────
  const textElements: string[] = [];

  if (spec.textElements.includes("headline") && copy.headline) {
    textElements.push(`UN TITULAR GRANDE que dice exactamente: "${copy.headline}"`);
  }
  if (spec.textElements.includes("subheadline") && copy.subheadline) {
    textElements.push(`Un subtítulo más pequeño que dice: "${copy.subheadline}"`);
  }
  if (spec.textElements.includes("saleLabel") && copy.saleLabel) {
    textElements.push(`Un sello/etiqueta de oferta que dice: "${copy.saleLabel}"`);
  }
  if (spec.textElements.includes("price") && body.priceSale) {
    textElements.push(`Un precio grande que dice exactamente: "${body.priceSale}"`);
  }
  if (spec.textElements.includes("priceOriginal") && body.priceOriginal) {
    textElements.push(`Un precio tachado más pequeño que dice: "${body.priceOriginal}"`);
  }
  if (spec.textElements.includes("beforeAfter")) {
    textElements.push(`Dos etiquetas: una arriba que dice "ANTES" y otra abajo que dice "DESPUÉS"`);
  }
  if (spec.textElements.includes("ourVsOthers") && (copy.ourLabel || copy.othersLabel)) {
    textElements.push(`Dos encabezados de columna: izquierda "${copy.ourLabel || "NOSOTROS"}", derecha "${copy.othersLabel || "OTROS"}"`);
  }
  if (spec.textElements.includes("rating")) {
    textElements.push(`Cinco estrellas doradas grandes`);
  }
  if (spec.textElements.includes("bullets") && copy.bullets.length) {
    const limited = copy.bullets.slice(0, spec.maxBullets);
    textElements.push(`${limited.length} textos cortos: ${limited.map((b) => `"${b}"`).join(", ")}`);
  }
  if (spec.textElements.includes("trustBadges") && copy.badges.length) {
    const limited = copy.badges.slice(0, 3);
    textElements.push(`${limited.length} sellos pequeños: ${limited.map((b) => `"${b}"`).join(", ")}`);
  }
  if (spec.textElements.includes("stepNumbers") && copy.steps.length) {
    const limited = copy.steps.slice(0, 3);
    textElements.push(`Tres pasos numerados (1, 2, 3) con etiquetas: ${limited.map((b) => `"${b}"`).join(", ")}`);
  }
  if (spec.textElements.includes("cta") && copy.cta) {
    textElements.push(`Un botón de acción que dice: "${copy.cta}"`);
  }

  const textList = textElements.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const parts: string[] = [];

  if (imageRolesParts.length > 0) {
    parts.push(...imageRolesParts);
  }

  parts.push(`Crea un banner publicitario vertical 9:16 (1080x1920) en español, calidad comercial premium.

DISEÑO: ${spec.visualDescription}
${copy.layoutDescription ? `Disposición: ${copy.layoutDescription}` : ""}

PRODUCTO A MOSTRAR: ${copy.productDescription || body.productName || ""}. Debe verse fotorealista, nítido, con iluminación profesional de estudio.

ESTILO VISUAL: ${copy.visualStyle || "moderno, limpio, profesional"}

TEXTO EN EL BANNER — RENDERIZA EXACTAMENTE ESTAS PALABRAS EN ESPAÑOL CORRECTO, NADA MÁS:
${textList}

REGLAS ESTRICTAS:
- Renderiza ÚNICAMENTE los textos listados arriba. NO añadas ningún otro texto.
- Cada palabra debe estar PERFECTAMENTE escrita en español, letra por letra.
- NO inventes palabras. NO escribas texto en inglés.
- Tipografía clara, bold, legible. Kerning perfecto.
- Sin marcas de agua. Sin logos extra. Sin texto decorativo random.
- Fotografía publicitaria de alta gama. 4K, nítido, profesional.`);

  return parts.join("\n\n");
}

// ─── Image generation: gpt-image-1 edit mode (with reference images) ─────────

async function fetchAsBlob(url: string): Promise<{ blob: Blob; filename: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    let ext = "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
    else if (contentType.includes("webp")) ext = "webp";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    return { blob: new Blob([buf], { type: contentType }), filename };
  } catch {
    return null;
  }
}

async function callGptImage1Edit(params: {
  apiKey: string;
  prompt: string;
  imageUrls: string[];  // template first, then product photos
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", params.prompt);
    form.append("n", "1");
    form.append("size", "1024x1536");
    form.append("quality", "high");

    for (const url of params.imageUrls.slice(0, 8)) {
      const fetched = await fetchAsBlob(url);
      if (!fetched) continue;
      form.append("image[]", fetched.blob, fetched.filename);
    }

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error?.message ?? "OpenAI edit error" };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return { ok: false, error: "gpt-image-1 edit no devolvió imagen" };
    return { ok: true, url: `data:image/png;base64,${b64}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

async function callGptImage1Generate(params: {
  apiKey: string;
  prompt: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: params.prompt,
        n: 1,
        size: "1024x1536",
        quality: "high",
        output_format: "webp",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error?.message ?? "Error gpt-image-1" };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return { ok: false, error: "gpt-image-1 no devolvió imagen" };
    return { ok: true, url: `data:image/webp;base64,${b64}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

async function callDalle3HD(params: {
  apiKey: string;
  prompt: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: params.prompt,
        n: 1,
        size: "1024x1792",
        quality: "hd",
        style: "vivid",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error?.message ?? "Error DALL-E 3" };
    const url = data.data?.[0]?.url;
    if (!url) return { ok: false, error: "DALL-E 3 no devolvió imagen" };
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

// ─── Fal.ai generic caller ────────────────────────────────────────────────────

async function callFalModel(params: {
  apiKey: string;
  endpoint: string;
  prompt: string;
  styleImageUrls?: string[];
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const isFluxUltra = params.endpoint.includes("ultra");
  const isIdeogram = params.endpoint.includes("ideogram");

  const body: Record<string, unknown> = {
    prompt: params.prompt,
    num_images: 1,
    ...(isFluxUltra
      ? { aspect_ratio: "9:16", output_format: "jpeg" }
      : { image_size: { width: 1080, height: 1920 } }
    ),
  };

  if (isIdeogram && params.styleImageUrls?.length) {
    body.image_urls = params.styleImageUrls;
    body.rendering_speed = "QUALITY";
    body.expand_prompt = false;
    body.style = "AUTO";
  }

  try {
    const res = await fetch(`https://fal.run/${params.endpoint}`, {
      method: "POST",
      headers: { Authorization: `Key ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.detail ?? data.message ?? `Error ${params.endpoint}` };
    const url = data.images?.[0]?.url ?? data.image?.url;
    if (!url) return { ok: false, error: `${params.endpoint} no devolvió imagen` };
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

// ─── Gemini (Nano Banana) — multimodal edit/generate ─────────────────────────

async function fetchAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    const mimeType = contentType.split(";")[0].trim();
    const data = Buffer.from(buf).toString("base64");
    return { data, mimeType };
  } catch {
    return null;
  }
}

async function callGeminiImage(params: {
  apiKey: string;
  prompt: string;
  imageUrls: string[];
  models: string[];   // candidate model ids, tried in order
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const parts: unknown[] = [{ text: params.prompt }];
  for (const url of params.imageUrls.slice(0, 8)) {
    const img = await fetchAsBase64(url);
    if (!img) continue;
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }

  let lastError = "Gemini no devolvió imagen";
  for (const model of params.models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        lastError = data.error?.message ?? JSON.stringify(data);
        continue;
      }
      for (const candidate of data.candidates ?? []) {
        for (const part of candidate.content?.parts ?? []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType ?? "image/png";
            return { ok: true, url: `data:${mime};base64,${part.inlineData.data}` };
          }
        }
      }
      lastError = "Gemini no devolvió imagen";
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Error";
    }
  }
  return { ok: false, error: `Gemini error: ${lastError}` };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const productImages = (body.productImages ?? []).filter((u): u is string => !!u);
  const hasTemplate = !!body.templateUrl;
  const hasRefImages = hasTemplate || productImages.length > 0;

  // Stage 1: Claude Vision + Spanish copywriting
  const copy = await analyzeAndWriteCopy(body);
  const prompt = buildImagePrompt(body, copy);

  const falKey = user.user_metadata?.ai_key_fal;
  const openaiKey = user.user_metadata?.ai_key_openai;
  const geminiKey = user.user_metadata?.ai_key_gemini;
  const aiModel = body.aiModel ?? "";

  // ── Gemini (Nano Banana) models ───────────────────────────────────────────
  if (GEMINI_MODELS[aiModel]) {
    if (!geminiKey) return NextResponse.json({ error: "Configura tu API key de Gemini (Google) en Ajustes > Modelos IA" }, { status: 400 });
    const imageUrls: string[] = [];
    if (hasTemplate) imageUrls.push(body.templateUrl!);
    imageUrls.push(...productImages.slice(0, 7));

    const out = await callGeminiImage({ apiKey: geminiKey, prompt, imageUrls, models: GEMINI_MODELS[aiModel] });
    if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: aiModel });
    return NextResponse.json({ error: out.error }, { status: 500 });
  }

  // ── OpenAI models ─────────────────────────────────────────────────────────
  if (aiModel === "openai-dalle3") {
    if (!openaiKey) return NextResponse.json({ error: "Configura tu API key de OpenAI en Ajustes > Modelos IA" }, { status: 400 });
    const out = await callDalle3HD({ apiKey: openaiKey, prompt });
    if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "dalle3-hd" });
    return NextResponse.json({ error: out.error }, { status: 500 });
  }

  if (aiModel === "openai-gpt-image-1" || (!aiModel && openaiKey)) {
    if (!openaiKey) return NextResponse.json({ error: "Configura tu API key de OpenAI en Ajustes > Modelos IA" }, { status: 400 });

    // Use edit mode when reference images are available — much better template fidelity
    if (hasRefImages) {
      const imageUrls: string[] = [];
      if (hasTemplate) imageUrls.push(body.templateUrl!);
      imageUrls.push(...productImages.slice(0, 7)); // max 8 total including template

      const out = await callGptImage1Edit({ apiKey: openaiKey, prompt, imageUrls });
      if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "gpt-image-1-edit" });
      // On edit failure, fall through to generate mode
    }

    const out = await callGptImage1Generate({ apiKey: openaiKey, prompt });
    if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "gpt-image-1" });
    if (!falKey) return NextResponse.json({ error: out.error }, { status: 500 });
  }

  // ── Fal.ai models ─────────────────────────────────────────────────────────
  if (falKey) {
    const falEndpoint = FAL_ENDPOINTS[aiModel] ?? FAL_ENDPOINTS["fal-ideogram2"];

    const styleRefs: string[] = [];
    if (hasTemplate) styleRefs.push(body.templateUrl!);
    if (productImages.length > 0) styleRefs.push(...productImages.slice(0, 2));

    const out = await callFalModel({
      apiKey: falKey,
      endpoint: falEndpoint,
      prompt,
      styleImageUrls: styleRefs.length > 0 ? styleRefs : undefined,
    });
    if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: aiModel });

    // Fallback: if the chosen model failed, try ideogram as safety net
    if (falEndpoint !== FAL_ENDPOINTS["fal-ideogram2"]) {
      const fallback = await callFalModel({
        apiKey: falKey,
        endpoint: FAL_ENDPOINTS["fal-ideogram2"],
        prompt,
        styleImageUrls: styleRefs.length > 0 ? styleRefs : undefined,
      });
      if (fallback.ok) return NextResponse.json({ ok: true, imageUrl: fallback.url, mode: "ideogram-v3-fallback" });
    }

    return NextResponse.json({ error: out.error }, { status: 500 });
  }

  return NextResponse.json(
    { error: "Configura tu API key de Fal.ai o OpenAI en Ajustes > Modelos IA" },
    { status: 400 }
  );
}
