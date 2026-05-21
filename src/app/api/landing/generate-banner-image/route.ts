import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 120;

// ─── Section-specific instructions ───────────────────────────────────────────

const SECTION_INSTRUCTIONS: Record<string, string> = {
  hero:
    "Main hero product banner. Product image featured prominently center or right. Bold product name as headline. Eye-catching premium commercial. Clean spacious layout.",
  oferta:
    "Special offer / discount banner. LARGE sale price dominant. Strikethrough original price. Urgency copy. Product visible.",
  antes_despues:
    "Before-and-after split banner. LEFT half = problem state. RIGHT half = result after using product. Product bottle/package visible. Clear contrast.",
  beneficios:
    "Product benefits showcase. 3-4 benefit items as icons + short text arranged around the product. Clean card layout.",
  comparativa:
    "Comparison banner. Left column: OUR PRODUCT with green checkmarks. Right column: 'Others' with red X marks.",
  autoridad:
    "Authority and trust banner. Certification badges, dermatologically-tested style. Premium, scientific, credible feel.",
  testimonios:
    "Customer testimonial banner. Happy customer photo, 5-star rating, quote bubble. Real, trustworthy.",
  ingredientes:
    "Ingredients / materials showcase. Natural ingredients arranged elegantly around the product. Close-up details.",
  modo_uso:
    "How-to-use guide. Numbered step 1, step 2, step 3 visual flow. Clean instructional layout.",
  logistica:
    "Shipping and logistics banner. Fast delivery icon, money-back guarantee badge, secure payment icons.",
  faqs:
    "FAQ banner. 2-3 question-answer cards with question mark icons. Clean, organized.",
};

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "México", PA: "Panamá", EC: "Ecuador", PE: "Perú",
  CL: "Chile", PY: "Paraguay", AR: "Argentina", GT: "Guatemala", ES: "España",
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
  bullets: string[];
}

async function analyzeAndWriteCopy(body: RequestBody): Promise<GeneratedCopy | null> {
  try {
    const anthropic = getAnthropicClient();
    const market = COUNTRY_NAMES[body.country] ?? "Latinoamérica";
    const sectionDesc = SECTION_INSTRUCTIONS[body.sectionType] ?? "advertising banner";
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
      ingredients.length && body.sectionType === "ingredientes"
        ? `Ingredientes: ${ingredients.join(", ")}` : "",
      body.productDifferentiator ? `Diferenciador: ${body.productDifferentiator}` : "",
      priceInfo,
      body.angle ? `Ángulo de marketing: ${body.angle}` : "",
    ].filter(Boolean).join("\n");

    const userContent: Array<
      | { type: "image"; source: { type: "url"; url: string } }
      | { type: "text"; text: string }
    > = [];

    if (body.templateUrl) {
      userContent.push({ type: "image", source: { type: "url", url: body.templateUrl } });
    }

    userContent.push({
      type: "text",
      text: `${body.templateUrl ? "Analiza esta plantilla de banner publicitario.\n\n" : ""}Eres un copywriter publicitario senior para ecommerce en ${market}.

Tipo de banner: ${sectionDesc}

INFORMACIÓN DEL PRODUCTO:
${productSummary}

Necesito un JSON con dos cosas:

A) ANÁLISIS VISUAL (en inglés, para un modelo de generación de imágenes):
- "layoutDescription": cómo está organizado el banner — dónde va el titular, el producto, los iconos/beneficios, la jerarquía visual
- "visualStyle": estilo gráfico — paleta de colores, tipografía aproximada, ambiente (clean / vibrant / minimal / etc), iluminación
- "productDescription": descripción visual del producto en inglés (forma, color, tipo de envase) para que el modelo lo dibuje correctamente

B) COPY PUBLICITARIO EN ESPAÑOL (${market}) — texto REAL y correcto, sin inventar palabras:
- "headline": titular principal, máximo 6 palabras, impactante
- "subheadline": subtitular, máximo 10 palabras
- "bodyText": 1 oración corta de apoyo (máx 12 palabras) — opcional, "" si no aplica
- "cta": botón de acción, 2-4 palabras (ej "Comprar Ahora", "Pídelo Ya")
- "bullets": exactamente 3 beneficios cortos, máx 3 palabras cada uno (ej "100% Natural", "Sin Parabenos", "Resultados Visibles")

Reglas estrictas para el copy:
- Solo palabras reales en español, correctamente escritas
- NO inventes palabras
- NO mezcles con inglés
- Que suene natural para alguien de ${market}

Responde ÚNICAMENTE con este JSON, sin markdown ni explicación:
{"layoutDescription":"...","visualStyle":"...","productDescription":"...","headline":"...","subheadline":"...","bodyText":"...","cta":"...","bullets":["...","...","..."]}`,
    });

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
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
      bodyText: (parsed.bodyText ?? "").trim(),
      cta: (parsed.cta ?? "").trim(),
      bullets: Array.isArray(parsed.bullets)
        ? parsed.bullets.map((b: unknown) => String(b).trim()).filter(Boolean)
        : [],
    };
  } catch {
    return null;
  }
}

// ─── Stage 2: Build Ideogram prompt with EXACT text strings ──────────────────

function buildIdeogramPrompt(body: RequestBody, copy: GeneratedCopy | null): string {
  const market = COUNTRY_NAMES[body.country] ?? "Latin America";
  const sectionDesc = SECTION_INSTRUCTIONS[body.sectionType] ?? "advertising banner";

  if (!copy) {
    // Fallback without Claude analysis
    const benefits = (body.productBenefits ?? []).filter(Boolean);
    const productLine = body.productName ?? body.productDescription ?? "the product";
    return [
      `Vertical 9:16 advertising banner for ${market} Spanish-speaking market.`,
      sectionDesc,
      `Product: ${productLine}.`,
      benefits.length ? `Benefits: ${benefits.join(", ")}.` : "",
      "Professional commercial quality. Clean Spanish text. High resolution.",
    ].filter(Boolean).join(" ");
  }

  // Build a prompt that QUOTES exact text strings — this is how Ideogram renders them perfectly
  const textsToRender: string[] = [];
  if (copy.headline) textsToRender.push(`large bold headline text reading "${copy.headline}"`);
  if (copy.subheadline) textsToRender.push(`subheadline text reading "${copy.subheadline}"`);
  if (copy.bodyText) textsToRender.push(`supporting text reading "${copy.bodyText}"`);
  if (copy.bullets.length) {
    const bulletText = copy.bullets.map((b) => `"${b}"`).join(", ");
    textsToRender.push(`benefit labels: ${bulletText}`);
  }
  if (copy.cta) textsToRender.push(`call-to-action button text reading "${copy.cta}"`);
  if (body.sectionType === "oferta" && body.priceSale) {
    textsToRender.push(`large price text "${body.priceSale}"${body.priceOriginal ? ` with crossed-out original price "${body.priceOriginal}"` : ""}`);
  }

  return [
    `Vertical 9:16 advertising banner for ${market} ecommerce.`,
    sectionDesc,
    `Product: ${copy.productDescription || body.productName || "the product"}.`,
    `Layout: ${copy.layoutDescription}`,
    `Visual style: ${copy.visualStyle}`,
    "",
    "TEXT TO RENDER (must appear exactly as written, all in correct Spanish, perfectly spelled):",
    textsToRender.join(". "),
    ".",
    "",
    "High-end commercial advertising photography. Sharp typography, clean kerning, perfect letterforms. Professional retouching. No watermarks. No English text. No misspellings. Photorealistic product.",
  ].filter(Boolean).join(" ");
}

// ─── Image generation calls ───────────────────────────────────────────────────

async function callIdeogramV3(params: {
  apiKey: string;
  prompt: string;
  styleImageUrls?: string[];
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const body: Record<string, unknown> = {
    prompt: params.prompt,
    rendering_speed: "QUALITY",
    expand_prompt: false,
    style: "AUTO",
    image_size: { width: 1080, height: 1920 },
    num_images: 1,
  };
  if (params.styleImageUrls && params.styleImageUrls.length > 0) {
    body.image_urls = params.styleImageUrls;
  }
  try {
    const res = await fetch("https://fal.run/fal-ai/ideogram/v3", {
      method: "POST",
      headers: { Authorization: `Key ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.detail ?? data.message ?? "Error Ideogram v3" };
    const url = data.images?.[0]?.url ?? data.image?.url;
    if (!url) return { ok: false, error: "Ideogram v3 no devolvió imagen" };
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

async function callRecraftV3(params: {
  apiKey: string;
  prompt: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://fal.run/fal-ai/recraft/v3/text-to-image", {
      method: "POST",
      headers: { Authorization: `Key ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: params.prompt,
        image_size: { width: 1080, height: 1920 },
        style: "realistic_image",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.detail ?? data.message ?? "Error Recraft" };
    const url = data.images?.[0]?.url ?? data.image?.url;
    if (!url) return { ok: false, error: "Recraft no devolvió imagen" };
    return { ok: true, url };
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
    if (!res.ok) return { ok: false, error: data.error?.message ?? "Error OpenAI" };
    const url = data.data?.[0]?.url;
    if (!url) return { ok: false, error: "DALL-E no devolvió imagen" };
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
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

  // ── Stage 1: Claude Vision + Spanish copywriting ───────────────────────────
  const copy = await analyzeAndWriteCopy(body);
  const prompt = buildIdeogramPrompt(body, copy);

  const falKey = user.user_metadata?.ai_key_fal;
  const openaiKey = user.user_metadata?.ai_key_openai;
  const userChoseDalle = body.aiModel === "openai-dalle3";

  // ── Stage 2: Image generation — Ideogram v3 by default (best text) ────────
  // Use template + product images as STYLE REFERENCES (Ideogram v3 supports this)
  if (falKey) {
    const styleRefs: string[] = [];
    if (hasTemplate) styleRefs.push(body.templateUrl!);
    if (productImages.length > 0) styleRefs.push(...productImages.slice(0, 2));

    // Allow user to force DALL-E 3 if they explicitly selected it AND have the key
    if (userChoseDalle && openaiKey) {
      const out = await callDalle3HD({ apiKey: openaiKey, prompt });
      if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "dalle3-hd" });
      return NextResponse.json({ error: out.error }, { status: 500 });
    }

    // Try Ideogram v3 first
    const ideogram = await callIdeogramV3({
      apiKey: falKey,
      prompt,
      styleImageUrls: styleRefs.length > 0 ? styleRefs : undefined,
    });
    if (ideogram.ok) {
      return NextResponse.json({ ok: true, imageUrl: ideogram.url, mode: "ideogram-v3" });
    }

    // Fallback to Recraft v3 (also excellent at text)
    const recraft = await callRecraftV3({ apiKey: falKey, prompt });
    if (recraft.ok) {
      return NextResponse.json({ ok: true, imageUrl: recraft.url, mode: "recraft-v3" });
    }

    return NextResponse.json({ error: ideogram.error }, { status: 500 });
  }

  // ── OpenAI-only path ───────────────────────────────────────────────────────
  if (openaiKey) {
    const out = await callDalle3HD({ apiKey: openaiKey, prompt });
    if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "dalle3-hd" });
    return NextResponse.json({ error: out.error }, { status: 500 });
  }

  return NextResponse.json(
    { error: "Configura tu API key de Fal.ai o OpenAI en Ajustes > Modelos IA" },
    { status: 400 }
  );
}
