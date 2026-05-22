"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const STYLE = `
  .mc-box{ display:flex; flex-direction:column; gap:14px; }
  .mc-box h2{ margin:0 0 4px; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
  .mc-box .ok{ font-size:14px; color:#2a2a2a; line-height:1.5; }
  .mc-box .err{
    background:rgba(194, 90, 53, 0.08); border:1px solid #c25a35; border-radius:10px;
    padding:10px 12px; color:#c25a35; font-size:13px; line-height:1.4;
  }
  .mc-box .btn{
    appearance:none; border:0; cursor:pointer;
    background:#0c0c0c; color:#faf9f6;
    padding:14px 20px; border-radius:12px;
    font-family:var(--font-manrope), sans-serif; font-weight:600; font-size:15px;
    text-align:center; text-decoration:none;
  }
`;

export function MagicLinkConsume() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ kind: "pending" });

  useEffect(() => {
    if (!token) { setState({ kind: "error", msg: "Ссылка повреждена — нет токена." }); return; }
    let cancelled = false;
    (async () => {
      const res = await signIn("magic-link", { token, redirect: false });
      if (cancelled) return;
      if (res?.error) {
        setState({ kind: "error", msg: "Ссылка недействительна или истекла. Запросите новую." });
        return;
      }
      setState({ kind: "ok" });
      router.push("/chat");
      router.refresh();
    })();
    return () => { cancelled = true; };
  }, [token, router]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="mc-box">
        <h2>Входим...</h2>
        {state.kind === "pending" && <div className="ok">Проверяем ссылку. Это займёт пару секунд.</div>}
        {state.kind === "ok"      && <div className="ok">Готово. Перенаправляем в кабинет.</div>}
        {state.kind === "error"   && (
          <>
            <div className="err">{state.msg}</div>
            <a className="btn" href="/login">Назад ко входу</a>
          </>
        )}
      </div>
    </>
  );
}
