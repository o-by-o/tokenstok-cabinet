// utils.js — small helpers used across the app.

export function cn(...args) {
  return args.filter(Boolean).join(" ");
}

// random id, no crypto dependency (sufficient for chat/message keys in-browser)
export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// "847,12 ₽" — Russian decimal format, two digits
export function fmtRub(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "0,00 ₽";
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₽";
}
// "0,0142 ₽" — 4 digits for token-level prices
export function fmtRubFine(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "0,0000 ₽";
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + " ₽";
}

// Relative time in russian: "сейчас", "5 мин", "2 ч", "вчера", "2 дн"
export function relTime(tsMs) {
  if (!tsMs) return "";
  const diff = Date.now() - tsMs;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "сейчас";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  const d = Math.floor(h / 24);
  if (d === 1) return "вчера";
  if (d < 7) return `${d} дн`;
  if (d < 30) return `${Math.floor(d/7)} нед`;
  return `${Math.floor(d/30)} мес`;
}

// "сегодня · 14:23" — HH:MM with leading zero
export function timeOfDay(tsMs = Date.now()) {
  const d = new Date(tsMs);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
