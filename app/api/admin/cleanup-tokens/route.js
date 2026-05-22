// POST /api/admin/cleanup-tokens
// Удаляет токены старше 7 дней (использованные либо просроченные).
// Доступ — header `X-Admin-Secret` против ADMIN_SECRET в env. Используем
// отдельный header (а не Authorization Bearer), чтобы не конфликтовать
// с HTTP Basic Auth Caddy на проде.
//
// Можно дёргать из cron на хосте:
//   curl -u tokenstok:<basic-auth-pw> -X POST \
//     -H "X-Admin-Secret: $ADMIN_SECRET" \
//     https://chat.tokenstok.ru/api/admin/cleanup-tokens

import { prisma } from "../../../lib/prisma";

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    console.error("[admin/cleanup-tokens] ADMIN_SECRET не задан — endpoint выключен");
    return new Response("Disabled", { status: 503 });
  }

  const provided = req.headers.get("x-admin-secret") || "";
  if (provided !== secret) {
    return new Response("Forbidden", { status: 403 });
  }

  const cutoff = new Date(Date.now() - STALE_MS);

  const magic   = await prisma.magicLinkToken.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: cutoff } }] },
  });
  const verify  = await prisma.emailVerificationToken.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: cutoff } }] },
  });
  const reset   = await prisma.passwordResetToken.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: cutoff } }] },
  });

  const result = {
    magicLinkTokens:           magic.count,
    emailVerificationTokens:   verify.count,
    passwordResetTokens:       reset.count,
  };
  console.log(`[admin/cleanup-tokens] removed ${JSON.stringify(result)}`);
  return new Response(JSON.stringify({ ok: true, removed: result }), {
    headers: { "content-type": "application/json" },
  });
}
