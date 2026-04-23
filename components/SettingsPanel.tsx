"use client";
import { UserSettings, ThemeMode, ColorScheme, FontSize } from "@/lib/types";

interface Props {
  settings: UserSettings;
  onChange: (s: UserSettings) => void;
  onClose: () => void;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; emoji: string }[] = [
  { id: "light", label: "בהיר", emoji: "☀️" },
  { id: "dark", label: "כהה", emoji: "🌙" },
  { id: "auto", label: "אוטומטי", emoji: "🌗" },
];

const COLOR_OPTIONS: { id: ColorScheme; label: string; hex: string }[] = [
  { id: "blue",   label: "כחול",  hex: "#2563eb" },
  { id: "green",  label: "ירוק",  hex: "#16a34a" },
  { id: "red",    label: "אדום",  hex: "#dc2626" },
  { id: "purple", label: "סגול",  hex: "#7c3aed" },
  { id: "orange", label: "כתום",  hex: "#ea580c" },
];

const FONT_OPTIONS: { id: FontSize; label: string; size: string }[] = [
  { id: "small",  label: "קטן",   size: "13px" },
  { id: "medium", label: "בינוני", size: "14px" },
  { id: "large",  label: "גדול",  size: "16px" },
];

export default function SettingsPanel({ settings, onChange, onClose }: Props) {
  const update = (patch: Partial<UserSettings>) => onChange({ ...settings, ...patch });

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 300, animation: "fadeIn var(--anim-fast) ease" }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301,
        background: "var(--surface)", borderRadius: "20px 20px 0 0",
        padding: "16px 20px calc(20px + env(safe-area-inset-bottom))",
        maxHeight: "85dvh", overflowY: "auto",
        animation: "slideUp var(--anim-duration) ease",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ width: 40, height: 4, background: "var(--border-2)", borderRadius: 10, margin: "0 auto 16px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "22px" }}>⚙</span>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 700, color: "var(--text)" }}>הגדרות</div>
          </div>
          <button onClick={onClose}
            style={{ padding: "6px 12px", background: "transparent", border: "1px solid var(--border-2)", color: "var(--text-muted)", borderRadius: 8, fontSize: "var(--fs-sm)", cursor: "pointer" }}>
            סגור
          </button>
        </div>

        {/* Theme */}
        <Section title="🎨 ערכת נושא">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {THEME_OPTIONS.map((t) => {
              const active = settings.theme === t.id;
              return (
                <button key={t.id} onClick={() => update({ theme: t.id })}
                  style={{
                    padding: "14px 10px", borderRadius: 12,
                    border: `1.5px solid ${active ? "var(--primary)" : "var(--border-2)"}`,
                    background: active ? "var(--primary-tint)" : "transparent",
                    color: active ? "var(--primary)" : "var(--text-muted)",
                    fontSize: "var(--fs-sm)", fontWeight: active ? 700 : 500, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    transition: "all var(--anim-fast)",
                  }}>
                  <span style={{ fontSize: "22px" }}>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Color */}
        <Section title="🌈 צבע מבטא">
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            {COLOR_OPTIONS.map((c) => {
              const active = settings.color === c.id;
              return (
                <button key={c.id} onClick={() => update({ color: c.id })}
                  aria-label={c.label}
                  style={{
                    width: 56, height: 56, borderRadius: "50%",
                    border: `3px solid ${active ? "var(--text)" : "transparent"}`,
                    background: c.hex,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "22px",
                    boxShadow: active ? "0 0 0 2px var(--surface), 0 0 0 4px var(--text-muted)" : "none",
                    transition: "all var(--anim-fast)",
                  }}>
                  {active && "✓"}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Font size */}
        <Section title="🔤 גודל גופן">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {FONT_OPTIONS.map((f) => {
              const active = settings.fontSize === f.id;
              return (
                <button key={f.id} onClick={() => update({ fontSize: f.id })}
                  style={{
                    padding: "14px 10px", borderRadius: 12,
                    border: `1.5px solid ${active ? "var(--primary)" : "var(--border-2)"}`,
                    background: active ? "var(--primary-tint)" : "transparent",
                    color: active ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: active ? 700 : 500, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    transition: "all var(--anim-fast)",
                  }}>
                  <span style={{ fontSize: f.size, fontWeight: 800 }}>א</span>
                  <span style={{ fontSize: "var(--fs-sm)" }}>{f.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Animations */}
        <Section title="✨ אנימציות">
          <label style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 12,
            border: "1.5px solid var(--border-2)", background: "var(--surface-2)",
            cursor: "pointer",
          }}>
            <div>
              <div style={{ fontSize: "var(--fs-base)", fontWeight: 600, color: "var(--text)" }}>אנימציות חלקות</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-dim)", marginTop: 2 }}>כיבוי ישפר ביצועים במכשירים חלשים</div>
            </div>
            <div onClick={() => update({ animations: !settings.animations })}
              style={{
                width: 50, height: 28, borderRadius: 20,
                background: settings.animations ? "var(--primary)" : "var(--border-2)",
                position: "relative", cursor: "pointer", flexShrink: 0,
                transition: "background var(--anim-fast)",
              }}>
              <div style={{
                position: "absolute",
                top: 3, insetInlineStart: settings.animations ? 25 : 3,
                width: 22, height: 22, borderRadius: "50%",
                background: "white",
                transition: "inset-inline-start var(--anim-fast)",
              }} />
            </div>
          </label>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
