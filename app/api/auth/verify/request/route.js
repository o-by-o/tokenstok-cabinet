// POST /api/auth/verify/request
// Body: { email }
// Отправляет письмо с подтверждением email (TTL 24 часа).
// Используется, если юзер зарегистрировался по паролю и хочет получить
// verify-ссылку повторно. Если email уже подтверждён — тихо отвечаем 200.

import { prisma } from "../../../../lib/prisma";
import { sendVerifyEmail } from "../../../../lib/mail";
import { newToken, expiresAt } from "../../../../lib/tokens";
import { take } from "../../../../lib/rate-limit";

const SUCCESS_BODY = {
  ok: true,
  message: "Если этот email есть в системе и ещё не подтверждён — мы отправили ссылку.",
};

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Неверный формат email" }, 400);
  }

  const rl = take("verify", email, 60 * 1000);
  if (!rl.ok) return json(SUCCESS_BODY);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return json(SUCCESS_BODY);

  const token = newToken();
  await prisma.emailVerificationToken.create({
    data: { token, userId: user.id, expiresAt: expiresAt(24 * 60) },
  });

  const base = process.env.AUTH_URL || "https://chat.tokenstok.ru";
  const link = `${base}/auth/verify?token=${encodeURIComponent(token)}`;

  try {
    await sendVerifyEmail(email, link);
  } catch (e) {
    console.error(`[auth/verify] sendVerifyEmail failed: ${e?.message || e}`);
  }

  return json(SUCCESS_BODY);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
