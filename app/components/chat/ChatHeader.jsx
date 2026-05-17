"use client";

// ChatHeader.jsx — uses .ts-head + .ts-modelpill from cabinet/foundation.js.
// Both hamburger and "left-spacer" are in the DOM unconditionally; CSS media
// queries decide which is visible — same DOM on SSR and client → no hydration
// mismatch.

import { TSIcon } from "../../cabinet/foundation";
import { TS_MODELS } from "../../cabinet/data";
import { useCurrentChat, useDispatch, useApp } from "../../lib/store";

const STYLE = `
  .ch-wrap{ position:sticky; top:0; z-index:5; }
  .ch-wrap .left-mobile{ display:flex; }
  .ch-wrap .left-spacer{ display:none; }
  @media (min-width: 1024px){
    .ch-wrap .ts-head{ grid-template-columns:1fr auto 36px; padding:14px 18px 14px; }
    .ch-wrap .left-mobile{ display:none; }
    .ch-wrap .left-spacer{ display:block; }
  }
  .ch-wrap .ts-modelpill{ max-width:260px; }
`;

export function ChatHeader() {
  const dispatch = useDispatch();
  const chat = useCurrentChat();
  const { state } = useApp();
  const modelId = chat?.modelId || state.models.currentId;
  const model = TS_MODELS.find((m) => m.id === modelId);

  const newChat = () => dispatch({ type: "chat/new" });
  const openPicker = () => dispatch({ type: "ui/openSheet", sheet: "picker" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ch-wrap">
        <div className="ts-head">
          <button className="ico-btn left-mobile" aria-label="меню" onClick={() => dispatch({ type: "ui/setSidebar", open: true })}>
            {TSIcon.burger({})}
          </button>
          <span className="left-spacer" />
          <button className="ts-modelpill" onClick={openPicker} aria-label="выбрать модель">
            <span className="glyph">{model?.glyph}</span>
            <span className="nm" style={{ fontFamily: "var(--mono)", fontWeight: 500, fontSize: 12.5 }}>{model?.id}</span>
            {model?.vendor && <small>· {model.vendor}</small>}
            <span className="chev">{TSIcon.chev({})}</span>
          </button>
          <button className="ico-btn" aria-label="новый чат" onClick={newChat}>
            {TSIcon.plus({})}
          </button>
        </div>
      </div>
    </>
  );
}
