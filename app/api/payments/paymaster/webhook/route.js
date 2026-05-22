// POST /api/payments/paymaster/webhook
// PayMaster шлёт callback при изменении статуса инвойса.
// Идемпотентность: повторный COMPLETE для уже succeeded — 200 без действий.
//
// PUBLIC route — обход NextAuth middleware (см. middleware.js) и обход
// HTTP Basic Auth в Caddyfile.

import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { verifyWebhookSignature } from "../../../../lib/paymaster";

export async function POST(req) {
  const rawBody = await req.text();

  // PayMaster добавляет подпись в заголовок — точное имя в публичной доке
  // нечёткое, поэтому пробуем варианты.
  const sig =
    req.headers.get("x-signature")        ||
    req.headers.get("x-paymaster-signature") ||
    req.headers.get("x-payment-signature") ||
    req.headers.get("paymaster-signature")   ||
    "";

  if (!process.env.PAYMASTER_SECRET_KEY) {
    console.error("[paymaster webhook] PAYMASTER_SECRET_KEY не задан — webhook ОТКЛОНЁН");
    return new Response("Forbidden", { status: 403 });
  }
  if (!verifyWebhookSignature(rawBody, sig)) {
    console.error(`[paymaster webhook] bad signature (header=${JSON.stringify(sig)})`);
    return new Response("Bad signature", { status: 401 });
  }

  let payload;
  try { payload = JSON.parse(rawBody); } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Структура PayMaster v2 webhook (приближённо):
  //   { paymentId, status: "Settled" | "Failed" | "Cancelled" | ... ,
  //     invoice: { orderNo }, amount: { value, currency } }
  const paymentId = payload.paymentId || payload.id || payload.invoice?.paymentId;
  const orderNo   = payload.invoice?.orderNo || payload.orderNo;
  const status    = String(payload.status || payload.state || "").toLowerCase();
  const amount    = Number(payload.amount?.value ?? payload.amountValue ?? NaN);

  if (!paymentId && !orderNo) {
    console.error(`[paymaster webhook] missing paymentId / orderNo: ${rawBody.slice(0, 400)}`);
    return new Response("Missing identifiers", { status: 400 });
  }

  const tx = await findTransaction({ paymentId, orderNo });
  if (!tx) {
    console.error(`[paymaster webhook] tx not found pmId=${paymentId} orderNo=${orderNo}`);
    return new Response("Transaction not found", { status: 404 });
  }

  console.log(`[paymaster webhook] tx=${tx.id} state=${status} amount=${amount}`);

  const isSuccess  = ["settled", "complete", "completed", "succeeded", "paid"].includes(status);
  const isFailure  = ["failed", "cancelled", "canceled", "expired", "declined", "rejected"].includes(status);

  if (isSuccess) {
    if (tx.status === "succeeded") {
      // Идемпотентность: уже зачислено.
      return new Response("OK (already succeeded)", { status: 200 });
    }
    if (Number.isFinite(amount) && Math.abs(amount - Number(tx.amountRub)) > 0.005) {
      console.error(
        `[paymaster webhook] amount mismatch tx=${tx.id} expected=${tx.amountRub} got=${amount}`
      );
      return new Response("Amount mismatch", { status: 400 });
    }

    await prisma.$transaction(async (db) => {
      const user = await db.user.findUnique({ where: { id: tx.userId }, select: { balance: true } });
      const newBalance = new Prisma.Decimal(user.balance).plus(tx.amountRub);
      await db.user.update({
        where: { id: tx.userId },
        data:  { balance: newBalance },
      });
      await db.transaction.update({
        where: { id: tx.id },
        data:  {
          status: "succeeded",
          balanceAfter: newBalance,
          paymasterPaymentId: payload.paymentId ?? tx.paymasterPaymentId,
          metadata: payload,
        },
      });
    });
    return new Response("OK", { status: 200 });
  }

  if (isFailure) {
    if (tx.status === "succeeded") {
      // Не понижаем уже-успешную транзакцию.
      return new Response("OK (already succeeded)", { status: 200 });
    }
    if (tx.status === "failed") {
      return new Response("OK (already failed)", { status: 200 });
    }
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "failed", metadata: payload },
    });
    return new Response("OK (failed)", { status: 200 });
  }

  // Промежуточный статус — пишем metadata, не трогаем balance.
  await prisma.transaction.update({
    where: { id: tx.id },
    data:  { metadata: payload },
  });
  return new Response("OK (ignored)", { status: 200 });
}

async function findTransaction({ paymentId, orderNo }) {
  if (paymentId) {
    const byPm = await prisma.transaction.findUnique({
      where: { paymasterInvoiceId: paymentId },
    });
    if (byPm) return byPm;
  }
  if (orderNo) {
    return prisma.transaction.findUnique({ where: { id: orderNo } });
  }
  return null;
}
