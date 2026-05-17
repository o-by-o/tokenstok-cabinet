"use client";

// MessageList.jsx — uses .ts-msgs from foundation (correct paddings/gap/typography)
// but overrides overflow to allow scroll. Auto-scroll-to-bottom on new message and
// while streaming.

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { useUi } from "../../lib/store";
import { timeOfDay } from "../../lib/utils";

const STYLE = `
  /* override .ts-msgs overflow:hidden so the chat actually scrolls */
  .ml-wrap .ts-msgs{ overflow-y:auto; overflow-x:hidden; flex:1 1 auto; min-height:0; scrollbar-width:none; }
  .ml-wrap .ts-msgs::-webkit-scrollbar{ display:none; }
  .ml-wrap{ flex:1 1 auto; display:flex; flex-direction:column; min-height:0; }

  /* Center the message column on wide screens (like ChatGPT/Claude) */
  .ml-wrap .ts-msgs{ padding-left:max(16px, calc((100% - 720px) / 2)); padding-right:max(16px, calc((100% - 720px) / 2)); }
`;

export function MessageList({ messages, onLongPress }) {
  const scrollRef = useRef(null);
  const lastLenRef = useRef(messages.length);
  const ui = useUi();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: messages.length > lastLenRef.current ? "smooth" : "auto" });
    lastLenRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (!last?.streaming) return;
    const id = setInterval(() => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }, 120);
    return () => clearInterval(id);
  }, [messages]);

  const dayStamp = messages.length > 0 ? timeOfDay(messages[0]?.ts) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ml-wrap">
        <div className="ts-msgs" ref={scrollRef}>
          {dayStamp && (
            <div style={{ textAlign:"center", fontFamily:"var(--mono)", fontSize:11, color:"var(--mute)", margin:"2px 0 4px", letterSpacing:".04em" }}>
              сегодня · {dayStamp}
            </div>
          )}
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
