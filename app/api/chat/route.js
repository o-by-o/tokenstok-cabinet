// POST /api/chat — стриминг ответа от Vercel AI Gateway.
// Возвращает stream совместимый с @ai-sdk/react useChat().
//
// Запрос:
//   { messages: UIMessage[], modelId?: string }
// modelId соответствует id в каталоге Vercel AI Gateway:
//   - openai/gpt-5         (выберешь в picker'е → maps to "gpt-5")
//   - anthropic/claude-sonnet-4.5
//   - google/gemini-2.5-pro
//   - deepseek/deepseek-r1
//   - meta/llama-4-405b
//   - mistral/mistral-large-3
// и т.д.

import "../../lib/server-bootstrap";          // настраивает undici-прокси
import { streamText, convertToModelMessages } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { auth } from "../../lib/auth";

export const runtime = "nodejs";
export const maxDuration = 120;

// Маппинг наших model.id → gateway provider/model id.
// (наш id ↔ vercel-gateway id — иногда отличается, например "claude-sonnet-4.5"
// у нас, но в gateway часто префикс anthropic/, openai/ и т.д.)
const MODEL_MAP = {
  "gpt-5":             "openai/gpt-5",
  "gpt-5-codex":       "openai/gpt-5-codex",
  "claude-sonnet-4.5": "anthropic/claude-sonnet-4.5",
  "claude-haiku-4.5":  "anthropic/claude-haiku-4.5",
  "gemini-2.5-pro":    "google/gemini-2.5-pro",
  "deepseek-r1":       "deepseek/deepseek-r1",
  "llama-4-405b":      "meta/llama-4-405b",
  "mistral-large-3":   "mistral/mistral-large-3",
};

export async function POST(req) {
  // только авторизованные
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Невалидный JSON" }), {
      status: 400, headers: { "content-type": "application/json" },
    });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400, headers: { "content-type": "application/json" },
    });
  }

  const requestedId = String(body?.modelId || "claude-sonnet-4.5");
  const gatewayModelId = MODEL_MAP[requestedId] || requestedId;

  if (!process.env.AI_GATEWAY_API_KEY) {
    return new Response(JSON.stringify({ error: "AI_GATEWAY_API_KEY не настроен на сервере" }), {
      status: 500, headers: { "content-type": "application/json" },
    });
  }

  const result = streamText({
    model: gateway(gatewayModelId),
    messages: convertToModelMessages(messages),
    maxOutputTokens: 1024,
    onError({ error }) {
      console.error("[tokenstok /api/chat] streamText error:", error);
    },
  });

  // Plain-text stream — клиент читает чанки и аппендит в message.text
  return result.toTextStreamResponse();
}
