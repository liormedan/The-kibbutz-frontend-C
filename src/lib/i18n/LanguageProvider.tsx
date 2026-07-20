"use client";
// הקיבוץ – Language provider (app-wide i18n)
// Holds the current language, exposes t()/dir, persists the choice, and sets
// lang + dir on <html> so the whole document switches RTL/LTR. Hebrew default.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionary, type Lang, type TranslationKey } from "./dictionary";

const LANG_KEY = "new-kibbutz-lang";

type Vars = Record<string, string | number>;

interface I18nContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  // Load the saved language once on mount.
  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "he") setLangState(saved);
  }, []);

  // Reflect the language on <html> (drives RTL/LTR for the whole document).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: TranslationKey, vars?: Vars) => {
      const table = dictionary[lang] as Record<string, string>;
      const fallback = dictionary.he as Record<string, string>;
      return interpolate(table[key] ?? fallback[key] ?? key, vars);
    };
    return {
      lang,
      dir: lang === "he" ? "rtl" : "ltr",
      setLang,
      toggleLang: () => setLang(lang === "he" ? "en" : "he"),
      t,
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <LanguageProvider>");
  return ctx;
}
