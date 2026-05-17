"use client";

// Composer.jsx — uses .ts-composer / .row / .ic / .send / .voice / .ctx from
// foundation so styling matches the mockup. Wraps a real <textarea> with the
// .input class so we get the right typography and a working autosize input.

import { useRef, useState, useEffect } from "react";
import { TSIcon } from "../../cabinet/foundation";
import { useApp, useDispatch, useUi } from "../../lib/store";
import { useAutosizeTextarea } from "../../lib/hooks";

const STYLE = `
  /* Cap the composer to the same max-width as message column so they align */
  .cmp-wrap{ flex:0 0 auto; }
  .cmp-wrap .ts-composer{
    padding-left:max(16px, calc((100% - 720px) / 2));
    padding-right:max(16px, calc((100% - 720px) / 2));
  }
  /* Replace the span.input with a real textarea using same classes */
  .cmp-wrap .ts-composer .input{
    flex:1; min-width:0; resize:none;
    border:0; outline:none; background:transparent;
    color:var(--ink); font:400 15px/1.3 var(--sans);
    padding:8px 0; min-height:24px; max-height:200px;
  }
  .cmp-wrap .ts-composer .input::placeholder{ color:var(--mute); }
  .cmp-wrap .ts-composer .row{ align-items:flex-end; }
`;

export function Composer({ onVoice, autoFocus = false }) {
  const dispatch = useDispatch();
  const { state } = useApp();
  const ui = useUi();
  const [text, setText] = useState("");
  const ref = useRef(null);
  useAutosizeTextarea(ref, text);

  // pick up text prefilled by /library "apply" or /agents agent-card tap
  useEffect(() => {
    if (ui.composerPrefill) {
      setText(ui.composerPrefill);
      dispatch({ type: "ui/clearPrefill" });
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [ui.composerPrefill, dispatch]);

  // expose ref globally so shortcut handlers can focus composer
  useEffect(() => {
    if (typeof window !== "undefined") window.__tk_composer = ref.current;
    return () => { if (typeof window !== "undefined") window.__tk_composer = null; };
  });

  const canSend = text.trim().length > 0;

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    dispatch({ type: "msg/sendUser", text: value });
    setTimeout(() => ref.current?.focus(), 0);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const balance = state.wallet.balance.toFixed(2).replace(".", ",") + " ₽";
  const today = state.wallet.todaySpend.toFixed(2).replace(".", ",") + " ₽";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cmp-wrap">
        <div className="ts-composer">
          <div className="row">
            <button className="ic" type="button" aria-label="прикрепить">{TSIcon.attach({})}</button>
            <textarea
              ref={ref}
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="Спроси что угодно…"
              rows={1}
              autoFocus={autoFocus}
            />
            {canSend ? (
              <button className="ic send" type="button" aria-label="отправить" onClick={send}>{TSIcon.send({})}</button>
            ) : (
              <button className="ic voice" type="button" aria-label="голос" onClick={onVoice}>{TSIcon.mic({})}</button>
            )}
          </div>
          <div className="ctx">
            <span>остаток · <b>{balance}</b></span>
            <span>сегодня · <b>{today}</b></span>
          </div>
        </div>
      </div>
    </>
  );
}
