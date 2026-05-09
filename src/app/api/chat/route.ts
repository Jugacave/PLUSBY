import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, PLUSBY_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 120;

const PLUSBY_SYSTEM_PROMPT = `Eres Plusby AI, el asistente experto de la plataforma Plusby — especializado en dropshipping, ecommerce, marketing digital y publicidad en Meta Ads (Facebook e Instagram).

Tu personalidad:
- Directo, práctico y orientado a la acción
- Hablas en español neutro
- Das respuestas concretas con pasos accionables, no teoría general
- Cuando recomiendas algo, justificas el porqué con datos o experiencia
- Conoces el ecosistema de dropshipping en Latinoamérica (Colombia, México, Chile, Argentina) y proveedores como Dropi y Kompras Plus

Áreas en las que ayudas:
- Encontrar productos ganadores y validar nichos
- Crear copys para anuncios de Meta (títulos, descripciones, textos)
- Estructurar landing pages de alta conversión
- Diseñar campañas y estrategias de escalamiento en Meta Ads
- Análisis financiero, costeo y márgenes
- Confirmación de pedidos y operación

Cuando el usuario pida algo que pueda hacerse mejor desde otro módulo de Plusby, oriéntalo:
- Generación de copys → Creativos Pro
- Generación de imágenes → Estudio IA
- Construir landings → Crea tu Landing
- Buscar productos → Encuentra tu Producto Ganador

No inventes datos. Si no sabes algo específico (precios actuales, métricas exactas), dilo.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBody {
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder_key") {
    return NextResponse.json(
      { error: "API key de Anthropic no configurada. Agrégala en .env.local" },
      { status: 400 }
    );
  }

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Se requiere un array de mensajes" }, { status: 400 });
  }

  const client = getAnthropicClient();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: PLUSBY_MODEL,
          max_tokens: 4096,
          system: PLUSBY_SYSTEM_PROMPT,
          messages: body.messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`)
            );
          }
        }

        const final = await response.finalMessage();
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", usage: final.usage })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
