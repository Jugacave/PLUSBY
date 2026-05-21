import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 120;

// ─── Section-specific instructions ───────────────────────────────────────────
// IMPORTANT: every section limits the number of text strings to 2-3 maximum.
// Image generation models render text correctly only when there are few strings.

interface SectionSpec {
  visualDescription: string;  // visual description in Spanish
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

    // Build the JSON spec request based on what THIS section actually needs
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

    // Always include visual descriptors for the image model
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

// ─── Stage 2: Build Spanish prompt with ONLY the texts needed per section ────

function buildImagePrompt(body: RequestBody, copy: GeneratedCopy | null): string {
  const spec = SECTION_SPECS[body.sectionType] ?? SECTION_SPECS.hero;

  if (!copy) {
    const productLine = body.productName ?? body.productDescription ?? "el producto";
    return [
      `Banner publicitario vertical 9:16 de alta calidad.`,
      spec.visualDescription,
      `Producto: ${productLine}.`,
      `Estilo: fotografía publicitaria profesional, iluminación premium, sin texto en inglés.`,
    ].join(" ");
  }

  // Build the EXACT list of texts to render. Each text is QUOTED.
  // The fewer text strings, the better the rendering.
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

  return `Crea un banner publicitario vertical 9:16 (1080x1920) en español, calidad comercial premium.

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
- Fotografía publicitaria de alta gama. 4K, nítido, profesional.`;
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

// gpt-image-1: OpenAI's latest and best model — excellent text rendering
async function callGptImage1(params: {
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
        size: "1024x1792",
        quality: "high",
        output_format: "webp",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error?.message ?? "Error gpt-image-1" };
    // gpt-image-1 returns base64
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
  const prompt = buildImagePrompt(body, copy);

  const falKey = user.user_metadata?.ai_key_fal;
  const openaiKey = user.user_metadata?.ai_key_openai;
  const aiModel = body.aiModel ?? "";

  // ── Stage 2: Image generation ─────────────────────────────────────────────
  //
  // Priority for best text quality:
  //   1. gpt-image-1  (OpenAI) — best text, photorealistic, 1024×1792
  //   2. Ideogram v3  (Fal.ai) — best text among open-weight models
  //   3. Recraft v3   (Fal.ai) — strong text, poster/banner specialist
  //   4. DALL-E 3 hd  (OpenAI) — good text fallback
  //
  // User can override by explicitly selecting a model in the editor.

  // ── OpenAI path ───────────────────────────────────────────────────────────
  const isOpenAIModel = aiModel === "openai-gpt-image-1" || aiModel === "openai-dalle3";
  if (openaiKey && (isOpenAIModel || !falKey)) {
    if (aiModel === "openai-dalle3") {
      const out = await callDalle3HD({ apiKey: openaiKey, prompt });
      if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "dalle3-hd" });
      return NextResponse.json({ error: out.error }, { status: 500 });
    }
    // gpt-image-1 (default OpenAI)
    const out = await callGptImage1({ apiKey: openaiKey, prompt });
    if (out.ok) return NextResponse.json({ ok: true, imageUrl: out.url, mode: "gpt-image-1" });
    // Failed → fall through to Fal.ai if available
    if (!falKey) return NextResponse.json({ error: out.error }, { status: 500 });
  }

  // ── Fal.ai path: Ideogram v3 → Recraft v3 ────────────────────────────────
  if (falKey) {
    const styleRefs: string[] = [];
    if (hasTemplate) styleRefs.push(body.templateUrl!);
    if (productImages.length > 0) styleRefs.push(...productImages.slice(0, 2));

    const ideogram = await callIdeogramV3({
      apiKey: falKey,
      prompt,
      styleImageUrls: styleRefs.length > 0 ? styleRefs : undefined,
    });
    if (ideogram.ok) {
      return NextResponse.json({ ok: true, imageUrl: ideogram.url, mode: "ideogram-v3" });
    }

    const recraft = await callRecraftV3({ apiKey: falKey, prompt });
    if (recraft.ok) {
      return NextResponse.json({ ok: true, imageUrl: recraft.url, mode: "recraft-v3" });
    }

    return NextResponse.json({ error: ideogram.error }, { status: 500 });
  }

  return NextResponse.json(
    { error: "Configura tu API key de Fal.ai o OpenAI en Ajustes > Modelos IA" },
    { status: 400 }
  );
}
