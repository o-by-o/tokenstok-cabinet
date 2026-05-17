"use client";

// MessageBubble.jsx — uses .ts-q / .ts-a / .ts-meta / .ts-caret from
// cabinet/foundation.js so visual language matches the mockup verbatim.
//
// User side meta = ₽ + ток + model (right-aligned, mono small)
// Assistant side meta = ₽ + ток + model + latency (left-aligned)
// Assistant streaming meta = ts-live pulse + ₽ + ток + ms

import { useEffect, useRef } from "react";
import { useUi, useDispatch } from "../../lib/store";
import { useStreamingMessage } from "../../lib/streaming";
import { useLongPress } from "../../lib/hooks";
import { LimitCard } from "./LimitCard";

// ── per-token DOM renderers (one-shot streaming variants from the design)
function renderTokenSpan(text, prev) {
  const added = text.slice(prev.length);
  if (!added) return null;
  const span = document.createElement("span");
  span.textContent = added;
  span.style.cssText = "background:var(--chip);color:var(--ink);border-radius:2px;transition:background .35s ease;";
  requestAnimationFrame(() => { span.style.background = "transparent"; });
  return span;
}
function renderPopWords(text, prev) {
  const tail = text.slice(prev.length);
  if (!tail) return null;
  const span = document.createElement("span");
  span.textContent = tail;
  span.style.cssText = "display:inline;white-space:pre-wrap;opacity:0;transform:translateY(4px);transition:opacity .26s ease, transform .26s ease;";
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

const RENDERERS = { token: renderTokenSpan, pop: renderPopWords, blur: renderBlurSpan, phosphor: renderPhosphorChars };

function StreamedText({ text, effect = "token", mono = false }) {
  const ref = useRef(null);
  const prevRef = useRef("");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (text.length < prevRef.current.length) { el.innerHTML = ""; prevRef.current = ""; }
    if (text === prevRef.current) return;
    const renderer = RENDERERS[effect] || RENDERERS.token;
    const span = renderer(text, prevRef.current);
    if (span) el.appendChild(span);
    prevRef.current = text;
  }, [text, effect]);
  return <span ref={ref} style={{ whiteSpace: "pre-wrap", fontFamily: mono ? "var(--mono)" : undefined, fontSize: mono ? "14px" : undefined }}/>;
}

// ── cost meta rendering (matches the mockup: ₽ + ток + model on both sides)
function CostMeta({ message, right }) {
  if (message.cost === undefined) return null;
  const rub = message.cost.toFixed(4).replace(".", ",");
  return (
    <div className={`ts-meta ${right ? "right" : ""}`}>
      <span><b className="num">{rub} ₽</b></span>
      <span className="dot"/>
      <span className="num">{message.tokens} ток</span>
      {message.modelId && <><span className="dot"/><span>{message.modelId}</span></>}
      {!right && message.latency && <><span className="dot"/><span>{message.latency} ms</span></>}
    </div>
  );
}

export function MessageBubble({ message, streamKind = "token", showCost = true, onLongPress }) {
  const ui = useUi();
  const lp = useLongPress(
    (e) => onLongPress && onLongPress({ messageId: message.id, x: e.x, y: e.y, target: e.target }),
    { delay: 420 }
  );

  if (message.role === "user") {
    return (
      <>
        <div className="ts-q">{message.text}</div>
        {showCost && <CostMeta message={message} right={true} />}
      </>
    );
  }

  // limit card replaces the normal assistant bubble when wallet was empty
  if (message.type === "limit") {
    return <LimitCard message={message} />;
  }

  // assistant
  const effect = streamKind || ui.streamKind || "token";
  return (
    <>
      <div className="ts-a" data-message-id={message.id} {...lp}>
        {message.streaming
          ? <AssistantStreaming text={message.text} effect={effect} messageId={message.id} />
          : <span style={{ whiteSpace: "pre-wrap" }}>{message.text}</span>
        }
      </div>
      {showCost && !message.streaming && <CostMeta message={message} right={false} />}
      {message.streaming && (
        <div className="ts-meta">
          <span className="ts-live">streaming</span>
          <span className="dot"/>
          <span><b className="num">{message.cost?.toFixed(4).replace(".", ",")} ₽</b></span>
          <span className="dot"/>
          <span className="num">{message.tokens} ток</span>
          {message.latency && <><span className="dot"/><span>{message.latency} ms</span></>}
        </div>
      )}
    </>
  );
}

function AssistantStreaming({ text, effect, messageId }) {
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
      {isStreaming && <span className="ts-caret"/>}
    </>
  );
}
