"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";

interface Props {
  history: ChatMessage[];
  onSend: (text: string) => Promise<void>;
  onClose: () => void;
  isSending: boolean;
}

export default function ChatPanel({ history, onSend, onClose, isSending }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isSending]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    await onSend(text);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 300, animation: "fadeIn var(--anim-fast) ease" }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301,
        background: "var(--surface)", borderRadius: "20px 20px 0 0",
        display: "flex", flexDirection: "column",
        height: "85dvh", maxHeight: "85dvh",
        animation: "slideUp var(--anim-duration) ease",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
      }}>
        {/* Handle + header */}
        <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 40, height: 4, background: "var(--border-2)", borderRadius: 10, margin: "0 auto 10px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "20px" }}>💬</span>
              <div>
                <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--text)" }}>צ'אט עם הסוכן</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-faint)" }}>אפשר לבקש שינוי פילטרים, הסתרה, חיפוש מחדש</div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ padding: "6px 12px", background: "transparent", border: "1px solid var(--border-2)", color: "var(--text-muted)", borderRadius: 8, fontSize: "var(--fs-sm)", cursor: "pointer" }}>
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {history.length === 0 && !isSending && (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-faint)" }}>
              <div style={{ fontSize: "36px", marginBottom: 12 }}>💡</div>
              <div style={{ fontSize: "var(--fs-base)", color: "var(--text-muted)", marginBottom: 10, fontWeight: 600 }}>התחל שיחה עם הסוכן</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
                <div>🔹 "תעלה את המחיר ל-10,000"</div>
                <div>🔹 "תחפש מחדש"</div>
                <div>🔹 "תסיר את כל הדירות בדרום העיר"</div>
                <div>🔹 "איזה דירה הכי מתאימה לי?"</div>
              </div>
            </div>
          )}

          {history.map((m) => (
            <div key={m.id} style={{
              alignSelf: m.role === "user" ? "flex-start" : "flex-end",
              maxWidth: "85%",
              animation: m.role === "user" ? "slideInRight var(--anim-fast) ease" : "slideInLeft var(--anim-fast) ease",
            }}>
              <div style={{
                padding: "10px 14px", borderRadius: 14,
                background: m.role === "user" ? "var(--primary)" : "var(--surface-2)",
                color: m.role === "user" ? "white" : "var(--text)",
                border: m.role === "user" ? "none" : "1px solid var(--border)",
                fontSize: "var(--fs-base)", lineHeight: 1.5,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {m.text}
              </div>
              {m.actions && m.actions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                  {m.actions.map((a, i) => {
                    const labels: Record<string, string> = {
                      updateFilters: "🔧 עדכן פילטרים",
                      runSearch: "🔍 חיפוש מחדש",
                      hideApartment: "🗑 הסתר דירה",
                      hideMany: "🗑 הסתר דירות",
                      clearHidden: "↩️ בטל הסתרות",
                    };
                    return (
                      <span key={i} style={{ fontSize: "var(--fs-sm)", padding: "2px 8px", borderRadius: 20, background: "var(--primary-tint)", color: "var(--primary)", border: "1px solid var(--primary)" }}>
                        {labels[a.type] || a.type}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div style={{ alignSelf: "flex-end", animation: "slideInLeft var(--anim-fast) ease" }}>
              <div style={{
                padding: "12px 16px", borderRadius: 14,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={isSending}
              rows={1}
              placeholder="כתוב הודעה..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 20,
                border: "1px solid var(--border-2)", background: "var(--surface-2)",
                color: "var(--text)", fontSize: "var(--fs-base)",
                resize: "none", maxHeight: 120, lineHeight: 1.4,
                outline: "none",
              }}
            />
            <button onClick={handleSend} disabled={!input.trim() || isSending}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "none",
                background: input.trim() && !isSending ? "var(--primary)" : "var(--surface-2)",
                color: input.trim() && !isSending ? "white" : "var(--text-faint)",
                fontSize: "20px", cursor: input.trim() && !isSending ? "pointer" : "not-allowed",
                flexShrink: 0,
                transition: "all var(--anim-fast)",
              }}>
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
