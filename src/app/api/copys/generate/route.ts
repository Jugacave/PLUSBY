import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

const COPY_SCHEMA = {
  type: "object",
  properties: {
    titulos: {
      type: "array",
      description: "Exactamente 5 variaciones de títulos para anuncios Meta (máx 40 caracteres c/u)",
      items: { type: "string" },
    },
    descripciones: {
      type: "array",
      description: "Exactamente 5 variaciones de descripciones cortas (máx 30 caracteres c/u)",
      items: { type: "string" },
    },
    textos: {
      type: "array",
      description: "Exactamente 5 variaciones de textos principales del anuncio (máx 125 caracteres c/u)",
      items: { type: "string" },
    },
  },
  required: ["titulos", "descripciones", "textos"],
  additionalProperties: false,
} as const;

interface GenerateCopysBody {
  producto: string;
  descripcion?: string;
  publicoObjetivo?: string;
  tono?: string;
  beneficioPrincipal?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder_key") {
    return NextResponse.json(
      { error: "API key de Anthropic no configurada. Agrégala en .env.local" },
      { status: 400 }
    );
  }

  let body: GenerateCopysBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.producto?.trim()) {
    return NextResponse.json({ error: "El nombre del producto es obligatorio" }, { status: 400 });
  }

  const client = getAnthropicClient();

  const userPrompt = `Eres un copywriter experto en dropshipping y publicidad de Meta Ads (Facebook e Instagram).

Genera copys de alta conversión para este producto:

**Producto:** ${body.producto}
${body.descripcion ? `**Descripción:** ${body.descripcion}` : ""}
${body.publicoObjetivo ? `**Público objetivo:** ${body.publicoObjetivo}` : ""}
${body.beneficioPrincipal ? `**Beneficio principal:** ${body.beneficioPrincipal}` : ""}
${body.tono ? `**Tono:** ${body.tono}` : "**Tono:** persuasivo y emocional"}

Reglas obligatorias:
- 5 títulos (máximo 40 caracteres cada uno) — directos, con gancho
- 5 descripciones cortas (máximo 30 caracteres cada uno) — beneficio en una línea
- 5 textos principales (máximo 125 caracteres cada uno) — historia + beneficio + CTA
- Usa diferentes ángulos: dolor, deseo, urgencia, prueba social, transformación
- En español neutro, listo para usar en Meta Ads
- Sin hashtags, sin emojis excesivos (máximo 1 emoji por copy si aplica)

Devuelve ÚNICAMENTE el JSON con el schema solicitado.`;

  try {
    const response = await client.messages.create({
      model: PLUSBY_MODEL,
      max_tokens: 4096,
      output_config: {
        format: {
          type: "json_schema",
          schema: COPY_SCHEMA,
        },
      },
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Respuesta vacía del modelo" }, { status: 500 });
    }

    const parsed = JSON.parse(textBlock.text);
    return NextResponse.json({
      ok: true,
      data: parsed,
      usage: response.usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
