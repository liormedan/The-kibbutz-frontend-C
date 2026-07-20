// הקיבוץ – theme helper
// Applies the warm brand dark mode by toggling the `.dark-theme` class on
// <html> (the CSS for it lives in globals.css). Persists to localStorage so
// the choice survives reloads, and dispatches an event so any mounted UI
// (e.g. the settings toggle) stays in sync.

export type Theme = "light" | "dark";

const KEY = "new-kibbutz-theme";
export const THEME_EVENT = "kibbutz:theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark-theme", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}
