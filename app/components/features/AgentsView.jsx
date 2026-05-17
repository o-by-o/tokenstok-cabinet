"use client";

// AgentsView.jsx — ported from screens-features.jsx ScreenAgents.
// Header (back + label + search) → hero "Готовые роли" → category chips → 2-col grid of expert cards.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TSIcon } from "../../cabinet/foundation";
import { TS_AGENTS } from "../../cabinet/data";
import { useDispatch } from "../../lib/store";

const STYLE = `
  .av{ flex:1; min-height:0; display:flex; flex-direction:column; background:var(--bg); height:100dvh; }
  .av-hd{
    padding:8px 16px 6px;
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    position:sticky; top:0; background:var(--bg); z-index:5;
    border-bottom:1px solid var(--line);
  }
  .av-hd .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .av-hd .icobtn:hover{ background:var(--chip); }
  .av-hd .lbl{ font-family:var(--mono); font-size:11.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; }
  .av-hero{ padding:12px 18px 6px; max-width:760px; margin:0 auto; width:100%; }
  .av-hero h2{ margin:0; font-size:26px; font-weight:800; letter-spacing:-0.025em; line-height:1.05; }
  @media (min-width: 768px){ .av-hero h2{ font-size:32px; } }
  .av-hero p{ margin:6px 0 0; font-size:13.5px; color:var(--mute); line-height:1.45; }
  .av-chips{ padding:12px 16px 6px; display:flex; gap:6px; overflow-x:auto; max-width:760px; margin:0 auto; width:100%; scrollbar-width:none; }
  .av-chips::-webkit-scrollbar{ display:none; }
  .av-grid{
    flex:1; min-height:0; overflow-y:auto;
    padding:8px 14px 16px;
    max-width:760px; margin:0 auto; width:100%;
  }
  @media (min-width: 768px){ .av-grid{ padding:12px 18px 24px; } }
  .av-grid-inner{
    display:grid; grid-template-columns:1fr 1fr; gap:8px;
  }
  @media (min-width: 768px){ .av-grid-inner{ grid-template-columns:repeat(3, 1fr); gap:12px; } }
  @media (min-width: 1200px){ .av-grid-inner{ grid-template-columns:repeat(4, 1fr); } }
  .av-card{
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    padding:14px 14px 12px;
    display:flex; flex-direction:column; gap:8px;
    min-height:144px;
    cursor:pointer; text-align:left; transition:border-color .15s, transform .15s;
  }
  .av-card:hover{ border-color:var(--ink2); transform:translateY(-1px); }
  .av-card .gly{
    width:38px; height:38px; border-radius:9px;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:700; font-size:14px;
  }
  .av-card .nm{ font-size:15px; font-weight:700; letter-spacing:-0.015em; }
  .av-card .desc{ font-size:12px; line-height:1.4; color:var(--ink2); flex:1; }
  .av-card .foot{
    display:flex; justify-content:space-between; align-items:center;
    margin-top:auto; padding-top:8px; border-top:1px dashed var(--line);
  }
  .av-card .foot .m{ font-family:var(--mono); font-size:10px; color:var(--mute); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .av-card .foot .a{ font-family:var(--mono); font-size:10px; color:var(--ink2); }
`;

const CATEGORIES = ["Все", "Работа", "Дом", "Творчество", "Код"];

export function AgentsView() {
  const dispatch = useDispatch();
  const router = useRouter();

  const startChat = (agent) => {
    // create empty chat, set the agent's preferred model, prefill composer
    // with a greeting tuned for the role — user can edit before sending.
    dispatch({ type: "chat/new" });
    setTimeout(() => {
      dispatch({ type: "chat/setModel", modelId: agent.model });
      dispatch({ type: "ui/prefill", text: `Привет, ${agent.name.toLowerCase()}! Помоги мне: ` });
      router.push("/chat");
    }, 0);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="av">
        <header className="av-hd">
          <Link href="/chat" className="icobtn" aria-label="назад">{TSIcon.back({})}</Link>
          <span className="lbl">эксперты</span>
          <button className="icobtn" aria-label="поиск">{TSIcon.search({})}</button>
        </header>

        <div className="av-hero">
          <h2>Готовые роли.</h2>
          <p>Системный промпт + хорошая модель под задачу. Тапни — начнётся чат.</p>
        </div>

        <div className="av-chips no-scroll-bars">
          {CATEGORIES.map((t, i) => (
            <span key={i} className={`ts-chip ${i === 0 ? "active" : ""}`}>{t}</span>
          ))}
        </div>

        <div className="av-grid no-scroll-bars">
          <div className="av-grid-inner">
            {TS_AGENTS.map((a) => (
              <button key={a.id} className="av-card" onClick={() => startChat(a)}>
                <div className="gly">{a.glyph}</div>
                <div className="nm">{a.name}</div>
                <div className="desc">{a.desc}</div>
                <div className="foot">
                  <span className="m">{a.model.replace("-", " ")}</span>
                  <span className="a">{TSIcon.chev({ style: { transform: "rotate(-90deg)" } })}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
