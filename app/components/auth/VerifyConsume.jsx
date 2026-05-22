"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STYLE = `
  .vc-box{ display:flex; flex-direction:column; gap:14px; }
  .vc-box h2{ margin:0 0 4px; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
  .vc-box .ok{ font-size:14px; color:#2a2a2a; line-height:1.5; }
  .vc-box .err{
    background:rgba(194, 90, 53, 0.08); border:1px solid #c25a35; border-radius:10px;
    padding:10px 12px; color:#c25a35; font-size:13px; line-height:1.4;
  }
  .vc-box .btn{
    appearance:none; border:0; cursor:pointer;
    background:#0c0c0c; color:#faf9f6;
    padding:14px 20px; border-radius:12px;
    font-family:var(--font-manrope), sans-serif; font-weight:600; font-size:15px;
    text-align:center; text-decoration:none;
  }
`;

export function VerifyConsume() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ kind: "pending" });

  useEffect(() => {
    if (!token) { setState({ kind: "error", msg: "Ссылка повреждена — нет токена." }); return; }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/verify/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (cancelled) return;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState({ kind: "error", msg: body.error || "Ссылка недействительна или истекла." });
        return;
      }
      setState({ kind: "ok" });
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="vc-box">
        <h2>Подтверждение email</h2>
        {state.kind === "pending" && <div className="ok">Проверяем ссылку...</div>}
        {state.kind === "ok"      && (
          <>
            <div className="ok">Email подтверждён. Можно входить.</div>
            <a className="btn" href="/login">Войти</a>
          </>
        )}
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
