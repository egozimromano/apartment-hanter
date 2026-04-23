import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "סוכן חיפוש דירות",
  description: "חיפוש דירות להשכרה בישראל",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "דירות" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  userScalable: false, viewportFit: "cover", themeColor: "#0c1220",
};

// Inline pre-paint script — reads user settings from localStorage and applies
// CSS variables immediately to prevent a flash of the wrong theme on load.
const themeInitScript = `
(function(){
  try {
    var s = localStorage.getItem("apt_settings_v2");
    var cfg = s ? JSON.parse(s) : { theme: "dark", color: "blue", fontSize: "medium", animations: true };
    var mode = cfg.theme;
    var resolved = mode === "auto"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : mode;
    var themes = {
      dark:  { bg:"#0c1220", surface:"#161f30", surface2:"#0c1220", border:"#1e293b", border2:"#334155", text:"#f1f5f9", textMuted:"#94a3b8", textDim:"#64748b", textFaint:"#475569", success:"#16a34a", successText:"#4ade80", warning:"#fbbf24", danger:"#dc2626", dangerText:"#f87171", overlay:"rgba(0,0,0,0.6)" },
      light: { bg:"#f8fafc", surface:"#ffffff", surface2:"#f1f5f9", border:"#e2e8f0", border2:"#cbd5e1", text:"#0f172a", textMuted:"#475569", textDim:"#64748b", textFaint:"#94a3b8", success:"#16a34a", successText:"#15803d", warning:"#d97706", danger:"#dc2626", dangerText:"#b91c1c", overlay:"rgba(15,23,42,0.4)" }
    };
    var colors = {
      blue:   { p:"#2563eb", h:"#1d4ed8", t:"#2563eb22" },
      green:  { p:"#16a34a", h:"#15803d", t:"#16a34a22" },
      red:    { p:"#dc2626", h:"#b91c1c", t:"#dc262622" },
      purple: { p:"#7c3aed", h:"#6d28d9", t:"#7c3aed22" },
      orange: { p:"#ea580c", h:"#c2410c", t:"#ea580c22" }
    };
    var fonts = { small:{b:"13px",s:"11px",l:"15px",x:"22px"}, medium:{b:"14px",s:"12px",l:"16px",x:"24px"}, large:{b:"16px",s:"14px",l:"18px",x:"28px"} };
    var t = themes[resolved] || themes.dark;
    var c = colors[cfg.color] || colors.blue;
    var f = fonts[cfg.fontSize] || fonts.medium;
    var r = document.documentElement;
    r.style.setProperty("--bg", t.bg);
    r.style.setProperty("--surface", t.surface);
    r.style.setProperty("--surface-2", t.surface2);
    r.style.setProperty("--border", t.border);
    r.style.setProperty("--border-2", t.border2);
    r.style.setProperty("--text", t.text);
    r.style.setProperty("--text-muted", t.textMuted);
    r.style.setProperty("--text-dim", t.textDim);
    r.style.setProperty("--text-faint", t.textFaint);
    r.style.setProperty("--success", t.success);
    r.style.setProperty("--success-text", t.successText);
    r.style.setProperty("--warning", t.warning);
    r.style.setProperty("--danger", t.danger);
    r.style.setProperty("--danger-text", t.dangerText);
    r.style.setProperty("--overlay", t.overlay);
    r.style.setProperty("--primary", c.p);
    r.style.setProperty("--primary-hover", c.h);
    r.style.setProperty("--primary-tint", c.t);
    r.style.setProperty("--fs-base", f.b);
    r.style.setProperty("--fs-sm", f.s);
    r.style.setProperty("--fs-lg", f.l);
    r.style.setProperty("--fs-xl", f.x);
    r.style.setProperty("--anim-duration", cfg.animations ? "0.25s" : "0s");
    r.style.setProperty("--anim-fast", cfg.animations ? "0.15s" : "0s");
    r.setAttribute("data-theme", resolved);
    r.setAttribute("data-color", cfg.color);
    r.setAttribute("data-fontsize", cfg.fontSize);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(console.error));` }} />
      </body>
    </html>
  );
}
