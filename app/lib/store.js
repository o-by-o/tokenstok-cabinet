"use client";

// store.js — single Context-backed store for the cabinet.
// Slices:
//   chats     { byId, order, currentId }   — conversations + messages
//   models    { currentId, recentIds }     — model selection (catalog lives in cabinet/data.js)
//   wallet    { balance, todaySpend, byModel }
//   ui        { sidebarOpen, sheet, longPress, theme, accent, density, streamKind, showCost }
// Persists everything except ui.sidebarOpen / ui.sheet / ui.longPress (ephemeral).

import {
  createContext, useContext, useEffect, useMemo, useReducer, useRef, useCallback,
} from "react";
import { TS_HISTORY, TS_MODELS, TS_RECENT_MODELS } from "../cabinet/data";
import { mockComplete } from "./streaming";
import { uid, timeOfDay } from "./utils";

// alias so the reducer (defined below before AppProvider imports the data
// indirectly) can read the catalog
const TS_MODELS_FOR_COST = TS_MODELS;

// Marker we use to detect when relTime should show a "real" time after mount.
// During SSR / first render we keep timestamps relative to the deterministic
// SEED_NOW so the rendered text matches across server and client.
let CLIENT_BOOT_TS = null;

// Bump when the persisted state shape changes incompatibly. Old keys (v1)
// keep their data on disk but are ignored on load — fresh seed wins.
const KEY = "tokenstok:v2";

// ── seed ──────────────────────────────────────────────────────────
// Build initial chats from TS_HISTORY. Deterministic — no Date.now(), no
// Math.random() — so SSR and client render identical DOM (otherwise hydration
// mismatches on chat IDs and relative timestamps). Real "now" gets stamped
// in after mount via "ui/touchSeed".
const SEED_NOW = 1779000000000; // 2026-05-12, a stable past timestamp
function seedChats() {
  const byId = {};
  const order = [];
  TS_HISTORY.forEach((h, i) => {
    const id = h.id;
    order.push(id);
    const ts = SEED_NOW - (i + 1) * 3600_000;
    byId[id] = {
      id,
      title: h.title,
      modelId: h.model,
      pinned: !!h.pinned,
      createdAt: ts,
      updatedAt: ts,
      messages: [
        { id: `${id}-u`, role: "user",      text: h.preview.replace(/…$/, ""), modelId: h.model, cost: 0.0008 + i * 0.0003, tokens: 10 + i * 2, ts: ts - 4000 },
        { id: `${id}-a`, role: "assistant", text: previewAnswer(h.title),       modelId: h.model, cost: 0.0042 + i * 0.001, tokens: 30 + i * 8, latency: 220 + i * 30, ts: ts },
      ],
    };
  });
  // brand-new empty chat at the top — deterministic id
  const blankId = "c-empty";
  byId[blankId] = { id: blankId, title: "Новый чат", modelId: "claude-sonnet-4.5", pinned: false, createdAt: SEED_NOW, updatedAt: SEED_NOW, messages: [] };
  order.unshift(blankId);
  return { byId, order, currentId: blankId };
}

function previewAnswer(title) {
  if (title.includes("сравн") || title.includes("Сравн")) return "Sonnet 4.5 сильнее в коде. GPT-5 шире по знаниям. Под код — claude, под общее — gpt.";
  if (title.includes("обложк") || title.includes("Скетч")) return "Готово. Сгенерировал 4 варианта, можно открыть в превью.";
  if (title.includes("Перев")) return "Перевёл. Юридический регистр, термины сохранены, ссылки в шапке.";
  if (title.includes("Видео")) return "5 секунд готово. dog runs on beach at sunset, slow-motion, 720p, sora-2.";
  if (title.includes("миграц")) return "Сделал alembic + zero-downtime: add nullable, dual-write, backfill, drop old. Скрипт прикрепил.";
  if (title.includes("шифров") || title.includes("Расшифров")) return "Расшифровал 47 минут. Два спикера, выделил решения и action-items в конце.";
  return "Готово. Если нужно — могу переделать.";
}

const initial = () => ({
  chats: seedChats(),
  models: { currentId: "claude-sonnet-4.5", recentIds: TS_RECENT_MODELS },
  wallet: {
    balance: 847.12,
    todaySpend: 23.40,
    // mirrors screens-util.jsx ScreenProfile breakdown exactly
    byModel: [
      { id: "claude-sonnet-4.5", glyph: "CL", n: 142, c: 14.82 },
      { id: "dalle-4",           glyph: "D4", n: 2,   c: 6.80 },
      { id: "claude-haiku-4.5",  glyph: "CH", n: 67,  c: 1.12 },
      { id: "whisper-1",         glyph: "WS", n: 1,   c: 0.66 },
    ],
  },
  ui: {
    sidebarOpen: false,
    sheet: null,
    longPress: null,
    theme: "light",
    accent: "graphite",
    density: "regular",
    streamKind: "token",
    showCost: true,
  },
});

// ── reducer ───────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    // chats ────────────────────────────────────────────
    case "chat/new": {
      const id = uid("c");
      const chat = { id, title: "Новый чат", modelId: state.models.currentId, pinned: false, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
      return {
        ...state,
        chats: { ...state.chats, byId: { ...state.chats.byId, [id]: chat }, order: [id, ...state.chats.order], currentId: id },
        ui: { ...state.ui, sidebarOpen: false },
      };
    }
    case "chat/select": {
      if (!state.chats.byId[action.id]) return state;
      return {
        ...state,
        chats: { ...state.chats, currentId: action.id },
        ui: { ...state.ui, sidebarOpen: false },
      };
    }
    case "chat/delete": {
      const { [action.id]: _, ...rest } = state.chats.byId;
      const order = state.chats.order.filter((k) => k !== action.id);
      let currentId = state.chats.currentId;
      if (currentId === action.id) currentId = order[0] || null;
      return { ...state, chats: { ...state.chats, byId: rest, order, currentId } };
    }
    case "chat/togglePin": {
      const c = state.chats.byId[action.id];
      if (!c) return state;
      return {
        ...state,
        chats: { ...state.chats, byId: { ...state.chats.byId, [action.id]: { ...c, pinned: !c.pinned } } },
      };
    }
    case "chat/rename": {
      const c = state.chats.byId[action.id];
      if (!c || !action.title) return state;
      return {
        ...state,
        chats: { ...state.chats, byId: { ...state.chats.byId, [action.id]: { ...c, title: action.title } } },
      };
    }
    case "chat/setModel": {
      const c = state.chats.byId[state.chats.currentId];
      if (!c) return state;
      return {
        ...state,
        chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: { ...c, modelId: action.modelId } } },
        models: { ...state.models, currentId: action.modelId, recentIds: [action.modelId, ...state.models.recentIds.filter((k) => k !== action.modelId)].slice(0, 8) },
      };
    }

    // messages ─────────────────────────────────────────
    case "msg/sendUser": {
      const c = state.chats.byId[state.chats.currentId];
      if (!c) return state;
      const m = TS_MODELS_FOR_COST.find((x) => x.id === c.modelId);
      const inputTokens = Math.max(3, Math.ceil(action.text.length / 4));
      const ppk = m ? Number((m.price || "0").replace(",", ".")) : 2.88;
      const userCost = (inputTokens / 1000) * ppk;
      const userMsg = {
        id: uid("m"), role: "user", text: action.text, ts: Date.now(),
        cost: userCost, tokens: inputTokens, modelId: c.modelId,
        attachments: action.attachments || undefined,
      };
      if (state.wallet.balance < 0.5) {
        const limitMsg = { id: uid("m"), role: "assistant", type: "limit", ts: Date.now() };
        const title = c.messages.length === 0 ? action.text.slice(0, 60) : c.title;
        const updated = { ...c, title, messages: [...c.messages, userMsg, limitMsg], updatedAt: Date.now() };
        return { ...state, chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: updated } } };
      }
      // Detect media intent up-front — those still go through the mock pipeline
      // (real image/video gen via gateway lives in a separate route).
      const intent = (() => {
        const p = action.text.toLowerCase();
        if (/(\b)?(видео|video|sora|veo|5\s*сек(унд)?)/.test(p)) return "video";
        if (/(нарисуй|draw|generate (an? )?image|обложк|иконк|сгенери(руй|ровать)|midjourney|dalle|flux)/.test(p)) return "image";
        return "text";
      })();
      if (intent !== "text") {
        const completion = mockComplete({ prompt: action.text, modelId: c.modelId, attachments: action.attachments });
        const asstMsg = {
          id: uid("m"), role: "assistant",
          type: intent === "image" ? "image-gen" : "video-gen",
          prompt: completion.prompt,
          modelId: completion.modelId, modelGlyph: completion.modelGlyph, modelName: completion.modelName,
          cost: completion.cost, tokens: completion.tokens, latency: completion.latency,
          ts: Date.now(), streaming: false,
        };
        const title = c.messages.length === 0 ? action.text.slice(0, 60) : c.title;
        const updated = { ...c, title, messages: [...c.messages, userMsg, asstMsg], updatedAt: Date.now() };
        return { ...state, chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: updated } } };
      }
      // Real text: create empty streaming placeholder; ChatView's effect fetches /api/chat.
      const asstMsg = {
        id: uid("m"),
        role: "assistant",
        text: "",
        modelId: c.modelId,
        modelGlyph: (m && m.glyph) || "AI",
        modelName: (m && m.name) || c.modelId,
        cost: 0, tokens: 0,
        ts: Date.now(),
        streaming: true,
      };
      const title = c.messages.length === 0 ? action.text.slice(0, 60) : c.title;
      const updated = { ...c, title, messages: [...c.messages, userMsg, asstMsg], updatedAt: Date.now() };
      // approximate spend
      const spendDelta = completion.cost;
      return {
        ...state,
        chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: updated } },
        wallet: { ...state.wallet, balance: Math.max(0, state.wallet.balance - spendDelta), todaySpend: state.wallet.todaySpend + spendDelta },
      };
    }
    case "msg/finishStreaming": {
      const c = state.chats.byId[state.chats.currentId];
      if (!c) return state;
      const messages = c.messages.map((m) => (m.id === action.id ? { ...m, streaming: false, ...(action.patch || {}) } : m));
      return { ...state, chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: { ...c, messages } } } };
    }
    case "msg/streamChunk": {
      const c = state.chats.byId[state.chats.currentId];
      if (!c) return state;
      const messages = c.messages.map((m) => (m.id === action.id ? { ...m, text: (m.text || "") + action.chunk } : m));
      return { ...state, chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: { ...c, messages } } } };
    }
    case "msg/streamFail": {
      const c = state.chats.byId[state.chats.currentId];
      if (!c) return state;
      const messages = c.messages.map((m) => (m.id === action.id ? {
        ...m,
        text: action.text || "Ошибка генерации. Попробуй ещё раз.",
        streaming: false,
        error: true,
        cta: action.cta || null,        // "topup" → MessageBubble отрендерит кнопку «Пополнить»
      } : m));
      return { ...state, chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: { ...c, messages } } } };
    }
    case "msg/regenerate": {
      // remove the assistant after `userId`, re-run completion
      const c = state.chats.byId[state.chats.currentId];
      if (!c) return state;
      const idx = c.messages.findIndex((m) => m.id === action.userId);
      if (idx < 0) return state;
      const user = c.messages[idx];
      const completion = mockComplete({ prompt: user.text, modelId: action.modelId || c.modelId });
      const newAsst = { id: uid("m"), role: "assistant", text: completion.text, modelId: completion.modelId, modelGlyph: completion.modelGlyph, modelName: completion.modelName, cost: completion.cost, tokens: completion.tokens, latency: completion.latency, ts: Date.now(), streaming: true };
      const before = c.messages.slice(0, idx + 1);
      // drop the assistant that immediately followed `userId`, if any
      const tail = c.messages.slice(idx + 1).filter((m, i) => !(i === 0 && m.role === "assistant"));
      const messages = [...before, newAsst, ...tail];
      return { ...state, chats: { ...state.chats, byId: { ...state.chats.byId, [c.id]: { ...c, messages, updatedAt: Date.now() } } } };
    }

    // wallet ───────────────────────────────────────────
    case "wallet/topup": {
      return { ...state, wallet: { ...state.wallet, balance: state.wallet.balance + action.amount } };
    }
    case "wallet/balance": {
      // Свежий баланс из /api/me/balance (строка с decimal — пускаем как Number).
      const next = Number(action.value);
      if (!Number.isFinite(next)) return state;
      return { ...state, wallet: { ...state.wallet, balance: next } };
    }

    // ui ───────────────────────────────────────────────
    case "ui/setSidebar":  return { ...state, ui: { ...state.ui, sidebarOpen: action.open } };
    case "ui/openSheet":   return { ...state, ui: { ...state.ui, sheet: action.sheet || null } };
    case "ui/longPress":   return { ...state, ui: { ...state.ui, longPress: action.value } };
    case "ui/set":         return { ...state, ui: { ...state.ui, ...action.patch } };
    // composer prefill — Library / Agents put text here, Composer consumes on mount.
    case "ui/prefill":     return { ...state, ui: { ...state.ui, composerPrefill: action.text || "" } };
    case "ui/clearPrefill":return { ...state, ui: { ...state.ui, composerPrefill: "" } };

    // hydration / reset
    case "hydrate":       return action.payload;
    default:              return state;
  }
}

// ── persistence ───────────────────────────────────────────────────
function loadPersisted() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.__v === 2 ? parsed.state : null;
  } catch { return null; }
}
function savePersisted(state) {
  try {
    const ui = { theme: state.ui.theme, accent: state.ui.accent, density: state.ui.density, streamKind: state.ui.streamKind, showCost: state.ui.showCost, sidebarOpen: false, sheet: null, longPress: null };
    localStorage.setItem(KEY, JSON.stringify({ __v: 2, state: { ...state, ui } }));
  } catch {}
}

// ── context ───────────────────────────────────────────────────────
const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const hydrated = useRef(false);

  // hydrate from localStorage after mount (avoid SSR mismatch).
  // Merge the persisted blob over the initial state so a partial / older
  // schema can't leave any slice undefined (we ran into a crash where
  // localStorage held only {ui:{...}} → state.chats was undefined).
  useEffect(() => {
    const p = loadPersisted();
    if (p) {
      const base = initial();
      const merged = {
        ...base,
        ...p,
        chats:  p.chats  ? { ...base.chats,  ...p.chats  } : base.chats,
        models: p.models ? { ...base.models, ...p.models } : base.models,
        wallet: p.wallet ? { ...base.wallet, ...p.wallet } : base.wallet,
        ui: {
          ...base.ui,
          ...(p.ui || {}),
          // ephemeral keys always start fresh regardless of what was saved
          sidebarOpen: false, sheet: null, longPress: null,
        },
      };
      dispatch({ type: "hydrate", payload: merged });
    }
    hydrated.current = true;
  }, []);
  // persist on change (debounced)
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => savePersisted(state), 200);
    return () => clearTimeout(t);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside <AppProvider>");
  return v;
}

// Convenience selectors / actions ─────────────────────────────────
export function useCurrentChat() {
  const { state } = useApp();
  const id = state.chats.currentId;
  return id ? state.chats.byId[id] : null;
}
export function useChatList() {
  const { state } = useApp();
  const order = state.chats?.order || [];
  const byId  = state.chats?.byId  || {};
  return order.map((id) => byId[id]).filter(Boolean);
}
export function useCurrentModelId() {
  const c = useCurrentChat();
  const { state } = useApp();
  return c?.modelId || state.models.currentId;
}
export function useUi() {
  const { state } = useApp();
  return state.ui;
}
export function useDispatch() {
  const { dispatch } = useApp();
  return dispatch;
}
