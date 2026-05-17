"use client";

// Composer.jsx — real input with autosize textarea, send (Enter), voice trigger,
// attach (no-op for now). Shows balance + today on bottom row.

import { useRef, useState } from "react";
import { TSIcon } from "../../cabinet/foundation";
import { useApp, useDispatch } from "../../lib/store";
import { useAutosizeTextarea } from "../../lib/hooks";
import { fmtRub } from "../../lib/utils";

const STYLE = `
  .cmp{ flex:0 0 auto; border-top:1px solid var(--line); padding:10px 12px 6px; background:var(--bg); position:relative; z-index:3; }
  .cmp .row{
    display:flex; align-items:flex-end; gap:8px;
    background:var(--card); border:1px solid var(--line); border-radius:22px;
    padding:6px 6px 6px 12px;
  }
  .cmp .row.focused{ border-color:var(--ink); }
  .cmp textarea{
    flex:1; min-width:0; resize:none; overflow-y:auto;
    border:0; outline:none; background:transparent;
    color:var(--ink); font:400 15px/1.4 var(--sans);
    padding:8px 0; min-height:24px; max-height:200px;
  }
  .cmp textarea::placeholder{ color:var(--mute); }
  .cmp .ic{
    width:34px; height:34px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; color:var(--ink); border:0; cursor:pointer;
    flex-shrink:0;
  }
  .cmp .ic:hover{ background:var(--chip); }
  .cmp .ic.send{ background:var(--accent); color:var(--bubble-out-fg); }
  .cmp .ic.send:disabled{ background:var(--mute2); cursor:not-allowed; }
  .cmp .ic.voice{ background:transparent; border:1px solid var(--line); }
  .cmp .ctx{
    display:flex; justify-content:space-between; gap:8px;
    padding:6px 6px 0;
    font-family:var(--mono); font-size:10.5px; color:var(--mute);
    letter-spacing:.02em;
  }
  .cmp .ctx b{ color:var(--ink2); font-weight:600; }
  .cmp .ctx .hint{ display:none; }
  @media (min-width: 768px){ .cmp .ctx .hint{ display:inline; opacity:.7; } }
`;

export function Composer({ onVoice, autoFocus = false }) {
  const dispatch = useDispatch();
  const { state } = useApp();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  useAutosizeTextarea(ref, text);

  const canSend = text.trim().length > 0;

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    dispatch({ type: "msg/sendUser", text: value });
    // refocus textarea after send
    setTimeout(() => ref.current?.focus(), 0);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cmp">
        <div className={`row ${focused ? "focused" : ""}`}>
          <button className="ic" type="button" aria-label="прикрепить">{TSIcon.attach({})}</button>
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKey}
            placeholder="Спроси что угодно…"
            rows={1}
            autoFocus={autoFocus}
          />
          {canSend ? (
            <button className="ic send" type="button" aria-label="отправить" onClick={send}>
              {TSIcon.send({})}
            </button>
          ) : (
            <button className="ic voice" type="button" aria-label="голос" onClick={onVoice}>
              {TSIcon.mic({})}
            </button>
          )}
        </div>
        <div className="ctx">
          <span>остаток · <b>{fmtRub(state.wallet.balance)}</b></span>
          <span><span className="hint">enter — отправить, shift+enter — перенос · </span>сегодня · <b>{fmtRub(state.wallet.todaySpend)}</b></span>
        </div>
      </div>
    </>
  );
}
