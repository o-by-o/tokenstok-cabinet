"use client";

// Composer.jsx — uses .ts-composer / .row / .ic / .send / .voice / .ctx from
// foundation. Wraps a real <textarea> + file picker. Attachments display as
// chips above the textarea row (thumbnails for images, name+ext for docs).

import { useRef, useState, useEffect } from "react";
import { TSIcon } from "../../cabinet/foundation";
import { useApp, useDispatch, useUi } from "../../lib/store";
import { useAutosizeTextarea } from "../../lib/hooks";

const STYLE = `
  .cmp-wrap{ flex:0 0 auto; }
  .cmp-wrap .ts-composer{
    padding-left:max(16px, calc((100% - 720px) / 2));
    padding-right:max(16px, calc((100% - 720px) / 2));
  }
  .cmp-wrap .ts-composer .input{
    flex:1; min-width:0; resize:none;
    border:0; outline:none; background:transparent;
    color:var(--ink); font:400 15px/1.3 var(--sans);
    padding:8px 0; min-height:24px; max-height:200px;
  }
  .cmp-wrap .ts-composer .input::placeholder{ color:var(--mute); }
  .cmp-wrap .ts-composer .row{ align-items:flex-end; }
  .cmp-wrap input[type="file"]{ display:none; }

  /* Attachment chips row */
  .cmp-att{
    display:flex; gap:6px; padding:0 0 6px;
    overflow-x:auto; scrollbar-width:none;
  }
  .cmp-att::-webkit-scrollbar{ display:none; }
  .cmp-chip{
    flex:0 0 auto; display:inline-flex; align-items:center; gap:8px;
    height:42px; padding:4px 8px 4px 4px;
    background:var(--chip); border:1px solid var(--line); border-radius:10px;
    font:500 12px var(--sans); color:var(--ink2);
    max-width:200px;
  }
  .cmp-chip .thumb{
    width:34px; height:34px; border-radius:7px; overflow:hidden;
    background:var(--bg);
    display:grid; place-items:center; flex-shrink:0;
  }
  .cmp-chip .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
  .cmp-chip .thumb .ext{
    font-family:var(--mono); font-size:9.5px; font-weight:700; color:var(--mute);
    text-transform:uppercase; letter-spacing:.04em;
  }
  .cmp-chip .meta{ display:flex; flex-direction:column; min-width:0; }
  .cmp-chip .meta .nm{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:130px; font-weight:600; }
  .cmp-chip .meta .sz{ font-family:var(--mono); font-size:10px; color:var(--mute); }
  .cmp-chip .x{
    width:18px; height:18px; border-radius:50%;
    background:transparent; border:0; cursor:pointer; color:var(--mute);
    display:grid; place-items:center; padding:0;
    flex-shrink:0;
  }
  .cmp-chip .x:hover{ background:var(--line2); color:var(--ink); }
`;

const MAX_PREVIEW_BYTES = 4 * 1024 * 1024; // 4 MB cap for in-memory preview thumbnails
const fmtSize = (b) => b < 1024 ? `${b} б` : b < 1024 * 1024 ? `${Math.round(b/1024)} КБ` : `${(b/1024/1024).toFixed(1)} МБ`;

export function Composer({ onVoice, autoFocus = false }) {
  const dispatch = useDispatch();
  const { state } = useApp();
  const ui = useUi();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  useAutosizeTextarea(ref, text);

  // pick up text prefilled by /library "apply" or /agents agent-card tap
  useEffect(() => {
    if (ui.composerPrefill) {
      setText(ui.composerPrefill);
      dispatch({ type: "ui/clearPrefill" });
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [ui.composerPrefill, dispatch]);

  // expose ref globally so shortcut handlers can focus composer
  useEffect(() => {
    if (typeof window !== "undefined") window.__tk_composer = ref.current;
    return () => { if (typeof window !== "undefined") window.__tk_composer = null; };
  });

  // revoke object URLs when attachments change / unmount, to avoid memory leak
  useEffect(() => {
    return () => attachments.forEach((a) => a.url && URL.revokeObjectURL(a.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = text.trim().length > 0 || attachments.length > 0;

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = files.map((f) => {
      const isImage = f.type.startsWith("image/");
      const url = isImage && f.size <= MAX_PREVIEW_BYTES ? URL.createObjectURL(f) : null;
      return {
        id: Math.random().toString(36).slice(2),
        name: f.name,
        size: f.size,
        type: f.type || "",
        ext: (f.name.split(".").pop() || "").slice(0, 5).toLowerCase(),
        url,
        isImage,
      };
    });
    setAttachments((prev) => [...prev, ...next]);
    e.target.value = ""; // allow picking the same file again later
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const send = () => {
    const value = text.trim();
    if (!value && attachments.length === 0) return;
    // Strip ephemeral fields (`url` from URL.createObjectURL is browser-only and
    // not safe to persist across reloads — drop it; the user message stores
    // only metadata + thumbnail data URL if we had one).
    const atts = attachments.map((a) => ({
      id: a.id, name: a.name, size: a.size, type: a.type, ext: a.ext, isImage: a.isImage,
      url: a.url, // keep for this session; on reload it'll be invalid (acceptable for mock app)
    }));
    setText("");
    setAttachments([]);
    dispatch({ type: "msg/sendUser", text: value || "[файл]", attachments: atts });
    setTimeout(() => ref.current?.focus(), 0);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const balance = state.wallet.balance.toFixed(2).replace(".", ",") + " ₽";
  const today = state.wallet.todaySpend.toFixed(2).replace(".", ",") + " ₽";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="cmp-wrap">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/*,.md,.csv,.json,.xml,.docx,.xlsx"
          onChange={onPickFiles}
        />
        <div className="ts-composer">
          {attachments.length > 0 && (
            <div className="cmp-att no-scroll-bars">
              {attachments.map((a) => (
                <div key={a.id} className="cmp-chip" title={`${a.name} · ${fmtSize(a.size)}`}>
                  <div className="thumb">
                    {a.url
                      ? <img src={a.url} alt={a.name}/>
                      : <span className="ext">{a.ext || "?"}</span>
                    }
                  </div>
                  <div className="meta">
                    <span className="nm">{a.name}</span>
                    <span className="sz">{fmtSize(a.size)}</span>
                  </div>
                  <button className="x" onClick={() => removeAttachment(a.id)} aria-label="убрать файл">
                    {TSIcon.close({ width: 12, height: 12 })}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="row">
            <button className="ic" type="button" aria-label="прикрепить" onClick={() => fileInputRef.current?.click()}>
              {TSIcon.attach({})}
            </button>
            <textarea
              ref={ref}
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder={attachments.length > 0 ? "Спроси про прикреплённое…" : "Спроси что угодно…"}
              rows={1}
              autoFocus={autoFocus}
            />
            {canSend ? (
              <button className="ic send" type="button" aria-label="отправить" onClick={send}>{TSIcon.send({})}</button>
            ) : (
              <button className="ic voice" type="button" aria-label="голос" onClick={onVoice}>{TSIcon.mic({})}</button>
            )}
          </div>
          <div className="ctx">
            <span>остаток · <b>{balance}</b></span>
            <span>сегодня · <b>{today}</b></span>
          </div>
        </div>
      </div>
    </>
  );
}
