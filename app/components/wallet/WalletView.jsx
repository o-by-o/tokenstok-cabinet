"use client";

// WalletView.jsx — реальные данные (балансы / расход / транзакции) +
// пополнение через PayMaster (POST /api/payments/paymaster/create →
// redirect на paymentUrl).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBreakpoint } from "../../lib/hooks";
import { useDispatch } from "../../lib/store";
import { TSIcon } from "../../cabinet/foundation";

const STYLE = `
  .wv{ flex:1; min-height:0; display:flex; flex-direction:column; background:var(--bg); height:100dvh; }
  .wv-hd{
    padding:12px 16px; border-bottom:1px solid var(--line);
    display:flex; align-items:center; gap:10px;
    position:sticky; top:0; background:var(--bg); z-index:5;
  }
  .wv-hd .icobtn{
    width:36px; height:36px; border-radius:50%;
    display:grid; place-items:center;
    background:transparent; border:1px solid var(--line); color:var(--ink); cursor:pointer;
  }
  .wv-hd .icobtn:hover{ background:var(--chip); }
  .wv-hd .lbl{ font-family:var(--mono); font-size:11.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; flex:1; }
  .wv-body{ flex:1; overflow-y:auto; padding:18px 18px 40px; }
  .wv-inner{ max-width:560px; margin:0 auto; display:flex; flex-direction:column; gap:18px; }

  .balance-eyebrow{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.04em; }
  .balance-amount{
    display:flex; align-items:baseline; gap:8px; margin-top:4px;
    font-family:var(--sans); font-weight:800;
    font-size:clamp(48px, 12vw, 72px); letter-spacing:-0.04em; line-height:1;
  }
  .balance-amount .cur{ font-size:.4em; font-weight:600; opacity:.6; }
  .balance-sub{ font-family:var(--mono); font-size:11px; color:var(--mute); margin-top:6px; }
  .balance-sub b{ color:var(--ink2); font-weight:600; }

  .topup-card{
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    padding:14px 16px;
  }
  .topup-card .l{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.04em; margin-bottom:10px; }
  .topup-row{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
  .topup-btn{
    flex:1; min-width:80px; padding:10px 6px; border-radius:10px;
    font:600 12.5px var(--sans); cursor:pointer;
    background:var(--chip); color:var(--ink); border:1px solid var(--line2);
  }
  .topup-btn.active, .topup-btn:hover{ background:var(--ink); color:var(--bubble-out-fg); border-color:var(--ink); }
  .topup-input{
    display:flex; gap:6px;
  }
  .topup-input input{
    flex:1; padding:10px 12px; border-radius:10px; border:1px solid var(--line);
    font-family:var(--sans); font-size:14px; background:var(--bg); color:var(--ink); outline:none;
  }
  .topup-input button{
    padding:10px 16px; border-radius:10px; border:0; background:var(--ink); color:var(--bubble-out-fg);
    font:600 13px var(--sans); cursor:pointer;
  }
  .topup-input button:disabled{ opacity:.55; cursor:wait; }
  .topup-err{
    background:rgba(194, 90, 53, 0.08); border:1px solid #c25a35; border-radius:10px;
    padding:8px 12px; color:#c25a35; font-size:12px; line-height:1.4; margin-top:8px;
  }

  .card{
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    padding:14px 16px;
  }
  .card-head{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; }
  .card-head .l{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.04em; }
  .card-head .r{ font-family:var(--sans); font-weight:700; font-size:18px; letter-spacing:-0.015em; }

  .br-title{ font-family:var(--mono); font-size:10.5px; color:var(--mute); letter-spacing:.06em; text-transform:uppercase; margin-bottom:6px; }
  .br-list{ background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
  .br-row{ display:flex; align-items:center; gap:10px; padding:10px 14px; }
  .br-row + .br-row{ border-top:1px solid var(--line); }
  .br-row .gly{
    width:26px; height:26px; border-radius:7px;
    background:var(--chip); border:1px solid var(--line2);
    display:grid; place-items:center; font-family:var(--mono); font-weight:700; font-size:10.5px;
    flex-shrink:0;
  }
  .br-row .nm{ flex:1; font-size:13.5px; font-weight:500; font-family:var(--mono); }
  .br-row .n{ font-family:var(--mono); font-size:11px; color:var(--mute); }
  .br-row .c{ font-family:var(--mono); font-size:13px; font-weight:600; }

  .tx-row{ display:flex; align-items:center; gap:10px; padding:10px 14px; }
  .tx-row + .tx-row{ border-top:1px solid var(--line); }
  .tx-row .tx-kind{
    width:30px; height:30px; border-radius:8px; display:grid; place-items:center;
    background:var(--chip); border:1px solid var(--line2); flex-shrink:0;
    font-family:var(--mono); font-weight:700; font-size:14px;
  }
  .tx-row .tx-kind.topup{ background:rgba(20,110,64,0.08); border-color:#146e40; color:#146e40; }
  .tx-row .tx-kind.spend{ background:rgba(194,90,53,0.08); border-color:#c25a35; color:#c25a35; }
  .tx-row .tx-desc{ flex:1; min-width:0; }
  .tx-row .tx-desc .t{ font-size:13px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tx-row .tx-desc .s{ font-family:var(--mono); font-size:10.5px; color:var(--mute); margin-top:1px; }
  .tx-row .tx-amount{ font-family:var(--mono); font-size:13.5px; font-weight:700; flex-shrink:0; }
  .tx-row .tx-amount.plus{ color:#146e40; }
  .tx-row .tx-amount.minus{ color:#c25a35; }

  .skeleton{ background:var(--chip); border-radius:8px; }
`;

const QUICK_AMOUNTS = [500, 1000, 3000, 5000];

function fmtRub(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "0,00";
  return n.toFixed(2).replace(".", ",");
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function txGlyph(kind) {
  if (kind === "topup")  return "+";
  if (kind === "spend")  return "−";
  if (kind === "refund") return "↺";
  if (kind === "bonus")  return "★";
  return "·";
}

function txDescriptionLabel(t) {
  if (t.description) return t.description;
  if (t.kind === "topup")  return "Пополнение баланса";
  if (t.kind === "spend")  return "Запрос к модели";
  if (t.kind === "refund") return "Возврат";
  if (t.kind === "bonus")  return "Бонус";
  return t.kind;
}

export function WalletView() {
  const bp = useBreakpoint();
  const dispatch = useDispatch();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount,  setAmount]  = useState(500);
  const [custom,  setCustom]  = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError,   setTopupError]   = useState(null);

  // Загружаем сводку при монтаже.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wallet");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (cancelled) return;
        setData(body);
        if (body.balance != null) dispatch({ type: "wallet/balance", value: body.balance });
      } catch (err) {
        console.error("[wallet] load failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  const startTopup = async () => {
    const amt = Number(custom) > 0 ? Number(custom) : amount;
    if (!Number.isFinite(amt) || amt < 100 || amt > 100_000) {
      setTopupError("Сумма должна быть от 100 до 100 000 ₽.");
      return;
    }
    setTopupError(null);
    setTopupLoading(true);
    try {
      const res = await fetch("/api/payments/paymaster/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amountRub: amt }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.paymentUrl) {
        setTopupError(body.error || `Не получилось создать платёж (HTTP ${res.status}).`);
        setTopupLoading(false);
        return;
      }
      window.location.href = body.paymentUrl;
    } catch (err) {
      console.error("[wallet] topup failed", err);
      setTopupError("Сеть отвалилась. Попробуйте ещё раз.");
      setTopupLoading(false);
    }
  };

  const balance       = Number(data?.balance ?? 0);
  const todaySpend    = Number(data?.todaySpendRub ?? 0);
  const byModel       = data?.byModel       ?? [];
  const transactions  = data?.transactions  ?? [];

  // «Хватит на сколько дней» — грубая оценка на основе сегодняшнего расхода
  const daysLeft = todaySpend > 0.01
    ? Math.floor(balance / Math.max(todaySpend, 0.5))
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="wv">
        <header className="wv-hd">
          {bp.isMobile && (
            <Link href="/chat" className="icobtn" aria-label="назад">{TSIcon.back({})}</Link>
          )}
          <span className="lbl">кошелёк</span>
          <Link href="/settings" className="icobtn" aria-label="настройки">{TSIcon.settings({})}</Link>
        </header>

        <div className="wv-body">
          <div className="wv-inner">
            <div>
              <div className="balance-eyebrow">остаток на счёте</div>
              <div className="balance-amount">
                {loading ? (
                  <span className="skeleton" style={{ width: 180, height: 56 }}/>
                ) : (
                  <>
                    <span className="num">{fmtRub(balance)}</span>
                    <span className="cur">₽</span>
                  </>
                )}
              </div>
              {!loading && (
                <div className="balance-sub">
                  {daysLeft != null
                    ? <>хватит на <b>~ {daysLeft} дней</b> при текущем расходе</>
                    : <>сегодня вы ещё не тратили — самое время попробовать модель</>}
                </div>
              )}
            </div>

            {/* Пополнение */}
            <div className="topup-card">
              <div className="l">пополнить</div>
              <div className="topup-row">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    className={`topup-btn ${amount === a && !custom ? "active" : ""}`}
                    onClick={() => { setAmount(a); setCustom(""); }}
                  >
                    {a} ₽
                  </button>
                ))}
              </div>
              <div className="topup-input">
                <input
                  type="number" min={100} max={100000}
                  placeholder="другая сумма, ₽"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />
                <button onClick={startTopup} disabled={topupLoading}>
                  {topupLoading ? "..." : "Оплатить →"}
                </button>
              </div>
              {topupError && <div className="topup-err">{topupError}</div>}
            </div>

            {/* Сегодня */}
            <div className="card">
              <div className="card-head">
                <span className="l">сегодня</span>
                <span className="r"><span className="num">{fmtRub(todaySpend)}</span> ₽</span>
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize: 11, color: "var(--mute)" }}>
                {todaySpend > 0 ? "расход за сутки" : "пока ни одного запроса"}
              </div>
            </div>

            {/* По моделям */}
            {byModel.length > 0 && (
              <div>
                <div className="br-title">по моделям · 30 дней</div>
                <div className="br-list">
                  {byModel.map((b) => (
                    <div key={b.id} className="br-row">
                      <span className="gly">{b.glyph}</span>
                      <span className="nm">{b.id}</span>
                      <span className="n">{b.n} зап.</span>
                      <span className="c"><span className="num">{fmtRub(b.c)}</span> ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* История операций */}
            <div>
              <div className="br-title">история операций</div>
              <div className="br-list">
                {transactions.length === 0 && !loading && (
                  <div className="br-row" style={{ color: "var(--mute)", fontSize: 13 }}>
                    Транзакций ещё нет.
                  </div>
                )}
                {transactions.map((t) => {
                  const amt = Number(t.amountRub);
                  const isPlus = amt > 0;
                  return (
                    <div key={t.id} className="tx-row">
                      <span className={`tx-kind ${t.kind}`}>{txGlyph(t.kind)}</span>
                      <div className="tx-desc">
                        <div className="t">{txDescriptionLabel(t)}</div>
                        <div className="s">{fmtDate(t.createdAt)} · {t.status}</div>
                      </div>
                      <span className={`tx-amount ${isPlus ? "plus" : "minus"}`}>
                        {isPlus ? "+" : ""}{fmtRub(amt)} ₽
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
