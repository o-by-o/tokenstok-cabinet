"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  .au-form .hint{ font-family:var(--font-jetbrains-mono), monospace; font-size:11px; color:#6c6c6c; line-height:1.4; }
`;

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(body.error || "Не получилось зарегистрироваться. Попробуй ещё раз.");
      return;
    }
    // auto-sign-in after register
    const sign = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (sign?.error) {
      setError("Зарегистрировались, но не получилось войти. Попробуй на странице входа.");
      return;
    }
    // Подтверждение email можно сделать позже — пока пускаем сразу в кабинет.
    router.push(`/auth/check-inbox?reason=verify&email=${encodeURIComponent(email)}`);
    router.refresh();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <form className="au-form" onSubmit={submit}>
        <h2>Зарегистрироваться</h2>
        {error && <div className="err">{error}</div>}
        <label>
          <span>Имя (необязательно)</span>
          <input
            type="text" autoComplete="name" maxLength={80}
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="как обращаться"
          />
        </label>
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
            type="password" required autoComplete="new-password" minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 8 символов"
          />
        </label>
        <div className="hint">
          После регистрации зачислим 100 ₽ — попробовать несколько моделей.
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "..." : "Завести аккаунт →"}
        </button>
        <div className="alt">
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </div>
      </form>
    </>
  );
}
