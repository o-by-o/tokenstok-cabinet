// app/lib/mail.js
// Транспорт SMTP для отправки писем через Yandex Postbox.
// Конфигурация — через env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM.

import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "[mail] SMTP_HOST / SMTP_USER / SMTP_PASSWORD не заданы в окружении"
    );
  }

  // 465 — implicit TLS, всё остальное — STARTTLS.
  const secure = port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
  });

  return transporter;
}

function getFrom() {
  return process.env.EMAIL_FROM || "noreply@tokenstok.ru";
}

export async function sendMail({ to, subject, html, text }) {
  const from = getFrom();
  const info = await getTransporter().sendMail({ from, to, subject, html, text });
  console.log(`[mail] sent to=${to} subject=${JSON.stringify(subject)} id=${info.messageId}`);
  return info;
}

// ───────────────────────── Templates ─────────────────────────

const BRAND = "ТокенСток";
const FOOTER_TEXT =
  "Это автоматическое письмо, отвечать на него не нужно. Если вы не запрашивали действие — просто проигнорируйте это сообщение.";

function wrap({ heading, body, ctaLabel, ctaUrl }) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0c0c0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;padding:32px;max-width:560px;">
          <tr><td style="font-size:14px;letter-spacing:0.08em;color:#6b6b6b;text-transform:uppercase;padding-bottom:12px;">${BRAND}</td></tr>
          <tr><td style="font-size:22px;font-weight:600;line-height:1.3;padding-bottom:16px;">${heading}</td></tr>
          <tr><td style="font-size:15px;line-height:1.6;color:#2b2b2b;padding-bottom:24px;">${body}</td></tr>
          ${
            ctaLabel && ctaUrl
              ? `<tr><td align="center" style="padding-bottom:24px;">
                   <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#0c0c0c;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:500;">${ctaLabel}</a>
                 </td></tr>
                 <tr><td style="font-size:13px;line-height:1.6;color:#6b6b6b;padding-bottom:24px;word-break:break-all;">
                   Если кнопка не работает, скопируйте ссылку:<br/>
                   <a href="${ctaUrl}" style="color:#6b6b6b;">${ctaUrl}</a>
                 </td></tr>`
              : ""
          }
          <tr><td style="font-size:12px;line-height:1.6;color:#9b9b9b;border-top:1px solid #eeeeee;padding-top:16px;">${FOOTER_TEXT}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function sendMagicLink(email, link) {
  const heading = "Ссылка для входа";
  const body =
    "Чтобы войти в ваш кабинет ТокенСток, нажмите кнопку ниже. Ссылка действует 15 минут и сработает один раз.";
  const text = `Ссылка для входа в ТокенСток (действует 15 минут):\n\n${link}\n\nЕсли вы не запрашивали вход — проигнорируйте письмо.`;
  return sendMail({
    to: email,
    subject: `${BRAND}: вход по ссылке`,
    html: wrap({ heading, body, ctaLabel: "Войти", ctaUrl: link }),
    text,
  });
}

export function sendVerifyEmail(email, link) {
  const heading = "Подтвердите email";
  const body =
    "Чтобы завершить регистрацию в ТокенСток, подтвердите ваш email. Ссылка действует 24 часа.";
  const text = `Подтвердите email для ТокенСток (ссылка действует 24 часа):\n\n${link}`;
  return sendMail({
    to: email,
    subject: `${BRAND}: подтверждение email`,
    html: wrap({ heading, body, ctaLabel: "Подтвердить email", ctaUrl: link }),
    text,
  });
}

export function sendPasswordReset(email, link) {
  const heading = "Сброс пароля";
  const body =
    "Мы получили запрос на сброс пароля. Нажмите кнопку ниже, чтобы задать новый пароль. Ссылка действует 1 час.";
  const text = `Сброс пароля ТокенСток (ссылка действует 1 час):\n\n${link}\n\nЕсли вы не запрашивали сброс — проигнорируйте письмо.`;
  return sendMail({
    to: email,
    subject: `${BRAND}: сброс пароля`,
    html: wrap({ heading, body, ctaLabel: "Сбросить пароль", ctaUrl: link }),
    text,
  });
}
