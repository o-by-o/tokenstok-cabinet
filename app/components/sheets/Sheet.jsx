"use client";

// Sheet.jsx — bottom sheet on mobile, centered modal on desktop.
// Portal to <body>, swipe-to-dismiss on mobile, esc/scrim to close.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint, useEscape } from "../../lib/hooks";

const STYLE = `
  .sh-scrim{
    position:fixed; inset:0; background:rgba(12,12,12,.45);
    backdrop-filter:blur(6px);
    z-index:90;
    opacity:0; transition:opacity .18s ease;
  }
  .sh-scrim.open{ opacity:1; }
  .sh-wrap{
    position:fixed; left:0; right:0; bottom:0;
    z-index:91; display:flex; justify-content:center; align-items:flex-end;
    pointer-events:none;
  }
  @media (min-width: 768px){
    .sh-wrap{ inset:0; align-items:center; }
  }
  .sh-panel{
    pointer-events:auto;
    width:100%;
    background:var(--card); color:var(--ink);
    box-shadow:0 -8px 32px -16px rgba(0,0,0,.25);
    border-top-left-radius:22px; border-top-right-radius:22px;
    display:flex; flex-direction:column;
    max-height:88dvh;
    transform:translateY(100%);
    transition:transform .26s cubic-bezier(.2,.7,.3,1);
  }
  .sh-panel.open{ transform:translateY(0); }
  @media (min-width: 768px){
    .sh-panel{
      max-width:560px; max-height:80dvh;
      border-radius:18px;
      box-shadow:0 24px 80px rgba(0,0,0,.32);
      transform:translateY(8px) scale(.98); opacity:0;
      transition:transform .18s cubic-bezier(.2,.7,.3,1), opacity .18s;
    }
    .sh-panel.open{ transform:none; opacity:1; }
  }
  .sh-grip{
    align-self:center; margin:6px auto 10px;
    width:38px; height:4px; border-radius:3px; background:var(--line2);
    flex:0 0 auto;
  }
  @media (min-width: 768px){ .sh-grip{ display:none; } }
  .sh-body{
    overflow-y:auto; min-height:0;
    padding:4px 0 16px;
    scrollbar-width:none;
  }
  .sh-body::-webkit-scrollbar{ display:none; }
`;

export function Sheet({ children, onClose, label }) {
  const bp = useBreakpoint();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // animate-in
  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEscape(() => requestClose(), true);

  const requestClose = () => {
    setOpen(false);
    setTimeout(() => onClose && onClose(), 240);
  };

  // swipe-to-dismiss on mobile
  useEffect(() => {
    if (!bp.isMobile) return;
    const panel = panelRef.current;
    if (!panel) return;
    let startY = null;
    let dragY = 0;
    let dragging = false;
    const onDown = (e) => {
      // only when grabbing the grip area (top 40px)
      const r = panel.getBoundingClientRect();
      if (e.clientY - r.top > 40) return;
      startY = e.clientY;
      dragging = true;
      panel.style.transition = "none";
    };
    const onMove = (e) => {
      if (!dragging || startY === null) return;
      dragY = Math.max(0, e.clientY - startY);
      panel.style.transform = `translateY(${dragY}px)`;
    };
    const onUp = () => {
      if (!dragging) return;
      panel.style.transition = "";
      const tooFar = dragY > panel.offsetHeight * 0.3;
      if (tooFar) requestClose();
      else panel.style.transform = "";
      dragging = false; startY = null; dragY = 0;
    };
    panel.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      panel.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [bp.isMobile]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className={`sh-scrim ${open ? "open" : ""}`} onClick={requestClose} aria-hidden="true"/>
      <div className="sh-wrap">
        <div ref={panelRef} className={`sh-panel ${open ? "open" : ""}`} role="dialog" aria-label={label || "sheet"}>
          <div className="sh-grip" />
          <div className="sh-body no-scroll-bars">{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
}
