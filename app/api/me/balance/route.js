// GET /api/me/balance
// Возвращает текущий баланс пользователя (используется клиентом для обновления
// UI после стрима в чате и после оплаты).

import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ error: "Не авторизован" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });
  if (!user) return json({ error: "Не найдено" }, 404);

  return json({ balance: user.balance.toString() });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
