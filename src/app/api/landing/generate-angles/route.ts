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
    description: string;
    benefits: string[];
    problems: string[];
    ingredients: string[];
    differentiator: string;
    country: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { description, benefits, problems, ingredients, differentiator, country } = body;
  const countryName = COUNTRY_NAMES[country] || country || "Latinoamérica";

  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: PLUSBY_MODEL,
      max_tokens: 1024,
      system: `Eres un experto en marketing digital y publicidad para dropshipping en Latinoamérica.
Creas ángulos de venta únicos y emocionales que conectan con el público objetivo.
Usas jerga y expresiones naturales del mercado objetivo. Responde SOLO con JSON válido.`,
      messages: [
        {
          role: "user",
          content: `Mercado objetivo: ${countryName}

PRODUCTO: ${description || "Producto de dropshipping"}
BENEFICIOS: ${(benefits || []).filter(Boolean).join(" | ") || "No especificado"}
PROBLEMAS QUE RESUELVE: ${(problems || []).filter(Boolean).join(" | ") || "No especificado"}
INGREDIENTES/COMPONENTES: ${(ingredients || []).filter(Boolean).join(" | ") || "No especificado"}
DIFERENCIADOR: ${differentiator || "No especificado"}

Genera 8 ángulos de venta únicos para este producto en ${countryName}.
Cada ángulo representa un público objetivo distinto o una emoción diferente.
Sé creativo, específico y usa lenguaje de ${countryName}.

JSON:
{
  "angles": [
    "Ángulo 1 (máx 10 palabras, específico y emocional)",
    "Ángulo 2",
    "Ángulo 3",
    "Ángulo 4",
    "Ángulo 5",
    "Ángulo 6",
    "Ángulo 7",
    "Ángulo 8"
  ]
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    return NextResponse.json({ ok: true, ...parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
