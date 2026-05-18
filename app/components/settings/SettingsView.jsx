"use client";

// SettingsView.jsx — theme, accent, density, stream effect, showCost toggle.
// Replaces the canvas-era floating Tweaks panel.

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useBreakpoint } from "../../lib/hooks";
import { useUi, useDispatch } from "../../lib/store";
import { TSIcon } from "../../cabinet/foundation";

const STYLE = `
  .sv{ flex:1; min-height:0; display:flex; flex-direction:column; background:var(--bg); height:100dvh; }
  .sv-hd{
    padding:12px 16px; border-bottom:1px solid var(--line);
    display:flex; align-items:center; gap:10px;
    position:sticky; top:0; background:var(--bg); z-index:5;
  }
  .sv-hd .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .sv-hd .lbl{ font-family:var(--mono); font-size:11.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; flex:1; }
  .sv-body{ flex:1; overflow-y:auto; padding:18px 18px 40px; }
  .sv-inner{ max-width:560px; margin:0 auto; display:flex; flex-direction:column; gap:18px; }
  .sv-section{ font-family:var(--mono); font-size:10.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; padding:6px 0 2px; }
  .sv-row{
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    background:var(--card); border:1px solid var(--line); border-radius:12px;
    padding:12px 14px;
  }
  .sv-row .lbl{ font-size:14px; font-weight:600; }
  .sv-row .desc{ font-family:var(--mono); font-size:11px; color:var(--mute); margin-top:2px; }
  .seg{
    display:flex; gap:4px; padding:3px; border-radius:10px;
    background:var(--chip); border:1px solid var(--line);
    flex-shrink:0;
  }
  .seg button{
    border:0; background:transparent; padding:6px 10px;
    border-radius:7px; font:500 12.5px var(--sans); color:var(--ink2);
    cursor:pointer;
  }
  .seg button.on{ background:var(--card); color:var(--ink); box-shadow:0 1px 2px rgba(0,0,0,.06); font-weight:600; }
  .tg{
    position:relative; width:38px; height:22px; border:0; border-radius:999px;
    background:var(--line2); cursor:pointer; padding:0;
    transition:background .15s;
  }
  .tg[data-on="1"]{ background:var(--ink); }
  .tg i{ position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform .15s; }
  .tg[data-on="1"] i{ transform:translateX(16px); }
`;

const SEG = (value, options, onChange) => (
  <div className="seg">
    {options.map((o) => (
      <button key={o.v} className={value === o.v ? "on" : ""} onClick={() => onChange(o.v)}>{o.l}</button>
    ))}
  </div>
);

export function SettingsView() {
  const bp = useBreakpoint();
  const ui = useUi();
  const dispatch = useDispatch();
  const set = (patch) => dispatch({ type: "ui/set", patch });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="sv">
        <header className="sv-hd">
          {bp.isMobile && (
            <Link href="/chat" className="icobtn" aria-label="назад">{TSIcon.back({})}</Link>
          )}
          <span className="lbl">настройки</span>
        </header>

        <div className="sv-body">
          <div className="sv-inner">
            <div className="sv-section">Внешний вид</div>
            <div className="sv-row">
              <div><div className="lbl">Тема</div><div className="desc">светлая или тёмная палитра</div></div>
              {SEG(ui.theme, [{ v:"light", l:"Light" }, { v:"dark", l:"Dark" }], (v) => set({ theme: v }))}
            </div>
            <div className="sv-row">
              <div><div className="lbl">Акцент</div><div className="desc">цвет кнопок и стримового выделения</div></div>
              {SEG(ui.accent, [{ v:"graphite", l:"Графит" }, { v:"terracotta", l:"Терракот" }, { v:"olive", l:"Хвоя" }], (v) => set({ accent: v }))}
            </div>
            <div className="sv-row">
              <div><div className="lbl">Плотность</div><div className="desc">пока не используется, future use</div></div>
              {SEG(ui.density, [{ v:"compact", l:"Компакт" }, { v:"regular", l:"Обычно" }, { v:"comfy", l:"Просторно" }], (v) => set({ density: v }))}
            </div>

            <div className="sv-section">Поведение</div>
            <div className="sv-row">
              <div><div className="lbl">Стрим-эффект</div><div className="desc">как появляется текст ответа</div></div>
              {SEG(ui.streamKind, [
                { v:"token", l:"Поток" },
                { v:"pop", l:"Pop" },
                { v:"blur", l:"Blur" },
                { v:"phosphor", l:"Фосфор" },
              ], (v) => set({ streamKind: v }))}
            </div>
            <div className="sv-row">
              <div><div className="lbl">Показывать стоимость</div><div className="desc">₽ + токены под каждым сообщением</div></div>
              <button className="tg" data-on={ui.showCost ? "1" : "0"} onClick={() => set({ showCost: !ui.showCost })} aria-label="показывать стоимость"><i/></button>
            </div>

            <div className="sv-section">Аккаунт</div>
            <SettingsAccount/>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingsAccount(){
  const { data: session } = useSession();
  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "—";
  const email = session?.user?.email || "—";
  return (
    <>
      <div className="sv-row">
        <div><div className="lbl">{name}</div><div className="desc">{email}</div></div>
      </div>
      <div className="sv-row">
        <div><div className="lbl">Выйти</div><div className="desc">завершить сессию на этом устройстве</div></div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "transparent", border: "1px solid var(--line)", borderRadius: 10,
            padding: "8px 14px", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600,
            color: "var(--ink)", cursor: "pointer",
          }}
        >
          Выйти →
        </button>
      </div>
    </>
  );
}

