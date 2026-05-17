"use client";

// AppShell.jsx — responsive 3-column shell.
// Mobile (<768): main only, sidebar = overlay drawer triggered from header
// Tablet (768-1023): sidebar collapsed icon-rail + main
// Desktop (≥1024): sidebar 280 + main, no rail by default
// Wide (≥1440): sidebar 280 + main + rail 320

import { useEffect } from "react";
import { TS_ACCENTS } from "../../cabinet/foundation";
import { useApp, useUi, useDispatch } from "../../lib/store";
import { useBreakpoint } from "../../lib/hooks";
import { Sidebar } from "./Sidebar";
import { RightRail } from "./RightRail";
import { MobileDrawer } from "./MobileDrawer";

const STYLE = `
  .app-shell{
    --sidebar-w: 280px;
    --rail-w: 320px;
    width: 100vw; min-height: 100dvh;
    background: var(--bg);
    color: var(--ink);
    display: grid;
    grid-template-columns: var(--sidebar-w) 1fr;
  }
  .app-shell.wide{ grid-template-columns: var(--sidebar-w) 1fr var(--rail-w); }
  .app-shell.mobile{ grid-template-columns: 1fr; }

  .app-shell aside.app-sidebar{
    background: var(--bg);
    border-right: 1px solid var(--line);
    height: 100dvh; position: sticky; top: 0;
    overflow: hidden; display: flex; flex-direction: column;
  }
  .app-shell aside.app-rail{
    background: var(--bg);
    border-left: 1px solid var(--line);
    height: 100dvh; position: sticky; top: 0;
    overflow: hidden; display: flex; flex-direction: column;
    padding: 14px 14px 18px;
  }
  .app-shell main.app-main{
    min-width: 0; min-height: 100dvh;
    display: flex; flex-direction: column;
    background: var(--bg);
    position: relative;
  }

  .mobile-drawer-scrim{
    position: fixed; inset: 0;
    background: rgba(12,12,12,.45);
    z-index: 80;
    opacity: 0; transition: opacity .18s ease;
    pointer-events: none;
  }
  .mobile-drawer-scrim.open{ opacity: 1; pointer-events: auto; }
  .mobile-drawer{
    position: fixed; top: 0; left: 0; bottom: 0;
    width: min(86vw, 360px);
    background: var(--bg); color: var(--ink);
    z-index: 81;
    box-shadow: 12px 0 30px -16px rgba(0,0,0,.18);
    transform: translateX(-100%);
    transition: transform .22s cubic-bezier(.2,.7,.3,1);
    display: flex; flex-direction: column;
  }
  .mobile-drawer.open{ transform: translateX(0); }
`;

export function AppShell({ children }) {
  const ui = useUi();
  const dispatch = useDispatch();
  const bp = useBreakpoint();

  // Lock body scroll when drawer / sheet is open (mobile)
  useEffect(() => {
    if (bp.isMobile && (ui.sidebarOpen || ui.sheet)) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [bp.isMobile, ui.sidebarOpen, ui.sheet]);

  const accent = (TS_ACCENTS[ui.accent] || TS_ACCENTS.graphite);
  const accentVal = ui.theme === "dark" ? accent.dark : accent.light;
  const den = ui.density === "compact" ? 0.92 : ui.density === "comfy" ? 1.08 : 1;

  const shellClass = ["app-shell", `ts-root t-${ui.theme}`, bp.isMobile ? "mobile" : bp.isWide ? "wide" : ""].filter(Boolean).join(" ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className={shellClass} style={{ "--den": den, "--accent": accentVal }}>
        {!bp.isMobile && (
          <aside className="app-sidebar no-scroll-bars">
            <Sidebar/>
          </aside>
        )}
        <main className="app-main no-scroll-bars">
          {children}
        </main>
        {bp.isWide && (
          <aside className="app-rail no-scroll-bars">
            <RightRail/>
          </aside>
        )}
      </div>

      {bp.isMobile && (
        <>
          <div
            className={`mobile-drawer-scrim ${ui.sidebarOpen ? "open" : ""}`}
            onClick={() => dispatch({ type: "ui/setSidebar", open: false })}
          />
          <div className={`ts-root t-${ui.theme} mobile-drawer ${ui.sidebarOpen ? "open" : ""}`} style={{ "--den": den, "--accent": accentVal }}>
            <MobileDrawer/>
          </div>
        </>
      )}
    </>
  );
}
