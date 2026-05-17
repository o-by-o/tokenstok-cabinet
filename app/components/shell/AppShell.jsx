"use client";

// AppShell.jsx — responsive 3-column shell.
// Layout is driven by CSS media queries (no JS-based bp checks), so SSR and
// client render identical DOM — no hydration mismatch. JS state only controls
// the mobile drawer open/close.

import { useEffect } from "react";
import { TS_ACCENTS } from "../../cabinet/foundation";
import { useUi, useDispatch } from "../../lib/store";
import { Sidebar } from "./Sidebar";
import { RightRail } from "./RightRail";
import { MobileDrawer } from "./MobileDrawer";
import { BottomTabBar } from "./BottomTabBar";
import { StatusBar } from "../../cabinet/foundation";

const STYLE = `
  .app-shell{
    --sidebar-w: 280px;
    --rail-w: 320px;
    width: 100vw; min-height: 100dvh;
    background: var(--bg);
    color: var(--ink);
    display: grid;
    grid-template-columns: 1fr;                /* mobile default */
    grid-template-areas: "main";
  }
  /* desktop */
  @media (min-width: 1024px){
    .app-shell{
      grid-template-columns: var(--sidebar-w) 1fr;
      grid-template-areas: "side main";
    }
  }
  /* wide */
  @media (min-width: 1440px){
    .app-shell{
      grid-template-columns: var(--sidebar-w) 1fr var(--rail-w);
      grid-template-areas: "side main rail";
    }
  }

  .app-shell > aside.app-sidebar{
    grid-area: side;
    background: var(--bg);
    border-right: 1px solid var(--line);
    height: 100dvh; position: sticky; top: 0;
    overflow: hidden; display: none; flex-direction: column;
  }
  @media (min-width: 1024px){
    .app-shell > aside.app-sidebar{ display: flex; }
  }

  .app-shell > aside.app-rail{
    grid-area: rail;
    background: var(--bg);
    border-left: 1px solid var(--line);
    height: 100dvh; position: sticky; top: 0;
    overflow: hidden; display: none; flex-direction: column;
    padding: 14px 14px 18px;
  }
  @media (min-width: 1440px){
    .app-shell > aside.app-rail{ display: flex; }
  }

  .app-shell > main.app-main{
    grid-area: main;
    min-width: 0; min-height: 100dvh;
    display: flex; flex-direction: column;
    background: var(--bg);
    position: relative;
  }

  /* iOS status bar simulation — mobile only */
  .app-shell .mobile-status{ display: block; }
  @media (min-width: 1024px){ .app-shell .mobile-status{ display: none; } }

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
  @media (min-width: 1024px){
    .mobile-drawer-scrim, .mobile-drawer{ display: none; }
  }
`;

export function AppShell({ children }) {
  const ui = useUi();
  const dispatch = useDispatch();

  // Lock body scroll when drawer / sheet is open (relevant on mobile only)
  useEffect(() => {
    if (ui.sidebarOpen || ui.sheet) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [ui.sidebarOpen, ui.sheet]);

  const accent = (TS_ACCENTS[ui.accent] || TS_ACCENTS.graphite);
  const accentVal = ui.theme === "dark" ? accent.dark : accent.light;
  const den = ui.density === "compact" ? 0.92 : ui.density === "comfy" ? 1.08 : 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className={`app-shell ts-root t-${ui.theme}`} style={{ "--den": den, "--accent": accentVal }}>
        <aside className="app-sidebar no-scroll-bars">
          <Sidebar/>
        </aside>
        <main className="app-main no-scroll-bars">
          <div className="mobile-status"><StatusBar/></div>
          {children}
          <BottomTabBar/>
        </main>
        <aside className="app-rail no-scroll-bars">
          <RightRail/>
        </aside>
      </div>

      <div
        className={`mobile-drawer-scrim ${ui.sidebarOpen ? "open" : ""}`}
        onClick={() => dispatch({ type: "ui/setSidebar", open: false })}
      />
      <div className={`ts-root t-${ui.theme} mobile-drawer ${ui.sidebarOpen ? "open" : ""}`} style={{ "--den": den, "--accent": accentVal }}>
        <MobileDrawer/>
      </div>
    </>
  );
}
