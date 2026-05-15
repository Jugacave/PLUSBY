import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

const COUNTRY_NAMES: Record<string, string> = {
  CO: "Colombia", MX: "México", PA: "Panamá", EC: "Ecuador",
  PE: "Perú", CL: "Chile", PY: "Paraguay", AR: "Argentina",
  GT: "Guatemala", ES: "España",
};

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder_key") {
    return NextResponse.json({ error: "API key no configurada" }, { status: 400 });
  }

  let body: {
    productName: string;
    description?: string;
    country: string;
    refImageUrls?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { productName, description, country, refImageUrls } = body;
  const countryName = COUNTRY_NAMES[country] || "Latinoamérica";
  const client = getAnthropicClient();

  const validImageUrls = (refImageUrls ?? [])
    .filter((u) => typeof u === "string" && u.startsWith("http"))
    .slice(0, 3);

  type MessageContent = {
    type: "image";
    source: { type: "url"; url: string };
  } | {
    type: "text";
    text: string;
  };

  const imageBlocks: MessageContent[] = validImageUrls.map((url) => ({
    type: "image",
    source: { type: "url", url },
  }));

  const textBlock: MessageContent = {
    type: "text",
    text: `${imageBlocks.length > 0 ? "Analiza las imágenes del producto adjuntas y " : ""}genera información de marketing para dropshipping.

PRODUCTO: ${productName || "producto de dropshipping"}
${description ? `DESCRIPCIÓN ACTUAL: ${description}` : ""}
MERCADO OBJETIVO: ${countryName}

Responde SOLO con este JSON (sin texto adicional):
{
  "description": "descripción convincente del producto (3-4 oraciones en lenguaje natural de ${countryName})",
  "benefits": ["beneficio concreto 1", "beneficio concreto 2", "beneficio concreto 3", "beneficio concreto 4"],
  "problems": ["problema que resuelve 1", "problema que resuelve 2", "problema que resuelve 3"],
  "ingredients": ["ingrediente o material 1", "ingrediente o material 2", "ingrediente o material 3"],
  "differentiator": "qué hace único a este producto vs la competencia (1-2 oraciones directas)"
}`,
  };

  const content: MessageContent[] = imageBlocks.length > 0
    ? [...imageBlocks, textBlock]
    : [textBlock];

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
