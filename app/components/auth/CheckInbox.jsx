"use client";

import { useSearchParams } from "next/navigation";

const STYLE = `
  .ci-box{ display:flex; flex-direction:column; gap:14px; }
  .ci-box h2{ margin:0 0 4px; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
  .ci-box p{ margin:0; font-size:14px; color:#2a2a2a; line-height:1.55; }
  .ci-box .email{ font-family:var(--font-jetbrains-mono), monospace; font-size:13px; color:#0c0c0c; background:#f0ede4; padding:2px 6px; border-radius:6px; }
  .ci-box .hint{ font-size:12px; color:#6c6c6c; line-height:1.5; }
  .ci-box .btn{
    appearance:none; border:0; cursor:pointer;
    background:#0c0c0c; color:#faf9f6;
    padding:14px 20px; border-radius:12px;
    font-family:var(--font-manrope), sans-serif; font-weight:600; font-size:15px;
    text-decoration:none; text-align:center;
  }
`;

export function CheckInbox() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const reason = params.get("reason") || "magic"; // "magic" | "verify" | "reset"

  let heading = "Проверьте почту";
  let body = "Мы отправили вам письмо со ссылкой. Откройте его и кликните по кнопке.";
  if (reason === "verify") {
    heading = "Подтвердите email";
    body = "Мы отправили письмо с подтверждением. Перейдите по ссылке, чтобы активировать аккаунт.";
  } else if (reason === "reset") {
    heading = "Ссылка отправлена";
    body = "Если email есть в системе — на него уйдёт письмо со ссылкой для сброса пароля.";
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ci-box">
        <h2>{heading}</h2>
        <p>{body}</p>
        {email && <p>Адрес: <span className="email">{email}</span></p>}
        <p className="hint">
          Письмо может попасть в «Спам» или «Промоакции». Ссылка работает один раз
          и истекает через 15 минут (magic link) / 1 час (сброс пароля) / 24 часа (подтверждение).
        </p>
        <a className="btn" href="/login">Назад ко входу</a>
      </div>
    </>
  );
}
