"use client";

// MessageBubble.jsx — single message render.
//   user → right-aligned dark bubble
//   assistant → left-aligned ink-on-paper; either static text (settled) or
//               streaming via the chosen effect

import { useEffect, useRef } from "react";
import { useUi, useDispatch } from "../../lib/store";
import { useStreamingMessage } from "../../lib/streaming";
import { useLongPress } from "../../lib/hooks";

// ── streaming renderers ─────────────────────────────────────────
// Each renderer mutates the DOM directly to keep span-level animations.
// We re-use the four effects from the design source: token/pop/blur/phosphor.

function renderTokenSpan(text, prev) {
  // append new chars one chunk at a time; flash a tinted background then fade.
  const added = text.slice(prev.length);
  if (!added) return null;
  const span = document.createElement("span");
  span.textContent = added;
  span.style.cssText = "background:var(--chip);color:var(--ink);border-radius:2px;transition:background .35s ease;";
  requestAnimationFrame(() => { span.style.background = "transparent"; });
  return span;
}

function renderPopWords(text, prev) {
  // word-level pop in
  const tail = text.slice(prev.length);
  if (!tail) return null;
  const span = document.createElement("span");
  span.textContent = tail;
  span.style.cssText = "display:inline;white-space:pre-wrap;opacity:0;transform:translateY(4px);transition:opacity .26s ease, transform .26s ease;";
  // schedule reveal
  requestAnimationFrame(() => { span.style.opacity = 1; span.style.transform = "translateY(0)"; });
  return span;
}

function renderBlurSpan(text, prev) {
  const tail = text.slice(prev.length);
  if (!tail) return null;
  const span = document.createElement("span");
  span.textContent = tail;
  span.style.cssText = "display:inline;white-space:pre-wrap;filter:blur(7px);opacity:0;transition:filter .38s ease, opacity .38s ease;";
  requestAnimationFrame(() => { span.style.filter = "blur(0)"; span.style.opacity = 1; });
  return span;
}

function renderPhosphorChars(text, prev) {
  const tail = text.slice(prev.length);
  if (!tail) return null;
  const wrap = document.createElement("span");
  for (const ch of tail) {
    const s = document.createElement("span");
    s.textContent = ch;
    s.style.cssText = "color:var(--ink);text-shadow:0 0 14px rgba(var(--glow),.95), 0 0 4px rgba(var(--glow),.7);transition:color 1.2s ease, text-shadow 1.2s ease;";
    setTimeout(() => {
      s.style.color = "var(--ink2)";
      s.style.textShadow = "0 0 1px rgba(var(--glow),.12)";
    }, 80);
    wrap.appendChild(s);
  }
  return wrap;
}

const RENDERERS = {
  token:    renderTokenSpan,
  pop:      renderPopWords,
  blur:     renderBlurSpan,
  phosphor: renderPhosphorChars,
};

function StreamedText({ text, effect = "token", mono = false }){
  const ref = useRef(null);
  const prevRef = useRef("");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // text shrunk (regenerate / reset) — wipe
    if (text.length < prevRef.current.length) {
      el.innerHTML = "";
      prevRef.current = "";
    }
    if (text === prevRef.current) return;
    const renderer = RENDERERS[effect] || RENDERERS.token;
    const span = renderer(text, prevRef.current);
    if (span) el.appendChild(span);
    prevRef.current = text;
  }, [text, effect]);
  return <span ref={ref} style={{ whiteSpace:"pre-wrap", fontFamily: mono ? "var(--mono)" : undefined, fontSize: mono ? "14px" : undefined }}/>;
}

// ── bubble ──────────────────────────────────────────────────────
const STYLE = `
  .bub{ display:flex; flex-direction:column; gap:4px; }
  .bub-row{ display:flex; flex-direction:column; gap:4px; }
  .bub-q{
    align-self:flex-end; max-width:84%;
    background:var(--bubble-out); color:var(--bubble-out-fg);
    padding:9px 13px; border-radius:18px 18px 4px 18px;
    font-size:15px; line-height:1.45; letter-spacing:-0.005em;
    word-break:break-word; white-space:pre-wrap;
  }
  .bub-a{
    align-self:flex-start; max-width:88%;
    color:var(--ink); padding:2px 0;
    font-size:15px; line-height:1.5; letter-spacing:-0.005em;
    word-break:break-word; white-space:pre-wrap;
  }
  .bub-meta{
    font-family:var(--mono); font-size:10.5px; color:var(--mute);
    margin-left:2px; margin-top:-2px;
    display:inline-flex; gap:10px; align-items:center;
    letter-spacing:.02em; flex-wrap:wrap;
  }
  .bub-meta.right{ align-self:flex-end; margin-right:4px; }
  .bub-meta b{ color:var(--ink2); font-weight:600; }
  .bub-meta .dot{ width:3px; height:3px; border-radius:50%; background:var(--mute2); display:inline-block; }
  .bub-caret{
    display:inline-block; width:.5em; height:1em;
    background:var(--ink); vertical-align:-2px; margin-left:2px;
    animation:ts-blink 1s steps(2) infinite;
  }
`;

export function MessageBubble({ message, streamKind = "token", showCost = true, onLongPress }) {
  const ui = useUi();
  const lp = useLongPress(
    (e) => onLongPress && onLongPress({ messageId: message.id, x: e.x, y: e.y, target: e.target }),
    { delay: 420 }
  );

  if (message.role === "user") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div className="bub-row">
          <div className="bub-q">{message.text}</div>
          {showCost && message.cost !== undefined && (
            <div className="bub-meta right">
              <span><b>{(message.tokens ?? 0).toLocaleString("ru-RU")} ток</b></span>
            </div>
          )}
        </div>
      </>
    );
  }

  // assistant
  const effect = streamKind || ui.streamKind || "token";
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="bub-row" {...(message.role === "assistant" ? lp : {})}>
        <div className="bub-a" data-message-id={message.id}>
          {message.streaming
            ? <AssistantStreaming text={message.text} effect={effect} messageId={message.id} />
            : <span style={{ whiteSpace:"pre-wrap" }}>{message.text}</span>
          }
        </div>
        {showCost && message.cost !== undefined && !message.streaming && (
          <div className="bub-meta">
            <span><b>{message.cost.toFixed(4).replace(".", ",")} ₽</b></span>
            <span className="dot"/>
            <span>{message.tokens} ток</span>
            {message.modelId && <><span className="dot"/><span>{message.modelId}</span></>}
            {message.latency && <><span className="dot"/><span>{message.latency} ms</span></>}
          </div>
        )}
        {message.streaming && (
          <div className="bub-meta">
            <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", display:"inline-block", animation:"ts-pulse 1.4s ease-in-out infinite" }}/>
              streaming
            </span>
            <span className="dot"/>
            <span>{message.modelId}</span>
          </div>
        )}
      </div>
    </>
  );
}

function AssistantStreaming({ text, effect, messageId }){
  const dispatch = useDispatch();
  const { visible, isStreaming } = useStreamingMessage(text, { msPerChar: 12 });
  const finishedRef = useRef(false);
  useEffect(() => {
    if (!isStreaming && !finishedRef.current && visible === text) {
      finishedRef.current = true;
      dispatch({ type: "msg/finishStreaming", id: messageId });
    }
  }, [isStreaming, visible, text, messageId, dispatch]);
  return (
    <>
      <StreamedText text={visible} effect={effect} mono={effect === "phosphor"}/>
      {isStreaming && <span className="bub-caret"/>}
    </>
  );
}
