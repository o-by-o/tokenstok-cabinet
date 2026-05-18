// server-bootstrap.js — выполняется один раз при инициализации серверного
// модуля. Прокидывает все исходящие fetch() Node.js через локальный
// HTTP-прокси (Hysteria → OVH), потому что Vercel AI Gateway / OpenAI / Anthropic
// заблокированы для российских IP.
//
// Сетка: VM → Hysteria :8080 → 40.160.8.42 (OVH) → интернет → gateway.ai.vercel.dev

import { ProxyAgent, setGlobalDispatcher } from "undici";

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY;

if (proxy && typeof globalThis.__tk_proxy_set === "undefined") {
  setGlobalDispatcher(new ProxyAgent(proxy));
  globalThis.__tk_proxy_set = true;
  // server-side only, never reaches the browser
  console.log(`[tokenstok] HTTPS_PROXY=${proxy} — все исходящие fetch() пройдут через него`);
}
