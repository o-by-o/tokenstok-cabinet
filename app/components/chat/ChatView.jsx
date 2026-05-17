"use client";

// ChatView.jsx — orchestrates a single chat: header + (empty | list) + composer
// + the sheets that float on top (model picker, voice, long-press menu).

import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { EmptyChat } from "./EmptyChat";
import { Composer } from "./Composer";
import { ModelPickerSheet } from "../sheets/ModelPickerSheet";
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cv">
        <ChatHeader/>
        {empty
          ? <div style={{ flex:1, overflowY:"auto" }} className="no-scroll-bars"><EmptyChat/></div>
          : <MessageList messages={chat.messages} onLongPress={setLongPress}/>
        }
        <Composer/>
      </div>

      {ui.sheet === "picker" && (
        <ModelPickerSheet onClose={() => dispatch({ type: "ui/openSheet", sheet: null })} />
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
