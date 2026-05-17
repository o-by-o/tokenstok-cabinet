"use client";

// MessageList.jsx — scroll container + auto-scroll-to-bottom on new message
// or streaming update.

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { useUi, useDispatch } from "../../lib/store";
import { timeOfDay } from "../../lib/utils";

const STYLE = `
  .ml{ flex:1 1 auto; overflow-y:auto; overflow-x:hidden; padding:14px 16px; }
  .ml-inner{ max-width:760px; margin:0 auto; display:flex; flex-direction:column; gap:14px; }
  .ml-day{ text-align:center; font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.04em; padding:2px 0 4px; }
`;

export function MessageList({ messages, onLongPress }) {
  const scrollRef = useRef(null);
  const lastLenRef = useRef(messages.length);
  const ui = useUi();

  // auto-scroll on new message
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: messages.length > lastLenRef.current ? "smooth" : "auto" });
    lastLenRef.current = messages.length;
  }, [messages.length]);

  // also keep scrolled to bottom while streaming
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (!last?.streaming) return;
    const id = setInterval(() => {
      // only auto-scroll if user hasn't scrolled up
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }, 120);
    return () => clearInterval(id);
  }, [messages]);

  const showDay = messages.length > 0 ? timeOfDay(messages[0]?.ts) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ml no-scroll-bars" ref={scrollRef}>
        <div className="ml-inner">
          {showDay && <div className="ml-day">сегодня · {showDay}</div>}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              streamKind={ui.streamKind}
              showCost={ui.showCost}
              onLongPress={onLongPress}
            />
          ))}
        </div>
      </div>
    </>
  );
}
