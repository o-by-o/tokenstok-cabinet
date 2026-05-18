"use client";

// AuthLayout.jsx — двухколоночный экран входа/регистрации.
// Слева — логотип + заголовок + подзаголовок, справа — форма.
// На мобиле всё в колонку.

import Link from "next/link";
import { Logo } from "../brand/Logo";

const STYLE = `
  .au-root{
    min-height:100dvh; width:100vw; background:#faf9f6; color:#0c0c0c;
    font-family:var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif;
    display:grid; grid-template-columns: 1fr;
    --sans: var(--font-manrope), sans-serif;
    --mono: var(--font-jetbrains-mono), monospace;
    --mute: #6c6c6c; --ink2: #2a2a2a; --line: #e6e3da;
  }
  @media (min-width: 900px){
    .au-root{ grid-template-columns: 1.05fr 1fr; }
  }
  .au-aside{
    padding:36px 36px 28px;
    display:flex; flex-direction:column; gap:24px;
    background:#f0ede4;
    border-bottom:1px solid var(--line);
  }
  @media (min-width: 900px){
    .au-aside{ padding:48px 56px 40px; border-bottom:0; border-right:1px solid var(--line); }
  }
  .au-aside h1{
    margin:auto 0 8px; font-weight:800; letter-spacing:-0.03em;
    font-size: clamp(40px, 5vw, 68px); line-height:0.98;
  }
  .au-aside p{
    margin:0 0 0; color:var(--ink2); font-size:17px; line-height:1.5; max-width:38ch;
  }
  .au-aside .nav{ display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .au-aside .nav a{ font-family:var(--mono); font-size:12px; color:var(--mute); text-decoration:none; }
  .au-aside .nav a:hover{ color:var(--ink2); text-decoration:underline; text-underline-offset:4px; }

  .au-main{
    padding:36px 28px 44px;
    display:flex; align-items:center; justify-content:center;
  }
  @media (min-width: 900px){
    .au-main{ padding:48px 56px; }
  }
  .au-form-wrap{ width:100%; max-width:380px; display:flex; flex-direction:column; gap:18px; }
`;

export function AuthLayout({ title, subtitle, children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="au-root">
        <aside className="au-aside">
          <div className="nav">
            <a href="https://tokenstok.ru/" style={{ color: "inherit", textDecoration: "none" }}>
              <Logo tag="v1.0 · beta"/>
            </a>
            <a href="https://tokenstok.ru/">← на главную</a>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div style={{ flex:1 }}/>
          <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--mute)" }}>
            218 моделей · оплата по факту · без подписок
          </div>
        </aside>
        <main className="au-main">
          <div className="au-form-wrap">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
