// POST /api/auth/register — creates a user with bcrypt-hashed password.
// Returns 200 on success, 4xx with { error } on validation failure.

import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: "Невалидный JSON" }, 400); }

  const email    = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const name     = body?.name ? String(body.name).trim().slice(0, 80) : null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Неверный формат email" }, 400);
  }
  if (password.length < 8) {
    return json({ error: "Пароль слишком короткий (минимум 8 символов)" }, 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return json({ error: "Этот email уже зарегистрирован" }, 409);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, hashedPassword, name },
    select: { id: true, email: true, name: true, balance: true },
  });

  return json({ ok: true, user: { ...user, balance: user.balance.toString() } });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
