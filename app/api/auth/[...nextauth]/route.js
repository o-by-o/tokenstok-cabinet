// NextAuth.js v5 catch-all route handler.
// Exposes /api/auth/signin, /api/auth/signout, /api/auth/session, etc.

import { handlers } from "../../../lib/auth";

export const { GET, POST } = handlers;
