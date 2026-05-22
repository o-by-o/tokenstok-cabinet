"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const STYLE = `
  .au-form{ display:flex; flex-direction:column; gap:14px; }
  .au-form h2{ margin:0 0 4px; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
  .au-form label{ display:flex; flex-direction:column; gap:6px; font-size:13px; font-weight:500; color:#2a2a2a; }
  .au-form input{
    appearance:none; width:100%; min-width:0;
    background:#fff; border:1px solid #e6e3da; border-radius:12px;
    padding:12px 14px;
    font-family:var(--font-manrope), sans-serif; font-size:15px; color:#0c0c0c;
    outline:none; transition:border-color .12s;
  }
  .au-form input:focus{ border-color:#0c0c0c; }
  .au-form .err{
    background:rgba(194, 90, 53, 0.08); border:1px solid #c25a35; border-radius:10px;
    padding:10px 12px; color:#c25a35; font-size:13px; line-height:1.4;
  }
  .au-form .btn{
    appearance:none; border:0; cursor:pointer;
    background:#0c0c0c; color:#faf9f6;
    padding:14px 20px; border-radius:12px;
    font-family:var(--font-manrope), sans-serif; font-weight:600; font-size:15px;
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    transition:transform .12s, opacity .12s;
  }
  .au-form .btn:hover{ transform:translateY(-1px); }
  .au-form .btn:disabled{ opacity:.55; cursor:wait; }
  .au-form .alt{
    font-size:13px; color:#6c6c6c; text-align:center; padding-top:8px;
    border-top:1px dashed #e6e3da; margin-top:4px;
  }
  .au-form .alt a{ color:#0c0c0c; font-weight:600; text-decoration:none; }
  .au-form .alt a:hover{ text-decoration:underline; text-underline-offset:4px; }
  .au-form .sep{
    display:flex; align-items:center; gap:10px; color:#9b9b9b; font-size:12px;
    text-transform:uppercase; letter-spacing:0.1em; padding:4px 0;
  }
  .au-form .sep::before, .au-form .sep::after{
    content:""; flex:1; height:1px; background:#e6e3da;
  }
  .au-form .ghost{
    appearance:none; cursor:pointer;
    background:transparent; color:#0c0c0c;
    border:1px solid #d8d3c4; padding:12px 18px; border-radius:12px;
    font-family:var(--font-manrope), sans-serif; font-weight:500; font-size:14px;
  }
  .au-form .ghost:hover{ background:#f0ede4; }
  .au-form .ghost:disabled{ opacity:.55; cursor:wait; }
  .au-form .ok{
    background:rgba(20, 110, 64, 0.08); border:1px solid #146e40; border-radius:10px;
    padding:10px 12px; color:#146e40; font-size:13px; line-height:1.4;
  }
  .au-form .miniLink{
    background:none; border:0; color:#6c6c6c; font-size:12px; cursor:pointer; padding:0;
    text-align:right; text-decoration:underline; text-underline-offset:3px;
  }
  .au-form .miniLink:hover{ color:#0c0c0c; }
`;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/chat";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Magic-link state — отдельная мини-форма
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSending, setMagicSending] = useState(false);
  const [magicSentMsg, setMagicSentMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email или пароль.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  const requestMagic = async (e) => {
    e.preventDefault();
    const value = (magicEmail || email).trim().toLowerCase();
    if (!value) return;
    setMagicSending(true);
    setMagicSentMsg(null);
    const res = await fetch("/api/auth/magic/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    setMagicSending(false);
    if (res.ok) {
      // Не показываем существование email — просто переходим на check-inbox
      router.push(`/auth/check-inbox?reason=magic&email=${encodeURIComponent(value)}`);
    } else {
      const body = await res.json().catch(() => ({}));
      setMagicSentMsg(body.error || "Не получилось отправить ссылку. Попробуйте ещё раз.");
    }
  };

  const requestReset = async () => {
    const value = (email || magicEmail).trim().toLowerCase();
    if (!value) { setError("Сначала укажите email."); return; }
    const res = await fetch("/api/auth/password/reset/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    if (res.ok) {
      router.push(`/auth/check-inbox?reason=reset&email=${encodeURIComponent(value)}`);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Не получилось отправить письмо. Попробуйте позже.");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <form className="au-form" onSubmit={submit}>
        <h2>Войти</h2>
        {error && <div className="err">{error}</div>}
        <label>
          <span>Email</span>
          <input
            type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="ты@пример.рф"
          />
        </label>
        <label>
          <span>Пароль</span>
          <input
            type="password" required autoComplete="current-password" minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 8 символов"
          />
        </label>
        <button type="button" className="miniLink" onClick={requestReset}>Забыли пароль?</button>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "..." : "Войти →"}
        </button>
      </form>

      <div className="au-form sep">или</div>

      <form className="au-form" onSubmit={requestMagic}>
        <h2 style={{ fontSize:18 }}>Получить ссылку для входа</h2>
        {magicSentMsg && <div className="err">{magicSentMsg}</div>}
        <label>
          <span>Email</span>
          <input
            type="email" required autoComplete="email"
            value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)}
            placeholder="ты@пример.рф"
          />
        </label>
        <button className="ghost" type="submit" disabled={magicSending}>
          {magicSending ? "..." : "Отправить ссылку на email"}
        </button>
        <div className="alt">
          Нет аккаунта? <Link href="/register">Завести</Link>
        </div>
      </form>
    </>
  );
}
