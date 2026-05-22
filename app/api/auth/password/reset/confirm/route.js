// POST /api/auth/password/reset/confirm
// Body: { token, newPassword }
// Меняет пароль и помечает токен как использованный.

import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const token       = String(body?.token || "");
  const newPassword = String(body?.newPassword || "");

  if (!token) return json({ error: "Отсутствует токен" }, 400);
  if (newPassword.length < 8) {
    return json({ error: "Пароль слишком короткий (минимум 8 символов)" }, 400);
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return json({ error: "Ссылка недействительна или истекла. Запросите новую." }, 400);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { hashedPassword: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
  ]);

  console.log(`[auth/reset] password reset for userId=${record.userId}`);
  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
