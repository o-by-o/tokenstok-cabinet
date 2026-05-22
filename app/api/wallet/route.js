// GET /api/wallet
// Сводка кошелька: баланс, расход за сегодня, агрегаты по моделям за 30 дней,
// последние 50 транзакций.

import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return json({ error: "Не авторизован" }, 401);

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });
  if (!user) return json({ error: "Не найдено" }, 404);

  // Сегодня — от 00:00 по UTC. Можно потом локализовать.
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Расход за сегодня — сумма costRub по UsageEvent.
  const todayAgg = await prisma.usageEvent.aggregate({
    where: { userId, createdAt: { gte: todayStart } },
    _sum: { costRub: true },
  });

  // Агрегаты по моделям за 30 дней.
  const byModelRaw = await prisma.usageEvent.groupBy({
    by: ["modelId"],
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    _sum:   { costRub: true, inputTokens: true, outputTokens: true },
    _count: { _all: true },
  });
  const byModel = byModelRaw
    .map((r) => ({
      id: r.modelId,
      glyph: r.modelId.slice(0, 2).toUpperCase(),
      n: r._count._all,
      c: Number(r._sum.costRub ?? 0),
      inputTokens: r._sum.inputTokens ?? 0,
      outputTokens: r._sum.outputTokens ?? 0,
    }))
    .sort((a, b) => b.c - a.c);

  // Последние 50 транзакций.
  const txRaw = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      kind: true,
      amountRub: true,
      balanceAfter: true,
      status: true,
      description: true,
      createdAt: true,
    },
  });
  const transactions = txRaw.map((t) => ({
    id: t.id,
    kind: t.kind,
    amountRub:    t.amountRub.toString(),
    balanceAfter: t.balanceAfter.toString(),
    status: t.status,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  return json({
    balance:       user.balance.toString(),
    todaySpendRub: (todayAgg._sum.costRub ?? 0).toString(),
    byModel,
    transactions,
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
