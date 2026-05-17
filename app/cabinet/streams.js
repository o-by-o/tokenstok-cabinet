"use client";

// streams.js — 4 streaming text effects for the chat.
// Each implements the same contract:
//   <StreamText kind="token|pop|blur|phosphor" text={string} loopGap={ms} />
// They render a <span> that fills its parent, animate to completion, then
// (if loop=true) clear + restart after loopGap.

import { useEffect, useRef } from "react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tokenize(s){
  const out = []; const re = /\n|[^\s\n]+\s*/g; let m;
  while((m = re.exec(s))) out.push(m[0]);
  return out;
}
function pieces(s){
  return s.match(/\s+|[A-Za-zА-Яа-яЁё]{1,4}|[^A-Za-zА-Яа-яЁё\s]/g) || [];
}

function useStreamLoop(ref, iter, { gap = 1800, deps = [], loop = true } = {}){
  const cancelRef = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    cancelRef.current = false;
    let timer = null;
    const run = async () => {
      while (!cancelRef.current){
        const el = ref.current;
        if (!el) return;
        el.innerHTML = '';
        await iter(el, () => cancelRef.current);
        if (!loop || cancelRef.current) return;
        await new Promise((res) => { timer = setTimeout(res, gap); });
      }
    };
    run();
    return () => { cancelRef.current = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ── 1. TOKEN — sub-word pieces with token-bg flash
export function StreamToken({ text, loopGap = 1800, mono = false }){
  const ref = useRef(null);
  useStreamLoop(ref, async (el, cancelled) => {
    const ps = pieces(text);
    for (const p of ps){
      if (cancelled()) return;
      const s = document.createElement('span');
      s.textContent = p;
      s.style.cssText = 'background:var(--chip);color:var(--ink);border-radius:2px;transition:background .35s ease;';
      el.appendChild(s);
      requestAnimationFrame(() => { s.style.background = 'transparent'; });
      await sleep(46 + Math.random() * 50);
    }
    const c = document.createElement('span'); c.className = 'ts-caret'; el.appendChild(c);
    await sleep(900);
  }, { gap: loopGap, deps: [text] });
  return <span ref={ref} style={{ fontFamily: mono ? 'var(--mono)' : undefined, fontSize: mono ? '14px' : undefined }}/>;
}

// ── 2. POP — words fade+rise
export function StreamPop({ text, loopGap = 1800 }){
  const ref = useRef(null);
  useStreamLoop(ref, async (el, cancelled) => {
    const toks = tokenize(text);
    for (const t of toks){
      if (cancelled()) return;
      if (t === '\n'){ el.appendChild(document.createElement('br')); continue; }
      const s = document.createElement('span');
      s.textContent = t;
      s.style.cssText = 'display:inline-block;white-space:pre;opacity:0;transform:translateY(6px);transition:opacity .26s ease, transform .26s ease;';
      el.appendChild(s);
      requestAnimationFrame(() => { s.style.opacity = 1; s.style.transform = 'translateY(0)'; });
      await sleep(70 + Math.random() * 50);
    }
    await sleep(900);
  }, { gap: loopGap, deps: [text] });
  return <span ref={ref}/>;
}

// ── 3. BLUR — words emerge from soft blur
export function StreamBlur({ text, loopGap = 1800 }){
  const ref = useRef(null);
  useStreamLoop(ref, async (el, cancelled) => {
    const toks = tokenize(text);
    for (const t of toks){
      if (cancelled()) return;
      if (t === '\n'){ el.appendChild(document.createElement('br')); continue; }
      const s = document.createElement('span');
      s.textContent = t;
      s.style.cssText = 'display:inline-block;white-space:pre;filter:blur(7px);opacity:0;transition:filter .38s ease, opacity .38s ease;';
      el.appendChild(s);
      requestAnimationFrame(() => { s.style.filter = 'blur(0)'; s.style.opacity = 1; });
      await sleep(90 + Math.random() * 60);
    }
    await sleep(900);
  }, { gap: loopGap, deps: [text] });
  return <span ref={ref}/>;
}

// ── 4. PHOSPHOR — char typewriter; white-hot → cool ink (terminal feel)
export function StreamPhosphor({ text, loopGap = 1800, mono = true }){
  const ref = useRef(null);
  useStreamLoop(ref, async (el, cancelled) => {
    el.style.whiteSpace = 'pre-wrap';
    const caret = document.createElement('span');
    caret.textContent = '█';
    caret.style.cssText = 'display:inline-block;color:var(--ink);text-shadow:0 0 10px rgba(var(--glow),.9);animation:ts-blink 1s steps(2) infinite;';
    el.appendChild(caret);
    for (let i = 0; i < text.length; i++){
      if (cancelled()) return;
      const ch = text[i];
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = 'color:var(--ink);text-shadow:0 0 14px rgba(var(--glow),.95), 0 0 4px rgba(var(--glow),.7);transition:color 1.2s ease, text-shadow 1.2s ease;';
      caret.insertAdjacentElement('beforebegin', s);
      setTimeout(() => {
        s.style.color = 'var(--ink2)';
        s.style.textShadow = '0 0 1px rgba(var(--glow),.12)';
      }, 80);
      await sleep(ch === '\n' ? 150 : (Math.random() * 22 + 28));
    }
    await sleep(900);
  }, { gap: loopGap, deps: [text] });
  return <span ref={ref} style={{ fontFamily: mono ? 'var(--mono)' : undefined, fontSize: mono ? '14px' : undefined, display:'inline-block' }}/>;
}

export function StreamText({ kind = 'token', text, ...rest }){
  if (kind === 'pop')      return <StreamPop text={text} {...rest}/>;
  if (kind === 'blur')     return <StreamBlur text={text} {...rest}/>;
  if (kind === 'phosphor') return <StreamPhosphor text={text} {...rest}/>;
  return <StreamToken text={text} {...rest}/>;
}

export const TS_STREAM_OPTIONS = [
  { value: 'token',    label: 'Поток' },
  { value: 'pop',      label: 'Pop' },
  { value: 'blur',     label: 'Blur' },
  { value: 'phosphor', label: 'Фосфор' },
];
