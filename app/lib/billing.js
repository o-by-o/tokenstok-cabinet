// app/lib/billing.js
// Биллинг по usage: цена модели × токены × наценка → рубли.
// Все Decimal — через Prisma.Decimal, чтобы не накапливать float-ошибки.

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getUsdToRub } from "./fx";

// 30 % наценки сверх цены провайдера.
export const MARKUP = new Prisma.Decimal("1.300");

// Цены провайдеров — USD per 1M tokens (input / output).
// Цены актуальны на момент сборки MVP; пересмотр — раз в квартал.
const PRICE_FALLBACK = { input: "3", output: "15" };

const PRICE_TABLE = {
  // OpenAI
  "gpt-5":             { input: "5",   output: "15"   },
  "gpt-5-codex":       { input: "5",   output: "15"   },
  // Anthropic
  "claude-sonnet-4.5": { input: "3",   output: "15"   },
  "claude-haiku-4.5":  { input: "0.8", output: "4"    },
  // Google
  "gemini-2.5-pro":    { input: "1.25",output: "10"   },
  // DeepSeek
  "deepseek-r1":       { input: "0.55",output: "2.19" },
  // Meta
  "llama-4-405b":      { input: "2.7", output: "8"    },
  // Mistral
  "mistral-large-3":   { input: "2",   output: "6"    },
};

/**
 * @param {Object} p
 * @param {string} p.modelId
 * @param {number} p.inputTokens
 * @param {number} p.outputTokens
 * @returns {Promise<{ costRub: Prisma.Decimal, rawCostUsd: Prisma.Decimal, markup: Prisma.Decimal, usdToRub: Prisma.Decimal }>}
 */
export async function calculateCostRub({ modelId, inputTokens, outputTokens }) {
  const price = PRICE_TABLE[modelId] || PRICE_FALLBACK;
  const inUsd  = new Prisma.Decimal(inputTokens  || 0).mul(price.input).div(1_000_000);
  const outUsd = new Prisma.Decimal(outputTokens || 0).mul(price.output).div(1_000_000);
  const rawCostUsd = inUsd.plus(outUsd);
  const usdToRub   = await getUsdToRub();
  const costRub    = rawCostUsd.mul(usdToRub).mul(MARKUP);
  return { costRub, rawCostUsd, markup: MARKUP, usdToRub };
}

/**
 * @param {string} userId
 * @param {number|string|Prisma.Decimal} minRub — минимальный требуемый остаток
 * @returns {Promise<boolean>}
 */
export async function checkBalance(userId, minRub = "0.50") {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });
  if (!user) return false;
  return new Prisma.Decimal(user.balance).gte(minRub);
}

/**
 * Атомарно: создаёт UsageEvent, создаёт Transaction(kind="spend", -costRub),
 * декрементит user.balance, линкует UsageEvent.transactionId.
 *
 * Не откатывает если balance стал отрицательным — юзер уже получил ответ,
 * следующий запрос будет заблокирован через checkBalance().
 *
 * @returns {Promise<{ transactionId: string, balanceAfter: Prisma.Decimal, costRub: Prisma.Decimal }>}
 */
export async function chargeUsage(p) {
  const { costRub, rawCostUsd, markup } = await calculateCostRub(p);

  // Минимальное списание — копейка, чтобы не плодить нулевые операции.
  if (costRub.lessThan("0.0001")) {
    return { transactionId: null, balanceAfter: null, costRub: new Prisma.Decimal(0) };
  }

  return prisma.$transaction(async (db) => {
    const user = await db.user.findUnique({
      where: { id: p.userId },
      select: { balance: true },
    });
    if (!user) throw new Error(`[billing] user ${p.userId} not found`);

    const newBalance = new Prisma.Decimal(user.balance).minus(costRub);

    await db.user.update({
      where: { id: p.userId },
      data:  { balance: newBalance },
    });

    const tx = await db.transaction.create({
      data: {
        userId: p.userId,
        kind: "spend",
        amountRub: costRub.negated(),
        balanceAfter: newBalance,
        status: "succeeded",
        description: `Запрос к ${p.modelId} (in=${p.inputTokens}, out=${p.outputTokens})`,
        metadata: { modelId: p.modelId, gatewayModelId: p.gatewayModelId },
      },
      select: { id: true },
    });

    await db.usageEvent.create({
      data: {
        userId: p.userId,
        chatId: p.chatId,
        messageId: p.messageId ?? null,
        modelId: p.modelId,
        gatewayModelId: p.gatewayModelId,
        inputTokens: p.inputTokens,
        outputTokens: p.outputTokens,
        costRub,
        rawCostUsd,
        markup,
        transactionId: tx.id,
      },
    });

    return { transactionId: tx.id, balanceAfter: newBalance, costRub };
  });
}
