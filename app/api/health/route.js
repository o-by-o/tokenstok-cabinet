// GET /api/health
// Лёгкий health-check для внешнего мониторинга / uptime-роботов.
// PUBLIC route (NextAuth middleware пропускает /api/auth — но /api/health
// не в PUBLIC, поэтому добавь его в middleware если хочешь без сессии).
//
// Возвращает 200 + JSON если БД отвечает; 503 если нет.

import { prisma } from "../../lib/prisma";

const STARTED_AT = Date.now();

export async function GET() {
  const checks = {
    db: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch (err) {
    console.error("[health] db ping failed:", err?.message || err);
  }

  const ok = Object.values(checks).every(Boolean);
  const body = {
    ok,
    checks,
    uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
    version: process.env.GIT_SHA || "dev",
  };

  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 503,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
