"use client";

// ChatHeader.jsx — top bar inside the chat view. Mobile gets the hamburger,
// model pill (opens picker), and "new chat" button. Desktop hides hamburger.

import { TSIcon } from "../../cabinet/foundation";
import { TS_MODELS } from "../../cabinet/data";
import { useCurrentChat, useUi, useDispatch, useApp } from "../../lib/store";
import { useBreakpoint } from "../../lib/hooks";

const STYLE = `
  .ch{
    flex:0 0 auto; padding:10px 12px 12px;
    display:grid; grid-template-columns:36px 1fr 36px; align-items:center; gap:8px;
    border-bottom:1px solid var(--line); background:var(--bg);
    position:sticky; top:0; z-index:5;
  }
  @media (min-width: 768px){
    .ch{ padding:12px 18px 14px; grid-template-columns:1fr auto 36px; }
  }
  .ch .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .ch .icobtn:hover{ background:var(--chip); }
  .ch-title{
    display:none;
    font-size:14px; font-weight:700; letter-spacing:-0.01em;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  @media (min-width: 768px){ .ch-title{ display:block; } }
  .ch-pill{
    justify-self:center;
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 12px 6px 6px;
    border:1px solid var(--line); border-radius:999px;
    background:var(--card);
    font:600 13px var(--sans);
    cursor:pointer; max-width:230px;
  }
  .ch-pill:hover{ border-color:var(--ink2); }
  .ch-pill .gly{
    width:24px; height:24px; border-radius:50%;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:600; font-size:10px; color:var(--ink);
  }
  .ch-pill .nm{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ch-pill small{ color:var(--mute); font-weight:500; font-size:11px; font-family:var(--mono); }
`;

export function ChatHeader() {
  const dispatch = useDispatch();
  const chat = useCurrentChat();
  const { state } = useApp();
  const bp = useBreakpoint();
  const modelId = chat?.modelId || state.models.currentId;
  const model = TS_MODELS.find((m) => m.id === modelId);

  const newChat = () => dispatch({ type: "chat/new" });
  const openPicker = () => dispatch({ type: "ui/openSheet", sheet: "picker" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <header className="ch">
        {bp.isMobile ? (
          <button className="icobtn" aria-label="меню" onClick={() => dispatch({ type: "ui/setSidebar", open: true })}>
            {TSIcon.burger({})}
          </button>
        ) : (
          <div className="ch-title">{chat?.title || "Новый чат"}</div>
        )}
        <button className="ch-pill" onClick={openPicker} aria-label="выбрать модель">
          <span className="gly">{model?.glyph}</span>
          <span className="nm">{model?.name}</span>
          {model?.vendor && <small>· {model.vendor}</small>}
          <span style={{ color:"var(--mute)" }}>{TSIcon.chev({})}</span>
        </button>
        <button className="icobtn" aria-label="новый чат" onClick={newChat}>
          {TSIcon.plus({})}
        </button>
      </header>
    </>
  );
}
