// middleware.js — гейтит protected routes. Без session → /login.
// Public routes: /, /login, /register, /api/auth/* (NextAuth handlers).

import { NextResponse } from "next/server";
import { auth } from "./app/lib/auth";

const PUBLIC = [
  "/login",
  "/register",
  "/auth",   // /auth/magic, /auth/verify, /auth/reset, /auth/check-inbox
  "/api/auth",
  "/api/payments/paymaster/webhook",  // PayMaster шлёт без сессии
  "/api/health",                       // мониторинг / uptime-роботы
  "/api/admin",                        // защищён ADMIN_SECRET Bearer
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // public: pass through
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  // root redirects (server-side) — keep behavior consistent
  if (pathname === "/") {
    return NextResponse.redirect(new URL(req.auth ? "/chat" : "/login", req.url));
  }

  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // skip Next.js internals + static assets
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.svg|manifest\\.webmanifest).*)",
  ],
};
