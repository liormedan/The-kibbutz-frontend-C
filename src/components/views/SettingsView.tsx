"use client";
// הקיבוץ – Settings view (own route: /settings)
// Self-contained port of the former dashboard "settings" tab: appearance
// (language + theme), notifications, privacy, about, logout.

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Info, LogOut, Sparkles, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type SettingsTab = "appearance" | "notifications" | "privacy" | "about";

export default function SettingsView() {
  const logout = useAuthStore((s) => s.logout);

  const [settingsTab, setSettingsTab] = useState<SettingsTab>("appearance");
  const [lang, setLang] = useState<"he" | "en">("he");
  const [isDark, setIsDark] = useState(false);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifProjects, setNotifProjects] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [privacyPublic, setPrivacyPublic] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("new-kibbutz-lang") as "en" | "he" | null;
    if (savedLang) setLang(savedLang);
    if (localStorage.getItem("new-kibbutz-theme") === "dark") setIsDark(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("new-kibbutz-theme", next ? "dark" : "light");
  };
  const toggleLanguage = () => {
    const next = lang === "he" ? "en" : "he";
    setLang(next);
    localStorage.setItem("new-kibbutz-lang", next);
  };

  const nav: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "appearance", label: "מראה", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: "notifications", label: "התראות", icon: <Bell className="w-4 h-4" /> },
    { id: "privacy", label: "פרטיות", icon: <Info className="w-4 h-4" /> },
    { id: "about", label: "אודות", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full p-4 md:p-6" dir="rtl">
      <div
        className="w-full h-full rounded-2xl border border-[var(--border)] overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "12rem 1fr",
          background: "rgba(247,244,237,0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* ── Nav ── */}
        <nav className="flex flex-col py-4 bg-[var(--background-subtle)]" style={{ borderInlineEnd: "1px solid var(--border)" }}>
          {nav.map((s) => (
            <button
              key={s.id}
              onClick={() => setSettingsTab(s.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all cursor-pointer border-s-2 ${
                settingsTab === s.id
                  ? "text-primary font-semibold bg-primary/8 border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent hover:bg-primary/5"
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
          <div className="mt-auto px-3 pt-4 pb-2">
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/8 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              התנתקות
            </button>
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="overflow-y-auto p-8">
          {settingsTab === "appearance" && (
            <div className="max-w-xl space-y-6">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">מראה</p>

              {/* Language */}
              <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-sm font-semibold text-foreground">שפה</p>
                  <p className="text-xs text-muted-foreground mt-0.5">שפת ממשק המשתמש</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => { if (lang !== "he") toggleLanguage(); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lang === "he" ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"}`}
                  >עברית</button>
                  <button onClick={() => { if (lang !== "en") toggleLanguage(); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lang === "en" ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"}`}
                  >English</button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">תבנית צבע</p>
                  <p className="text-xs text-muted-foreground mt-0.5">בחר מצב תצוגה</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => { if (isDark) toggleTheme(); }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${!isDark ? "border-primary" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
                  >
                    <div className="w-14 h-9 rounded-lg overflow-hidden flex">
                      <div className="flex-1 bg-[#f4eee1]" /><div className="w-4 bg-[#e4ddcd]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">בהיר</span>
                  </button>
                  <button onClick={() => { if (!isDark) toggleTheme(); }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${isDark ? "border-primary" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
                  >
                    <div className="w-14 h-9 rounded-lg overflow-hidden flex">
                      <div className="flex-1 bg-[#1a0f08]" /><div className="w-4 bg-[#2a1a0e]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">כהה</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "notifications" && (
            <div className="max-w-xl space-y-2">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">התראות</p>
              {[
                { label: "הודעות חדשות", sub: "התראה על צ'אט נכנס", val: notifMessages, set: setNotifMessages },
                { label: "עדכוני פרויקט", sub: "הצטרפות / עזיבה של חברים", val: notifProjects, set: setNotifProjects },
                { label: "פרויקטים חדשים בקהילה", sub: "", val: notifCommunity, set: setNotifCommunity },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
                  </div>
                  <button
                    onClick={() => item.set(!item.val)}
                    className={`relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0 ${item.val ? "bg-primary" : "bg-[var(--border)]"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${item.val ? "right-1" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {settingsTab === "privacy" && (
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">פרטיות</p>
              <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-sm font-semibold text-foreground">נראות פרופיל</p>
                  <p className="text-xs text-muted-foreground mt-0.5">מי יכול לראות את הפרופיל שלך</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setPrivacyPublic(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${privacyPublic ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground"}`}
                  >ציבורי</button>
                  <button onClick={() => setPrivacyPublic(false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${!privacyPublic ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground"}`}
                  >חברים בלבד</button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "about" && (
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">אודות</p>
              <div className="flex items-center gap-4 mb-6">
                <img src="/logo.jpg" alt="הקיבוץ" className="w-12 h-12 rounded-xl object-contain" />
                <div>
                  <p className="font-bold text-foreground text-lg">הקיבוץ</p>
                  <p className="text-xs text-muted-foreground">גרסה 2.0.0</p>
                </div>
              </div>
              <div className="space-y-1">
                {["תנאי שימוש", "צור קשר"].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between py-3 border-b border-[var(--border)] text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
                    {item}
                    <ChevronDown className="w-4 h-4 text-muted-foreground rotate-90" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
