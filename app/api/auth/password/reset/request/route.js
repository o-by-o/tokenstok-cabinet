// POST /api/auth/password/reset/request
// Body: { email }
// Отправляет письмо для сброса пароля (TTL 60 мин). Не раскрывает наличие email.

import { prisma } from "../../../../../lib/prisma";
import { sendPasswordReset } from "../../../../../lib/mail";
import { newToken, expiresAt } from "../../../../../lib/tokens";
import { take } from "../../../../../lib/rate-limit";

const SUCCESS_BODY = {
  ok: true,
  message: "Если этот email есть в системе — мы отправили на него ссылку для сброса пароля.",
};

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Неверный формат email" }, 400);
  }

  const rl = take("reset", email, 60 * 1000);
  if (!rl.ok) return json(SUCCESS_BODY);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return json(SUCCESS_BODY);

  const token = newToken();
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: expiresAt(60) },
  });

  const base = process.env.AUTH_URL || "https://chat.tokenstok.ru";
  const link = `${base}/auth/reset?token=${encodeURIComponent(token)}`;

  try {
    await sendPasswordReset(email, link);
  } catch (e) {
    console.error(`[auth/reset] sendPasswordReset failed: ${e?.message || e}`);
  }

  return json(SUCCESS_BODY);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
