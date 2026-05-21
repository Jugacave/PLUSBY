import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "México", PA: "Panamá", EC: "Ecuador", PE: "Perú",
  CL: "Chile", PY: "Paraguay", AR: "Argentina", GT: "Guatemala", ES: "España",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const {
    sectionType = "hero",
    productName = "",
    productDescription = "",
    productBenefits = [],
    productProblems = [],
    productIngredients = [],
    productDifferentiator = "",
    angle = "",
    country = "CO",
    priceSale = "",
    priceOriginal = "",
  } = body;

  const market = COUNTRY_NAMES[country] ?? "Latinoamérica";
  const anthropic = getAnthropicClient();

  const productInfo = [
    productName ? `Producto: ${productName}` : "",
    productDescription ? `Descripción: ${productDescription}` : "",
    productBenefits.filter(Boolean).length ? `Beneficios: ${productBenefits.filter(Boolean).join(", ")}` : "",
    productProblems.filter(Boolean).length ? `Problemas que resuelve: ${productProblems.filter(Boolean).join(", ")}` : "",
    productIngredients.filter(Boolean).length ? `Ingredientes: ${productIngredients.filter(Boolean).join(", ")}` : "",
    productDifferentiator ? `Diferenciador: ${productDifferentiator}` : "",
    priceSale ? `Precio oferta: ${priceSale}${priceOriginal ? ` (antes ${priceOriginal})` : ""}` : "",
    angle ? `Ángulo de marketing: ${angle}` : "",
  ].filter(Boolean).join("\n");

  const sectionGuides: Record<string, string> = {
    hero:          "headline impactante (máx 5 palabras, mayúsculas), subheadline (máx 8 palabras), CTA (máx 3 palabras), 0 bullets",
    oferta:        "headline de urgencia (máx 5 palabras), saleLabel ('OFERTA' o '50% OFF' o similar, máx 2 palabras), CTA (máx 3 palabras), 0 bullets. Incluir precio si está disponible.",
    antes_despues: "headline del resultado final (máx 5 palabras), subheadline del problema (máx 6 palabras), CTA (máx 3 palabras), 3 bullets del beneficio (máx 2 palabras c/u)",
    beneficios:    "headline (máx 5 palabras), 3 bullets ULTRA cortos (máx 2 palabras c/u, ej: '100% Natural', 'Sin Químicos', 'Resultados Rápidos'), CTA (máx 3 palabras)",
    comparativa:   "headline (máx 4 palabras), nuestro label (1-2 palabras ej NOSOTROS), competencia label (1 palabra ej OTROS), CTA (máx 3 palabras)",
    autoridad:     "headline de confianza (máx 5 palabras), 3 badges de certificación (máx 2 palabras c/u), CTA (máx 3 palabras)",
    testimonios:   "headline (máx 5 palabras), subheadline = frase testimonial de cliente (máx 10 palabras, en comillas), CTA (máx 3 palabras)",
    ingredientes:  "headline (máx 4 palabras), 3 bullets = nombres de ingredientes clave (1-2 palabras c/u), CTA (máx 3 palabras)",
    modo_uso:      "headline (máx 4 palabras), 3 steps = acciones de los pasos (máx 2 palabras c/u), CTA (máx 3 palabras)",
    logistica:     "headline (máx 4 palabras), 3 badges de logística (máx 2 palabras c/u, ej 'Envío Gratis', 'Garantía 30 Días', 'Pago Seguro'), CTA (máx 3 palabras)",
    faqs:          "headline (máx 4 palabras), 2 bullets = preguntas cortas (máx 4 palabras c/u, en formato pregunta), CTA (máx 3 palabras)",
  };

  const guide = sectionGuides[sectionType] ?? sectionGuides.hero;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `Eres un copywriter de ecommerce para ${market}. Genera copy publicitario en ESPAÑOL CORRECTO.

TIPO DE BANNER: ${sectionType}
GUÍA DE TEXTOS: ${guide}

PRODUCTO:
${productInfo}

REGLAS CRÍTICAS:
- Todo en español de ${market}, palabras REALES correctamente escritas
- Brevísimo: cumple los límites de palabras al pie de la letra
- NO inventes palabras. NO mezcles inglés.
- Usa mayúsculas para TITULARES (headline, saleLabel)
- saleLabel SIEMPRE en mayúsculas

Responde ÚNICAMENTE con este JSON sin markdown:
{"headline":"...","subheadline":"...","cta":"...","saleLabel":"...","bullets":["...","...","..."],"steps":["...","...","..."],"badges":["...","...","..."],"ourLabel":"...","othersLabel":"...","primaryColor":"#RRGGBB","secondaryColor":"#RRGGBB","bgColor":"#RRGGBB","accentColor":"#RRGGBB"}

Para los colores: elige una paleta coherente con el producto y el tipo de banner. primaryColor = color principal del producto o del estado de ánimo de la categoría. accentColor = color del texto principal sobre el fondo (usualmente blanco #FFFFFF o negro oscuro #0A0A0F).`,
      }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Claude no devolvió JSON" }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      ok: true,
      headline:      parsed.headline ?? "",
      subheadline:   parsed.subheadline ?? "",
      cta:           parsed.cta ?? "Comprar Ahora",
      saleLabel:     parsed.saleLabel ?? "",
      bullets:       Array.isArray(parsed.bullets) ? parsed.bullets.filter(Boolean) : [],
      steps:         Array.isArray(parsed.steps) ? parsed.steps.filter(Boolean) : [],
      badges:        Array.isArray(parsed.badges) ? parsed.badges.filter(Boolean) : [],
      ourLabel:      parsed.ourLabel ?? "",
      othersLabel:   parsed.othersLabel ?? "",
      primaryColor:  parsed.primaryColor ?? "#7C3AED",
      secondaryColor: parsed.secondaryColor ?? "#1C1C26",
      bgColor:       parsed.bgColor ?? "#0A0A0F",
      accentColor:   parsed.accentColor ?? "#FFFFFF",
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
