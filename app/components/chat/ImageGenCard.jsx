"use client";

// ImageGenCard.jsx — inline card that auto-progresses queued → 62% → done.
// Ported from screens-media.jsx ImageCard (3 phases). Drives phase via setState
// so it animates without needing reducer ticks.

import { useEffect, useState } from "react";
import { TSIcon } from "../../cabinet/foundation";

const STYLE = `
  .ig-wrap{ align-self:flex-start; max-width:92%; }
  .ig{
    width:320px; max-width:100%;
    border-radius:14px; overflow:hidden;
    background:var(--card); border:1px solid var(--line);
  }
  .ig-hd{
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 12px; border-bottom:1px solid var(--line);
  }
  .ig-hd .l{ display:flex; align-items:center; gap:8px; }
  .ig-hd .gly{
    width:22px; height:22px; border-radius:6px;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:700; font-size:10px;
  }
  .ig-hd .nm{ font-size:12.5px; font-weight:600; font-family:var(--mono); }
  .ig-hd .meta-info{ font-family:var(--mono); font-size:10.5px; color:var(--mute); }
  .ig-hd .phase{ font-family:var(--mono); font-size:10.5px; color:var(--mute); }
  .ig-hd .phase.done{ color:var(--ink); }

  .ig-canvas{ position:relative; width:100%; aspect-ratio:1/1; overflow:hidden; }
  .ig-phase1{
    position:absolute; inset:0; background:var(--skel);
    display:grid; place-items:center;
  }
  .ig-phase1::after{
    content:""; position:absolute; inset:0;
    background:linear-gradient(90deg, transparent 0%, rgba(var(--glow),.06) 50%, transparent 100%);
    background-size:200% 100%;
    animation:ts-shim 1.6s linear infinite;
  }
  .ig-phase1 .label{
    position:relative; z-index:1;
    font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.04em;
  }
  .ig-phase2 .top{
    position:absolute; inset:0;
    background:linear-gradient(135deg, #d8d2c0 0%, #8a8276 45%, #3a352c 100%);
  }
  .ig-phase2 .resolve{
    position:absolute; left:0; right:0; bottom:0; height:40%;
    background:var(--skel);
    mask:linear-gradient(to bottom, transparent 0%, black 30%);
    -webkit-mask:linear-gradient(to bottom, transparent 0%, black 30%);
  }
  .ig-phase2 .resolve::after{
    content:""; position:absolute; inset:0;
    background:linear-gradient(90deg, transparent 0%, rgba(var(--glow),.08) 50%, transparent 100%);
    background-size:200% 100%;
    animation:ts-shim 1.4s linear infinite;
  }
  .ig-phase3{
    position:absolute; inset:0;
    background:linear-gradient(160deg, #ddd5bf 0%, #a39d8b 30%, #5d574a 65%, #1e1c17 100%);
  }
  .ig-phase3 .moon{
    position:absolute; top:18%; left:62%;
    width:60px; height:60px; border-radius:50%;
    background:radial-gradient(circle, #f0ede4 0%, rgba(240,237,228,0) 70%);
    opacity:.7;
  }
  .ig-phase3 .horizon{
    position:absolute; left:8%; right:8%; bottom:30%; height:1px;
    background:#0c0c0c; opacity:.35;
  }

  .ig-progress{
    position:absolute; left:14px; right:14px; bottom:14px;
    height:5px; border-radius:3px; background:rgba(244,241,234,.18); overflow:hidden;
    backdrop-filter:blur(4px);
  }
  .ig-progress > i{
    display:block; height:100%; background:#f4f1ea; border-radius:3px;
    transition:width .8s ease;
  }

  .ig-foot{ padding:10px 12px; display:flex; flex-direction:column; gap:8px; }
  .ig-foot .prompt{ font-family:var(--mono); font-size:11px; color:var(--mute); line-height:1.4; }
  .ig-foot .actions{ display:flex; gap:6px; align-items:center; }
  .ig-foot .btn{
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    border-radius:10px; padding:8px 10px;
    font:600 12.5px var(--sans); cursor:pointer;
  }
  .ig-foot .btn.primary{ flex:1; background:var(--accent); color:var(--bubble-out-fg); border:0; }
  .ig-foot .btn.ghost{ background:transparent; border:1px solid var(--line); color:var(--ink); }
`;

export function ImageGenCard({ prompt = "ECM · ночь · плёнка", model = "dalle-4", glyph = "D4" }) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 2200);
    const t2 = setTimeout(() => setPhase(3), 5400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const badge =
    phase === 1 ? { t: "в очереди · 0:03 / ~0:24", done: false } :
    phase === 2 ? { t: "62 %  ·  0:14 / ~0:24",     done: false } :
                  { t: "готово · 0:22",              done: true };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ig-wrap">
        <div className="ig">
          <div className="ig-hd">
            <div className="l">
              <span className="gly">{glyph}</span>
              <span className="nm">{model}</span>
              <span className="meta-info">· 1024²</span>
            </div>
            {phase < 3
              ? <span className="phase"><span className="ts-live" style={{ fontSize: 10.5 }}>{badge.t}</span></span>
              : <span className="phase done">{badge.t}</span>}
          </div>

          <div className="ig-canvas">
            {phase === 1 && <div className="ig-phase1"><span className="label">подбираю композицию…</span></div>}
            {phase === 2 && (
              <div className="ig-phase2">
                <div className="top"/>
                <div className="resolve"/>
              </div>
            )}
            {phase === 3 && (
              <div className="ig-phase3">
                <div className="moon"/>
                <div className="horizon"/>
              </div>
            )}
            {phase < 3 && (
              <div className="ig-progress">
                <i style={{ width: phase === 1 ? "8%" : "62%" }}/>
              </div>
            )}
          </div>

          <div className="ig-foot">
            <div className="prompt">{prompt}</div>
            {phase === 3 && (
              <div className="actions">
                <button className="btn primary">{TSIcon.download({})} сохранить</button>
                <button className="btn ghost">{TSIcon.refresh({})} ещё</button>
                <button className="btn ghost">{TSIcon.share({})}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
