// GET /api/wallet/transactions/[id]
// Возвращает одну транзакцию текущего пользователя (для polling после оплаты).

import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(_req, { params }) {
  const session = await auth();
  if (!session?.user?.id) return json({ error: "Не авторизован" }, 401);

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({
    where: { id },
    select: {
      id: true,
      kind: true,
      amountRub: true,
      balanceAfter: true,
      status: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });

  if (!tx || tx.userId !== session.user.id) {
    return json({ error: "Не найдено" }, 404);
  }

  return json({
    transaction: {
      ...tx,
      amountRub:    tx.amountRub.toString(),
      balanceAfter: tx.balanceAfter.toString(),
      userId: undefined,
    },
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
