// NextAuth.js v5 (Auth.js) config.
// Два провайдера:
//   - "credentials" — email + bcrypt пароль
//   - "magic-link"  — одноразовый токен из почты, обменивается на сессию
// JWT-сессии 30 дней.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },  // 30 days
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const email    = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || email.split("@")[0],
          role: user.role,
        };
      },
    }),

    Credentials({
      id: "magic-link",
      name: "magic-link",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = String(credentials?.token || "");
        if (!token) return null;

        const record = await prisma.magicLinkToken.findUnique({ where: { token } });
        if (!record) return null;
        if (record.usedAt) return null;
        if (record.expiresAt.getTime() < Date.now()) return null;

        // Если userId уже привязан — берём этого юзера. Если нет (новый email) —
        // ищем по email, либо создаём нового без пароля и с подтверждённым email.
        let user = record.userId
          ? await prisma.user.findUnique({ where: { id: record.userId } })
          : await prisma.user.findUnique({ where: { email: record.email } });

        const now = new Date();
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: record.email,
              hashedPassword: null,
              emailVerified: now,
            },
          });
        } else if (!user.emailVerified) {
          // Успешный magic-link одновременно подтверждает email.
          user = await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: now },
          });
        }

        await prisma.magicLinkToken.update({
          where: { id: record.id },
          data: { usedAt: now, userId: user.id },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
