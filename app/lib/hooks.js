"use client";

// hooks.js — small custom hooks. All client-side.

import { useEffect, useRef, useState, useCallback } from "react";

// useBreakpoint — returns { isMobile, isDesktop, isWide } from window.innerWidth.
// Breakpoints: mobile <768, desktop ≥1024, wide ≥1440.
export function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  useEffect(() => {
    const r = () => setW(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return {
    width: w,
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1024,
    isDesktop: w >= 1024,
    isWide: w >= 1440,
  };
}

// useLongPress — fires onLongPress({x, y, target}) after `delay`ms hold.
// Also catches desktop right-click via contextmenu.
export function useLongPress(handler, { delay = 450, moveThreshold = 10 } = {}) {
  const timer = useRef(null);
  const start = useRef(null);

  const cancel = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  }, []);

  const onPointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return; // primary only
    const target = e.currentTarget;
    start.current = { x: e.clientX, y: e.clientY };
    cancel();
    timer.current = setTimeout(() => {
      timer.current = null;
      handler({ x: e.clientX, y: e.clientY, target });
    }, delay);
  }, [handler, delay, cancel]);

  const onPointerMove = useCallback((e) => {
    if (!start.current || !timer.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (dx * dx + dy * dy > moveThreshold * moveThreshold) cancel();
  }, [moveThreshold, cancel]);

  const onPointerUp = cancel;
  const onPointerCancel = cancel;
  const onPointerLeave = cancel;

  const onContextMenu = useCallback((e) => {
    e.preventDefault();
    cancel();
    handler({ x: e.clientX, y: e.clientY, target: e.currentTarget });
  }, [handler, cancel]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave, onContextMenu };
}

// useClickOutside — calls handler when a pointerdown lands outside the ref.
export function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e) => {
      const el = ref.current;
      if (el && !el.contains(e.target)) handler(e);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [ref, handler, enabled]);
}

// useAutosizeTextarea — grows the textarea height up to maxRows lines.
export function useAutosizeTextarea(ref, value, { maxPx = 200 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, maxPx);
    el.style.height = next + "px";
  }, [ref, value, maxPx]);
}

// useEscape — fires handler when Escape is pressed (while enabled).
export function useEscape(handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const k = (e) => { if (e.key === "Escape") handler(e); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [handler, enabled]);
}

// useShortcuts — registers a map of "Mod+Key" → handler. "Mod" matches Cmd
// on macOS, Ctrl elsewhere. Skips when user is typing in an input/textarea
// (except Escape which always fires).
export function useShortcuts(map) {
  useEffect(() => {
    const onKey = (e) => {
      const isTyping = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key;
      // canonicalize: "Mod+K" / "Esc" / "Mod+/"
      const probe = mod ? `Mod+${key.toLowerCase()}` : key === "Escape" ? "Esc" : null;
      if (!probe) return;
      const handler = map[probe];
      if (!handler) return;
      if (isTyping && probe !== "Esc" && probe !== "Mod+/") return;
      e.preventDefault();
      handler(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [map]);
}
