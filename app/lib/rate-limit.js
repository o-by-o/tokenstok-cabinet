// app/lib/rate-limit.js
// Простейший in-memory rate-limit per (key, scope). Для MVP достаточно —
// один контейнер, один процесс. Когда выйдем за один процесс — заменим
// на Redis-backed.

const buckets = new Map();

/**
 * @param {string} scope    e.g. "magic", "reset", "verify"
 * @param {string} key      e.g. email-адрес (lowercased)
 * @param {number} windowMs минимальный интервал между попытками
 * @returns {{ ok: true } | { ok: false, retryAfterMs: number }}
 */
export function take(scope, key, windowMs) {
  const bucketKey = `${scope}:${key}`;
  const now = Date.now();
  const last = buckets.get(bucketKey);
  if (last && now - last < windowMs) {
    return { ok: false, retryAfterMs: windowMs - (now - last) };
  }
  buckets.set(bucketKey, now);
  return { ok: true };
}
