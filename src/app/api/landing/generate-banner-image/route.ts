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
    "Special offer / discount banner. LARGE sale price dominant. Strikethrough original price. Urgency copy. Timer or 'Limited offer' label. Product visible.",
  antes_despues:
    "Before-and-after split banner. LEFT half = problem state (dull, damaged, before). RIGHT half = result after using product (glowing, improved, after). Product bottle/package visible. Clear contrast.",
  beneficios:
    "Product benefits showcase. 3-4 benefit items as icons + short text arranged around the product. Clean card layout. Scannable.",
  comparativa:
    "Comparison banner. Left column: OUR PRODUCT with green checkmarks. Right column: 'Others' with red X marks. Two-column split. Show superiority clearly.",
  autoridad:
    "Authority and trust banner. Certification badges. 'Dermatologically tested' or lab-approved style. Scientific, premium, credible feel. Product central.",
  testimonios:
    "Customer testimonial banner. Happy customer photo (stock), 5-star rating, quote bubble with testimonial text. Real, relatable, trustworthy.",
  ingredientes:
    "Ingredients / materials showcase. Natural ingredients arranged elegantly around the product. Close-up details. Quality and transparency.",
  modo_uso:
    "How-to-use guide. Step 1, Step 2, Step 3 visual flow. Clean numbered icons. Simple instructional layout. Product visible.",
  logistica:
    "Shipping and logistics banner. Fast delivery icon, money-back guarantee badge, secure payment icons. Trust focused.",
  faqs:
    "FAQ banner. 2-3 question-answer cards with question mark icons. Informative, organized, clean.",
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

// ─── Stage 1: Claude Vision — analyze template + generate Spanish copy ────────

interface GeneratedCopy {
  layoutDescription: string;
  headline: string;
  subheadline: string;
  bodyText: string;
  cta: string;
  bullets: string[];
}

async function analyzeTemplateAndGenerateCopy(body: RequestBody): Promise<GeneratedCopy | null> {
  try {
    const anthropic = getAnthropicClient();
    const market = COUNTRY_NAMES[body.country] ?? "Latinoamérica";
    const sectionDesc = SECTION_INSTRUCTIONS[body.sectionType] ?? "advertising banner";
    const benefits = (body.productBenefits ?? []).filter(Boolean);
    const problems = (body.productProblems ?? []).filter(Boolean);
    const ingredients = (body.productIngredients ?? []).filter(Boolean);

    const priceInfo =
      body.sectionType === "oferta" && body.priceSale
        ? `Precio oferta: ${body.priceSale}${body.priceOriginal ? ` (antes: ${body.priceOriginal})` : ""}`
        : "";

    const productSummary = [
      body.productName ? `Producto: ${body.productName}` : "",
      body.productDescription ? `Descripción: ${body.productDescription}` : "",
      benefits.length ? `Beneficios: ${benefits.join(", ")}` : "",
      problems.length ? `Problemas que resuelve: ${problems.join(", ")}` : "",
      ingredients.length && body.sectionType === "ingredientes"
        ? `Ingredientes: ${ingredients.join(", ")}`
        : "",
      body.productDifferentiator ? `Diferenciador: ${body.productDifferentiator}` : "",
      priceInfo,
      body.angle ? `Ángulo de marketing: ${body.angle}` : "",
    ].filter(Boolean).join("\n");

    const contentBlocks: Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"] = [];

    if (body.templateUrl) {
      contentBlocks.push({
        type: "image",
        source: { type: "url", url: body.templateUrl },
      });
    }

    contentBlocks.push({
      type: "text",
      text: `${body.templateUrl ? "Analiza esta plantilla de banner publicitario.\n\n" : ""}Necesito dos cosas:

1. DESCRIPCIÓN DEL DISEÑO (2-3 oraciones): Describe la estructura visual — dónde va el titular principal, dónde va la imagen del producto, dónde van los textos secundarios/beneficios, cuál es la jerarquía visual, zonas de color.

2. COPY PUBLICITARIO EN ESPAÑOL para el mercado de ${market}
Tipo de banner: ${sectionDesc}

${productSummary}

Genera copy publicitario convincente, real y en español latinoamericano natural:
- TITULAR: máx 8 palabras, impactante, directo
- SUBTITULAR: máx 15 palabras
- TEXTO CUERPO: 1-2 oraciones de apoyo
- CTA (llamado a la acción): 3-5 palabras, botón de acción
- 3 PUNTOS DE BENEFICIO: cortos, poderosos (máx 6 palabras cada uno)

Responde ÚNICAMENTE con este JSON (sin markdown):
{
  "layoutDescription": "...",
  "headline": "...",
  "subheadline": "...",
  "bodyText": "...",
  "cta": "...",
  "bullets": ["...", "...", "..."]
}`,
    });

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      layoutDescription: parsed.layoutDescription ?? "",
      headline: parsed.headline ?? "",
      subheadline: parsed.subheadline ?? "",
      bodyText: parsed.bodyText ?? "",
      cta: parsed.cta ?? "",
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
    };
  } catch {
    return null;
  }
}

// ─── Stage 2: Build generation prompt from Claude copy ────────────────────────

function buildGenerationPrompt(body: RequestBody, copy: GeneratedCopy | null): string {
  const market = COUNTRY_NAMES[body.country] ?? "Latinoamérica";
  const sectionDesc = SECTION_INSTRUCTIONS[body.sectionType] ?? "advertising banner";
  const productLine = body.productName
    ? `${body.productName}${body.productDescription ? " — " + body.productDescription : ""}`
    : body.productDescription || "el producto";

  if (copy) {
    const bulletList = copy.bullets.length ? copy.bullets.map((b) => `• ${b}`).join("  ") : "";
    const priceText =
      body.sectionType === "oferta" && body.priceSale
        ? ` PRECIO: "${body.priceSale}"${body.priceOriginal ? ` (tachado: "${body.priceOriginal}")` : ""}.`
        : "";

    return [
      `Crea un banner publicitario vertical 9:16 (1080×1920 píxeles) para ${market}.`,
      copy.layoutDescription
        ? `DISEÑO: ${copy.layoutDescription}`
        : sectionDesc,
      `PRODUCTO: ${productLine}.`,
      "",
      `TEXTO EXACTO a incluir en el banner (respeta las palabras exactas):`,
      `TITULAR PRINCIPAL: "${copy.headline}"`,
      `SUBTITULAR: "${copy.subheadline}"`,
      copy.bodyText ? `TEXTO DE APOYO: "${copy.bodyText}"` : "",
      copy.bullets.length ? `BENEFICIOS: ${bulletList}` : "",
      `BOTÓN/CTA: "${copy.cta}"`,
      priceText,
      "",
      "ESTILO VISUAL: banner publicitario profesional, alta calidad comercial, fotografía de producto limpia y nítida. Sin marcas de agua. Sin texto en inglés.",
      "TIPOGRAFÍA: bold, peso heavy para titular. Legible. Letras en español correctas.",
      "COLOR: paleta que armonice con el producto.",
    ].filter(Boolean).join(" ");
  }

  // Fallback without Claude copy
  const benefits = (body.productBenefits ?? []).filter(Boolean);
  const colorsText = (body.colors ?? []).filter(Boolean).join(", ");
  return [
    sectionDesc,
    `Producto: ${productLine}.`,
    benefits.length ? `Beneficios: ${benefits.join("; ")}.` : "",
    body.angle ? `Ángulo: ${body.angle}.` : "",
    colorsText ? `Paleta de colores: ${colorsText}.` : "",
    `Mercado: ${market}.`,
    body.sectionType === "oferta" && body.priceSale
      ? `Precio: ${body.priceSale}${body.priceOriginal ? ` (antes ${body.priceOriginal})` : ""}.`
      : "",
    "Banner vertical 9:16. Copy en español. Calidad comercial premium.",
  ].filter(Boolean).join(" ");
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
  const hasProduct = productImages.length > 0;

  // ── Stage 1: Claude Vision analyzes template + generates Spanish copy ──────
  // Runs whenever we have a template URL (it's fast ~2-3s and critical for quality)
  const copy = hasTemplate ? await analyzeTemplateAndGenerateCopy(body) : null;
  const prompt = buildGenerationPrompt(body, copy);

  // ── DALL-E 3 path (best text rendering, hd quality) ──────────────────────
  const openaiKey = user.user_metadata?.ai_key_openai;
  if (body.aiModel === "openai-dalle3" || (!user.user_metadata?.ai_key_fal && openaiKey)) {
    if (!openaiKey) {
      return NextResponse.json(
        { error: "Configura tu API key de OpenAI en Ajustes > Modelos IA" },
        { status: 400 }
      );
    }
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1792",
          quality: "hd",
          style: "vivid",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.error?.message ?? "Error OpenAI" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, imageUrl: data.data?.[0]?.url, mode: "dalle3-hd" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    }
  }

  // ── Fal.ai path ───────────────────────────────────────────────────────────
  const falKey = user.user_metadata?.ai_key_fal;
  if (!falKey) {
    return NextResponse.json(
      { error: "Configura tu API key de Fal.ai en Ajustes > Modelos IA" },
      { status: 400 }
    );
  }

  // Branch A: template + product images → Flux Kontext Multi
  // (passes product reference images so product appears in the banner)
  if (hasTemplate && hasProduct) {
    const imageUrls = [body.templateUrl!, ...productImages];
    try {
      const res = await fetch("https://fal.run/fal-ai/flux-pro/kontext/max/multi", {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          image_urls: imageUrls,
          aspect_ratio: "9:16",
          guidance_scale: 3.5,
          num_images: 1,
          output_format: "jpeg",
          safety_tolerance: "2",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data.detail ?? data.message ?? "Error Fal.ai Kontext Multi" },
          { status: 500 }
        );
      }
      const imageUrl = data.images?.[0]?.url ?? data.image?.url;
      if (!imageUrl) return NextResponse.json({ error: "No se generó imagen" }, { status: 500 });
      return NextResponse.json({ ok: true, imageUrl, mode: "kontext-multi" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    }
  }

  // Branch B: template only (no product photos) → Ideogram v2 for best text rendering
  if (hasTemplate && !hasProduct) {
    try {
      const res = await fetch("https://fal.run/fal-ai/ideogram/v2", {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspect_ratio: "9_16",
          rendering_speed: "QUALITY",
          magic_prompt_option: "OFF",
          style_type: "REALISTIC",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Fallback to Flux Kontext single if Ideogram fails
        const res2 = await fetch("https://fal.run/fal-ai/flux-pro/kontext/max", {
          method: "POST",
          headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            image_url: body.templateUrl!,
            aspect_ratio: "9:16",
            guidance_scale: 3.5,
            num_images: 1,
            output_format: "jpeg",
            safety_tolerance: "2",
          }),
        });
        const data2 = await res2.json();
        const imageUrl2 = data2.images?.[0]?.url ?? data2.image?.url;
        if (imageUrl2) return NextResponse.json({ ok: true, imageUrl: imageUrl2, mode: "kontext-single" });
        return NextResponse.json({ error: data.detail ?? data.message ?? "Error Fal.ai" }, { status: 500 });
      }
      const imageUrl = data.images?.[0]?.url ?? data.image?.url;
      if (!imageUrl) return NextResponse.json({ error: "No se generó imagen" }, { status: 500 });
      return NextResponse.json({ ok: true, imageUrl, mode: "ideogram-template" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    }
  }

  // Branch C: no template, no product → text-to-image with selected model
  const falModelMap: Record<string, string> = {
    "fal-flux-dev":   "fal-ai/flux/dev",
    "fal-flux-pro":   "fal-ai/flux-pro/v1.1",
    "fal-flux-ultra": "fal-ai/flux-pro/v1.1-ultra",
    "fal-ideogram2":  "fal-ai/ideogram/v2",
    "fal-imagen3":    "fal-ai/imagen3",
    "fal-sd-xl":      "fal-ai/stable-diffusion-xl",
  };
  const modelPath = falModelMap[body.aiModel] ?? "fal-ai/ideogram/v2";

  const isIdeogram = modelPath.includes("ideogram");
  const falBody = isIdeogram
    ? {
        prompt,
        aspect_ratio: "9_16",
        rendering_speed: "QUALITY",
        magic_prompt_option: "OFF",
        style_type: "REALISTIC",
      }
    : {
        prompt,
        image_size: "portrait_16_9",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      };

  try {
    const res = await fetch(`https://fal.run/${modelPath}`, {
      method: "POST",
      headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(falBody),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? data.message ?? "Error de Fal.ai" },
        { status: 500 }
      );
    }
    const imageUrl = data.images?.[0]?.url ?? data.image?.url;
    if (!imageUrl) return NextResponse.json({ error: "No se generó imagen" }, { status: 500 });
    return NextResponse.json({ ok: true, imageUrl, mode: "text-to-image" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
