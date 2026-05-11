import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

const SECTION_PROMPTS: Record<string, string> = {
  hero: `Crea el texto hero de una landing page de alta conversión para el producto.
Devuelve: headline (máx 15 palabras, impacto emocional), subtext (máx 30 palabras, propuesta de valor), ctaText (máx 6 palabras, urgente).`,

  benefits: `Crea el contenido de beneficios para el producto.
Devuelve: headline (máx 12 palabras), subtext (máx 20 palabras), items (array de 4 beneficios concretos, máx 15 palabras cada uno).`,

  problem: `Describe el problema que resuelve el producto para la sección "El Problema".
Devuelve: headline (máx 12 palabras, que resuene emocionalmente), subtext (máx 35 palabras describiendo el dolor del cliente).`,

  solution: `Presenta el producto como la solución perfecta.
Devuelve: headline (máx 12 palabras, positivo y esperanzador), subtext (máx 35 palabras explicando cómo el producto resuelve el problema).`,

  features: `Lista las características técnicas/diferenciales del producto.
Devuelve: headline (máx 10 palabras), subtext (máx 20 palabras), items (array de 4 características específicas, máx 12 palabras cada una).`,

  testimonials: `Crea 3 testimonios ficticios pero realistas para el producto.
Devuelve: headline (máx 10 palabras, social proof), subtext (máx 20 palabras sobre satisfacción de clientes), items (array de 3 testimonios en formato "Nombre, Ciudad: texto del testimonio", máx 25 palabras cada uno).`,

  urgency: `Crea urgencia y escasez para la oferta del producto.
Devuelve: headline (máx 12 palabras, urgente), subtext (máx 30 palabras explicando por qué actuar ahora), ctaText (máx 5 palabras).`,

  pricing: `Presenta el precio y la oferta del producto de forma convincente.
Devuelve: headline (máx 12 palabras, el precio como oportunidad), subtext (máx 30 palabras con la oferta, descuento o garantía).`,

  cta: `Crea el llamado a la acción final de la landing page.
Devuelve: headline (máx 12 palabras, cierre emocional), subtext (máx 25 palabras, refuerzo de confianza/garantía), ctaText (máx 6 palabras, acción directa).`,
};

interface Body {
  sectionType: string;
  product: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder_key") {
    return NextResponse.json({ error: "API key no configurada" }, { status: 400 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { sectionType, product } = body;
  if (!product?.trim() || !sectionType) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const sectionPrompt = SECTION_PROMPTS[sectionType];
  if (!sectionPrompt) {
    return NextResponse.json({ error: "Tipo de sección no válido" }, { status: 400 });
  }

  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: PLUSBY_MODEL,
      max_tokens: 1024,
      system: `Eres un experto en copywriting de alta conversión para dropshipping en Latinoamérica.
Escribes en español neutro, con lenguaje directo y emocional.
SIEMPRE responde con JSON válido siguiendo exactamente el esquema solicitado. Sin explicaciones adicionales.`,
      messages: [
        {
          role: "user",
          content: `Producto: ${product.trim()}

${sectionPrompt}

Responde SOLO con JSON válido. Ejemplo de formato:
{"headline": "...", "subtext": "...", "ctaText": "...", "items": [...]}
Solo incluye los campos relevantes para este tipo de sección.`,
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
