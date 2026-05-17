"use client";

// VideoGenCard.jsx — inline video render card with step log + spend counter.
// Ported from screens-media.jsx ScreenVideoGen.

import { TSIcon } from "../../cabinet/foundation";

const STYLE = `
  .vg-wrap{ align-self:flex-start; max-width:92%; width:92%; }
  .vg{
    border-radius:14px; overflow:hidden;
    background:var(--card); border:1px solid var(--line);
  }
  .vg-hd{
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 12px; border-bottom:1px solid var(--line);
  }
  .vg-hd .l{ display:flex; align-items:center; gap:8px; }
  .vg-hd .gly{
    width:22px; height:22px; border-radius:6px;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:700; font-size:10px;
  }
  .vg-hd .nm{ font-size:12.5px; font-weight:600; font-family:var(--mono); }
  .vg-hd .meta-info{ font-family:var(--mono); font-size:10.5px; color:var(--mute); }
  .vg-hd .live{ font-size:10.5px; font-family:var(--mono); color:var(--mute); }

  .vg-canvas{ position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; }
  .vg-canvas .bg{
    position:absolute; inset:0;
    background:linear-gradient(180deg, #b8a98a 0%, #7a6a4e 40%, #3a3120 100%);
    filter:blur(14px); transform:scale(1.05);
  }
  .vg-canvas .vignette{
    position:absolute; inset:0;
    background:radial-gradient(ellipse at 50% 65%, rgba(0,0,0,0) 0%, rgba(0,0,0,.4) 100%);
  }
  .vg-canvas .frames{
    position:absolute; left:14px; right:14px; bottom:14px;
    display:flex; gap:3px; align-items:flex-end;
  }
  .vg-canvas .frames i{ flex:1; border-radius:1px; }
  .vg-canvas .phase{
    position:absolute; left:14px; top:14px;
    font-family:var(--mono); font-size:10.5px; color:rgba(244,241,234,.85); letter-spacing:.04em;
    text-shadow:0 1px 4px rgba(0,0,0,.4);
  }

  .vg-steps{
    padding:10px 12px; display:flex; flex-direction:column; gap:6px;
    font-family:var(--mono); font-size:11px; line-height:1.5;
  }
  .vg-step{
    display:flex; align-items:center; gap:8px;
  }
  .vg-step.pending{ color:var(--mute); }
  .vg-step .dot{
    width:10px; height:10px; border-radius:50%;
    border:1px solid var(--ink);
    display:grid; place-items:center;
    flex-shrink:0;
  }
  .vg-step.ok .dot{ background:var(--ink); }
  .vg-step.live .dot::after{
    content:""; width:4px; height:4px; border-radius:50%;
    background:var(--ink);
    animation:ts-pulse 1.4s ease-in-out infinite;
  }
  .vg-step .t{ flex:1; }
  .vg-step .c{ color:var(--ink2); }
  .vg-step.pending .c{ color:var(--mute); }

  .vg-totals{
    padding:10px 12px; border-top:1px solid var(--line);
    display:flex; justify-content:space-between; align-items:center;
    font-family:var(--mono); font-size:11px; color:var(--mute);
  }
  .vg-totals b{ color:var(--ink2); font-weight:600; }
  .vg-totals button{
    background:transparent; border:1px solid var(--line); border-radius:8px;
    padding:5px 10px; font-family:var(--mono); font-size:11px; color:var(--ink2); cursor:pointer;
  }
`;

const STEPS = [
  { t: "разбор промпта",  status: "ok",      c: "0,42 ₽" },
  { t: "движение и свет", status: "ok",      c: "2,18 ₽" },
  { t: "рендер кадров",   status: "live",    c: "24,40 ₽" },
  { t: "апскейл 720p",    status: "pending", c: "~ 6,80 ₽" },
];

export function VideoGenCard() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="vg-wrap">
        <div className="vg">
          <div className="vg-hd">
            <div className="l">
              <span className="gly">S2</span>
              <span className="nm">sora-2</span>
              <span className="meta-info">· 5 сек · 720p</span>
            </div>
            <span className="live"><span className="ts-live">рендер · ~1:40 осталось</span></span>
          </div>

          <div className="vg-canvas">
            <div className="bg"/>
            <div className="vignette"/>
            <div className="frames">
              {Array.from({ length: 24 }).map((_, i) => (
                <i key={i} style={{
                  height: 4 + (i % 5) * 1.2,
                  background: i < 14 ? "#f4f1ea" : "rgba(244,241,234,.22)",
                }}/>
              ))}
            </div>
            <div className="phase">кадр 14 / 24 · 58 %</div>
          </div>

          <div className="vg-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`vg-step ${s.status}`}>
                <span className="dot"/>
                <span className="t">{s.t}</span>
                <span className="c">{s.c}</span>
              </div>
            ))}
          </div>

          <div className="vg-totals">
            <span>уже потрачено · <b>27,00 ₽</b></span>
            <button>отменить</button>
          </div>
        </div>
      </div>
    </>
  );
}
