"use client";

// LibraryView.jsx — ported from screens-features.jsx ScreenLibrary.

import Link from "next/link";
import { TSIcon } from "../../cabinet/foundation";
import { TS_PROMPTS_LIB } from "../../cabinet/data";

const STYLE = `
  .lv{ flex:1; min-height:0; display:flex; flex-direction:column; background:var(--bg); height:100dvh; }
  .lv-hd{
    padding:8px 16px 6px;
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    position:sticky; top:0; background:var(--bg); z-index:5;
    border-bottom:1px solid var(--line);
  }
  .lv-hd .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .lv-hd .lbl{ font-family:var(--mono); font-size:11.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; }
  .lv-hero{ padding:12px 18px 6px; max-width:760px; margin:0 auto; width:100%; }
  .lv-hero h2{ margin:0; font-size:26px; font-weight:800; letter-spacing:-0.025em; line-height:1.05; }
  @media (min-width: 768px){ .lv-hero h2{ font-size:32px; } }
  .lv-hero p{ margin:6px 0 0; font-size:13.5px; color:var(--mute); line-height:1.45; }
  .lv-search{ padding:14px 16px 8px; max-width:760px; margin:0 auto; width:100%; }
  .lv-search-row{
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:14px;
    background:var(--chip); border:1px solid var(--line);
    color:var(--mute); font-size:13.5px;
  }
  .lv-tags{ padding:4px 16px 6px; display:flex; gap:6px; overflow-x:auto; max-width:760px; margin:0 auto; width:100%; scrollbar-width:none; }
  .lv-tags::-webkit-scrollbar{ display:none; }
  .lv-list{
    flex:1; min-height:0; overflow-y:auto;
    padding:8px 16px 16px;
    max-width:760px; margin:0 auto; width:100%;
    display:flex; flex-direction:column; gap:8px;
  }
  .lv-card{
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    padding:12px 14px;
    display:flex; flex-direction:column; gap:6px;
  }
  .lv-card-hd{
    display:flex; align-items:center; justify-content:space-between; gap:8px;
  }
  .lv-card-hd .ttl{
    display:flex; align-items:center; gap:8px; min-width:0;
    font-size:14px; font-weight:700; letter-spacing:-0.01em;
  }
  .lv-card-hd .ttl span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lv-card-hd .tag{
    font-family:var(--mono); font-size:10px; color:var(--mute);
    padding:2px 7px; border:1px solid var(--line); border-radius:999px;
    flex-shrink:0;
  }
  .lv-preview{ font-family:var(--mono); font-size:11.5px; color:var(--mute); line-height:1.4; }
  .lv-foot{
    display:flex; justify-content:space-between; align-items:center;
    padding-top:6px; border-top:1px dashed var(--line);
  }
  .lv-foot .uses{ font-family:var(--mono); font-size:10.5px; color:var(--mute); }
  .lv-foot button{
    background:transparent; border:1px solid var(--line); border-radius:8px;
    padding:4px 10px; font-family:var(--sans); font-size:12px; font-weight:600; color:var(--ink); cursor:pointer;
    display:inline-flex; align-items:center; gap:6px;
  }
  .lv-foot button:hover{ background:var(--chip); }
`;

const TAGS = ["Все · 28", "Текст · 14", "Картинка · 6", "Код · 5", "Жизнь · 3"];

export function LibraryView() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="lv">
        <header className="lv-hd">
          <Link href="/chat" className="icobtn" aria-label="назад">{TSIcon.back({})}</Link>
          <span className="lbl">промпт-библиотека</span>
          <button className="icobtn" aria-label="новый шаблон">{TSIcon.plus({})}</button>
        </header>

        <div className="lv-hero">
          <h2>Твои шаблоны.</h2>
          <p>Сохрани удачный промт, дай ему имя — используй одним тапом.</p>
        </div>

        <div className="lv-search">
          <div className="lv-search-row">
            {TSIcon.search({})}
            <span>поиск по 28 шаблонам…</span>
          </div>
        </div>

        <div className="lv-tags no-scroll-bars">
          {TAGS.map((t, i) => (
            <span key={i} className={`ts-chip ${i === 0 ? "active" : ""}`}>{t}</span>
          ))}
        </div>

        <div className="lv-list no-scroll-bars">
          {TS_PROMPTS_LIB.map((p) => (
            <div key={p.id} className="lv-card">
              <div className="lv-card-hd">
                <div className="ttl">
                  <span style={{ color: "var(--ink)" }}>{TSIcon.star({ width: 11, height: 11 })}</span>
                  <span>{p.title}</span>
                </div>
                <span className="tag">{p.tag}</span>
              </div>
              <div className="lv-preview">{p.preview}</div>
              <div className="lv-foot">
                <span className="uses">{p.uses} применений</span>
                <button>применить {TSIcon.chev({ style: { transform: "rotate(-90deg)" } })}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
