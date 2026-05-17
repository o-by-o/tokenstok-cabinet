"use client";

// CompareView.jsx — ported from screens-features.jsx ScreenCompare.
// Prompt card + 2 column responses (both streaming) + winner picker.

import Link from "next/link";
import { useState } from "react";
import { TSIcon } from "../../cabinet/foundation";
import { useUi } from "../../lib/store";
import { useStreamingMessage } from "../../lib/streaming";

const STYLE = `
  .cv-screen{ flex:1; min-height:0; display:flex; flex-direction:column; background:var(--bg); height:100dvh; }
  .cv-hd{
    padding:8px 16px 6px;
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    position:sticky; top:0; background:var(--bg); z-index:5;
    border-bottom:1px solid var(--line);
  }
  .cv-hd .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .cv-hd .title{ text-align:center; }
  .cv-hd .title b{ font-size:14px; font-weight:700; letter-spacing:-0.01em; }
  .cv-hd .title .s{ font-family:var(--mono); font-size:10.5px; color:var(--mute); }
  .cv-prompt{ padding:14px 16px 10px; max-width:920px; margin:0 auto; width:100%; }
  .cv-prompt .card{
    background:var(--chip); border-radius:12px;
    padding:10px 14px; font-size:14px; line-height:1.45; color:var(--ink);
    letter-spacing:-0.005em;
  }
  .cv-prompt .meta{
    display:flex; justify-content:space-between;
    margin-top:6px; font-family:var(--mono); font-size:10.5px; color:var(--mute);
  }
  .cv-cols{
    flex:1; overflow:hidden; padding:0 14px 8px;
    display:grid; grid-template-columns:1fr 1fr; gap:8px;
    max-width:920px; margin:0 auto; width:100%;
  }
  .cv-col{ display:flex; flex-direction:column; gap:6px; min-height:0; }
  .cv-col-hd{
    display:flex; align-items:center; gap:6px;
    padding:7px 10px; background:var(--card); border:1px solid var(--line); border-radius:10px;
  }
  .cv-col-hd .gly{
    width:20px; height:20px; border-radius:5px;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center; font-family:var(--mono); font-weight:700; font-size:9.5px;
  }
  .cv-col-hd .nm{ flex:1; font-size:12.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cv-col-body{
    flex:1; overflow-y:auto; padding:10px 12px;
    background:var(--card); border:1px solid var(--line); border-radius:10px;
    font-family:var(--mono); font-size:11.5px; line-height:1.55; color:var(--ink);
    scrollbar-width:none;
  }
  .cv-col-body::-webkit-scrollbar{ display:none; }
  .cv-col-body .mute{ color:var(--mute); }
  .cv-col-body .explain{
    color:var(--ink2); margin-top:8px; font-family:var(--sans); font-size:11.5px; line-height:1.45;
  }
  .cv-col-foot{
    display:flex; justify-content:space-between; font-family:var(--mono); font-size:10px; color:var(--mute);
  }
  .cv-pick{
    padding:8px 16px 12px;
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    border-top:1px solid var(--line);
    max-width:920px; margin:0 auto; width:100%;
  }
  .cv-pick .lbl{ font-family:var(--mono); font-size:11px; color:var(--mute); }
  .cv-pick .btns{ display:flex; gap:6px; }
  .cv-pick button{
    border-radius:10px; padding:7px 12px;
    font-family:var(--sans); font-weight:600; font-size:12px; cursor:pointer;
    display:inline-flex; align-items:center; gap:6px;
  }
  .cv-pick button.win{ background:var(--ink); color:var(--bubble-out-fg); border:0; }
  .cv-pick button.alt{ background:transparent; color:var(--ink); border:1px solid var(--line); }
`;

const A_TEXT = "Go проще, gc, без сложных типов. Rust строже — но безопаснее на памяти.";
const B_TEXT = "Go — про скорость разработки. Rust — про предсказуемую память.";

function ColAnswer({ text }) {
  const { visible } = useStreamingMessage(text, { msPerChar: 18 });
  return <span style={{ whiteSpace: "pre-wrap" }}>{visible}</span>;
}

export function CompareView() {
  const ui = useUi();
  const [winner, setWinner] = useState("sonnet");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cv-screen">
        <header className="cv-hd">
          <Link href="/chat" className="icobtn" aria-label="назад">{TSIcon.back({})}</Link>
          <div className="title">
            <b>Сравнение</b>
            <div className="s">1 промт · 2 модели</div>
          </div>
          <button className="icobtn" aria-label="ещё модель">{TSIcon.plus({})}</button>
        </header>

        <div className="cv-prompt">
          <div className="card">
            Напиши hello-world на go и rust, объясни разницу в одном абзаце.
          </div>
          <div className="meta">
            <span>43 ток</span><span>0,0008 ₽ × 2 модели</span>
          </div>
        </div>

        <div className="cv-cols">
          <div className="cv-col">
            <div className="cv-col-hd">
              <span className="gly">CL</span>
              <span className="nm" style={{ fontFamily: "var(--mono)" }}>claude-sonnet-4.5</span>
              <span className="ts-live" style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--mute)" }}>1.4s</span>
            </div>
            <div className="cv-col-body no-scroll-bars">
              <div className="mute">{'// go'}</div>
              <div>{'package main'}</div>
              <div>{'func main(){'}</div>
              <div>{'  fmt.Println('}</div>
              <div>{'  "hi")}'}</div>
              <div className="mute" style={{ marginTop: 6 }}>{'// rust'}</div>
              <div>{'fn main(){'}</div>
              <div>{'  println!("hi");'}</div>
              <div>{'}'}</div>
              <div className="explain"><ColAnswer text={A_TEXT}/></div>
            </div>
            <div className="cv-col-foot">
              <span><b className="num" style={{ color: "var(--ink2)", fontWeight: 600 }}>0,0064 ₽</b></span>
              <span>142 ток</span>
            </div>
          </div>

          <div className="cv-col">
            <div className="cv-col-hd">
              <span className="gly">G5</span>
              <span className="nm" style={{ fontFamily: "var(--mono)" }}>gpt-5</span>
              <span className="ts-live" style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--mute)" }}>1.8s</span>
            </div>
            <div className="cv-col-body no-scroll-bars">
              <div className="mute">{'// go'}</div>
              <div>{'package main'}</div>
              <div>{'import "fmt"'}</div>
              <div>{'func main(){'}</div>
              <div>{'  fmt.Println('}</div>
              <div>{'   "hello")'}</div>
              <div>{'}'}</div>
              <div className="mute" style={{ marginTop: 4 }}>{'// rust'}</div>
              <div>{'fn main(){'}</div>
              <div>{'  println!('}</div>
              <div>{'   "hello");'}</div>
              <div>{'}'}</div>
              <div className="explain"><ColAnswer text={B_TEXT}/></div>
            </div>
            <div className="cv-col-foot">
              <span><b className="num" style={{ color: "var(--ink2)", fontWeight: 600 }}>0,0124 ₽</b></span>
              <span>167 ток</span>
            </div>
          </div>
        </div>

        <div className="cv-pick">
          <span className="lbl">выбери победителя:</span>
          <div className="btns">
            <button className={winner === "sonnet" ? "win" : "alt"} onClick={() => setWinner("sonnet")}>
              {TSIcon.check({})} sonnet
            </button>
            <button className={winner === "gpt-5" ? "win" : "alt"} onClick={() => setWinner("gpt-5")}>
              gpt-5
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
