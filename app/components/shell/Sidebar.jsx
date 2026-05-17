"use client";

// Sidebar.jsx — chat history + search + profile snippet + topup button.
// Used both for desktop persistent sidebar and inside MobileDrawer.

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TSIcon } from "../../cabinet/foundation";
import { TS_MODELS } from "../../cabinet/data";
import { useApp, useChatList, useDispatch } from "../../lib/store";
import { relTime, fmtRub } from "../../lib/utils";

const STYLE = `
  .sb{ display:flex; flex-direction:column; height:100%; min-height:0; }
  .sb-hd{ padding:14px 16px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .sb-hd .brand{ font-weight:800; font-size:18px; letter-spacing:-0.02em; }
  .sb-hd .brand small{ color:var(--mute); font-weight:500; font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; display:block; margin-top:1px; }
  .sb-newbtn{
    width:34px; height:34px; border-radius:50%;
    display:grid; place-items:center;
    background:var(--ink); color:var(--bubble-out-fg); border:0;
    cursor:pointer;
  }
  .sb-search{ padding:0 12px 10px; }
  .sb-search-row{
    display:flex; align-items:center; gap:10px;
    padding:9px 12px; border-radius:12px;
    background:var(--chip); border:1px solid var(--line);
  }
  .sb-search-row input{
    flex:1; border:0; background:transparent; outline:none;
    font:500 13.5px/1 var(--sans); color:var(--ink); min-width:0;
  }
  .sb-search-row input::placeholder{ color:var(--mute); }
  .sb-search-row kbd{
    font-family:var(--mono); font-size:10.5px; color:var(--mute);
    padding:2px 6px; border:1px solid var(--line); border-radius:4px;
  }
  .sb-nav{ padding:2px 12px 8px; display:flex; flex-direction:column; gap:1px; }
  .sb-navlink{
    display:flex; align-items:center; gap:10px;
    padding:8px 10px; border-radius:8px;
    color:var(--ink2); font-size:13.5px; font-weight:500;
    text-decoration:none; cursor:pointer;
  }
  .sb-navlink:hover{ background:var(--chip); }
  .sb-navlink.active{ background:var(--chip); color:var(--ink); font-weight:600; }
  .sb-navlink small{ margin-left:auto; font-family:var(--mono); font-size:10.5px; color:var(--mute); font-weight:500; }
  .sb-section{ padding:10px 16px 4px; font-family:var(--mono); font-size:10px; color:var(--mute); letter-spacing:.08em; text-transform:uppercase; }
  .sb-scroll{ flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; }
  .sb-chat{
    display:flex; align-items:center; gap:10px;
    padding:9px 14px; border-left:2px solid transparent;
    cursor:pointer;
  }
  .sb-chat:hover{ background:var(--chip); }
  .sb-chat.active{ background:var(--chip); border-left-color:var(--ink); }
  .sb-chat .gly{
    width:28px; height:28px; border-radius:7px;
    background:var(--card); border:1px solid var(--line);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:700; font-size:10.5px;
    flex-shrink:0;
  }
  .sb-chat .meta{ flex:1; min-width:0; }
  .sb-chat .ttl{ font-size:13.5px; font-weight:600; letter-spacing:-0.005em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:flex; align-items:center; gap:6px; }
  .sb-chat .ttl svg{ flex-shrink:0; }
  .sb-chat .pre{ font-family:var(--mono); font-size:11px; color:var(--mute); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sb-chat .when{ font-family:var(--mono); font-size:10.5px; color:var(--mute); flex-shrink:0; }
  /* hover kebab + popover */
  .sb-chat{ position:relative; }
  .sb-kebab{
    width:24px; height:24px; border-radius:6px;
    border:0; background:transparent; color:var(--mute); cursor:pointer;
    display:none; align-items:center; justify-content:center;
    flex-shrink:0; padding:0;
  }
  .sb-chat:hover .sb-kebab{ display:flex; }
  .sb-chat .sb-kebab.open{ display:flex; color:var(--ink); background:var(--card); }
  .sb-kebab:hover{ background:var(--card); color:var(--ink); }
  .sb-pop{
    position:absolute; right:8px; top:calc(100% - 6px);
    background:var(--card); border:1px solid var(--line); border-radius:10px;
    box-shadow:0 18px 50px -16px rgba(0,0,0,.35);
    padding:4px; min-width:180px; z-index:20;
  }
  .sb-pop button{
    display:flex; align-items:center; gap:10px;
    width:100%; padding:8px 10px; border:0; background:transparent;
    border-radius:6px; cursor:pointer; font:500 13px var(--sans); color:var(--ink);
    text-align:left;
  }
  .sb-pop button:hover{ background:var(--chip); }
  .sb-pop button.danger{ color:#c25a35; }
  .sb-pop hr{ border:0; border-top:1px solid var(--line); margin:4px 2px; }
  .sb-foot{
    margin:8px; padding:10px 12px;
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    display:flex; align-items:center; gap:10px;
  }
  .sb-foot .av{
    width:34px; height:34px; border-radius:50%;
    background:var(--ink); color:var(--bubble-out-fg);
    display:grid; place-items:center;
    font-family:var(--mono); font-weight:700; font-size:13px;
    flex-shrink:0;
  }
  .sb-foot .meta{ flex:1; min-width:0; }
  .sb-foot .meta .n{ font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sb-foot .meta .b{ font-family:var(--mono); font-size:11px; color:var(--mute); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sb-foot .meta .b b{ color:var(--ink2); font-weight:600; }
  .sb-foot button.topup{
    background:var(--ink); color:var(--bubble-out-fg); border:0; border-radius:9px;
    padding:6px 10px; font-family:var(--sans); font-size:12px; font-weight:600; cursor:pointer; flex-shrink:0;
  }
`;

const NAV = [
  { href: "/chat", icon: "burger", label: "Чаты" },
  { href: "/agents", icon: "agents", label: "Эксперты" },
  { href: "/library", icon: "sparkle", label: "Библиотека" },
  { href: "/compare", icon: "quote", label: "Сравнение" },
  { href: "/wallet", icon: "wallet", label: "Кошелёк" },
  { href: "/settings", icon: "settings", label: "Настройки" },
];

export function Sidebar() {
  const { state } = useApp();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const chats = useChatList();
  const [q, setQ] = useState("");

  const { pinned, recent } = useMemo(() => {
    const filtered = q.trim()
      ? chats.filter((c) => (c.title + " " + (c.messages[0]?.text || "")).toLowerCase().includes(q.toLowerCase()))
      : chats;
    return {
      pinned: filtered.filter((c) => c.pinned),
      recent: filtered.filter((c) => !c.pinned),
    };
  }, [chats, q]);

  const newChat = () => {
    dispatch({ type: "chat/new" });
    router.push("/chat");
  };

  const openChat = (id) => {
    dispatch({ type: "chat/select", id });
    router.push("/chat");
  };

  const initials = "АК";
  const balance = fmtRub(state.wallet.balance);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="sb">
        <div className="sb-hd">
          <div className="brand">ТокенСток<small>218 моделей · оплата по факту</small></div>
          <button className="sb-newbtn" aria-label="Новый чат" onClick={newChat}>{TSIcon.plus({ width: 16, height: 16 })}</button>
        </div>

        <div className="sb-search">
          <div className="sb-search-row">
            {TSIcon.search({})}
            <input
              type="search"
              placeholder="Поиск по чатам"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <kbd>⌘K</kbd>
          </div>
        </div>

        <div className="sb-nav">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href === "/chat" && pathname.startsWith("/chat"));
            return (
              <Link key={n.href} href={n.href} className={`sb-navlink ${active ? "active" : ""}`}>
                {TSIcon[n.icon]({ width: 16, height: 16 })}
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="sb-scroll no-scroll-bars">
          {pinned.length > 0 && (
            <>
              <div className="sb-section">закреплённые</div>
              {pinned.map((c) => <ChatRow key={c.id} chat={c} active={c.id === state.chats.currentId} onClick={() => openChat(c.id)} />)}
            </>
          )}
          {recent.length > 0 && (
            <>
              <div className="sb-section">{pinned.length ? "недавние" : "история"}</div>
              {recent.map((c) => <ChatRow key={c.id} chat={c} active={c.id === state.chats.currentId} onClick={() => openChat(c.id)} />)}
            </>
          )}
          {q && pinned.length + recent.length === 0 && (
            <div style={{ padding:"20px 16px", color:"var(--mute)", fontSize:13 }}>Ничего не нашлось.</div>
          )}
        </div>

        <div className="sb-foot">
          <div className="av">{initials}</div>
          <div className="meta">
            <div className="n">Аня Кравченко</div>
            <div className="b">остаток · <b>{balance}</b></div>
          </div>
          <button className="topup" onClick={() => router.push("/wallet")}>+ 1 000 ₽</button>
        </div>
      </div>
    </>
  );
}

function ChatRow({ chat, active, onClick }){
  const model = TS_MODELS.find((m) => m.id === chat.modelId);
  const last = chat.messages.at(-1);
  const preview = last ? (last.role === "user" ? "ты: " : "") + last.text : "пустой чат";
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const popRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => { setMounted(true); }, []);
  // close popover on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const off = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("pointerdown", off, true);
    return () => document.removeEventListener("pointerdown", off, true);
  }, [menuOpen]);

  const rename = () => {
    setMenuOpen(false);
    const next = window.prompt("Переименовать чат:", chat.title || "");
    if (next && next.trim()) dispatch({ type: "chat/rename", id: chat.id, title: next.trim() });
  };
  const togglePin = () => { setMenuOpen(false); dispatch({ type: "chat/togglePin", id: chat.id }); };
  const remove = () => {
    setMenuOpen(false);
    if (window.confirm(`Удалить «${chat.title || "Новый чат"}»?`)) dispatch({ type: "chat/delete", id: chat.id });
  };

  return (
    <div className={`sb-chat ${active ? "active" : ""}`} onClick={(e) => {
      // ignore clicks on kebab / popover
      if (e.target.closest(".sb-kebab,.sb-pop")) return;
      onClick();
    }}>
      <span className="gly">{model?.glyph || "··"}</span>
      <div className="meta">
        <div className="ttl">
          {chat.pinned && TSIcon.pin({ width: 10, height: 10 })}
          <span>{chat.title || "Новый чат"}</span>
        </div>
        <div className="pre">{preview}</div>
      </div>
      <div className="when" suppressHydrationWarning>{mounted ? relTime(chat.updatedAt) : ""}</div>
      <button
        className={`sb-kebab ${menuOpen ? "open" : ""}`}
        aria-label="действия с чатом"
        onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
      >
        {TSIcon.more({ width: 14, height: 14 })}
      </button>
      {menuOpen && (
        <div className="sb-pop" ref={popRef} onClick={(e) => e.stopPropagation()}>
          <button onClick={rename}>{TSIcon.edit({})} Переименовать</button>
          <button onClick={togglePin}>{TSIcon.pin({})} {chat.pinned ? "Открепить" : "Закрепить"}</button>
          <hr/>
          <button className="danger" onClick={remove}>{TSIcon.close({})} Удалить</button>
        </div>
      )}
    </div>
  );
}
