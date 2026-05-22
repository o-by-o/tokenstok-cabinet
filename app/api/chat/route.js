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
import { checkBalance, chargeUsage } from "../../lib/billing";

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

  // Проверяем баланс — не блокируем юзера если есть хотя бы 0.50 ₽,
  // но если ушёл в ноль — 402 со ссылкой на /wallet.
  if (!(await checkBalance(session.user.id, "0.50"))) {
    return new Response(JSON.stringify({
      error: "insufficient_balance",
      message: "На балансе закончились средства. Пополните кошелёк, чтобы продолжить.",
    }), { status: 402, headers: { "content-type": "application/json" } });
  }

  const chatId =
    String(body?.chatId || "") ||
    String(messages[0]?.id || "") ||
    `chat-${session.user.id}-${Date.now()}`;
  const messageId = String(messages.at(-1)?.id || "") || null;

  let modelMessages;
  try {
    modelMessages = convertToModelMessages(messages);
  } catch (err) {
    console.error("[tokenstok /api/chat] convertToModelMessages failed:", err);
    return new Response(JSON.stringify({ error: "Невалидный формат сообщений: " + (err?.message || String(err)) }), {
      status: 400, headers: { "content-type": "application/json" },
    });
  }

  let capturedError = null;
  let result;
  try {
    result = streamText({
      model: gateway(gatewayModelId),
      messages: modelMessages,
      maxOutputTokens: 1024,
      onError({ error }) {
        capturedError = error;
        console.error("[tokenstok /api/chat] streamText onError:", error);
      },
    });
  } catch (err) {
    console.error("[tokenstok /api/chat] streamText threw:", err);
    return new Response(JSON.stringify({ error: friendlyError(err) }), {
      status: 502, headers: { "content-type": "application/json" },
    });
  }

  // Stream via fullStream so we can react to error events explicitly.
  // textStream silently closes on errors (AI SDK quirk).
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let emittedAny = false;
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta" && part.text) {
            controller.enqueue(encoder.encode(part.text));
            emittedAny = true;
          } else if (part.type === "error") {
            console.error("[tokenstok /api/chat] fullStream error part:", part.error);
            capturedError = part.error;
          }
        }
        if (!emittedAny && capturedError) {
          controller.enqueue(encoder.encode(friendlyError(capturedError)));
        }
        controller.close();
      } catch (err) {
        console.error("[tokenstok /api/chat] fullStream iteration failed:", err);
        controller.enqueue(encoder.encode(friendlyError(err)));
        controller.close();
      }

      // Списание после закрытия стрима. Не ломаем response если usage
      // недоступен (например, при ошибке провайдера).
      try {
        const usage = await result.usage;
        const inputTokens  = Number(usage?.inputTokens  ?? usage?.promptTokens     ?? 0);
        const outputTokens = Number(usage?.outputTokens ?? usage?.completionTokens ?? 0);
        if (inputTokens || outputTokens) {
          const charged = await chargeUsage({
            userId:        session.user.id,
            chatId,
            messageId,
            modelId:       requestedId,
            gatewayModelId,
            inputTokens,
            outputTokens,
          });
          console.log(
            `[billing] tx=${charged.transactionId} user=${session.user.id} ` +
            `model=${requestedId} in=${inputTokens} out=${outputTokens} ` +
            `cost=${charged.costRub.toString()} balance=${charged.balanceAfter?.toString?.()}`
          );
        }
      } catch (err) {
        console.error("[billing] chargeUsage failed:", err);
      }
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

function friendlyError(err) {
  const raw = err?.message || String(err);
  if (/insufficient.?funds|insufficient.?credit|payment.required|402/i.test(raw)) {
    return "Сервис временно недоступен (нет кредитов на AI-провайдере). Мы уже знаем, скоро вернём.";
  }
  if (/unauthorized|401|invalid.api.key/i.test(raw)) {
    return "AI-сервис не авторизован. Свяжись с поддержкой.";
  }
  if (/rate.?limit|429/i.test(raw)) {
    return "Слишком много запросов, подожди немного и попробуй снова.";
  }
  return "Ошибка AI-сервиса: " + raw;
}
