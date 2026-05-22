// POST /api/payments/paymaster/create
// Body: { amountRub: number }
// Создаёт PENDING Transaction в БД и инвойс в PayMaster.
// Возвращает { paymentUrl } для редиректа на форму оплаты.

import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { createInvoice, PaymasterMisconfiguredError, PaymasterApiError } from "../../../../lib/paymaster";

const MIN_RUB = 100;
const MAX_RUB = 100_000;

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return json({ error: "Не авторизован" }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const amountRub = Number(body?.amountRub);
  if (!Number.isFinite(amountRub) || amountRub < MIN_RUB || amountRub > MAX_RUB) {
    return json({ error: `Сумма должна быть от ${MIN_RUB} до ${MAX_RUB} ₽` }, 400);
  }

  // Создаём pending транзакцию, чтобы её id можно было передать как orderNo
  // ещё до запроса в PayMaster. balanceAfter заполним при успехе.
  const tx = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      kind: "topup",
      amountRub,
      balanceAfter: 0,  // будет проставлено при подтверждении
      status: "pending",
      description: `Пополнение баланса ТокенСток на ${amountRub.toFixed(2)} ₽`,
    },
    select: { id: true },
  });

  const base = process.env.AUTH_URL || "https://chat.tokenstok.ru";

  try {
    const { paymentId, paymentUrl } = await createInvoice({
      amountRub,
      description: `Пополнение баланса ТокенСток (tx ${tx.id})`,
      successUrl: `${base}/wallet/topup/success?tx=${tx.id}`,
      failUrl:    `${base}/wallet/topup/cancel?tx=${tx.id}`,
      orderNo: tx.id,
      customerEmail: session.user.email,
      customerAccount: session.user.id,
    });

    await prisma.transaction.update({
      where: { id: tx.id },
      data: { paymasterInvoiceId: paymentId },
    });

    console.log(`[paymaster] create tx=${tx.id} pmId=${paymentId} amount=${amountRub}`);
    return json({ ok: true, paymentUrl });
  } catch (e) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "failed", description: `${tx.id}: ${e?.message || e}` },
    });

    if (e instanceof PaymasterMisconfiguredError) {
      console.error(`[paymaster] create: misconfigured (${e.message})`);
      return json({ error: "Платёжный шлюз не настроен. Свяжитесь с поддержкой." }, 503);
    }
    if (e instanceof PaymasterApiError) {
      console.error(`[paymaster] create: API error: ${JSON.stringify(e.body)}`);
      return json({ error: "Платёжный шлюз отказал. Попробуйте позже." }, 502);
    }
    console.error(`[paymaster] create: unexpected: ${e?.message || e}`);
    return json({ error: "Внутренняя ошибка. Попробуйте позже." }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
