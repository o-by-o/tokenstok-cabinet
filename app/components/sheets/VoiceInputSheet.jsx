"use client";

// VoiceInputSheet.jsx — bottom-sheet voice dictation. Uses webkitSpeechRecognition
// if available; otherwise falls back to a "demo mode" that fakes word-by-word
// transcription so the UI works in every browser.

import { useEffect, useRef, useState } from "react";
import { Sheet } from "./Sheet";
import { TSIcon } from "../../cabinet/foundation";
import { useDispatch } from "../../lib/store";

const STYLE = `
  .vs-hd{ padding:0 20px 4px; font-size:18px; font-weight:700; letter-spacing:-0.015em; }
  .vs-sub{ padding:0 20px 14px; font-family:var(--mono); font-size:11px; color:var(--mute); }
  .vs-tr{
    padding:4px 20px 20px; font-size:18px; line-height:1.4; font-weight:500;
    letter-spacing:-0.01em; min-height:54px; color:var(--ink);
  }
  .vs-tr .interim{ color:var(--mute); }
  .vs-tr .caret{
    display:inline-block; width:.5em; height:1.05em;
    background:var(--ink); vertical-align:-3px; margin-left:2px;
    animation:ts-blink 1s steps(2) infinite;
  }
  .vs-wave{
    padding:0 20px 22px;
    display:flex; align-items:center; justify-content:center; gap:3px; height:60px;
  }
  .vs-wave i{
    width:3px; border-radius:2px;
    animation:ts-shim 1.2s linear infinite;
  }
  .vs-actions{
    padding:0 20px 4px;
    display:flex; align-items:center; justify-content:space-between; gap:10px;
  }
  .vs-actions .cancel{
    display:inline-flex; align-items:center; gap:6px;
    background:transparent; border:1px solid var(--line); border-radius:999px;
    padding:8px 14px; font:600 13px var(--sans); color:var(--ink); cursor:pointer;
  }
  .vs-actions .send{
    display:inline-flex; align-items:center; gap:6px;
    background:var(--accent); color:var(--bubble-out-fg); border:0; border-radius:999px;
    padding:10px 16px; font:600 13px var(--sans); cursor:pointer;
  }
  .vs-actions .send:disabled{ opacity:.5; cursor:not-allowed; }
  .vs-actions .timer{ font-family:var(--mono); font-size:11px; color:var(--mute); }
`;

const DEMO = "Сравни sonnet четыре пять и gpt пять для кода";

export function VoiceInputSheet({ onClose }) {
  const dispatch = useDispatch();
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 250);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.lang = "ru-RU";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let final = "", inter = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) final += res[0].transcript;
          else inter += res[0].transcript;
        }
        if (final) setTranscript((t) => (t + " " + final).trim());
        setInterim(inter);
      };
      r.onerror = () => {};
      try { r.start(); } catch {}
      recRef.current = r;
      return () => { try { r.stop(); } catch {} };
    }
    // Fallback: typewriter-fake transcript
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(DEMO.length, i + Math.ceil(Math.random() * 2));
      setTranscript(DEMO.slice(0, i));
      if (i >= DEMO.length) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, []);

  const send = () => {
    const text = (transcript + " " + interim).trim();
    if (!text) { onClose(); return; }
    dispatch({ type: "msg/sendUser", text });
    onClose();
  };

  const mm = String(Math.floor(seconds / 60)).padStart(1, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Sheet onClose={onClose} label="голосовой ввод">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="vs-hd">Слушаю</div>
      <div className="vs-sub">русский · whisper-1 · 0,0008 ₽ / 10 сек</div>
      <div className="vs-tr">
        {transcript}
        {interim && <span className="interim"> {interim}</span>}
        <span className="caret"/>
      </div>
      <div className="vs-wave">
        {Array.from({ length: 38 }).map((_, i) => {
          const h = 6 + (Math.sin(i * 0.7) * 0.5 + 0.5) * 38 + (i % 3 === 0 ? 6 : 0);
          return (
            <i key={i} style={{
              height: `${h}px`,
              background: i < 24 ? "var(--ink)" : "var(--line2)",
              animationDelay: `${i * 0.04}s`,
            }}/>
          );
        })}
      </div>
      <div className="vs-actions">
        <button className="cancel" onClick={onClose}>{TSIcon.close({})} отмена</button>
        <div className="timer"><span className="ts-live">{mm}:{ss}</span></div>
        <button className="send" onClick={send} disabled={!transcript && !interim}>
          {TSIcon.send({})} отправить
        </button>
      </div>
    </Sheet>
  );
}
