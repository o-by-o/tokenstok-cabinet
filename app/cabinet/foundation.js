"use client";

// foundation.js — ТокенСток mobile cabinet shared atoms
// Brand tokens, Phone shell (frameless 390×844), status bar, home indicator,
// chat header, composer, model pill, cost meta, theme/density helpers,
// inline SVG icons. Ported from foundation.jsx in the design bundle.

// ─── theme tokens ────────────────────────────────────────────────
export const TS_THEMES = {
  light: {
    bg:      '#faf9f6',
    paper:   '#f0ede4',
    card:    '#ffffff',
    ink:     '#0c0c0c',
    ink2:    '#2a2a2a',
    mute:    '#6c6c6c',
    mute2:   '#a8a6a0',
    line:    '#e6e3da',
    line2:   '#d9d6cd',
    hairline:'#0c0c0c',
    chip:    '#f0ede4',
    bubbleIn:'#f0ede4',
    bubbleOut:'#0c0c0c',
    bubbleOutFg:'#faf9f6',
    statusFg:'#0c0c0c',
    overlay: 'rgba(12,12,12,.45)',
    skel:    '#ecead9',
    skelMid: '#dcd7c5',
    glow:    '12,12,12',
  },
  dark: {
    bg:      '#100f0d',
    paper:   '#1a1814',
    card:    '#16140f',
    ink:     '#f4f1ea',
    ink2:    '#cfcbbf',
    mute:    '#7c786d',
    mute2:   '#4d4a42',
    line:    '#26221c',
    line2:   '#332e26',
    hairline:'#f4f1ea',
    chip:    '#23201a',
    bubbleIn:'#1f1c16',
    bubbleOut:'#f4f1ea',
    bubbleOutFg:'#100f0d',
    statusFg:'#f4f1ea',
    overlay: 'rgba(0,0,0,.55)',
    skel:    '#1c1a14',
    skelMid: '#2c2920',
    glow:    '244,241,234',
  },
};

export const TS_ACCENTS = {
  graphite:   { name: 'Графит',   light: '#0c0c0c', dark: '#f4f1ea' },
  terracotta: { name: 'Терракот', light: '#c25a35', dark: '#e2784f' },
  olive:      { name: 'Хвоя',     light: '#5a6b3a', dark: '#8aa05a' },
};

export const TS_STYLE = `
  .ts-root{
    --bg: ${TS_THEMES.light.bg};
    --paper: ${TS_THEMES.light.paper};
    --card: ${TS_THEMES.light.card};
    --ink: ${TS_THEMES.light.ink};
    --ink2: ${TS_THEMES.light.ink2};
    --mute: ${TS_THEMES.light.mute};
    --mute2: ${TS_THEMES.light.mute2};
    --line: ${TS_THEMES.light.line};
    --line2: ${TS_THEMES.light.line2};
    --chip: ${TS_THEMES.light.chip};
    --bubble-in: ${TS_THEMES.light.bubbleIn};
    --bubble-out: ${TS_THEMES.light.bubbleOut};
    --bubble-out-fg: ${TS_THEMES.light.bubbleOutFg};
    --status-fg: ${TS_THEMES.light.statusFg};
    --overlay: ${TS_THEMES.light.overlay};
    --skel: ${TS_THEMES.light.skel};
    --skel-mid: ${TS_THEMES.light.skelMid};
    --glow: ${TS_THEMES.light.glow};
    --accent: #0c0c0c;
    --den: 1;
    --sans: var(--font-manrope), -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    --mono: var(--font-jetbrains-mono), ui-monospace, "SF Mono", Menlo, monospace;
    color: var(--ink);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  .ts-root.t-dark{
    --bg: ${TS_THEMES.dark.bg};
    --paper: ${TS_THEMES.dark.paper};
    --card: ${TS_THEMES.dark.card};
    --ink: ${TS_THEMES.dark.ink};
    --ink2: ${TS_THEMES.dark.ink2};
    --mute: ${TS_THEMES.dark.mute};
    --mute2: ${TS_THEMES.dark.mute2};
    --line: ${TS_THEMES.dark.line};
    --line2: ${TS_THEMES.dark.line2};
    --chip: ${TS_THEMES.dark.chip};
    --bubble-in: ${TS_THEMES.dark.bubbleIn};
    --bubble-out: ${TS_THEMES.dark.bubbleOut};
    --bubble-out-fg: ${TS_THEMES.dark.bubbleOutFg};
    --status-fg: ${TS_THEMES.dark.statusFg};
    --overlay: ${TS_THEMES.dark.overlay};
    --skel: ${TS_THEMES.dark.skel};
    --skel-mid: ${TS_THEMES.dark.skelMid};
    --glow: ${TS_THEMES.dark.glow};
  }

  /* phone */
  .ts-phone{
    width:390px;height:844px;
    background:var(--bg);
    border-radius:48px;
    position:relative;
    overflow:hidden;
    color:var(--ink);
    box-shadow: 0 0 0 1px var(--line) inset;
  }
  .ts-screen{
    position:absolute;inset:0;
    display:flex;flex-direction:column;
    overflow:hidden;
  }

  /* status bar */
  .ts-status{
    flex:0 0 auto;height:54px;
    padding:18px 28px 0;
    display:flex;align-items:flex-start;justify-content:space-between;
    font-family:var(--sans);font-weight:600;font-size:15px;letter-spacing:-0.01em;
    color:var(--status-fg);
    position:relative;z-index:5;
  }
  .ts-status .clock{ font-variant-numeric: tabular-nums; }
  .ts-status .right{ display:flex;gap:6px;align-items:center; }
  .ts-status .island{
    position:absolute;left:50%;top:11px;transform:translateX(-50%);
    width:120px;height:32px;border-radius:999px;
    background:#000;
  }
  .ts-root.t-dark .ts-status .island{ background:#000; box-shadow:0 0 0 1px #0a0a0a; }

  /* home indicator */
  .ts-home{
    flex:0 0 auto;height:30px;
    display:flex;align-items:center;justify-content:center;
    padding-bottom:8px;
  }
  .ts-home::after{
    content:""; display:block;
    width:138px;height:5px;border-radius:3px;
    background: var(--ink); opacity: .9;
  }

  /* chat header */
  .ts-head{
    flex:0 0 auto;
    padding: 10px 12px 12px;
    display:grid;
    grid-template-columns: 36px 1fr 36px;
    align-items:center;
    gap:8px;
    border-bottom:1px solid var(--line);
    background: var(--bg);
    position:relative;z-index:3;
  }
  .ts-head .ico-btn{
    width:36px;height:36px;border-radius:50%;
    display:grid;place-items:center;
    background:transparent;border:1px solid var(--line);
    color:var(--ink); cursor:pointer;
  }
  .ts-head .ts-modelpill{ justify-self:center; }

  /* model pill */
  .ts-modelpill{
    display:inline-flex;align-items:center;gap:8px;
    padding:6px 12px 6px 6px;
    border:1px solid var(--line);
    border-radius:999px;
    background:var(--card);
    font-family:var(--sans);font-weight:600;font-size:13px;
    cursor:pointer;
    max-width:230px;
  }
  .ts-modelpill .glyph{
    width:24px;height:24px;border-radius:50%;
    background:var(--chip);border:1px solid var(--line2);
    display:grid;place-items:center;
    font-family:var(--mono);font-weight:600;font-size:10px;
    color:var(--ink);
  }
  .ts-modelpill .chev{ color:var(--mute);font-size:10px; }
  .ts-modelpill .nm{ overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .ts-modelpill small{ color:var(--mute);font-weight:500;font-size:11px;font-family:var(--mono); }

  /* composer */
  .ts-composer{
    flex:0 0 auto;
    border-top:1px solid var(--line);
    padding: 10px 12px 4px;
    background:var(--bg);
    position:relative;z-index:3;
  }
  .ts-composer .row{
    display:flex;align-items:center;gap:8px;
    background:var(--card);
    border:1px solid var(--line);
    border-radius:24px;
    padding: 6px 6px 6px 12px;
  }
  .ts-composer .input{
    flex:1; min-width:0;
    font-family:var(--sans);font-size:15px;color:var(--ink);
    padding: 8px 0;
    background:transparent;outline:none;border:0;
    line-height:1.3;
  }
  .ts-composer .input.placeholder{ color:var(--mute); }
  .ts-composer .ic{
    width:34px;height:34px;border-radius:50%;
    display:grid;place-items:center;
    background:transparent;border:0;color:var(--ink); cursor:pointer;
  }
  .ts-composer .send{
    background:var(--accent);color:var(--bubble-out-fg);
  }
  .ts-root.t-dark .ts-composer .send{ color:var(--bubble-out-fg); }
  .ts-composer .voice{ background:transparent;border:1px solid var(--line); }
  .ts-composer .ctx{
    display:flex;justify-content:space-between;
    padding: 6px 6px 0;
    font-family:var(--mono);font-size:10.5px;color:var(--mute);
    letter-spacing:.02em;
  }
  .ts-composer .ctx b{ color:var(--ink2);font-weight:600; }

  /* bubbles */
  .ts-msgs{
    flex:1 1 auto;
    overflow:hidden;
    padding: 14px 16px;
    display:flex;flex-direction:column;gap:14px;
  }
  .ts-q, .ts-a{
    max-width:84%;
    font-size:15px;line-height:1.45;
    letter-spacing:-0.005em;
  }
  .ts-q{
    align-self:flex-end;
    background: var(--bubble-out);
    color: var(--bubble-out-fg);
    padding: 9px 13px;
    border-radius: 18px 18px 4px 18px;
  }
  .ts-a{
    align-self:flex-start;
    color: var(--ink);
    padding: 2px 0;
    word-break: break-word;
  }
  .ts-a.bubbled{
    background: var(--bubble-in);
    padding: 10px 13px;
    border-radius: 18px 18px 18px 4px;
  }

  /* cost meta under message */
  .ts-meta{
    align-self:flex-start;
    font-family:var(--mono); font-size:10.5px; color:var(--mute);
    margin-top:-6px; margin-left:2px;
    display:inline-flex;gap:10px;align-items:center;
    letter-spacing:.02em;
    white-space:nowrap;
    flex-shrink:0;
    position:relative; z-index:1;
  }
  .ts-meta.right{ align-self:flex-end; margin-right:4px; }
  .ts-meta > *{ flex-shrink:0; }
  .ts-meta .dot{ width:3px;height:3px;border-radius:50%;background:var(--mute2);display:inline-block; }
  .ts-meta b{ color:var(--ink2);font-weight:600;font-family:var(--mono); }

  /* shimmer skeleton */
  .ts-skbar{
    height:.7em; border-radius:3px;
    background:linear-gradient(90deg,var(--skel) 0%,var(--skel-mid) 40%,var(--skel-mid) 60%,var(--skel) 100%);
    background-size:200% 100%;
    animation: ts-shim 1.6s linear infinite;
  }
  @keyframes ts-shim{from{background-position:200% 0}to{background-position:-200% 0}}

  /* caret */
  .ts-caret{
    display:inline-block;width:.5em;height:1em;
    background:var(--ink); vertical-align:-2px; margin-left:1px;
    animation: ts-blink 1s steps(2) infinite;
  }
  @keyframes ts-blink{50%{opacity:0}}

  /* live dot */
  .ts-live{ display:inline-flex;align-items:center;gap:6px; }
  .ts-live::before{
    content:""; width:6px;height:6px;border-radius:50%;
    background: var(--accent); display:inline-block;
    animation: ts-pulse 1.4s ease-in-out infinite;
  }
  @keyframes ts-pulse{50%{opacity:.35}}

  /* chips */
  .ts-chip{
    display:inline-flex;align-items:center;gap:6px;
    padding:4px 10px;border-radius:999px;
    background:var(--chip);border:1px solid var(--line);
    font-size:12px;color:var(--ink2);
    font-family:var(--sans);font-weight:500;
  }
  .ts-chip.mono{ font-family:var(--mono);font-size:11px; }
  .ts-chip.active{ background:var(--ink);color:var(--bubble-out-fg);border-color:var(--ink); }

  /* sheets / modals */
  .ts-scrim{
    position:absolute;inset:0; background:var(--overlay);
    backdrop-filter: blur(6px);
    z-index: 10;
  }
  .ts-sheet{
    position:absolute;left:0;right:0;bottom:0;
    background: var(--card);
    border-top-left-radius:22px;border-top-right-radius:22px;
    box-shadow: 0 -8px 32px -16px rgba(0,0,0,.25);
    z-index:11;
    padding: 8px 0 0;
    display:flex;flex-direction:column;
    max-height: 80%;
  }
  .ts-sheet::before{
    content:""; display:block; margin:6px auto 12px;
    width:38px;height:4px;border-radius:3px;
    background: var(--line2);
  }
  .ts-sheet-title{
    padding: 0 20px 12px;
    font-size:18px;font-weight:700;letter-spacing:-0.015em;
  }
  .ts-sheet-sub{
    padding: 0 20px 8px; font-size:13px;color:var(--mute);font-family:var(--mono);
  }

  /* number readouts */
  .num{ font-variant-numeric: tabular-nums; }
`;

// ─── icons (inline svg) ──────────────────────────────────────────
export const TSIcon = {
  burger:  (p) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...p}><path d="M3 6h14M3 10h14M3 14h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  plus:    (p) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...p}><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  chev:    (p) => <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...p}><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  send:    (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M9 14V4M5 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic:     (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><rect x="6.5" y="2.5" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 8.5a5.5 5.5 0 0 0 11 0M9 14v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  attach:  (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M14 8.5l-5.2 5.2a3.2 3.2 0 1 1-4.5-4.5l5.7-5.7a2.1 2.1 0 1 1 3 3l-5.7 5.7a1 1 0 1 1-1.4-1.4l5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:  (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  back:    (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M11 3L4.5 9 11 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more:    (p) => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...p}><circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="16" cy="10" r="1.6"/></svg>,
  copy:    (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  refresh: (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.8M13.5 8a5.5 5.5 0 0 1-9.5 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 1.5V4.5H9M4 14.5V11.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:    (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  pin:     (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M8 1.8l3 3-1.2 1.2 1.5 4.4-2 .6L8 14l-1.3-3 -2 -.6 1.5-4.4L5 4.8l3-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  quote:   (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M2 4h12M2 8h8M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 8h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  globe:   (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" stroke="currentColor" strokeWidth="1.2"/></svg>,
  image:   (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="6" cy="6.5" r="1" stroke="currentColor" strokeWidth="1.2"/><path d="M2.5 12L6 8.5l3 3 2-2 2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  video:   (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><rect x="1.5" y="4" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10.5 7l4-2v6l-4-2v-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  sparkle: (p) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M7 1.5L8 5.5L12.5 7L8 8.5L7 12.5L6 8.5L1.5 7L6 5.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  wallet:  (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8h14M12 11.5h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  history: (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5v4l2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  settings:(p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4"/><path d="M9 1.5V3.5M9 14.5V16.5M16.5 9H14.5M3.5 9H1.5M14.4 3.6l-1.4 1.4M5 13l-1.4 1.4M14.4 14.4L13 13M5 5L3.6 3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  agents:  (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M6 2.5h6l3 3v9h-12V5.5l3-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 8.5l1.5 1.5L11 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star:    (p) => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" {...p}><path d="M7 1l1.8 3.7L13 5.4l-3 2.9.7 4.2L7 10.5 3.3 12.5 4 8.3 1 5.4l4.2-.7L7 1z"/></svg>,
  translate:(p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M2 4h6M5 2v2M3 4c0 3 2 5 4 5M7 4c0 3-2 5-4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M8 14l2.5-6 2.5 6M9 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check:   (p) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  download:(p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M8 2v9M5 8l3 3 3-3M3 14h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share:   (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M8 2v9M5 5l3-3 3 3M3 9v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warning: (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M8 2L14 13H2L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  close:   (p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  square:  (p) => <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" {...p}><rect x="2" y="2" width="8" height="8" rx="1"/></svg>,
};

// ─── Stylesheet injector ─────────────────────────────────────────
// Rendered once at the root of the App. Adds the cabinet's <style>
// to <head> so all scoped CSS variables resolve.
export function TSStyles(){
  return <style dangerouslySetInnerHTML={{ __html: TS_STYLE }}/>;
}

// ─── Phone shell ─────────────────────────────────────────────────
export function Phone({ theme = 'light', accent = 'graphite', density = 'regular', children, screenStyle }){
  const den = density === 'compact' ? 0.92 : density === 'comfy' ? 1.08 : 1;
  const acc = TS_ACCENTS[accent] || TS_ACCENTS.graphite;
  const accentVal = theme === 'dark' ? acc.dark : acc.light;
  return (
    <div className={`ts-root t-${theme}`} style={{ '--den': den, '--accent': accentVal }}>
      <div className="ts-phone">
        <div className="ts-screen" style={screenStyle}>
          <StatusBar/>
          {children}
          <HomeIndicator/>
        </div>
      </div>
    </div>
  );
}

export function StatusBar({ time = '9:41', noIsland = false }){
  return (
    <div className="ts-status">
      <span className="clock">{time}</span>
      {!noIsland && <span className="island"/>}
      <span className="right">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="3" width="3" height="8" rx="1"/><rect x="13.5" y="0.5" width="3" height="10.5" rx="1"/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M1 4a10 10 0 0 1 13 0M3 6.5a6.5 6.5 0 0 1 9 0M5.5 9a3 3 0 0 1 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        <svg width="26" height="11" viewBox="0 0 26 11" fill="none">
          <rect x="0.5" y="0.5" width="22" height="10" rx="2.5" stroke="currentColor" strokeOpacity=".5"/>
          <rect x="2" y="2" width="14" height="7" rx="1.3" fill="currentColor"/>
          <rect x="23.5" y="3.5" width="1.5" height="4" rx=".7" fill="currentColor" fillOpacity=".5"/>
        </svg>
      </span>
    </div>
  );
}

export function HomeIndicator(){ return <div className="ts-home"/>; }

export function ChatHead({ model = 'claude-sonnet-4.5', glyph = 'CL', vendor, onLeft, onRight, leftIcon = 'burger', rightIcon = 'plus' }){
  return (
    <div className="ts-head">
      <button className="ico-btn" aria-label="menu" onClick={onLeft}>{TSIcon[leftIcon]({})}</button>
      <ModelPill name={model} glyph={glyph} vendor={vendor}/>
      <button className="ico-btn" aria-label="new" onClick={onRight}>{TSIcon[rightIcon]({})}</button>
    </div>
  );
}

export function ModelPill({ name, glyph, vendor }){
  return (
    <button className="ts-modelpill" aria-label={`model ${name}`}>
      <span className="glyph">{glyph}</span>
      <span className="nm">{name}</span>
      {vendor && <small>· {vendor}</small>}
      <span className="chev">{TSIcon.chev({})}</span>
    </button>
  );
}

export function Composer({ value = '', placeholder = 'Спроси что угодно…', showSend = false, balance = '847,12 ₽', today = '23,40 ₽', showCtx = true, hideAttach = false }){
  return (
    <div className="ts-composer">
      <div className="row">
        {!hideAttach && <button className="ic" aria-label="attach">{TSIcon.attach({})}</button>}
        <span className={`input ${value ? '' : 'placeholder'}`}>{value || placeholder}</span>
        {showSend
          ? <button className="ic send" aria-label="send">{TSIcon.send({})}</button>
          : <button className="ic voice" aria-label="voice">{TSIcon.mic({})}</button>
        }
      </div>
      {showCtx && (
        <div className="ctx">
          <span>остаток · <b>{balance}</b></span>
          <span>сегодня · <b>{today}</b></span>
        </div>
      )}
    </div>
  );
}

export function UserBubble({ children }){ return <div className="ts-q">{children}</div>; }

export function CostMeta({ rub, tokens, model, right = false, showCost = true }){
  if (!showCost) return null;
  if (right){
    return (
      <div className="ts-meta right">
        <span><b className="num">{rub} ₽</b></span>
        <span className="dot"/>
        <span className="num">{tokens} ток</span>
      </div>
    );
  }
  return (
    <div className="ts-meta">
      <span><b className="num">{rub} ₽</b></span>
      <span className="dot"/>
      <span className="num">{tokens} ток</span>
      {model && <><span className="dot"/><span>{model}</span></>}
    </div>
  );
}

export function DayLabel({ children }){
  return <div style={{ textAlign:'center', fontFamily:'var(--mono)', fontSize:11, color:'var(--mute)', margin:'2px 0 4px', letterSpacing:'.04em' }}>{children}</div>;
}
