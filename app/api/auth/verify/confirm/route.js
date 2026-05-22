// POST /api/auth/verify/confirm
// Body: { token }
// Ставит User.emailVerified = now() и помечает токен использованным.

import { prisma } from "../../../../lib/prisma";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const token = String(body?.token || "");
  if (!token) return json({ error: "Отсутствует токен" }, 400);

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return json({ error: "Ссылка недействительна или истекла." }, 400);
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: now },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
  ]);

  console.log(`[auth/verify] email verified for userId=${record.userId}`);
  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
