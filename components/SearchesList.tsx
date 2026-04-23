"use client";
import { SavedSearch } from "@/lib/types";

interface Props {
  searches: SavedSearch[];
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onSettings: () => void;
  onAgentSettings: () => void;
}

function timeAgo(ts: number | null): string {
  if (!ts) return "לא חופש עדיין";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} שעות`;
  const d = Math.floor(h / 24);
  return `לפני ${d} ימים`;
}

export default function SearchesList({ searches, onOpen, onEdit, onDelete, onNew, onSettings, onAgentSettings }: Props) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div className="safe-top" style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "12px 16px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "22px" }}>🏠</span>
            <div>
              <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--text)" }}>סוכן דירות</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-faint)" }}>{searches.length} חיפושים שמורים</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onAgentSettings}
              style={{ padding: "10px 12px", borderRadius: 20, border: "1px solid var(--border-2)", background: "transparent", color: "var(--text-muted)", fontSize: "16px", cursor: "pointer" }}
              aria-label="הגדרות סוכן">
              🤖
            </button>
            <button onClick={onSettings}
              style={{ padding: "10px 12px", borderRadius: 20, border: "1px solid var(--border-2)", background: "transparent", color: "var(--text-muted)", fontSize: "16px", cursor: "pointer" }}
              aria-label="הגדרות">
              ⚙
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
        <button onClick={onNew}
          style={{
            width: "100%", padding: "16px", marginBottom: 16,
            background: "var(--primary)", color: "white", border: "none", borderRadius: 14,
            fontSize: "var(--fs-lg)", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "transform var(--anim-fast)",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          <span style={{ fontSize: "20px" }}>+</span> חיפוש חדש
        </button>

        {searches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-faint)" }}>
            <div style={{ fontSize: "48px", marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>אין חיפושים עדיין</div>
            <div style={{ fontSize: "var(--fs-sm)" }}>צור חיפוש חדש כדי להתחיל</div>
          </div>
        ) : (
          <div className="anim-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {searches.map((s) => {
              const newCount = s.results.filter((r) => !s.hiddenIds.includes(r.id)).length;
              return (
                <div key={s.id}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 14, padding: "14px 16px",
                    transition: "all var(--anim-fast)",
                  }}>
                  <div onClick={() => onOpen(s.id)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: "var(--fs-lg)", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                        {s.name}
                      </div>
                      {newCount > 0 && (
                        <span style={{
                          flexShrink: 0, background: "var(--primary-tint)", color: "var(--primary)",
                          fontSize: "var(--fs-sm)", fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          border: "1px solid var(--primary)",
                        }}>{newCount}</span>
                      )}
                    </div>
                    {s.freeText && (
                      <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {s.freeText}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: "var(--fs-sm)", color: "var(--text-faint)" }}>
                      <span>🕐 {timeAgo(s.lastSearchedAt)}</span>
                      <span>·</span>
                      <span>🔍 {s.searchCount}</span>
                      {s.pushEnabled && <><span>·</span><span style={{ color: "var(--success-text)" }}>🔔 פעיל</span></>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => onOpen(s.id)}
                      style={{ flex: 1, padding: "8px 12px", background: "var(--primary)", color: "white", border: "none", borderRadius: 8, fontSize: "var(--fs-sm)", fontWeight: 600, cursor: "pointer" }}>
                      פתח
                    </button>
                    <button onClick={() => onEdit(s.id)}
                      style={{ padding: "8px 12px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-2)", borderRadius: 8, fontSize: "var(--fs-sm)", fontWeight: 600, cursor: "pointer" }}>
                      ✏️
                    </button>
                    <button onClick={() => { if (confirm(`למחוק את "${s.name}"?`)) onDelete(s.id); }}
                      style={{ padding: "8px 12px", background: "transparent", color: "var(--danger-text)", border: "1px solid var(--danger)", borderRadius: 8, fontSize: "var(--fs-sm)", fontWeight: 600, cursor: "pointer" }}>
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
