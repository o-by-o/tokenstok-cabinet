// app/lib/tokens.js
// Криптостойкая генерация одноразовых токенов + helper для TTL.

import crypto from "node:crypto";

export function newToken() {
  // 32 байта = 256 бит энтропии, urlsafe base64 без padding.
  return crypto.randomBytes(32).toString("base64url");
}

export function expiresAt(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
