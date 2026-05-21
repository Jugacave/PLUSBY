import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 180;

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudioRequest {
  sectionType: string;
  templateUrl: string | null;
  productImages: string[];
  productName?: string;
  productDescription?: string;
  productBenefits?: string[];
  productProblems?: string[];
  productIngredients?: string[];
  productDifferentiator?: string;
  priceSale?: string;
  priceOriginal?: string;
  // Studio fields
  bgColor?: string;
  outputSize?: string;     // "original" | "1080x1920" | "1080x1080" | "1200x628" | "1920x1080" | "300x250" | "728x90" | "160x600" | "custom"
  customWidth?: number;
  customHeight?: number;
  language?: string;       // "es" | "pt" | "en"
  aiModel?: "gpt-image-1" | "gemini" | "dalle3";
  // Personalization
  personalization?: boolean;
  characterNationality?: string;
  characterSex?: string;
  characterAgeRange?: string;
  sellingAngle?: string;
  specificProblem?: string;
  targetAudience?: string;
  solutionMechanism?: string;
  additionalInstructions?: string;
  country?: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "México", PA: "Panamá", EC: "Ecuador", PE: "Perú",
  CL: "Chile", PY: "Paraguay", AR: "Argentina", GT: "Guatemala", ES: "España",
};

const LANGUAGE_NAMES: Record<string, string> = {
  es: "español",
  pt: "portugués brasileño",
  en: "inglés",
};

// ─── Output size → OpenAI size mapping ───────────────────────────────────────
// gpt-image-1 only supports: 1024x1024, 1024x1536, 1536x1024
function mapOutputSize(s: string | undefined): "1024x1024" | "1024x1536" | "1536x1024" {
  switch (s) {
    case "1080x1080": return "1024x1024";
    case "1200x628":
    case "1920x1080":
    case "728x90":
    case "300x250":
      return "1536x1024";
    case "160x600":
    case "1080x1920":
    case "original":
    default:
      return "1024x1536";
  }
}

// ─── Stage 1: Build the section prompt (text-only, no copy translation needed
// because gpt-image-1 handles multilingual text rendering natively) ──────────

function buildStudioPrompt(req: StudioRequest): string {
  const market = COUNTRY_NAMES[req.country ?? "CO"] ?? "Latinoamérica";
  const lang = LANGUAGE_NAMES[req.language ?? "es"] ?? "español";

  const sections: string[] = [];

  // Header
  sections.push(
    `Create a high-end e-commerce advertising banner for the ${market} market.`,
    `All text on the image MUST be in ${lang}, properly spelled, no nonsense words.`,
  );

  // Visual reference instructions (most important — this is what guides composition)
  if (req.templateUrl) {
    sections.push(
      `STYLE REFERENCE: I am providing a reference template image. Follow its EXACT visual style, layout, typography style, color treatment, background composition, and overall mood. Replicate the design language faithfully.`
    );
  }
  if (req.productImages.length > 0) {
    sections.push(
      `PRODUCT: I am providing ${req.productImages.length} photo(s) of the actual product. The product in the final banner MUST be the same product shown in these photos — same shape, color, label, branding. Do not invent a different product. Integrate it naturally into the composition.`
    );
  }

  // Section-specific layout
  const sectionGuide: Record<string, string> = {
    hero:          "Layout: powerful hero banner. Big bold headline (max 5 words), product hero shot dominant, single CTA button.",
    oferta:        "Layout: offer/sale banner. Large discounted price dominant, struck-through original price, SALE badge, product visible, urgent CTA.",
    antes_despues: "Layout: vertical before/after split. Top half shows the problem state (desaturated), bottom half shows the result (vibrant). Product positioned between the two halves. Only the words 'ANTES' and 'DESPUÉS' as labels.",
    beneficios:    "Layout: 3 benefit icons arranged around the central product. Each icon has a 1-2 word label below.",
    comparativa:   "Layout: two vertical columns. Left = NOSOTROS with green check marks. Right = OTROS with red X. Product featured on the left column.",
    autoridad:     "Layout: product centered with 3 authority/certification badges around it (e.g. TESTEADO, DERMATÓLOGO, GARANTÍA). Premium scientific look.",
    testimonios:   "Layout: customer photo, 5 golden stars, short quoted testimonial. Product visible smaller in the corner.",
    ingredientes:  "Layout: product centered with 3 natural ingredient illustrations around it (fruits, leaves, etc), each labeled.",
    modo_uso:      "Layout: 3 numbered steps in a row (1, 2, 3) with simple icons. Each step has a 1-2 word label.",
    logistica:     "Layout: 3 logistics icons in a row (shipping, warranty, secure payment), each with a short label.",
    faqs:          "Layout: 2 large question mark cards with very short text below each. Product small on the side.",
  };
  sections.push(sectionGuide[req.sectionType] ?? sectionGuide.hero);

  // Product info
  const productInfo: string[] = [];
  if (req.productName) productInfo.push(`Product name: ${req.productName}`);
  if (req.productDescription) productInfo.push(`Description: ${req.productDescription}`);
  const benefits = (req.productBenefits ?? []).filter(Boolean);
  if (benefits.length) productInfo.push(`Benefits: ${benefits.join(", ")}`);
  const problems = (req.productProblems ?? []).filter(Boolean);
  if (problems.length) productInfo.push(`Problems solved: ${problems.join(", ")}`);
  const ingredients = (req.productIngredients ?? []).filter(Boolean);
  if (ingredients.length) productInfo.push(`Key ingredients: ${ingredients.join(", ")}`);
  if (req.productDifferentiator) productInfo.push(`Differentiator: ${req.productDifferentiator}`);
  if (req.priceSale) productInfo.push(`Sale price: ${req.priceSale}${req.priceOriginal ? ` (was ${req.priceOriginal})` : ""}`);
  if (productInfo.length) {
    sections.push(`PRODUCT INFORMATION:\n${productInfo.join("\n")}`);
  }

  // Personalization
  if (req.personalization) {
    const persona: string[] = [];
    if (req.characterNationality) persona.push(`nationality: ${req.characterNationality}`);
    if (req.characterSex) persona.push(`sex: ${req.characterSex}`);
    if (req.characterAgeRange) persona.push(`age range: ${req.characterAgeRange}`);
    if (persona.length) {
      sections.push(`CHARACTER: If a person appears in the banner, they must match this profile: ${persona.join(", ")}. Latin-American appearance. Authentic, relatable.`);
    }
    if (req.sellingAngle) sections.push(`SELLING ANGLE: ${req.sellingAngle}`);
    if (req.specificProblem) sections.push(`SPECIFIC PROBLEM TO ADDRESS: ${req.specificProblem}`);
    if (req.targetAudience) sections.push(`TARGET AUDIENCE: ${req.targetAudience}`);
    if (req.solutionMechanism) sections.push(`HOW THE PRODUCT BECOMES THE SOLUTION: ${req.solutionMechanism}`);
    if (req.additionalInstructions) sections.push(`ADDITIONAL INSTRUCTIONS: ${req.additionalInstructions}`);
  }

  // Background color
  if (req.bgColor) {
    sections.push(`DOMINANT BACKGROUND COLOR: ${req.bgColor}. Use this color as the main background tone or accent in the composition.`);
  }

  // Quality directives
  sections.push(
    `QUALITY: Photography-grade composition, sharp focus, professional lighting, vibrant but harmonious colors, modern advertising aesthetic. The banner must look like it was made by a top Meta-ads agency in ${market}.`,
    `TEXT REQUIREMENTS: All text must be in ${lang}, real words, perfect spelling, NO gibberish. Keep text minimal — preferably ≤8 total words on the entire banner. Use bold, condensed display fonts.`,
    `OUTPUT: A single banner image, ready to use as a landing page section. No watermarks, no logos other than the product's own branding.`,
  );

  return sections.join("\n\n");
}

// ─── Stage 2: Fetch URLs as buffers and POST to OpenAI /v1/images/edits ──────

async function fetchAsBlob(url: string): Promise<{ blob: Blob; filename: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    // OpenAI accepts png, jpeg, webp. Convert mime → ext.
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
  imageUrls: string[];          // first url should be the template, rest are product photos
  size: "1024x1024" | "1024x1536" | "1536x1024";
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", params.prompt);
    form.append("n", "1");
    form.append("size", params.size);
    form.append("quality", "high");

    // gpt-image-1 accepts up to 16 images via repeated "image[]" field
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
    if (!res.ok) return { ok: false, error: data.error?.message ?? "OpenAI error" };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return { ok: false, error: "gpt-image-1 no devolvió imagen" };
    return { ok: true, url: `data:image/png;base64,${b64}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

async function callGptImage1Generate(params: {
  apiKey: string;
  prompt: string;
  size: "1024x1024" | "1024x1536" | "1536x1024";
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: params.prompt,
        n: 1,
        size: params.size,
        quality: "high",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error?.message ?? "OpenAI error" };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return { ok: false, error: "gpt-image-1 no devolvió imagen" };
    return { ok: true, url: `data:image/png;base64,${b64}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

// ─── Optional Claude vision pass to enrich the prompt with template analysis
async function enrichPromptWithVision(req: StudioRequest, basePrompt: string): Promise<string> {
  if (!req.templateUrl) return basePrompt;
  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: req.templateUrl } },
          { type: "text", text: `Analiza esta plantilla de banner publicitario. Responde con un párrafo breve (máx 100 palabras) en INGLÉS describiendo: layout exacto, paleta de colores, estilo tipográfico, mood, composición. Solo el párrafo, sin preámbulos.` },
        ],
      }],
    });
    const analysis = message.content[0].type === "text" ? message.content[0].text : "";
    if (!analysis) return basePrompt;
    return `${basePrompt}\n\nTEMPLATE ANALYSIS: ${analysis}`;
  } catch {
    return basePrompt;
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: StudioRequest;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const openaiKey = user.user_metadata?.ai_key_openai ?? process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: "Falta API key de OpenAI. Configúrala en tu perfil." }, { status: 400 });
  }

  const productImages = (body.productImages ?? []).filter((u): u is string => !!u && u.startsWith("http"));
  const size = mapOutputSize(body.outputSize);

  // Stage 1: build prompt
  let prompt = buildStudioPrompt(body);
  prompt = await enrichPromptWithVision(body, prompt);

  // Stage 2: generate
  const imageUrls = [
    ...(body.templateUrl ? [body.templateUrl] : []),
    ...productImages,
  ];

  let result;
  if (imageUrls.length > 0) {
    // Edit mode — use template + product photos as visual reference
    result = await callGptImage1Edit({ apiKey: openaiKey, prompt, imageUrls, size });
  } else {
    // Pure text-to-image fallback
    result = await callGptImage1Generate({ apiKey: openaiKey, prompt, size });
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, imageUrl: result.url, mode: imageUrls.length > 0 ? "gpt-image-1-edit" : "gpt-image-1-gen" });
}
