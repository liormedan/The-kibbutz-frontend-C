"use client";
// הקיבוץ – Settings view (own route: /settings)
// Self-contained port of the former dashboard "settings" tab: appearance
// (language + theme), notifications, privacy, about, logout.

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Info, LogOut, Sparkles, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { applyTheme, getTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type SettingsTab = "appearance" | "notifications" | "privacy" | "about";

export default function SettingsView() {
  const logout = useAuthStore((s) => s.logout);
  const { t, lang, setLang, dir } = useI18n();

  const [settingsTab, setSettingsTab] = useState<SettingsTab>("appearance");
  const [isDark, setIsDark] = useState(false);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifProjects, setNotifProjects] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [privacyPublic, setPrivacyPublic] = useState(true);

  useEffect(() => {
    setIsDark(getTheme() === "dark");
  }, []);

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    applyTheme(dark ? "dark" : "light"); // applies the .dark-theme class app-wide
  };

  const nav: { id: SettingsTab; labelKey: TranslationKey; icon: React.ReactNode }[] = [
    { id: "appearance", labelKey: "settingsAppearance", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: "notifications", labelKey: "settingsNotifications", icon: <Bell className="w-4 h-4" /> },
    { id: "privacy", labelKey: "settingsPrivacy", icon: <Info className="w-4 h-4" /> },
    { id: "about", labelKey: "settingsAbout", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full p-4 md:p-6" dir={dir}>
      <div
        className="w-full h-full rounded-2xl border border-[var(--border)] overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "12rem 1fr",
          background: "var(--background-subtle)",
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
              {t(s.labelKey)}
            </button>
          ))}
          <div className="mt-auto px-3 pt-4 pb-2">
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/8 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {t("settingsLogout")}
            </button>
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="overflow-y-auto p-8">
          {settingsTab === "appearance" && (
            <div className="max-w-xl space-y-6">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t("settingsAppearance")}</p>

              {/* Language — real he/en switch (drives RTL/LTR app-wide) */}
              <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("settingsLang")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("settingsLangSub")}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setLang("he")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lang === "he" ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"}`}
                  >עברית</button>
                  <button onClick={() => setLang("en")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lang === "en" ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"}`}
                  >English</button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("settingsTheme")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("settingsThemeSub")}</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => setTheme(false)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${!isDark ? "border-primary" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
                  >
                    <div className="w-14 h-9 rounded-lg overflow-hidden flex">
                      <div className="flex-1 bg-[#f4eee1]" /><div className="w-4 bg-[#e4ddcd]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t("settingsThemeLight")}</span>
                  </button>
                  <button onClick={() => setTheme(true)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer ${isDark ? "border-primary" : "border-[var(--border)] opacity-60 hover:opacity-100"}`}
                  >
                    <div className="w-14 h-9 rounded-lg overflow-hidden flex">
                      <div className="flex-1 bg-[#1a0f08]" /><div className="w-4 bg-[#2a1a0e]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t("settingsThemeDark")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "notifications" && (
            <div className="max-w-xl space-y-2">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">{t("settingsNotifications")}</p>
              {[
                { label: t("settingsNotifMessages"), sub: t("settingsNotifMessagesSub"), val: notifMessages, set: setNotifMessages },
                { label: t("settingsNotifProjects"), sub: t("settingsNotifProjectsSub"), val: notifProjects, set: setNotifProjects },
                { label: t("settingsNotifCommunity"), sub: "", val: notifCommunity, set: setNotifCommunity },
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
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">{t("settingsPrivacy")}</p>
              <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("settingsPrivacyProfile")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("settingsPrivacyProfileSub")}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setPrivacyPublic(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${privacyPublic ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground"}`}
                  >{t("settingsPrivacyPublic")}</button>
                  <button onClick={() => setPrivacyPublic(false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${!privacyPublic ? "bg-primary text-white" : "border border-[var(--border)] text-muted-foreground"}`}
                  >{t("settingsPrivacyMembers")}</button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "about" && (
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-4">{t("settingsAbout")}</p>
              <div className="flex items-center gap-4 mb-6">
                <img src="/logo.jpg" alt={t("sidebarTitle")} className="w-12 h-12 rounded-xl object-contain" />
                <div>
                  <p className="font-bold text-foreground text-lg">{t("sidebarTitle")}</p>
                  <p className="text-xs text-muted-foreground">{t("settingsAboutVersion")} 2.0.0</p>
                </div>
              </div>
              <div className="space-y-1">
                {[t("settingsAboutTerms"), t("settingsAboutContact")].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between py-3 border-b border-[var(--border)] text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
                    {item}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground ${dir === "rtl" ? "rotate-90" : "-rotate-90"}`} />
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
