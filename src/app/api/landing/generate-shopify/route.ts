import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

interface ForgeConfig {
  country: string;
  priceOriginal: string;
  price1u: string;
  price2u: string;
  price3u: string;
  benefits: string;
  urgency: string;
}

interface Body {
  landingName: string;
  product: string;
  forgeConfig: ForgeConfig;
}

interface Block {
  title: string;
  html: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { landingName, product, forgeConfig } = body;

  if (!forgeConfig) {
    return NextResponse.json({ error: "forgeConfig es requerido" }, { status: 400 });
  }

  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: PLUSBY_MODEL,
      max_tokens: 4000,
      system: `Eres un experto generador de landing pages para Shopify con estructura AIDA (Atención, Interés, Deseo, Acción).
Generas HTML/CSS inline de alta conversión para dropshipping en Latinoamérica.
Tus landing pages son mobile-first, responsive, con estilos inline que no dependen del tema de Shopify.
SIEMPRE responde con JSON válido y nada más.`,
      messages: [
        {
          role: "user",
          content: `Genera EXACTAMENTE 4 bloques HTML/CSS para Shopify para la siguiente landing page.

Nombre de la landing: ${landingName}
Producto: ${product}
País: ${forgeConfig.country}
Precio original (tachado): ${forgeConfig.priceOriginal}
Precio 1 unidad: ${forgeConfig.price1u}
Precio 2 unidades: ${forgeConfig.price2u}
Precio 3 unidades: ${forgeConfig.price3u}
Beneficios clave: ${forgeConfig.benefits}
Urgencia/escasez: ${forgeConfig.urgency}

Requisitos de diseño:
- Todo CSS debe ser inline (sin clases externas ni dependencias del tema Shopify)
- Mobile-first y responsive usando max-width y padding adaptativos
- Fondo oscuro (#1a1a2e o similar) para la sección de problema/agitación
- Fondo blanco (#ffffff) para la sección de beneficios
- Color verde (#2d6a2d) para todos los botones CTA
- Tipografía: font-family: 'Arial', sans-serif como fallback seguro
- Botones CTA grandes, llamativos, con padding generoso

BLOQUE 1: Hero + Precios + Timer de urgencia
- Headline impactante con el beneficio principal
- Precios con el original tachado y los 3 paquetes (1u, 2u, 3u)
- Contador de urgencia/escasez (puede ser texto estático o JS simple)
- Botón CTA principal verde

BLOQUE 2: Problema + Agitación + Beneficios
- Sección oscura describiendo el problema/dolor del cliente
- Agitación emocional del problema
- Lista de beneficios clave del producto en fondo blanco

BLOQUE 3: Testimonios + Proceso de compra
- 3 testimonios ficticios pero realistas con nombre y ciudad de ${forgeConfig.country}
- Sección de cómo funciona el proceso de compra (3-4 pasos simples)

BLOQUE 4: Garantía + FAQ + CTA Final
- Sección de garantía (ej: 30 días de garantía)
- 3-4 preguntas frecuentes sobre el producto y el envío
- CTA final con botón verde grande y refuerzo de urgencia

Responde SOLO con este JSON (sin markdown, sin bloques de código, solo JSON puro):
{
  "blocks": [
    { "title": "Bloque 1: Hero + Precios", "html": "<!-- codigo html completo del bloque 1 -->" },
    { "title": "Bloque 2: Problema + Beneficios", "html": "<!-- codigo html completo del bloque 2 -->" },
    { "title": "Bloque 3: Testimonios", "html": "<!-- codigo html completo del bloque 3 -->" },
    { "title": "Bloque 4: Garantía + CTA Final", "html": "<!-- codigo html completo del bloque 4 -->" }
  ]
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    let blocks: Block[];
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as { blocks: Block[] };
      blocks = parsed.blocks;
    } catch {
      return NextResponse.json({ error: "Respuesta inválida de la IA" }, { status: 500 });
    }

    return NextResponse.json({ blocks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
