"use client";

// LimitCard.jsx — inline alternative to a normal assistant bubble, shown
// when wallet.balance is too low to complete the request.
// Ported from screens-util.jsx ScreenLimit.

import { TSIcon } from "../../cabinet/foundation";
import { useApp, useDispatch } from "../../lib/store";

const STYLE = `
  .lc-wrap{ align-self:flex-start; max-width:92%; width:92%; }
  .lc{
    border-radius:14px; overflow:hidden;
    background:var(--card); border:1px solid var(--line);
  }
  .lc-hd{
    padding:12px 14px 10px; display:flex; align-items:center; gap:10px;
    border-bottom:1px solid var(--line);
  }
  .lc-hd .ttl{ font-size:14px; font-weight:700; letter-spacing:-0.01em; }
  .lc-body{ padding:10px 14px 4px; font-size:13px; line-height:1.5; color:var(--ink2); }
  .lc-body b{ color:var(--ink); }
  .lc-amounts{ padding:12px 14px; display:flex; gap:6px; }
  .lc-amount{
    flex:1; border-radius:10px; padding:10px 6px;
    font-family:var(--sans); font-weight:600; font-size:13px;
    display:flex; flex-direction:column; gap:2px;
    cursor:pointer; letter-spacing:-0.005em;
  }
  .lc-amount.alt{ background:transparent; color:var(--ink); border:1px solid var(--line); }
  .lc-amount.primary{ background:var(--ink); color:var(--bubble-out-fg); border:0; }
  .lc-amount .hint{ font-family:var(--mono); font-size:10px; font-weight:500; }
  .lc-amount.alt .hint{ color:var(--mute); }
  .lc-amount.primary .hint{ color:rgba(244,241,234,.6); }
  .lc-pay{
    padding:4px 14px 12px; display:flex; align-items:center; justify-content:space-between;
    font-family:var(--mono); font-size:11px; color:var(--mute);
  }
  .lc-pay b{ color:var(--ink2); font-weight:600; }
  .lc-alt{
    padding:10px 14px; border-top:1px solid var(--line);
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    font-size:12.5px; color:var(--ink2);
  }
  .lc-alt b{ color:var(--ink); }
  .lc-alt button{
    background:transparent; border:1px solid var(--line); border-radius:8px;
    padding:5px 10px; font-family:var(--mono); font-size:11px; color:var(--ink); cursor:pointer;
    flex-shrink:0;
  }
`;

export function LimitCard({ message }) {
  const { state } = useApp();
  const dispatch = useDispatch();
  const balance = state.wallet.balance.toFixed(2).replace(".", ",");

  const topup = (amount) => dispatch({ type: "wallet/topup", amount });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="lc-wrap">
        <div className="lc">
          <div className="lc-hd">
            <span style={{ color: "var(--ink)" }}>{TSIcon.warning({})}</span>
            <span className="ttl">На счёте кончились деньги</span>
          </div>
          <div className="lc-body">
            Остаток <b>{balance} ₽</b> — не хватит даже на один ответ gpt-5.
            Положи <b>от 100 ₽</b> и продолжим с того места, где остановились.
          </div>
          <div className="lc-amounts">
            <button className="lc-amount alt" onClick={() => topup(100)}>
              <span>100 ₽</span>
              <span className="hint">≈ 1 день</span>
            </button>
            <button className="lc-amount primary" onClick={() => topup(1000)}>
              <span>1 000 ₽</span>
              <span className="hint">≈ неделя</span>
            </button>
            <button className="lc-amount alt" onClick={() => topup(5000)}>
              <span>5 000 ₽</span>
              <span className="hint">≈ месяц</span>
            </button>
          </div>
          <div className="lc-pay">
            <span>оплата · карта, СБП, крипта</span>
            <span>займёт <b>~ 12 сек</b></span>
          </div>
          <div className="lc-alt">
            <span>Или перейди на <b>haiku</b> — тот же запрос за <b className="num" style={{ fontFamily: "var(--mono)" }}>0,0042 ₽</b></span>
            <button onClick={() => dispatch({ type: "chat/setModel", modelId: "claude-haiku-4.5" })}>сменить</button>
          </div>
        </div>
      </div>
    </>
  );
}
