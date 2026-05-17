"use client";

// EmptyChat.jsx — greeting + quick agent picks + suggested prompts.
// Mirrors screen 01 from the design.

import { useDispatch } from "../../lib/store";
import { TS_AGENTS } from "../../cabinet/data";

const STYLE = `
  .ec{ padding:24px 22px 12px; display:flex; flex-direction:column; gap:18px; max-width:680px; margin:0 auto; width:100%; }
  .ec-eyebrow{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; }
  .ec h1{ margin:8px 0 4px; font-family:var(--sans); font-weight:800; font-size:clamp(28px, 5vw, 38px); letter-spacing:-0.03em; line-height:1.02; }
  .ec p{ margin:0; color:var(--mute); font-size:14px; line-height:1.5; }
  .ec-label{ font-family:var(--mono); font-size:10.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; margin-bottom:8px; }
  .ec-agents{ display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; }
  @media (max-width: 480px){ .ec-agents{ grid-template-columns:repeat(2, 1fr); } }
  .ec-agent{
    padding:10px 8px; background:var(--card); border:1px solid var(--line); border-radius:12px;
    display:flex; flex-direction:column; align-items:flex-start; gap:6px; cursor:pointer; text-align:left;
    transition:border-color .15s, transform .15s;
  }
  .ec-agent:hover{ border-color:var(--ink2); transform:translateY(-1px); }
  .ec-agent .gly{
    width:26px; height:26px; border-radius:6px; background:var(--chip);
    display:grid; place-items:center; font-family:var(--mono); font-weight:700; font-size:12px;
  }
  .ec-agent .nm{ font-size:13px; font-weight:600; letter-spacing:-0.005em; }
  .ec-prompts{ display:flex; flex-direction:column; gap:6px; }
  .ec-prompt{
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; background:var(--card);
    border:1px solid var(--line); border-radius:14px;
    text-align:left; cursor:pointer; transition:border-color .15s, transform .15s;
  }
  .ec-prompt:hover{ border-color:var(--ink2); transform:translateX(2px); }
  .ec-prompt .t{ font-size:14px; color:var(--ink); letter-spacing:-0.005em; }
  .ec-prompt .k{ font-family:var(--mono); font-size:10.5px; color:var(--mute); }
`;

const SUGGESTIONS = [
  { t: "Чем claude отличается от gpt?", k: "сравнение" },
  { t: "Нарисуй обложку альбома, плёночное зерно", k: "картинка" },
  { t: "Объясни TCP в одной строке", k: "коротко" },
  { t: "Самая дешёвая модель для классификации?", k: "цена" },
];

export function EmptyChat() {
  const dispatch = useDispatch();

  const send = (text) => dispatch({ type: "msg/sendUser", text });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ec">
        <div>
          <div className="ec-eyebrow"><span className="ts-live">218 моделей · готовы</span></div>
          <h1>Привет, Аня.<br/>Что делаем?</h1>
          <p>Спроси текстом, надиктуй или прикрепи файл. Я подберу модель.</p>
        </div>

        <div>
          <div className="ec-label">эксперты</div>
          <div className="ec-agents">
            {TS_AGENTS.slice(0, 4).map((a) => (
              <button key={a.id} className="ec-agent" onClick={() => send(`Привет, ${a.name.toLowerCase()}! ${a.desc.toLowerCase()}`)}>
                <span className="gly">{a.glyph}</span>
                <span className="nm">{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="ec-label">попробуй</div>
          <div className="ec-prompts">
            {SUGGESTIONS.map((p, i) => (
              <button key={i} className="ec-prompt" onClick={() => send(p.t)}>
                <span className="t">{p.t}</span>
                <span className="k">{p.k}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
