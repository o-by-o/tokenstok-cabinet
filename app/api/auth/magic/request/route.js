// POST /api/auth/magic/request
// Body: { email }
// Создаёт одноразовый magic-link токен (TTL 15 мин), отправляет email.
// Безопасность: НЕ раскрываем, существует ли email — всегда отвечаем 200
// с одинаковым сообщением.

import { prisma } from "../../../../lib/prisma";
import { sendMagicLink } from "../../../../lib/mail";
import { newToken, expiresAt } from "../../../../lib/tokens";
import { take } from "../../../../lib/rate-limit";

const SUCCESS_BODY = {
  ok: true,
  message: "Если этот email есть в системе или может зарегистрироваться — мы отправили на него ссылку.",
};

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Неверный формат email" }, 400);
  }

  // Rate-limit: не чаще раза в 60 сек на email.
  const rl = take("magic", email, 60 * 1000);
  if (!rl.ok) {
    // Возвращаем SUCCESS, чтобы не давать атакующему сигнал о частоте.
    return json(SUCCESS_BODY);
  }

  const token = newToken();
  const user = await prisma.user.findUnique({ where: { email } });

  await prisma.magicLinkToken.create({
    data: {
      token,
      email,
      userId: user?.id ?? null,
      expiresAt: expiresAt(15),
    },
  });

  const base = process.env.AUTH_URL || "https://chat.tokenstok.ru";
  const link = `${base}/auth/magic?token=${encodeURIComponent(token)}`;

  try {
    await sendMagicLink(email, link);
  } catch (e) {
    console.error(`[auth/magic] sendMagicLink failed: ${e?.message || e}`);
    // Всё равно возвращаем SUCCESS — иначе мы раскрываем, что отправка не удалась
    // только для конкретных email'ов. Логируем для оператора.
  }

  return json(SUCCESS_BODY);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
