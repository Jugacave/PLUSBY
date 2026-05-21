import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

// ─── Section-specific instructions for the AI ────────────────────────────────
// These tell the model what each section should communicate visually.

const SECTION_INSTRUCTIONS: Record<string, string> = {
  hero:
    "Main hero product banner. Product featured prominently. Bold product name as headline. " +
    "Eye-catching premium commercial photography. Lifestyle context if appropriate.",
  oferta:
    "Special offer / discount banner. Large prominent price display with strikethrough original price. " +
    "Sense of urgency, sale, limited time. Product visible.",
  antes_despues:
    "Before-and-after transformation banner. Split composition (left = before/problem, right = after/result). " +
    "Show contrast clearly. Product as the solution.",
  beneficios:
    "Product benefits showcase. Multiple benefit highlights as floating cards/pills/icons around the product. " +
    "Clean layout, easy to scan, professional iconography.",
  comparativa:
    "Product comparison banner. 'Our product' vs 'others' / generic alternative. " +
    "Clearly show superiority. Two-column or split composition with checkmarks vs crosses.",
  autoridad:
    "Authority and trust banner. Certifications, badges, lab-tested, professional endorsement. " +
    "Premium, credible, scientific feel.",
  testimonios:
    "Customer testimonials banner. Happy customer photo, 5-star rating, quote bubble. " +
    "Real, relatable, trustworthy. Social proof.",
  ingredientes:
    "Ingredients / materials showcase. Close-up detail of key components or natural ingredients arranged elegantly. " +
    "Quality, transparency, premium materials.",
  modo_uso:
    "How to use / usage guide. Step-by-step numbered visual (1, 2, 3). Clean instructional layout. " +
    "Simple, clear, actionable.",
  logistica:
    "Shipping and logistics banner. Fast delivery, secure packaging, money-back guarantee. " +
    "Trust badges, payment methods, delivery icons.",
  faqs:
    "Frequently asked questions banner. Clean Q&A cards with question marks. " +
    "Informative, trustworthy, organized design.",
};

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "Mexico", PA: "Panama", EC: "Ecuador", PE: "Peru",
  CL: "Chile", PY: "Paraguay", AR: "Argentina", GT: "Guatemala", ES: "Spain",
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

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildMultiImagePrompt(b: RequestBody): string {
  const sectionDesc = SECTION_INSTRUCTIONS[b.sectionType] ?? "Product advertisement banner";
  const benefits = (b.productBenefits ?? []).filter(Boolean);
  const problems = (b.productProblems ?? []).filter(Boolean);
  const ingredients = (b.productIngredients ?? []).filter(Boolean);
  const market = COUNTRY_NAMES[b.country] ?? "Latin America";

  const productLine = b.productName
    ? `${b.productName}${b.productDescription ? " — " + b.productDescription : ""}`
    : b.productDescription || "the product";

  const benefitsLine = benefits.length
    ? `Key benefits to highlight (translate to natural Spanish for ${market}): ${benefits.join("; ")}.`
    : "";
  const problemsLine = problems.length
    ? `Pain points this product solves: ${problems.join("; ")}.`
    : "";
  const ingredientsLine = ingredients.length && b.sectionType === "ingredientes"
    ? `Show these ingredients/components: ${ingredients.join(", ")}.`
    : "";
  const differentiatorLine = b.productDifferentiator
    ? `Differentiator: ${b.productDifferentiator}.`
    : "";
  const angleLine = b.angle ? `Marketing angle: ${b.angle}.` : "";
  const priceLine =
    b.sectionType === "oferta" && b.priceSale
      ? `Show price ${b.priceSale}${b.priceOriginal ? ` (original ${b.priceOriginal} crossed out)` : ""}.`
      : "";

  return [
    `Create a vertical 9:16 advertising banner (1080×1920 portrait format) for Spanish-speaking ${market}.`,
    "",
    `IMAGE 1 is the LAYOUT TEMPLATE: replicate its composition, text positioning, hierarchy, font weight, and overall design structure.`,
    `IMAGES 2+ show the ACTUAL PRODUCT to feature in the banner. Use these as the product reference — keep the product identity, shape and details faithful.`,
    "",
    `${sectionDesc}`,
    "",
    `Product: ${productLine}.`,
    benefitsLine,
    problemsLine,
    ingredientsLine,
    differentiatorLine,
    angleLine,
    priceLine,
    "",
    "COLOR PALETTE: adapt the colors to harmonize with the product's natural dominant colors (the colors visible in IMAGES 2+). Do NOT copy the template's exact colors — derive a complementary palette from the product itself.",
    "TYPOGRAPHY: bold, advertising-style, easy to read. Spanish copy. Heavy headlines, supporting body text.",
    "OUTPUT: a finished social media advertising banner. Professional commercial quality. Sharp, clean, high contrast. No watermarks, no logos that don't belong, no English text.",
  ].filter(Boolean).join(" ");
}

function buildTextOnlyPrompt(b: RequestBody): string {
  const sectionDesc = SECTION_INSTRUCTIONS[b.sectionType] ?? "Product advertisement banner";
  const colorsText = (b.colors ?? []).filter(Boolean).join(", ");
  const market = COUNTRY_NAMES[b.country] ?? "Latin America";
  const productLine = b.productName
    ? `${b.productName}${b.productDescription ? " — " + b.productDescription : ""}`
    : b.productDescription || "dropshipping product";
  const benefits = (b.productBenefits ?? []).filter(Boolean);
  const benefitsLine = benefits.length ? `Benefits: ${benefits.join("; ")}.` : "";
  const priceLine =
    b.sectionType === "oferta" && b.priceSale
      ? ` Sale price: ${b.priceSale}${b.priceOriginal ? `, original ${b.priceOriginal}` : ""}.`
      : "";

  return [
    sectionDesc,
    `Product: ${productLine}.`,
    benefitsLine,
    b.angle ? `Marketing angle: ${b.angle}.` : "",
    colorsText ? `Color palette: ${colorsText}.` : "",
    `Typography style: ${b.font || "modern sans-serif"}.`,
    `Target market: Spanish-speaking ${market}.`,
    priceLine,
    "Vertical 9:16 portrait format. Professional commercial photography. Spanish copy. High quality. Perfect for social media advertising.",
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
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const productImages = (body.productImages ?? []).filter((u): u is string => !!u);
  const hasTemplate = !!body.templateUrl;
  const hasProduct = productImages.length > 0;
  const useMultiImage = hasTemplate && hasProduct;

  // ── BRANCH 1: Multi-image editing (template + product → composed banner)
  if (useMultiImage) {
    const falKey = user.user_metadata?.ai_key_fal;
    if (!falKey) {
      return NextResponse.json(
        { error: "Configura tu API key de Fal.ai en Ajustes > Modelos IA" },
        { status: 400 }
      );
    }

    const prompt = buildMultiImagePrompt(body);
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
          { error: data.detail ?? data.message ?? "Error de Fal.ai (Kontext Multi)" },
          { status: 500 }
        );
      }

      const imageUrl = data.images?.[0]?.url ?? data.image?.url;
      if (!imageUrl) {
        return NextResponse.json({ error: "No se generó imagen" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, imageUrl, mode: "kontext-multi" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    }
  }

  // ── BRANCH 2: Single-image editing (just template → product-less banner)
  if (hasTemplate && !hasProduct) {
    const falKey = user.user_metadata?.ai_key_fal;
    if (!falKey) {
      return NextResponse.json(
        { error: "Configura tu API key de Fal.ai en Ajustes > Modelos IA" },
        { status: 400 }
      );
    }

    const prompt = buildMultiImagePrompt(body);
    try {
      const res = await fetch("https://fal.run/fal-ai/flux-pro/kontext/max", {
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
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data.detail ?? data.message ?? "Error de Fal.ai (Kontext)" },
          { status: 500 }
        );
      }
      const imageUrl = data.images?.[0]?.url ?? data.image?.url;
      if (!imageUrl) return NextResponse.json({ error: "No se generó imagen" }, { status: 500 });
      return NextResponse.json({ ok: true, imageUrl, mode: "kontext-single" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    }
  }

  // ── BRANCH 3: Text-to-image fallback (no template selected)
  const prompt = buildTextOnlyPrompt(body);
  const isOpenAI = body.aiModel === "openai-dalle3";

  if (isOpenAI) {
    const openaiKey = user.user_metadata?.ai_key_openai;
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
        body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1792", quality: "standard" }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.error?.message ?? "Error OpenAI" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, imageUrl: data.data?.[0]?.url, mode: "dalle3" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    }
  }

  const falKey = user.user_metadata?.ai_key_fal;
  if (!falKey) {
    return NextResponse.json(
      { error: "Configura tu API key de Fal.ai en Ajustes > Modelos IA para generar imágenes" },
      { status: 400 }
    );
  }

  const falModelMap: Record<string, string> = {
    "fal-flux-dev":   "fal-ai/flux/dev",
    "fal-flux-pro":   "fal-ai/flux-pro/v1.1",
    "fal-flux-ultra": "fal-ai/flux-pro/v1.1-ultra",
    "fal-ideogram2":  "fal-ai/ideogram/v2",
    "fal-imagen3":    "fal-ai/imagen3",
    "fal-sd-xl":      "fal-ai/stable-diffusion-xl",
  };
  const modelPath = falModelMap[body.aiModel] ?? "fal-ai/flux/dev";
  const falEndpoint = `https://fal.run/${modelPath}`;
  const falBody = {
    prompt,
    image_size: "portrait_16_9",
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
  };

  try {
    const res = await fetch(falEndpoint, {
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
