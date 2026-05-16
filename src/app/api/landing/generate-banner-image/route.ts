import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const SECTION_PROMPTS: Record<string, string> = {
  hero:          "Main hero product advertisement banner. Eye-catching, premium lifestyle shot. Product front and center.",
  oferta:        "Special offer / discount sale advertisement. Bold pricing, urgency, promotional deal.",
  antes_despues: "Before and after transformation advertisement. Split composition showing contrast and results.",
  beneficios:    "Product benefits showcase advertisement. Multiple benefit highlights, visual icons, clean layout.",
  comparativa:   "Product comparison advertisement. Our product vs others. Superiority, clear winner.",
  autoridad:     "Authority and trust advertisement. Certifications, badges, lab tested, professional endorsement.",
  testimonios:   "Customer testimonials advertisement. Happy customers, real results, social proof.",
  ingredientes:  "Ingredients or materials showcase advertisement. Close-up detail, quality components.",
  modo_uso:      "How to use / usage guide advertisement. Step by step, clean instructional visual.",
  logistica:     "Shipping and logistics advertisement. Fast delivery, guarantee, secure packaging.",
  faqs:          "FAQ / frequently asked questions advertisement. Clean, informative, trustworthy design.",
};

export async function POST(req: NextRequest) {
  let body: {
    sectionType: string;
    productDescription: string;
    angle: string;
    colors: string[];
    font: string;
    country: string;
    aiModel: string;
    styleKeywords?: string;
    priceSale?: string;
    priceOriginal?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { sectionType, productDescription, angle, colors, font, country, aiModel, styleKeywords, priceSale, priceOriginal } = body;

  const sectionDesc = SECTION_PROMPTS[sectionType] ?? "Product advertisement banner";

  const colorsText = (colors ?? []).filter(Boolean).join(", ");
  const pricingText =
    sectionType === "oferta" && priceSale
      ? ` Sale price: ${priceSale}${priceOriginal ? `, original ${priceOriginal}` : ""}.`
      : "";

  const prompt = [
    sectionDesc,
    styleKeywords ? `Visual style: ${styleKeywords}.` : "",
    `Product: ${productDescription || "dropshipping product"}.`,
    angle ? `Marketing angle: ${angle}.` : "",
    colorsText ? `Color palette: ${colorsText}.` : "",
    `Typography style: ${font || "modern sans-serif"}.`,
    `Target market: ${country || "Latin America"}.`,
    pricingText,
    "Professional commercial photography. High quality. Perfect for social media advertising.",
  ]
    .filter(Boolean)
    .join(" ");

  const falModelMap: Record<string, string> = {
    "fal-flux-dev":   "fal-ai/flux/dev",
    "fal-flux-pro":   "fal-ai/flux-pro/v1.1",
    "fal-flux-ultra": "fal-ai/flux-pro/v1.1-ultra",
    "fal-ideogram2":  "fal-ai/ideogram/v2",
    "fal-imagen3":    "fal-ai/imagen3",
    "fal-sd-xl":      "fal-ai/stable-diffusion-xl",
  };

  const isOpenAI = aiModel === "openai-dalle3";

  if (isOpenAI) {
    const openaiKey = user.user_metadata?.ai_key_openai;
    if (!openaiKey) {
      return NextResponse.json({ error: "Configura tu API key de OpenAI en Ajustes > Modelos IA" }, { status: 400 });
    }

    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "standard" }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.error?.message ?? "Error OpenAI" }, { status: 500 });
      return NextResponse.json({ ok: true, imageUrl: data.data?.[0]?.url });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
    }
  }

  const falKey = user.user_metadata?.ai_key_fal;
  if (!falKey) {
    return NextResponse.json({
      error: "Configura tu API key de Fal.ai en Ajustes > Modelos IA para generar imágenes",
    }, { status: 400 });
  }

  const modelPath = falModelMap[aiModel] ?? "fal-ai/flux/dev";
  const falEndpoint = `https://fal.run/${modelPath}`;
  const falBody = { prompt, image_size: "square_hd", num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true };

  try {
    const res = await fetch(falEndpoint, {
      method: "POST",
      headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(falBody),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.detail ?? data.message ?? "Error de Fal.ai" }, { status: 500 });
    }

    const imageUrl = data.images?.[0]?.url ?? data.image?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "No se generó imagen" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, imageUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
