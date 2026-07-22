"use client";
// הקיבוץ – Demo-data mode (development only)
//
// Several pages sit on domains the backend does not serve yet, so they render
// an empty state and the design cannot be judged. Each of those pages shows a
// "מצב פיתוח" button that swaps in typed sample data, so the layout can be
// reviewed as it will look once the endpoints exist.
//
// The state is per page (keyed) and persisted, so a reload keeps whatever you
// were looking at. It is a review aid, never a data source: production builds
// have no toggle and no fixtures on screen.

import { useCallback, useEffect, useState } from "react";

export type DemoKey =
  | "feed"
  | "friends"
  | "my-projects"
  | "my-teams"
  | "my-portfolio"
  | "portfolios"
  | "matches"
  | "profile"
  | "messages";

const storageKey = (key: DemoKey) => `kibbutz-demo:${key}`;

/** Dev builds only — matches the dev-login gate so both appear together. */
export const isDevBuild =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

/**
 * `[enabled, toggle, ready]`. `ready` is false on the very first render so the
 * server and the client agree before localStorage is read — otherwise the
 * toggle would hydrate-mismatch exactly like the theme script used to.
 */
export function useDemoMode(key: DemoKey): [boolean, () => void, boolean] {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isDevBuild) { setReady(true); return; }
    setEnabled(localStorage.getItem(storageKey(key)) === "true");
    setReady(true);
  }, [key]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(storageKey(key), String(next)); } catch { /* private mode */ }
      return next;
    });
  }, [key]);

  return [isDevBuild && enabled, toggle, ready];
}
