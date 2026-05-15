import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder_key") {
    return NextResponse.json({ error: "API key no configurada" }, { status: 400 });
  }

  let product: string;
  try {
    ({ product } = await req.json());
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!product?.trim()) {
    return NextResponse.json({ error: "Falta el producto" }, { status: 400 });
  }

  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: PLUSBY_MODEL,
      max_tokens: 2048,
      system: `Eres un experto en publicidad digital y copywriting de alta conversión para dropshipping en Latinoamérica.
Creas textos directos, emocionales y que generan acción inmediata. Siempre en español neutro.
SIEMPRE responde con JSON válido sin ningún texto adicional.`,
      messages: [
        {
          role: "user",
          content: `Producto: ${product.trim()}

Crea contenido para 5 banners publicitarios con estructura ganadora para dropshipping.
Cada banner debe tener coherencia narrativa con los demás (misma voz, misma oferta).

Responde SOLO con este JSON exacto:
{
  "hero": {
    "headline": "Titular de impacto máximo (máx 12 palabras, gancho emocional fuerte)",
    "subtext": "Propuesta de valor clara (máx 20 palabras)",
    "ctaText": "Botón de acción (máx 5 palabras)"
  },
  "benefits": {
    "headline": "¿Por qué elegir este producto? (máx 10 palabras)",
    "subtext": "Complemento del titular (máx 15 palabras)",
    "items": ["Beneficio concreto 1 (máx 10 palabras)", "Beneficio concreto 2", "Beneficio concreto 3", "Beneficio concreto 4"]
  },
  "testimonials": {
    "headline": "Titular de prueba social (máx 10 palabras)",
    "subtext": "Cantidad de clientes satisfechos o métrica (máx 15 palabras)",
    "items": ["Nombre, Ciudad: Testimonio real de 15-20 palabras", "Nombre, Ciudad: Otro testimonio real", "Nombre, Ciudad: Tercer testimonio"]
  },
  "urgency": {
    "headline": "Titular de urgencia/escasez (máx 10 palabras)",
    "subtext": "Detalle de la oferta limitada con descuento o razón de urgencia (máx 25 palabras)",
    "ctaText": "CTA urgente (máx 5 palabras)"
  },
  "cta": {
    "headline": "Cierre emocional definitivo (máx 12 palabras)",
    "subtext": "Garantía o refuerzo de confianza (máx 20 palabras)",
    "ctaText": "CTA de compra final (máx 5 palabras)"
  }
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json({ error: "Respuesta inválida de la IA" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
