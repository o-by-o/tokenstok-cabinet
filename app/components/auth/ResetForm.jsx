"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const STYLE = `
  .rf-form{ display:flex; flex-direction:column; gap:14px; }
  .rf-form h2{ margin:0 0 4px; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
  .rf-form label{ display:flex; flex-direction:column; gap:6px; font-size:13px; font-weight:500; color:#2a2a2a; }
  .rf-form input{
    appearance:none; width:100%; min-width:0;
    background:#fff; border:1px solid #e6e3da; border-radius:12px;
    padding:12px 14px;
    font-family:var(--font-manrope), sans-serif; font-size:15px; color:#0c0c0c;
    outline:none; transition:border-color .12s;
  }
  .rf-form input:focus{ border-color:#0c0c0c; }
  .rf-form .err{
    background:rgba(194, 90, 53, 0.08); border:1px solid #c25a35; border-radius:10px;
    padding:10px 12px; color:#c25a35; font-size:13px; line-height:1.4;
  }
  .rf-form .ok{
    background:rgba(20, 110, 64, 0.08); border:1px solid #146e40; border-radius:10px;
    padding:10px 12px; color:#146e40; font-size:13px; line-height:1.4;
  }
  .rf-form .btn{
    appearance:none; border:0; cursor:pointer;
    background:#0c0c0c; color:#faf9f6;
    padding:14px 20px; border-radius:12px;
    font-family:var(--font-manrope), sans-serif; font-weight:600; font-size:15px;
  }
  .rf-form .btn:disabled{ opacity:.55; cursor:wait; }
`;

export function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [pw, setPw]   = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState(null);
  const [ok, setOk]       = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (pw !== pw2) { setError("Пароли не совпадают."); return; }
    if (pw.length < 8) { setError("Пароль слишком короткий (минимум 8 символов)."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/password/reset/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, newPassword: pw }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(body.error || "Не получилось сменить пароль."); return; }
    setOk(true);
    // через пару сек редиректим на login
    setTimeout(() => { router.push("/login"); }, 1200);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <form className="rf-form" onSubmit={submit}>
        <h2>Новый пароль</h2>
        {!token && <div className="err">Ссылка повреждена — нет токена. Запросите сброс заново.</div>}
        {error && <div className="err">{error}</div>}
        {ok    && <div className="ok">Пароль обновлён. Перенаправляем на вход...</div>}
        <label>
          <span>Новый пароль</span>
          <input type="password" required minLength={8} autoComplete="new-password"
                 value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="минимум 8 символов" />
        </label>
        <label>
          <span>Повторите</span>
          <input type="password" required minLength={8} autoComplete="new-password"
                 value={pw2} onChange={(e)=>setPw2(e.target.value)} placeholder="ещё раз" />
        </label>
        <button className="btn" type="submit" disabled={loading || !token || ok}>
          {loading ? "..." : "Сменить пароль →"}
        </button>
      </form>
    </>
  );
}
