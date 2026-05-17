"use client";

// BottomTabBar.jsx — mobile-only bottom nav. Mirrors screens-util.jsx
// ScreenProfile bottom bar exactly: 4 tabs — чаты / модели / кошелёк / настройки.
// "Модели" is not a route — it opens the model-picker sheet inside the
// current chat. Agents/Library/Compare live in the sidebar drawer.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TSIcon } from "../../cabinet/foundation";
import { useDispatch } from "../../lib/store";

const STYLE = `
  .btb{
    position:sticky; bottom:0; z-index:6;
    display:flex; justify-content:space-around; align-items:center;
    padding:10px 0 8px;
    background:var(--bg);
    border-top:1px solid var(--line);
  }
  @media (min-width: 1024px){ .btb{ display:none; } }
  .btb a, .btb button{
    display:flex; flex-direction:column; align-items:center; gap:2px;
    color:var(--mute); text-decoration:none;
    padding:4px 12px;
    background:transparent; border:0; cursor:pointer; font:inherit;
  }
  .btb a.active, .btb button.active{ color:var(--ink); }
  .btb a .lb, .btb button .lb{
    font-family:var(--mono); font-size:9px; letter-spacing:.04em; text-transform:uppercase; font-weight:500;
  }
  .btb a.active .lb, .btb button.active .lb{ font-weight:700; }
`;

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isChat = pathname.startsWith("/chat");
  const isWallet = pathname === "/wallet";
  const isSettings = pathname === "/settings";

  const openModels = () => {
    if (!isChat) router.push("/chat");
    dispatch({ type: "ui/openSheet", sheet: "picker" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <nav className="btb" aria-label="навигация">
        <Link href="/chat" className={isChat ? "active" : ""}>
          {TSIcon.burger({ width: 18, height: 18 })}
          <span className="lb">чаты</span>
        </Link>
        <button onClick={openModels} aria-label="открыть picker моделей">
          {TSIcon.sparkle({ width: 16, height: 16 })}
          <span className="lb">модели</span>
        </button>
        <Link href="/wallet" className={isWallet ? "active" : ""}>
          {TSIcon.wallet({ width: 18, height: 18 })}
          <span className="lb">кошелёк</span>
        </Link>
        <Link href="/settings" className={isSettings ? "active" : ""}>
          {TSIcon.settings({ width: 18, height: 18 })}
          <span className="lb">настройки</span>
        </Link>
      </nav>
    </>
  );
}
