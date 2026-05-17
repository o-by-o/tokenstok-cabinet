"use client";

// ModelPickerSheet.jsx — kind tabs + scrollable model rows + 218 footer.

import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { TSIcon } from "../../cabinet/foundation";
import { TS_MODELS } from "../../cabinet/data";
import { useApp, useDispatch } from "../../lib/store";

const STYLE = `
  .pk-hd{ padding:0 20px 8px; display:flex; justify-content:space-between; align-items:flex-end; gap:12px; }
  .pk-hd .ttl{ font-size:18px; font-weight:700; letter-spacing:-0.015em; }
  .pk-hd .sub{ font-family:var(--mono); font-size:11.5px; color:var(--mute); margin-top:2px; }
  .pk-hd .search{
    display:inline-flex; align-items:center; gap:6px;
    background:transparent; border:1px solid var(--line); border-radius:999px;
    padding:5px 10px; font-family:var(--mono); font-size:11px; color:var(--ink); cursor:pointer;
  }
  .pk-tabs{ display:flex; gap:6px; padding:0 20px 12px; overflow-x:auto; }
  .pk-tabs::-webkit-scrollbar{ display:none; }
  .pk-tab{
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 11px; border-radius:999px;
    background:var(--chip); border:1px solid var(--line);
    font:500 12px var(--sans); color:var(--ink2); cursor:pointer; white-space:nowrap;
  }
  .pk-tab.active{ background:var(--ink); color:var(--bubble-out-fg); border-color:var(--ink); }
  .pk-list{ padding:0 8px 8px; display:flex; flex-direction:column; }
  .pk-row{
    display:flex; align-items:center; gap:12px;
    padding:10px 12px; border-radius:10px; cursor:pointer;
  }
  .pk-row:hover{ background:var(--chip); }
  .pk-row.current{ background:var(--chip); }
  .pk-row .gly{
    width:36px; height:36px; border-radius:8px;
    background:var(--card); border:1px solid var(--line);
    display:grid; place-items:center; font-family:var(--mono); font-weight:700; font-size:12px;
    flex-shrink:0;
  }
  .pk-row .meta{ flex:1; min-width:0; }
  .pk-row .meta .n{ font-size:14.5px; font-weight:600; letter-spacing:-0.01em; display:flex; align-items:center; gap:6px; }
  .pk-row .meta .n .hot{ font-family:var(--mono); font-size:9px; padding:2px 5px; background:var(--ink); color:var(--bubble-out-fg); border-radius:4px; letter-spacing:.04em; }
  .pk-row .meta .v{ font-family:var(--mono); font-size:11px; color:var(--mute); }
  .pk-row .price{ text-align:right; flex-shrink:0; }
  .pk-row .price .p{ font-family:var(--mono); font-size:12.5px; font-weight:600; }
  .pk-row .price .u{ font-family:var(--mono); font-size:10px; color:var(--mute); }
  .pk-allbtn{
    margin:8px 12px 8px; padding:12px;
    background:transparent; border:1px dashed var(--line); border-radius:10px;
    font-family:var(--mono); font-size:12px; color:var(--mute); cursor:pointer;
  }
  .pk-allbtn:hover{ color:var(--ink); border-color:var(--ink); }
`;

// Mirrors screens-chat.js ScreenPicker tabs verbatim
const TABS = [
  { id: "all",   label: "Все" },
  { id: "text",  label: "Текст" },
  { id: "code",  label: "Код" },
  { id: "image", label: "Картинки" },
  { id: "video", label: "Видео" },
  { id: "voice", label: "Голос" },
];

export function ModelPickerSheet({ onClose }) {
  const { state } = useApp();
  const dispatch = useDispatch();
  const [tab, setTab] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const currentId = state.models.currentId;

  // "Код" tab maps to text models tagged with «код» in data.js
  const matchesTab = (m, t) => {
    if (t === "all") return true;
    if (t === "code") return m.kind === "text" && /код/i.test(m.tag || "");
    return m.kind === t;
  };

  const models = useMemo(() => {
    const base = TS_MODELS.filter((m) => matchesTab(m, tab));
    if (!showAll) return base;
    // synth filler so "218 моделей" feels real after "смотреть все"
    const filler = Array.from({ length: Math.max(0, 218 - base.length) }, (_, i) => ({
      id: `synth-${i + 1}`,
      name: `Model ${String(i + 1).padStart(3, "0")}`,
      glyph: String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((i * 7) % 26)),
      vendor: ["Anthropic", "OpenAI", "Google", "Meta", "Mistral", "Cohere", "BFL", "Stability"][i % 8],
      kind: ["text", "image", "video", "voice"][i % 4],
      price: (Math.random() * 5 + 0.1).toFixed(2).replace(".", ","),
      unit: "₽ / 1k вх",
    })).filter((m) => matchesTab(m, tab));
    return [...base, ...filler];
  }, [tab, showAll]);

  const pick = (m) => {
    dispatch({ type: "chat/setModel", modelId: m.id });
    onClose();
  };

  return (
    <Sheet onClose={onClose} label="выбор модели">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="pk-hd">
        <div>
          <div className="ttl">Модель</div>
          <div className="sub">218 в каталоге · {state.models.recentIds.length} недавних</div>
        </div>
        <button className="search">{TSIcon.search({})} поиск</button>
      </div>

      <div className="pk-tabs no-scroll-bars">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`pk-tab ${t.id === tab ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      <div className="pk-list">
        {models.map((m) => {
          const current = m.id === currentId;
          return (
            <div key={m.id} className={`pk-row ${current ? "current" : ""}`} onClick={() => pick(m)}>
              <span className="gly">{m.glyph}</span>
              <div className="meta">
                <div className="n">
                  <span style={{ fontFamily:"var(--mono)", fontSize:14, fontWeight:600 }}>{m.id}</span>
                  {m.hot && <span className="hot">⚡ хит</span>}
                </div>
                <div className="v">{m.vendor}{m.tag ? ` · ${m.tag}` : ""}</div>
              </div>
              <div className="price">
                <div className="p">{m.price}</div>
                <div className="u">{m.unit}</div>
              </div>
              {current && <span style={{ color:"var(--ink)" }}>{TSIcon.check({})}</span>}
            </div>
          );
        })}
        {!showAll && (
          <button className="pk-allbtn" onClick={() => setShowAll(true)}>
            смотреть все 218 →
          </button>
        )}
      </div>
    </Sheet>
  );
}
