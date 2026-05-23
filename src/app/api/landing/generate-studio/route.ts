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
  aiModel?: "gpt-image-1" | "gpt-image-2" | "gemini" | "dalle3";
  productDetails?: string; // optional user-provided override of productDescription
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

// ─── Section types that benefit from lifestyle photography ────────────────────
const LIFESTYLE_SECTIONS = new Set(["hero", "beneficios", "testimonios", "antes_despues", "modo_uso", "oferta"]);

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

// gpt-image-2 supports any WxH where both edges are multiples of 16, aspect <= 3:1
function mapOutputSizeGpt2(s: string | undefined): string {
  switch (s) {
    case "1080x1080": return "1088x1088";
    case "1200x628":  return "1200x624";
    case "1920x1080": return "1920x1088";
    case "728x90":    return "736x96";
    case "300x250":   return "304x256";
    case "160x600":   return "160x608";
    case "1080x1920":
    case "original":
    default:          return "1088x1920";
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
  const description = req.productDetails?.trim() || req.productDescription;
  if (description) productInfo.push(`Description: ${description}`);
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

  // Lifestyle photography — always enabled for sections that benefit from it
  if (LIFESTYLE_SECTIONS.has(req.sectionType)) {
    const lifestyleScenes: Record<string, string> = {
      hero:          "A confident Latin American woman or man in their 30s using the product in a real-life aspirational setting (e.g., modern gym, bright home bathroom, outdoor park). The person is the hero — product in hand or actively being used. Cinematic lighting, shallow depth of field, fashion-editorial quality.",
      beneficios:    "A Latin American model demonstrating the product naturally in an everyday scene (home, gym, outdoors). The model looks happy and vibrant, product clearly visible.",
      testimonios:   "A real-looking Latin American person (not obviously stock), approx 25-45 years old, smiling authentically while holding or showing the product. Warm, trust-building environment.",
      antes_despues: "Photo-realistic before/after composition. The 'before' half: person looking tired, skin dull, problem visible. The 'after' half: same person glowing, energetic, transformed. Latin American features.",
      modo_uso:      "Step-by-step lifestyle imagery: a Latin American model in a clean, bright setting showing how to use the product — apply, use, enjoy. Natural hands-on feel.",
      oferta:        "Exciting, high-energy lifestyle image: Latin American model excitedly discovering the product deal, vibrant colors, sale atmosphere.",
    };
    const scene = lifestyleScenes[req.sectionType] ?? "";
    if (scene) sections.push(`LIFESTYLE SCENE: ${scene}`);

    // Personalization overrides
    if (req.personalization) {
      const persona: string[] = [];
      if (req.characterNationality) persona.push(`nationality: ${req.characterNationality}`);
      if (req.characterSex) persona.push(`sex: ${req.characterSex}`);
      if (req.characterAgeRange) persona.push(`age range: ${req.characterAgeRange}`);
      if (persona.length) {
        sections.push(`CHARACTER OVERRIDE: The person in the banner must match this exact profile: ${persona.join(", ")}. Authentic Latin-American appearance.`);
      }
    }
  } else if (req.personalization) {
    const persona: string[] = [];
    if (req.characterNationality) persona.push(`nationality: ${req.characterNationality}`);
    if (req.characterSex) persona.push(`sex: ${req.characterSex}`);
    if (req.characterAgeRange) persona.push(`age range: ${req.characterAgeRange}`);
    if (persona.length) {
      sections.push(`CHARACTER: If a person appears in the banner, they must match this profile: ${persona.join(", ")}. Latin-American appearance. Authentic, relatable.`);
    }
  }

  if (req.personalization) {
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
  size: string;
  model?: "gpt-image-1" | "gpt-image-2";
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const form = new FormData();
    form.append("model", params.model ?? "gpt-image-1");
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
  size: string;
  model?: "gpt-image-1" | "gpt-image-2";
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model ?? "gpt-image-1",
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

// ─── Gemini 2.5 Flash Image Generation ───────────────────────────────────────

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

async function callGeminiFlashImage(params: {
  apiKey: string;
  prompt: string;
  imageUrls: string[];
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    // Build parts: text first, then images
    const parts: unknown[] = [{ text: params.prompt }];

    for (const url of params.imageUrls.slice(0, 8)) {
      const img = await fetchAsBase64(url);
      if (!img) continue;
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${params.apiKey}`;

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
      const msg = data.error?.message ?? JSON.stringify(data);
      return { ok: false, error: `Gemini error: ${msg}` };
    }

    // Find the image part in the response
    const candidates = data.candidates ?? [];
    for (const candidate of candidates) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? "image/png";
          return { ok: true, url: `data:${mime};base64,${part.inlineData.data}` };
        }
      }
    }

    return { ok: false, error: "Gemini no devolvió imagen" };
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

  const geminiKey: string | undefined = user.user_metadata?.ai_key_gemini;
  const openaiKey: string | undefined =
    user.user_metadata?.ai_key_gpt_image ??
    user.user_metadata?.ai_key_openai ??
    process.env.OPENAI_API_KEY;

  const useGemini = body.aiModel === "gemini" && !!geminiKey;
  const useGpt2 = body.aiModel === "gpt-image-2";

  if (!useGemini && !openaiKey) {
    return NextResponse.json({ error: "Falta API key. Configura OpenAI o Gemini en Ajustes." }, { status: 400 });
  }

  const productImages = (body.productImages ?? []).filter((u): u is string => !!u && u.startsWith("http"));
  const size = useGpt2 ? mapOutputSizeGpt2(body.outputSize) : mapOutputSize(body.outputSize);

  // Stage 1: build prompt
  let prompt = buildStudioPrompt(body);
  prompt = await enrichPromptWithVision(body, prompt);

  // Stage 2: generate
  const imageUrls = [
    ...(body.templateUrl ? [body.templateUrl] : []),
    ...productImages,
  ];

  const openaiModel: "gpt-image-1" | "gpt-image-2" = useGpt2 ? "gpt-image-2" : "gpt-image-1";

  let result;
  if (useGemini) {
    result = await callGeminiFlashImage({ apiKey: geminiKey!, prompt, imageUrls });
  } else if (imageUrls.length > 0) {
    result = await callGptImage1Edit({ apiKey: openaiKey!, prompt, imageUrls, size, model: openaiModel });
  } else {
    result = await callGptImage1Generate({ apiKey: openaiKey!, prompt, size, model: openaiModel });
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  const mode = useGemini
    ? "gemini-flash"
    : `${openaiModel}-${imageUrls.length > 0 ? "edit" : "gen"}`;
  return NextResponse.json({ ok: true, imageUrl: result.url, mode });
}
