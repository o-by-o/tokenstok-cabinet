"use client";

// EmptyChat.jsx — matches the design's "01 · Пустой чат" artboard:
// eyebrow + hero + ЭКСПЕРТЫ (single horizontal row of 4 small cards) + ПОПРОБУЙ (stacked).

import { useDispatch } from "../../lib/store";
import { TS_AGENTS } from "../../cabinet/data";

const STYLE = `
  .ec{ flex:1; padding:24px 22px 8px; overflow-y:auto; display:flex; flex-direction:column; gap:18px; max-width:480px; margin:0 auto; width:100%; }
  @media (min-width: 768px){ .ec{ padding:36px 28px 16px; max-width:560px; } }
  .ec-eyebrow{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; }
  .ec h1{ margin:10px 0 6px; font-family:var(--sans); font-weight:800; font-size:32px; letter-spacing:-0.025em; line-height:1.02; }
  @media (min-width: 768px){ .ec h1{ font-size:38px; } }
  .ec p{ margin:0; color:var(--mute); font-size:14px; line-height:1.45; }
  .ec-label{ font-family:var(--mono); font-size:10.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; margin-bottom:8px; }

  /* Agents — horizontal flex row of small cards, like the mockup */
  .ec-agents{ display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; }
  .ec-agents::-webkit-scrollbar{ display:none; }
  .ec-agent{
    flex:1 1 0; min-width:0;
    padding:10px 8px;
    background:var(--card); border:1px solid var(--line); border-radius:12px;
    display:flex; flex-direction:column; align-items:flex-start; gap:6px;
    cursor:pointer; text-align:left;
    transition:border-color .15s, transform .15s;
  }
  .ec-agent:hover{ border-color:var(--ink2); transform:translateY(-1px); }
  .ec-agent .gly{
    width:24px; height:24px; border-radius:6px; background:var(--chip);
    display:grid; place-items:center; font-family:var(--mono); font-weight:700; font-size:11px;
    border:1px solid var(--line2);
  }
  .ec-agent .nm{ font-size:12.5px; font-weight:600; letter-spacing:-0.005em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }

  /* Prompt suggestions — stacked full-width buttons */
  .ec-prompts{ display:flex; flex-direction:column; gap:6px; }
  .ec-prompt{
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    padding:12px 14px;
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    text-align:left; cursor:pointer; transition:border-color .15s;
  }
  .ec-prompt:hover{ border-color:var(--ink2); }
  .ec-prompt .t{ font-size:14px; color:var(--ink); letter-spacing:-0.005em; }
  .ec-prompt .k{ font-family:var(--mono); font-size:10.5px; color:var(--mute); flex-shrink:0; }
`;

// Exactly mirrors screens-chat.js ScreenEmpty suggestions
const SUGGESTIONS = [
  { t: "Сравни sonnet 4.5 и gpt-5 для кода",     k: "код" },
  { t: "Нарисуй обложку альбома, плёночное зерно", k: "картинка" },
  { t: "Сожми этот pdf в 5 пунктов",               k: "файл" },
  { t: "5 секунд видео: собака бежит на закате",   k: "видео" },
];

export function EmptyChat() {
  const dispatch = useDispatch();
  const send = (text) => dispatch({ type: "msg/sendUser", text });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ec no-scroll-bars">
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
