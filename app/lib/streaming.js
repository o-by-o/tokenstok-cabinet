"use client";

// streaming.js — mock streaming engine + the hook chat components subscribe to.
// In M2 the "engine" matches a prompt against canned answers in data.js.
// Later this is the seam where a real API call slots in.

import { useEffect, useRef, useState } from "react";
import { TS_PROMPTS, TS_MODELS } from "../cabinet/data";

const FALLBACKS = [
  "Демо-режим. Подключим реальную модель — буду отвечать осмысленно. Пока что отвечаю шаблонами, чтобы можно было пощупать интерфейс.",
  "Это мок. Текст не настоящий. В нём есть переносы строки\nи длинные предложения, чтобы стрим выглядел как настоящий, а не как однострочник.",
  "Хороший вопрос. Сейчас отвечаю мокапом, но интерфейс уже рабочий: переключай модель в picker, лонг-пресс на сообщении — меню действий.",
];

function pickAnswer(prompt) {
  const p = prompt.toLowerCase().trim();
  // crude keyword match — replace with real model call later
  if (p.includes("claude") || p.includes("gpt") || p.includes("отлич")) return TS_PROMPTS.market;
  if (p.includes("хокку") || p.includes("дедлайн") || p.includes("стих")) return TS_PROMPTS.haiku;
  if (p.includes("дешёв") || p.includes("дешев") || p.includes("классиф") || p.includes("haiku")) return TS_PROMPTS.cheapest;
  if (p.includes("рецепт") || p.includes("вино") || p.includes("саперави")) return TS_PROMPTS.recipe;
  // for "Объясни TCP" et al. — synthesize a one-liner so the demo path always works
  if (p.startsWith("объясни")) return { a: "TCP — вежливый курьер: нумерует конверты, ждёт кивка и пересылает всё, что потерялось.", cost: 0.0094, tokens: 52, latency: 312 };
  // fallback
  const a = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  return { a, cost: 0.0042 + Math.random() * 0.015, tokens: 30 + Math.floor(Math.random() * 80), latency: 200 + Math.floor(Math.random() * 250) };
}

// Synchronously produce the canned assistant message. The hook handles timing.
export function mockComplete({ prompt, modelId }) {
  const ans = pickAnswer(prompt);
  const model = TS_MODELS.find((m) => m.id === modelId) || TS_MODELS[1]; // sonnet 4.5 default
  return {
    text: ans.a,
    modelId: model.id,
    modelGlyph: model.glyph,
    modelName: model.name,
    cost: ans.cost ?? 0.0086,
    tokens: ans.tokens ?? 47,
    latency: ans.latency ?? 280,
  };
}

// useStreamingMessage — given a final string + a speed knob, returns the
// progressively-revealed text. Streams char-by-char (light, predictable).
// Stops at full length and stays put.
export function useStreamingMessage(fullText, { msPerChar = 14, enabled = true } = {}) {
  const [visible, setVisible] = useState(enabled ? "" : fullText);
  const doneRef = useRef(!enabled);

  useEffect(() => {
    if (!enabled) { setVisible(fullText); doneRef.current = true; return; }
    let cancelled = false;
    let i = 0;
    setVisible("");
    doneRef.current = false;
    let timer;
    const tick = () => {
      if (cancelled) return;
      // batch a few chars per tick for performance — but jitter slightly
      const step = 1 + Math.floor(Math.random() * 2);
      i = Math.min(fullText.length, i + step);
      setVisible(fullText.slice(0, i));
      if (i < fullText.length) {
        const delay = msPerChar * (1 + Math.random() * 0.5);
        timer = setTimeout(tick, delay);
      } else {
        doneRef.current = true;
      }
    };
    timer = setTimeout(tick, msPerChar);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [fullText, msPerChar, enabled]);

  return { visible, isDone: doneRef.current, isStreaming: visible.length < fullText.length };
}
