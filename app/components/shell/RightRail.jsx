"use client";

// RightRail.jsx — wide-screen context rail.
// Shows: current model card, recent prompts in this chat, today's spend.

import { TSIcon } from "../../cabinet/foundation";
import { TS_MODELS } from "../../cabinet/data";
import { useCurrentChat, useApp } from "../../lib/store";
import { fmtRub, fmtRubFine } from "../../lib/utils";

const STYLE = `
  .rr{ display:flex; flex-direction:column; gap:14px; height:100%; min-height:0; }
  .rr-section{
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    padding:12px 14px;
  }
  .rr-title{ font-family:var(--mono); font-size:10px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; margin-bottom:8px; }
  .rr-model{ display:flex; align-items:flex-start; gap:10px; }
  .rr-model .gly{
    width:36px; height:36px; border-radius:8px;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:700; font-size:12px;
  }
  .rr-model .nm{ font-size:14px; font-weight:700; letter-spacing:-0.01em; }
  .rr-model .v{ font-family:var(--mono); font-size:11px; color:var(--mute); }
  .rr-model .pr{ margin-top:6px; font-family:var(--mono); font-size:11.5px; color:var(--ink2); }
  .rr-prompts{ display:flex; flex-direction:column; gap:6px; }
  .rr-prompts .row{
    padding:8px 10px; border-radius:8px;
    background:var(--bg); border:1px solid var(--line);
    font-size:12.5px; color:var(--ink2); line-height:1.4;
    overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  }
  .rr-prompts .row .role{ font-family:var(--mono); font-size:10px; color:var(--mute); display:block; margin-bottom:2px; letter-spacing:.04em; text-transform:uppercase; }
  .rr-spend{
    display:flex; justify-content:space-between; align-items:baseline;
    font-family:var(--mono); font-size:12px; color:var(--mute);
  }
  .rr-spend b{ font-size:18px; color:var(--ink); font-weight:700; }
  .rr-empty{ color:var(--mute); font-size:13px; padding:4px 0; }
`;

export function RightRail() {
  const chat = useCurrentChat();
  const { state } = useApp();
  const model = TS_MODELS.find((m) => m.id === (chat?.modelId || state.models.currentId));

  const lastPrompts = (chat?.messages || []).slice(-6).filter((m) => m.role === "user").slice(-3);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="rr">
        <div className="rr-section">
          <div className="rr-title">модель</div>
          <div className="rr-model">
            <span className="gly">{model?.glyph}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="nm" style={{ fontFamily:"var(--mono)", fontWeight:600, fontSize:13.5, letterSpacing:0 }}>{model?.id}</div>
              <div className="v">{model?.vendor}{model?.tag ? ` · ${model.tag}` : ""}</div>
              <div className="pr">{model?.price} · {model?.unit}</div>
            </div>
          </div>
        </div>

        <div className="rr-section">
          <div className="rr-title">последние промты в чате</div>
          <div className="rr-prompts">
            {lastPrompts.length === 0 && <div className="rr-empty">Пока пусто — задай вопрос ниже.</div>}
            {lastPrompts.map((m) => (
              <div key={m.id} className="row">
                <span className="role">ты</span>
                {m.text}
              </div>
            ))}
          </div>
        </div>

        <div className="rr-section">
          <div className="rr-title">сегодня</div>
          <div className="rr-spend">
            <span>израсходовано</span>
            <b>{fmtRub(state.wallet.todaySpend)}</b>
          </div>
          <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid var(--line)", display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:11, color:"var(--mute)" }}>
            <span>остаток</span>
            <b style={{ color:"var(--ink)", fontWeight:600 }}>{fmtRub(state.wallet.balance)}</b>
          </div>
        </div>

        <div style={{ flex:1 }}/>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"var(--mono)", fontSize:11, color:"var(--mute)", padding:"8px 0" }}>
          {TSIcon.check({ width: 12, height: 12 })}
          <span>оплата по факту · без подписок</span>
        </div>
      </div>
    </>
  );
}
