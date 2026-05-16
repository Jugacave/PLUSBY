import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";
import type { ImageBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";

export const runtime = "nodejs";
export const maxDuration = 60;

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "México", PA: "Panamá", EC: "Ecuador",
  PE: "Perú", CL: "Chile", PY: "Paraguay", AR: "Argentina",
  GT: "Guatemala", ES: "España",
};

type RefImage =
  | { kind: "url"; url: string }
  | { kind: "base64"; data: string; mediaType: string };

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder_key") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada en Vercel. Ve a Settings → Environment Variables." }, { status: 400 });
  }

  let body: {
    productName: string;
    description?: string;
    country: string;
    refImages?: RefImage[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { productName, description, country, refImages } = body;
  const countryName = COUNTRY_NAMES[country] || "Latinoamérica";
  const client = getAnthropicClient();

  const imageBlocks: ImageBlockParam[] = (refImages ?? [])
    .slice(0, 3)
    .map((img): ImageBlockParam => {
      if (img.kind === "url") {
        return { type: "image", source: { type: "url", url: img.url } };
      }
      const mt = img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      return { type: "image", source: { type: "base64", media_type: mt, data: img.data } };
    });

  const hasImages = imageBlocks.length > 0;

  const textBlock: TextBlockParam = {
    type: "text",
    text: `${hasImages ? "Analiza EXACTAMENTE las imágenes del producto adjuntas. Identifica qué producto específico es, sus características visuales, materiales y atributos. Luego " : ""}genera información de marketing para dropshipping.

PRODUCTO: ${productName || "producto de dropshipping"}
${description ? `DESCRIPCIÓN ACTUAL: ${description}` : ""}
MERCADO OBJETIVO: ${countryName}
${hasImages ? "\nIMPORTANTE: Basa toda la información en LO QUE VES en las imágenes reales del producto, no en suposiciones genéricas." : ""}

Responde SOLO con este JSON (sin texto adicional):
{
  "description": "descripción convincente del producto específico visto en las imágenes (3-4 oraciones en lenguaje natural de ${countryName})",
  "benefits": ["beneficio concreto 1 del producto real", "beneficio concreto 2", "beneficio concreto 3", "beneficio concreto 4"],
  "problems": ["problema que resuelve 1", "problema que resuelve 2", "problema que resuelve 3"],
  "ingredients": ["ingrediente o material visible 1", "ingrediente o material 2", "ingrediente o material 3"],
  "differentiator": "qué hace único a ESTE producto específico vs la competencia (1-2 oraciones directas)"
}`,
  };

  const content = hasImages ? [...imageBlocks, textBlock] : [textBlock];

  try {
    const response = await client.messages.create({
      model: PLUSBY_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    return NextResponse.json({ ok: true, ...parsed });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
