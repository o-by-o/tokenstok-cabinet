// app/lib/fx.js
// Курс USD → RUB. Источник — ЦБ РФ (https://www.cbr-xml-daily.ru/daily_json.js,
// зеркало официального XML с тем же содержимым). Кешируем в памяти на 6 часов,
// fallback — последняя успешно полученная котировка или хардкод 95.0.

import { Prisma } from "@prisma/client";

const FALLBACK_USD_RUB = "95.0";
const TTL_MS = 6 * 60 * 60 * 1000;  // 6 часов
const CBR_URL = "https://www.cbr-xml-daily.ru/daily_json.js";

let cached = { value: null, fetchedAt: 0 };

/**
 * Возвращает актуальный курс USD/RUB как Prisma.Decimal.
 * Никогда не бросает — на любую ошибку отдаёт последний удачный курс
 * или FALLBACK.
 */
export async function getUsdToRub() {
  const now = Date.now();
  if (cached.value && now - cached.fetchedAt < TTL_MS) {
    return cached.value;
  }

  try {
    // 4-секундный таймаут, чтобы chat-handler не подвисал на cold cache.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);

    const res = await fetch(CBR_URL, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();

    const usd = body?.Valute?.USD?.Value;
    if (typeof usd !== "number" || !Number.isFinite(usd) || usd <= 0) {
      throw new Error(`bad payload: ${JSON.stringify(body?.Valute?.USD)}`);
    }

    const dec = new Prisma.Decimal(usd.toFixed(4));
    cached = { value: dec, fetchedAt: now };
    console.log(`[fx] USD→RUB refreshed: ${dec.toString()}`);
    return dec;
  } catch (err) {
    console.error(`[fx] USD→RUB refresh failed: ${err?.message || err} — using ${cached.value ? "stale" : "fallback"}`);
    return cached.value ?? new Prisma.Decimal(FALLBACK_USD_RUB);
  }
}
