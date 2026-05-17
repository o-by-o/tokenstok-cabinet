"use client";

// WalletView.jsx — balance hero + topup row + today chart + by-model breakdown.
// Mobile-first, scales to desktop with a max-width.

import Link from "next/link";
import { useBreakpoint } from "../../lib/hooks";
import { useApp, useDispatch } from "../../lib/store";
import { TSIcon } from "../../cabinet/foundation";
import { TS_MODELS } from "../../cabinet/data";
import { fmtRub } from "../../lib/utils";

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

  .topup-row{ display:flex; gap:6px; }
  .topup-btn{
    flex:1; padding:12px 6px; border-radius:12px;
    font:600 12.5px var(--sans); cursor:pointer;
  }
  .topup-btn.primary{ background:var(--ink); color:var(--bubble-out-fg); border:0; }
  .topup-btn.secondary{ background:var(--card); color:var(--ink); border:1px solid var(--line); }

  .card{
    background:var(--card); border:1px solid var(--line); border-radius:14px;
    padding:14px 16px;
  }
  .card-head{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; }
  .card-head .l{ font-family:var(--mono); font-size:11px; color:var(--mute); letter-spacing:.04em; }
  .card-head .r{ font-family:var(--sans); font-weight:700; font-size:18px; letter-spacing:-0.015em; }
  .chart{ display:flex; align-items:flex-end; gap:4px; height:60px; }
  .chart .bar{ flex:1; border-radius:2px; background:var(--line2); }
  .chart .bar.peak{ background:var(--ink); }
  .chart-axis{ display:flex; justify-content:space-between; margin-top:6px; font-family:var(--mono); font-size:9.5px; color:var(--mute); }

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
  .br-row .nm{ flex:1; font-size:13.5px; font-weight:500; }
  .br-row .n{ font-family:var(--mono); font-size:11px; color:var(--mute); }
  .br-row .c{ font-family:var(--mono); font-size:13px; font-weight:600; }
`;

const HOURS = [8,14,22,16,11,9,17,28,32,21,12,7];
const PEAK = 9;

export function WalletView() {
  const bp = useBreakpoint();
  const dispatch = useDispatch();
  const { state } = useApp();

  const topup = (amount) => dispatch({ type: "wallet/topup", amount });

  const breakdown = Object.entries(state.wallet.byModel).map(([id, c]) => ({
    id,
    glyph: TS_MODELS.find((m) => m.id === id)?.glyph || (id.slice(0, 2).toUpperCase()),
    c,
  }));

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
                <span className="num">{state.wallet.balance.toFixed(2).replace(".", ",")}</span>
                <span className="cur">₽</span>
              </div>
              <div className="balance-sub">
                хватит на <b>~ {Math.floor(state.wallet.balance / Math.max(state.wallet.todaySpend, 0.5))} дней</b> при текущем расходе
              </div>
            </div>

            <div className="topup-row">
              <button className="topup-btn primary" onClick={() => topup(1000)}>+ 1 000 ₽</button>
              <button className="topup-btn secondary" onClick={() => topup(5000)}>+ 5 000 ₽</button>
              <button className="topup-btn secondary" onClick={() => topup(10000)}>+ 10 000 ₽</button>
              <button className="topup-btn secondary" onClick={() => {
                const v = prompt("Сумма пополнения, ₽:", "500");
                const n = Number(v);
                if (Number.isFinite(n) && n > 0) topup(n);
              }}>своя</button>
            </div>

            <div className="card">
              <div className="card-head">
                <span className="l">сегодня</span>
                <span className="r"><span className="num">{state.wallet.todaySpend.toFixed(2).replace(".", ",")}</span> ₽</span>
              </div>
              <div className="chart">
                {HOURS.map((h, i) => (
                  <span key={i} className={`bar ${i === PEAK ? "peak" : ""}`} style={{ height: `${h * 1.7}px` }}/>
                ))}
              </div>
              <div className="chart-axis">
                <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
              </div>
            </div>

            <div>
              <div className="br-title">по моделям · сегодня</div>
              <div className="br-list">
                {breakdown.map((b) => (
                  <div key={b.id} className="br-row">
                    <span className="gly">{b.glyph}</span>
                    <span className="nm">{b.id}</span>
                    <span className="n">{Math.floor(b.c * 10)} зап.</span>
                    <span className="c"><span className="num">{b.c.toFixed(2).replace(".", ",")}</span> ₽</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
