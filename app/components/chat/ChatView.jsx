"use client";

// ChatView.jsx — orchestrates a single chat: header + (empty | list) + composer
// + the sheets that float on top (model picker, voice, long-press menu).
//
// Real-stream effect: watches for a new "empty + streaming:true" assistant
// message at the tail of the chat. When it appears, fetch /api/chat with the
// full message history → read the plain-text stream → dispatch chunks until
// EOF, then finishStreaming. Errors fall back to a message-level error.

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { EmptyChat } from "./EmptyChat";
import { Composer } from "./Composer";
import { ModelPickerSheet } from "../sheets/ModelPickerSheet";
import { VoiceInputSheet } from "../sheets/VoiceInputSheet";
import { LongPressMenu } from "../sheets/LongPressMenu";
import { useCurrentChat, useUi, useDispatch } from "../../lib/store";

const STYLE = `
  .cv{
    flex:1; display:flex; flex-direction:column; min-height:0;
    background:var(--bg);
    height:100dvh;
  }
`;

export function ChatView() {
  const chat = useCurrentChat();
  const ui = useUi();
  const dispatch = useDispatch();
  const [longPress, setLongPress] = useState(null);
  const empty = !chat || chat.messages.length === 0;

  // Stream effect: handle empty streaming-assistant messages.
  // We track which message we've already started streaming so we don't fire
  // duplicate requests (e.g. when chat state churns from cost meta updates).
  const startedRef = useRef(new Set());
  useEffect(() => {
    if (!chat || chat.messages.length === 0) return;
    const last = chat.messages[chat.messages.length - 1];
    if (last.role !== "assistant" || !last.streaming || last.text !== "") return;
    if (startedRef.current.has(last.id)) return;
    startedRef.current.add(last.id);

    // Build UIMessage[] from the chat history (excluding the empty placeholder)
    const uiMessages = chat.messages
      .slice(0, -1)
      .filter((m) => m.role === "user" || (m.role === "assistant" && !m.streaming && m.text))
      .map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.text }],
      }));

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: uiMessages, modelId: chat.modelId }),
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 402) {
            // Нет денег на балансе — показываем CTA на пополнение.
            const body = await res.json().catch(() => ({}));
            const msg = body?.message ||
              "На балансе закончились средства. Пополните кошелёк, чтобы продолжить.";
            dispatch({ type: "msg/streamFail", id: last.id, text: msg, cta: "topup" });
            return;
          }
          let msg = `Ошибка ${res.status}`;
          try { const e = await res.json(); if (e?.error) msg = e.error; } catch {}
          dispatch({ type: "msg/streamFail", id: last.id, text: msg });
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) dispatch({ type: "msg/streamChunk", id: last.id, chunk });
        }
        dispatch({ type: "msg/finishStreaming", id: last.id });
        // После закрытия стрима — подтянуть актуальный баланс.
        try {
          const b = await fetch("/api/me/balance").then((r) => r.json());
          if (b?.balance != null) dispatch({ type: "wallet/balance", value: String(b.balance) });
        } catch { /* ignore */ }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("[chat] stream failed", err);
        dispatch({ type: "msg/streamFail", id: last.id, text: "Сеть упала. Попробуй ещё раз." });
      }
    })();

    return () => controller.abort();
  }, [chat, dispatch]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cv">
        <ChatHeader/>
        {empty
          ? <div style={{ flex:1, overflowY:"auto" }} className="no-scroll-bars"><EmptyChat/></div>
          : <MessageList messages={chat.messages} onLongPress={setLongPress}/>
        }
        <Composer onVoice={() => dispatch({ type: "ui/openSheet", sheet: "voice" })}/>
      </div>

      {ui.sheet === "picker" && (
        <ModelPickerSheet onClose={() => dispatch({ type: "ui/openSheet", sheet: null })} />
      )}
      {ui.sheet === "voice" && (
        <VoiceInputSheet onClose={() => dispatch({ type: "ui/openSheet", sheet: null })} />
      )}

      {longPress && (
        <LongPressMenu
          info={longPress}
          chat={chat}
          onClose={() => setLongPress(null)}
        />
      )}
    </>
  );
}
