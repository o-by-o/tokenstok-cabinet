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

const KEY = "tokenstok:v1";

// ── seed ──────────────────────────────────────────────────────────
// Build initial chats from TS_HISTORY. The current chat is empty (so /chat
// opens to the greeting), the rest are seeded with a single Q/A from preview.
function seedChats() {
  const byId = {};
  const order = [];
  const now = Date.now();
  TS_HISTORY.forEach((h, i) => {
    const id = h.id;
    order.push(id);
    byId[id] = {
      id,
      title: h.title,
      modelId: h.model,
      pinned: !!h.pinned,
      createdAt: now - (i + 1) * 3600_000,
      updatedAt: now - (i + 1) * 3600_000,
      // a preview-only chat: one user msg + one assistant msg
      messages: [
        { id: uid("m"), role: "user", text: h.preview.replace(/…$/, ""), ts: now - (i + 1) * 3600_000 - 4000 },
        { id: uid("m"), role: "assistant", text: previewAnswer(h.title), modelId: h.model, cost: 0.0042 + i * 0.001, tokens: 30 + i * 8, ts: now - (i + 1) * 3600_000 },
      ],
    };
  });
  // brand-new empty chat at the top
  const blankId = uid("c");
  byId[blankId] = { id: blankId, title: "Новый чат", modelId: "claude-sonnet-4.5", pinned: false, createdAt: now, updatedAt: now, messages: [] };
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
  wallet: { balance: 847.12, todaySpend: 23.40, byModel: { "claude-sonnet-4.5": 14.82, "dalle-4": 6.80, "claude-haiku-4.5": 1.12, "whisper-1": 0.66 } },
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
      const userMsg = { id: uid("m"), role: "user", text: action.text, ts: Date.now() };
      // generate assistant placeholder + run mock completion synchronously
      const completion = mockComplete({ prompt: action.text, modelId: c.modelId });
      const asstMsg = {
        id: uid("m"),
        role: "assistant",
        text: completion.text,
        modelId: completion.modelId,
        modelGlyph: completion.modelGlyph,
        modelName: completion.modelName,
        cost: completion.cost,
        tokens: completion.tokens,
        latency: completion.latency,
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
      const messages = c.messages.map((m) => (m.id === action.id ? { ...m, streaming: false } : m));
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

    // ui ───────────────────────────────────────────────
    case "ui/setSidebar": return { ...state, ui: { ...state.ui, sidebarOpen: action.open } };
    case "ui/openSheet":  return { ...state, ui: { ...state.ui, sheet: action.sheet || null } };
    case "ui/longPress":  return { ...state, ui: { ...state.ui, longPress: action.value } };
    case "ui/set":        return { ...state, ui: { ...state.ui, ...action.patch } };

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
    return parsed && parsed.__v === 1 ? parsed.state : null;
  } catch { return null; }
}
function savePersisted(state) {
  try {
    // strip ephemeral ui keys before persist
    const ui = { theme: state.ui.theme, accent: state.ui.accent, density: state.ui.density, streamKind: state.ui.streamKind, showCost: state.ui.showCost, sidebarOpen: false, sheet: null, longPress: null };
    localStorage.setItem(KEY, JSON.stringify({ __v: 1, state: { ...state, ui } }));
  } catch {}
}

// ── context ───────────────────────────────────────────────────────
const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const hydrated = useRef(false);

  // hydrate from localStorage after mount (avoid SSR mismatch)
  useEffect(() => {
    const p = loadPersisted();
    if (p) dispatch({ type: "hydrate", payload: { ...p, ui: { ...initial().ui, theme: p.ui?.theme || "light", accent: p.ui?.accent || "graphite", density: p.ui?.density || "regular", streamKind: p.ui?.streamKind || "token", showCost: p.ui?.showCost !== false } } });
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
  return state.chats.order.map((id) => state.chats.byId[id]).filter(Boolean);
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
