"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STYLE = `
  .tr-card{
    max-width:520px; margin:48px auto; padding:32px;
    background:#fff; border:1px solid #e6e3da; border-radius:18px;
    font-family:var(--font-manrope), sans-serif;
  }
  .tr-card h1{ margin:0 0 8px; font-size:24px; font-weight:700; letter-spacing:-0.02em; }
  .tr-card p{ margin:0 0 16px; color:#2a2a2a; line-height:1.55; font-size:15px; }
  .tr-card .meta{
    font-family:var(--font-jetbrains-mono), monospace; font-size:12px; color:#6c6c6c;
    background:#f0ede4; padding:8px 12px; border-radius:8px; margin-bottom:20px;
    word-break:break-all;
  }
  .tr-card .actions{ display:flex; gap:10px; flex-wrap:wrap; }
  .tr-card a.btn{
    display:inline-block; padding:12px 20px; border-radius:12px;
    background:#0c0c0c; color:#faf9f6; text-decoration:none; font-weight:600; font-size:14px;
  }
  .tr-card a.ghost{
    display:inline-block; padding:12px 20px; border-radius:12px;
    border:1px solid #d8d3c4; color:#0c0c0c; text-decoration:none; font-weight:500; font-size:14px;
  }
`;

export function TopupResult({ kind }) {
  const params = useSearchParams();
  const txId = params.get("tx") || "";
  const [tx, setTx] = useState(null);

  // Опрашиваем статус транзакции — webhook может прийти с задержкой.
  useEffect(() => {
    if (!txId) return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts++;
      try {
        const res = await fetch(`/api/wallet/transactions/${encodeURIComponent(txId)}`);
        if (!res.ok) return;
        const body = await res.json();
        if (cancelled) return;
        setTx(body.transaction || null);
        if (
          attempts < 10 &&
          body.transaction?.status === "pending"
        ) {
          setTimeout(poll, 2000);
        }
      } catch { /* ignore */ }
    }
    poll();
    return () => { cancelled = true; };
  }, [txId]);

  const isSuccess = kind === "success";
  const finalSuccess = tx?.status === "succeeded";
  const finalFailed  = tx?.status === "failed";

  let title;
  let body;
  if (isSuccess) {
    if (finalSuccess) {
      title = "Платёж принят";
      body  = "Баланс пополнен. Можно возвращаться в чат.";
    } else if (finalFailed) {
      title = "Платёж не прошёл";
      body  = "PayMaster отклонил оплату. Попробуйте ещё раз или другую карту.";
    } else {
      title = "Платёж обрабатывается";
      body  = "PayMaster подтверждает оплату — это обычно занимает до 30 секунд. Страница обновится сама.";
    }
  } else {
    title = "Платёж отменён";
    body  = "Вы вернулись с формы PayMaster без оплаты. Баланс не изменился.";
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="tr-card">
        <h1>{title}</h1>
        <p>{body}</p>
        {txId && <div className="meta">Транзакция: {txId}{tx?.status ? ` · статус: ${tx.status}` : ""}</div>}
        <div className="actions">
          <Link className="btn" href="/wallet">Перейти в кошелёк</Link>
          <Link className="ghost" href="/chat">Вернуться в чат</Link>
        </div>
      </div>
    </>
  );
}
