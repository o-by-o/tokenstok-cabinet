"use client";

// Logo.jsx — brand mark synced with the landing repo (o-by-o/tokenstok-landing).
// Pulsing ink dot + Manrope-800 wordmark "токен/сток" + optional mono tag.

const STYLE = `
  .tk-logo{
    display:inline-flex; align-items:baseline; gap:2px;
    font-family:var(--sans, var(--font-manrope), sans-serif);
    font-weight:800; font-size:18px; letter-spacing:-0.02em;
    color:inherit;
  }
  .tk-logo .tk-dot{
    width:8px; height:8px; border-radius:50%;
    background:currentColor;
    display:inline-block; margin-right:8px; transform:translateY(-1px);
    animation: tk-logo-pulse 1.6s ease-in-out infinite;
    flex-shrink:0;
  }
  @keyframes tk-logo-pulse { 50% { opacity:.4; } }
  .tk-logo .tk-slash{ color:var(--mute, #6c6c6c); font-weight:500; margin:0 6px; }
  .tk-logo .tk-tag{
    font-family:var(--mono, var(--font-jetbrains-mono), monospace);
    font-size:10.5px; color:var(--mute, #6c6c6c); font-weight:500;
    margin-left:10px; letter-spacing:0;
  }
  @media (prefers-reduced-motion: reduce){
    .tk-logo .tk-dot{ animation:none; }
  }
`;

export function Logo({ tag, as: As = "span" }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <As className="tk-logo">
        <span className="tk-dot" />
        <span>токен</span>
        <span className="tk-slash">/</span>
        <span>сток</span>
        {tag && <small className="tk-tag">{tag}</small>}
      </As>
    </>
  );
}
