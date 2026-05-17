"use client";

// LongPressMenu.jsx — popover near the long-pressed message with 6 actions.
// Closes on outside click, Esc, or after a destructive action.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TSIcon } from "../../cabinet/foundation";
import { useDispatch } from "../../lib/store";
import { useClickOutside, useEscape } from "../../lib/hooks";

const STYLE = `
  .lp-scrim{
    position:fixed; inset:0; background:rgba(12,12,12,.32);
    backdrop-filter:blur(2px);
    z-index:95;
  }
  .lp-pop{
    position:fixed; z-index:96;
    background:var(--card); color:var(--ink);
    border:1px solid var(--line); border-radius:14px;
    box-shadow:0 18px 50px -16px rgba(0,0,0,.35);
    padding:4px; min-width:240px;
  }
  .lp-item{
    display:flex; align-items:center; gap:12px;
    padding:9px 12px; border-radius:10px; cursor:pointer;
  }
  .lp-item:hover{ background:var(--chip); }
  .lp-item .nm{ flex:1; font-size:14px; font-weight:500; }
  .lp-item .sub{ font-family:var(--mono); font-size:11px; color:var(--mute); }
  .lp-item.danger{ color:#c25a35; }
`;

const ACTIONS = [
  { id: "copy",        i: "copy",      t: "Скопировать" },
  { id: "regenerate",  i: "refresh",   t: "Перегенерировать", sub: "другой моделью →" },
  { id: "edit",        i: "edit",      t: "Изменить промт" },
  { id: "quote",       i: "quote",     t: "Ответить на это" },
  { id: "pin",         i: "pin",       t: "Закрепить" },
  { id: "translate",   i: "translate", t: "Перевести" },
];

export function LongPressMenu({ info, chat, onClose }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState({ x: info.x, y: info.y });

  useClickOutside(popRef, onClose, true);
  useEscape(onClose, true);

  // clamp to viewport after mount
  useEffect(() => {
    const pop = popRef.current;
    if (!pop) return;
    const r = pop.getBoundingClientRect();
    const w = window.innerWidth, h = window.innerHeight;
    const PAD = 12;
    let nx = pos.x;
    let ny = pos.y;
    if (nx + r.width > w - PAD) nx = w - r.width - PAD;
    if (ny + r.height > h - PAD) ny = info.y - r.height - 12; // flip above
    if (nx < PAD) nx = PAD;
    if (ny < PAD) ny = PAD;
    if (nx !== pos.x || ny !== pos.y) setPos({ x: nx, y: ny });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = useDispatch();

  const handle = (id) => {
    const msg = chat?.messages.find((m) => m.id === info.messageId);
    if (!msg) { onClose(); return; }
    if (id === "copy") {
      navigator.clipboard?.writeText(msg.text).catch(() => {});
    } else if (id === "regenerate") {
      // find the user prompt right before this assistant message
      const idx = chat.messages.findIndex((m) => m.id === info.messageId);
      const prevUser = [...chat.messages.slice(0, idx)].reverse().find((m) => m.role === "user");
      if (prevUser) dispatch({ type: "msg/regenerate", userId: prevUser.id });
    } else if (id === "pin") {
      dispatch({ type: "chat/togglePin", id: chat.id });
    } else if (id === "edit") {
      // crude: put the user prompt back in a prompt() — composer doesn't expose external set yet
      const idx = chat.messages.findIndex((m) => m.id === info.messageId);
      const prevUser = [...chat.messages.slice(0, idx)].reverse().find((m) => m.role === "user");
      if (prevUser && typeof window !== "undefined") {
        const next = window.prompt("Изменить промт:", prevUser.text);
        if (next && next.trim()) dispatch({ type: "msg/regenerate", userId: prevUser.id });
      }
    } else if (id === "quote" || id === "translate") {
      // no-op for now — show a tiny toast via alert
      // intentionally silent; M10 polish adds toasts
    }
    onClose();
  };

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="lp-scrim" onClick={onClose}/>
      <div className="lp-pop" ref={popRef} style={{ left: pos.x, top: pos.y }}>
        {ACTIONS.map((a) => (
          <div key={a.id} className="lp-item" onClick={() => handle(a.id)}>
            <span style={{ color:"var(--ink)" }}>{TSIcon[a.i]({})}</span>
            <span className="nm">{a.t}</span>
            {a.sub && <span className="sub">{a.sub}</span>}
          </div>
        ))}
      </div>
    </>,
    document.body
  );
}
