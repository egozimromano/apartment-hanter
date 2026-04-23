import { UserSettings, ColorScheme, ThemeMode, FontSize } from "./types";

// Color palettes — accent only (primary/primary-hover/primary-tint)
const COLORS: Record<ColorScheme, { primary: string; primaryHover: string; primaryTint: string }> = {
  blue:   { primary: "#2563eb", primaryHover: "#1d4ed8", primaryTint: "#2563eb22" },
  green:  { primary: "#16a34a", primaryHover: "#15803d", primaryTint: "#16a34a22" },
  red:    { primary: "#dc2626", primaryHover: "#b91c1c", primaryTint: "#dc262622" },
  purple: { primary: "#7c3aed", primaryHover: "#6d28d9", primaryTint: "#7c3aed22" },
  orange: { primary: "#ea580c", primaryHover: "#c2410c", primaryTint: "#ea580c22" },
};

// Light vs dark neutrals
const THEMES = {
  dark: {
    bg:        "#0c1220",
    surface:   "#161f30",
    surface2:  "#0c1220",
    border:    "#1e293b",
    border2:   "#334155",
    text:      "#f1f5f9",
    textMuted: "#94a3b8",
    textDim:   "#64748b",
    textFaint: "#475569",
    success:   "#16a34a",
    successText: "#4ade80",
    warning:   "#fbbf24",
    danger:    "#dc2626",
    dangerText:"#f87171",
    overlay:   "rgba(0,0,0,0.6)",
  },
  light: {
    bg:        "#f8fafc",
    surface:   "#ffffff",
    surface2:  "#f1f5f9",
    border:    "#e2e8f0",
    border2:   "#cbd5e1",
    text:      "#0f172a",
    textMuted: "#475569",
    textDim:   "#64748b",
    textFaint: "#94a3b8",
    success:   "#16a34a",
    successText: "#15803d",
    warning:   "#d97706",
    danger:    "#dc2626",
    dangerText:"#b91c1c",
    overlay:   "rgba(15,23,42,0.4)",
  },
};

const FONT_SIZES: Record<FontSize, { base: string; sm: string; lg: string; xl: string }> = {
  small:  { base: "13px", sm: "11px", lg: "15px", xl: "22px" },
  medium: { base: "14px", sm: "12px", lg: "16px", xl: "24px" },
  large:  { base: "16px", sm: "14px", lg: "18px", xl: "28px" },
};

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode !== "auto") return mode;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applySettings(settings: UserSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveTheme(settings.theme);
  const t = THEMES[resolved];
  const c = COLORS[settings.color];
  const f = FONT_SIZES[settings.fontSize];

  // Theme neutrals
  root.style.setProperty("--bg", t.bg);
  root.style.setProperty("--surface", t.surface);
  root.style.setProperty("--surface-2", t.surface2);
  root.style.setProperty("--border", t.border);
  root.style.setProperty("--border-2", t.border2);
  root.style.setProperty("--text", t.text);
  root.style.setProperty("--text-muted", t.textMuted);
  root.style.setProperty("--text-dim", t.textDim);
  root.style.setProperty("--text-faint", t.textFaint);
  root.style.setProperty("--success", t.success);
  root.style.setProperty("--success-text", t.successText);
  root.style.setProperty("--warning", t.warning);
  root.style.setProperty("--danger", t.danger);
  root.style.setProperty("--danger-text", t.dangerText);
  root.style.setProperty("--overlay", t.overlay);

  // Accent color
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--primary-hover", c.primaryHover);
  root.style.setProperty("--primary-tint", c.primaryTint);

  // Font sizes
  root.style.setProperty("--fs-base", f.base);
  root.style.setProperty("--fs-sm", f.sm);
  root.style.setProperty("--fs-lg", f.lg);
  root.style.setProperty("--fs-xl", f.xl);

  // Animation toggle
  root.style.setProperty("--anim-duration", settings.animations ? "0.25s" : "0s");
  root.style.setProperty("--anim-fast", settings.animations ? "0.15s" : "0s");

  // Tag the root for any theme-specific overrides in CSS
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-color", settings.color);
  root.setAttribute("data-fontsize", settings.fontSize);
}

// For "auto" mode — re-apply when OS preference changes
export function watchSystemTheme(settings: UserSettings, onChange: () => void): () => void {
  if (typeof window === "undefined" || settings.theme !== "auto") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  const handler = () => onChange();
  mq.addEventListener?.("change", handler);
  return () => mq.removeEventListener?.("change", handler);
}
