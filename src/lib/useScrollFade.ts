"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Fade = "none" | "start" | "end" | "both";

/**
 * Marks a horizontally scrollable strip with the edge(s) it can still scroll
 * toward, so a half-cut tab reads as "there's more" instead of a rendering
 * glitch. globals.css turns the attribute into a mask.
 *
 * The fade tracks scroll position rather than being always-on: a permanent
 * fade at the end edge dims the last tab even once you've scrolled to it,
 * which looks like its own bug.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [fade, setFade] = useState<Fade>("none");

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // RTL scrollLeft is negative in Chromium/Firefox and positive in WebKit;
    // the absolute value is the distance scrolled in both.
    const scrolled = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 1) return setFade("none");
    const atStart = scrolled <= 1;
    const atEnd = scrolled >= max - 1;
    setFade(atStart ? "end" : atEnd ? "start" : "both");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  return { ref, "data-scroll-fade": fade } as const;
}
