"use client";

// BottomTabBar.jsx — mobile-only bottom nav. Mirrors screens-util.jsx
// ScreenProfile bottom bar: чаты / модели / кошелёк / настройки.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TSIcon } from "../../cabinet/foundation";

const STYLE = `
  .btb{
    position:sticky; bottom:0; z-index:6;
    display:flex; justify-content:space-around; align-items:center;
    padding:10px 0 8px;
    background:var(--bg);
    border-top:1px solid var(--line);
  }
  @media (min-width: 1024px){ .btb{ display:none; } }
  .btb a{
    display:flex; flex-direction:column; align-items:center; gap:2px;
    color:var(--mute); text-decoration:none;
    padding:4px 12px;
  }
  .btb a.active{ color:var(--ink); }
  .btb a .lb{
    font-family:var(--mono); font-size:9px; letter-spacing:.04em; text-transform:uppercase; font-weight:500;
  }
  .btb a.active .lb{ font-weight:700; }
`;

const TABS = [
  { href: "/chat",    icon: "burger",  label: "чаты" },
  { href: "/agents",  icon: "agents",  label: "эксперты" },
  { href: "/library", icon: "sparkle", label: "шаблоны" },
  { href: "/wallet",  icon: "wallet",  label: "кошелёк" },
  { href: "/settings",icon: "settings",label: "настр." },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <nav className="btb" aria-label="навигация">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href === "/chat" && pathname.startsWith("/chat"));
          return (
            <Link key={t.href} href={t.href} className={active ? "active" : ""}>
              {TSIcon[t.icon]({ width: 18, height: 18 })}
              <span className="lb">{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
