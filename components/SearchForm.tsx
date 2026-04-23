"use client";
import { useState } from "react";
import { StructuredFilters, SavedSearch } from "@/lib/types";

interface Props {
  initial?: SavedSearch;
  onSave: (name: string, freeText: string, filters: StructuredFilters) => void;
  onCancel: () => void;
}

const FEATURE_OPTIONS = [
  { id: "חניה", label: "חניה" },
  { id: "מעלית", label: "מעלית" },
  { id: "מרפסת", label: "מרפסת" },
  { id: "ממ״ד", label: "ממ״ד" },
  { id: "מזגן", label: "מזגן" },
  { id: "מרוהטת", label: "מרוהטת" },
  { id: "גינה", label: "גינה" },
  { id: "דוד שמש", label: "דוד שמש" },
];

const EXAMPLE_QUERIES = [
  "3 חדרים בתל אביב עד 9,000 ₪ עם חניה",
  "דירת 4 חדרים ברמת גן, שקטה ומוארת",
  "2 חדרים בבאר שבע עד 3,500 ₪",
];

export default function SearchForm({ initial, onSave, onCancel }: Props) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [freeText, setFreeText] = useState(initial?.freeText || "");
  const [city, setCity] = useState(initial?.filters.city || "");
  const [neighborhoods, setNeighborhoods] = useState((initial?.filters.neighborhoods || []).join(", "));
  const [roomsMin, setRoomsMin] = useState(initial?.filters.rooms_min?.toString() || "");
  const [roomsMax, setRoomsMax] = useState(initial?.filters.rooms_max?.toString() || "");
  const [priceMin, setPriceMin] = useState(initial?.filters.price_min?.toString() || "");
  const [priceMax, setPriceMax] = useState(initial?.filters.price_max?.toString() || "");
  const [mustHave, setMustHave] = useState<string[]>(initial?.filters.must_have || []);

  const toggleFeature = (id: string) => {
    setMustHave((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const handleSave = () => {
    const filters: StructuredFilters = {};
    if (city.trim()) filters.city = city.trim();
    const nb = neighborhoods.split(",").map((s) => s.trim()).filter(Boolean);
    if (nb.length) filters.neighborhoods = nb;
    if (roomsMin) filters.rooms_min = parseFloat(roomsMin);
    if (roomsMax) filters.rooms_max = parseFloat(roomsMax);
    if (priceMin) filters.price_min = parseInt(priceMin);
    if (priceMax) filters.price_max = parseInt(priceMax);
    if (mustHave.length) filters.must_have = mustHave;

    const autoName = name.trim() || [city || "חיפוש", roomsMin || roomsMax ? `${roomsMin || "?"}-${roomsMax || "?"} חד׳` : "", priceMax ? `עד ${priceMax}` : ""].filter(Boolean).join(" · ");
    onSave(autoName, freeText, filters);
  };

  const canSave = city.trim() || freeText.trim();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 13px", borderRadius: 10,
    border: "1px solid var(--border-2)", background: "var(--surface-2)",
    color: "var(--text)", fontSize: "var(--fs-base)",
  };
  const labelStyle: React.CSSProperties = { fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div className="safe-top" style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "12px 16px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <button onClick={onCancel}
            style={{ padding: "8px 12px", background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "var(--fs-base)", cursor: "pointer" }}>
            ← ביטול
          </button>
          <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--text)" }}>
            {isEdit ? "עריכת חיפוש" : "חיפוש חדש"}
          </div>
          <button onClick={handleSave} disabled={!canSave}
            style={{
              padding: "8px 16px",
              background: canSave ? "var(--primary)" : "var(--surface-2)",
              color: canSave ? "white" : "var(--text-faint)",
              border: "none", borderRadius: 8, fontSize: "var(--fs-sm)", fontWeight: 700,
              cursor: canSave ? "pointer" : "not-allowed",
            }}>
            שמור
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>שם החיפוש (אופציונלי)</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder='לדוגמה: "תל אביב 3 חדרים"' style={inputStyle} />
        </div>

        {/* Structured fields */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>📋 פילטרים מובנים</div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>עיר</label>
            <input value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="תל אביב" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>שכונות (מופרד בפסיקים)</label>
            <input value={neighborhoods} onChange={(e) => setNeighborhoods(e.target.value)}
              placeholder="צפון ישן, לב העיר" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>חדרים (מ-)</label>
              <input type="number" inputMode="decimal" step="0.5" value={roomsMin} onChange={(e) => setRoomsMin(e.target.value)}
                placeholder="3" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>חדרים (עד)</label>
              <input type="number" inputMode="decimal" step="0.5" value={roomsMax} onChange={(e) => setRoomsMax(e.target.value)}
                placeholder="4" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>מחיר (מ-)</label>
              <input type="number" inputMode="numeric" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                placeholder="5000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>מחיר (עד)</label>
              <input type="number" inputMode="numeric" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                placeholder="9000" style={inputStyle} />
            </div>
          </div>

          <label style={labelStyle}>חובה שיהיה</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FEATURE_OPTIONS.map((f) => {
              const active = mustHave.includes(f.id);
              return (
                <button key={f.id} onClick={() => toggleFeature(f.id)}
                  style={{
                    padding: "7px 13px", borderRadius: 20,
                    border: `1px solid ${active ? "var(--primary)" : "var(--border-2)"}`,
                    background: active ? "var(--primary-tint)" : "transparent",
                    color: active ? "var(--primary)" : "var(--text-muted)",
                    fontSize: "var(--fs-sm)", fontWeight: active ? 700 : 500, cursor: "pointer",
                    transition: "all var(--anim-fast)",
                  }}>
                  {active ? "✓ " : ""}{f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free text */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>💬 תיאור חופשי</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-dim)", marginBottom: 10 }}>תוסיף פרטים שהעוזר יבין מהטקסט</div>
          <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)}
            rows={4} placeholder="לדוגמה: שכונה שקטה, קרוב לתחבורה, מתאים לזוג צעיר"
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {EXAMPLE_QUERIES.map((ex) => (
              <button key={ex} onClick={() => setFreeText(ex)}
                style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid var(--border-2)", background: "transparent", color: "var(--text-dim)", fontSize: "var(--fs-sm)", cursor: "pointer" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
