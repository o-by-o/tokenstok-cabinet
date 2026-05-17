"use client";

// StubView.jsx — placeholder page for routes we'll fill later (M6+).
// Shows the brand-consistent eyebrow + title + description and a back-to-chat CTA.

import Link from "next/link";
import { useBreakpoint } from "../../lib/hooks";
import { useDispatch } from "../../lib/store";
import { TSIcon } from "../../cabinet/foundation";

const STYLE = `
  .stub{ flex:1; min-height:0; display:flex; flex-direction:column; background:var(--bg); height:100dvh; }
  .stub-hd{
    padding:12px 16px; border-bottom:1px solid var(--line);
    display:flex; align-items:center; gap:10px;
    position:sticky; top:0; background:var(--bg); z-index:5;
  }
  .stub-hd .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .stub-hd .icobtn:hover{ background:var(--chip); }
  .stub-hd .ttl{ font-size:14px; font-weight:700; }
  .stub-body{
    flex:1; overflow-y:auto;
    padding:48px 24px; display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; gap:16px;
  }
  .stub-eyebrow{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.08em; text-transform:uppercase; }
  .stub-body h1{ margin:0; font-size:clamp(28px, 5vw, 40px); font-weight:800; letter-spacing:-0.03em; }
  .stub-body p{ margin:0; color:var(--mute); font-size:15px; line-height:1.5; max-width:480px; }
  .stub-cta{
    margin-top:12px;
    display:inline-flex; align-items:center; gap:8px;
    padding:10px 16px; border-radius:12px;
    background:var(--ink); color:var(--bubble-out-fg); border:0;
    text-decoration:none; font-weight:600; font-size:14px; cursor:pointer;
  }
`;

export function StubView({ title, eyebrow, desc }) {
  const bp = useBreakpoint();
  const dispatch = useDispatch();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="stub">
        <header className="stub-hd">
          {bp.isMobile && (
            <button className="icobtn" aria-label="меню" onClick={() => dispatch({ type: "ui/setSidebar", open: true })}>
              {TSIcon.burger({})}
            </button>
          )}
          <div className="ttl">{title}</div>
        </header>
        <div className="stub-body">
          <div className="stub-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{desc}</p>
          <Link href="/chat" className="stub-cta">
            {TSIcon.back({ width: 16, height: 16 })}
            <span>Назад в чат</span>
          </Link>
        </div>
      </div>
    </>
  );
}
