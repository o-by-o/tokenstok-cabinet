// app/lib/paymaster.js
// Тонкий клиент PayMaster REST API v2.
//
// Базовая дока: https://paymaster.ru/docs/ru/api (SDK reference:
// github.com/parazeet/paymaster_api_php_sdk). Адаптировано под актуальный
// API: POST https://paymaster.ru/api/v2/invoices, Bearer Authorization,
// ответ содержит { paymentId, url }.
//
// PAYMASTER_SECRET_KEY — Bearer API token из ЛК PayMaster
// (paymaster.ru/cpl/currentusertokens). Также используется для HMAC
// проверки webhook'ов.

import crypto from "node:crypto";

const PAYMASTER_API = "https://paymaster.ru/api/v2";

export class PaymasterMisconfiguredError extends Error {
  constructor(missing) {
    super(`PayMaster не настроен: отсутствует ${missing}`);
    this.code = "paymaster_misconfigured";
  }
}

export class PaymasterApiError extends Error {
  constructor(status, body) {
    super(`PayMaster API error: HTTP ${status}`);
    this.code = "paymaster_api_error";
    this.status = status;
    this.body = body;
  }
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new PaymasterMisconfiguredError(name);
  return v;
}

/**
 * Создаёт invoice в PayMaster.
 * @param {Object} p
 * @param {number} p.amountRub      Положительное число.
 * @param {string} p.description    Описание инвойса.
 * @param {string} p.successUrl     Куда вернуть юзера после успеха.
 * @param {string} p.failUrl        Куда вернуть юзера при отмене / ошибке.
 * @param {string} p.orderNo        Наш внутренний идентификатор (Transaction.id).
 * @param {string} [p.customerEmail]
 * @param {string} [p.customerAccount]
 * @returns {Promise<{ paymentId: string, paymentUrl: string }>}
 */
export async function createInvoice(p) {
  const merchantId = requireEnv("PAYMASTER_MERCHANT_ID");
  const apiKey     = requireEnv("PAYMASTER_SECRET_KEY");
  const testMode   = String(process.env.PAYMASTER_TEST_MODE ?? "true").toLowerCase() === "true";

  const body = {
    merchantId,
    testMode,
    invoice: {
      description: p.description,
      orderNo: p.orderNo,
    },
    amount: {
      value: Number(p.amountRub.toFixed(2)),
      currency: "RUB",
    },
    paymentMethod: "BankCard",
    protocol: {
      // Куда PayMaster редиректит браузер после оплаты / отмены.
      callbackUrl: p.successUrl,
      returnUrl:   p.successUrl,
    },
    customer: p.customerEmail || p.customerAccount ? {
      ...(p.customerEmail   ? { email:   p.customerEmail }   : {}),
      ...(p.customerAccount ? { account: p.customerAccount } : {}),
    } : undefined,
  };

  const res = await fetch(`${PAYMASTER_API}/invoices`, {
    method: "POST",
    headers: {
      "content-type":  "application/json",
      "accept":        "application/json",
      "authorization": `Bearer ${apiKey}`,
      "idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* keep as text */ }

  if (!res.ok) {
    console.error(`[paymaster] createInvoice HTTP ${res.status}: ${text}`);
    throw new PaymasterApiError(res.status, parsed ?? text);
  }

  // По SDK PayMaster ответ — { paymentId, url }.
  const paymentId  = parsed?.paymentId ?? parsed?.invoice?.paymentId ?? parsed?.id;
  const paymentUrl = parsed?.url ?? parsed?.paymentUrl ?? parsed?.invoice?.url;
  if (!paymentId || !paymentUrl) {
    console.error(`[paymaster] createInvoice: missing paymentId/url in response: ${text}`);
    throw new PaymasterApiError(200, parsed ?? text);
  }

  return { paymentId, paymentUrl };
}

/**
 * Проверяет подпись webhook'а от PayMaster.
 * PayMaster шлёт сырое JSON-тело + подпись в заголовке. Точный формат
 * подписи в публичной доке расплывчат — пробуем SHA256 от raw body c
 * secret_key, fallback на SHA1.
 *
 * @param {string} rawBody     Сырое тело запроса (важно — не parsed JSON).
 * @param {string} signature   Подпись из заголовка (hex или base64).
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signature) {
  if (!signature) return false;
  const key = process.env.PAYMASTER_SECRET_KEY;
  if (!key) return false;

  const sigNormalized = signature.trim().toLowerCase();

  for (const algo of ["sha256", "sha1"]) {
    const hex = crypto.createHmac(algo, key).update(rawBody).digest("hex").toLowerCase();
    const b64 = crypto.createHmac(algo, key).update(rawBody).digest("base64");
    if (timingSafeEq(sigNormalized, hex))        return true;
    if (timingSafeEq(sigNormalized, b64.toLowerCase())) return true;
    if (timingSafeEq(signature, b64))            return true;  // base64 case-sensitive
  }
  return false;
}

function timingSafeEq(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
