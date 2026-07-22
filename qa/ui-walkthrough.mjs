// QA: walk the app the way a logged-in user would and report UI defects.
// Not a layout unit test — this clicks through every route in both themes and
// collects console errors, overflow, untranslated keys, Latin text leaking into
// the Hebrew UI, elements hidden behind the sticky top bar, and theme mixing.
//
//   node qa/ui-walkthrough.mjs            → light + dark, Hebrew
//   node qa/ui-walkthrough.mjs --shots    → also writes qa/shots/*.png
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = process.env.QA_BASE || "http://localhost:3001";
const SHOTS = process.argv.includes("--shots");
if (SHOTS) mkdirSync("qa/shots", { recursive: true });

const ROUTES = [
  ["/projects", "גילוי פרויקטים (בית)"],
  ["/feed", "פיד"],
  ["/messages", "הודעות"],
  ["/friends", "חברים"],
  ["/my-projects", "מרכז – הפרויקטים שלי"],
  ["/my-projects/requests", "מרכז – בקשות הצטרפות"],
  ["/my-projects/applications", "מרכז – מועמדויות פתוחות"],
  ["/my-projects/teams", "מרכז – הצוותים שלי"],
  ["/my-portfolio", "תיק העבודות שלי"],
  ["/portfolios", "תיקי עבודות"],
  ["/profile", "פרופיל"],
  ["/settings", "הגדרות"],
  ["/projects/create", "יצירת פרויקט"],
  ["/portfolios/create", "יצירת תיק עבודות"],
  ["/matches", "התאמות"],
  ["/nda", "NDA"],
  ["/nda/inbox", "תיבת NDA"],
];

const AUTH = {
  state: {
    token: "qa-token", refreshToken: "qa-refresh", isAuthenticated: true,
    user: {
      id: "qa-1", name: "ליאור מדן", email: "qa@kibbutz.local", avatar: "",
      role: "entrepreneur", canCreateProjects: true, canJoinProjects: true,
      isProfileComplete: true, emailVerified: true,
    },
  },
  version: 0,
};

const browser = await chromium.launch();

async function makeContext(theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  // Empty-but-successful API: a 401 would end the session and bounce to "/".
  await ctx.route("**/api/**", (r) =>
    r.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 },
      }),
    }),
  );
  const page = await ctx.newPage();
  await page.addInitScript(
    ([auth, th]) => {
      sessionStorage.setItem("kibbutz-auth", auth);
      localStorage.setItem("new-kibbutz-theme", th);
      localStorage.setItem("new-kibbutz-lang", "he");
    },
    [JSON.stringify(AUTH), theme],
  );
  return { ctx, page };
}

// ── the audit that runs inside the page ────────────────────────────────────
const AUDIT = () => {
  const out = { overflow: null, keyLeaks: [], latin: [], hidden: [], lightOnDark: [], deadText: [] };
  const de = document.documentElement;
  const isDark = de.classList.contains("dark-theme");

  if (de.scrollWidth > de.clientWidth + 1) {
    out.overflow = { scroll: de.scrollWidth, client: de.clientWidth };
  }

  const bar = document.querySelector("header.sticky");
  const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;

  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.opacity !== "0";
  };

  const leaves = [...document.querySelectorAll("body *")].filter(
    (el) => el.children.length === 0 && el.textContent.trim() && vis(el),
  );

  for (const el of leaves) {
    const txt = el.textContent.trim();
    const r = el.getBoundingClientRect();

    // Untranslated dictionary key rendered verbatim (camelCase, no spaces)
    if (/^[a-z][a-zA-Z0-9]{6,}$/.test(txt) && !txt.includes(" ")) out.keyLeaks.push(txt);

    // Placeholder junk that reached the UI
    if (/\b(undefined|NaN|null|\[object Object\]|\{[a-z]+\})/.test(txt)) out.deadText.push(txt.slice(0, 60));

    // Latin-only text in the Hebrew UI (allow brand/short/technical bits)
    if (
      /[A-Za-z]/.test(txt) && !/[֐-׿]/.test(txt) &&
      txt.length > 3 && !/^[\d\s\W]+$/.test(txt) &&
      !/(kibbutz|the kibbutz|NDA|©|@|\.com|v\d|http)/i.test(txt)
    ) out.latin.push(txt.slice(0, 60));

    // Content sitting under the sticky bar
    if (barBottom && r.top < barBottom - 2 && r.bottom > 0 && !bar.contains(el) && r.left < de.clientWidth) {
      out.hidden.push(txt.slice(0, 40));
    }
  }

  // Theme mixing: in dark mode, a panel still painted with a light background.
  if (isDark) {
    const lum = (c) => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      if (m[4] !== undefined && Number(m[4]) < 0.5) return null; // mostly transparent
      return (0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]) / 255;
    };
    for (const el of document.querySelectorAll("body *")) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 24) continue;
      const l = lum(getComputedStyle(el).backgroundColor);
      if (l !== null && l > 0.75) {
        out.lightOnDark.push(
          `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} bg=${getComputedStyle(el).backgroundColor}`,
        );
      }
    }
  }

  const uniq = (a) => [...new Set(a)];
  out.keyLeaks = uniq(out.keyLeaks);
  out.latin = uniq(out.latin);
  out.hidden = uniq(out.hidden);
  out.lightOnDark = uniq(out.lightOnDark).slice(0, 6);
  out.deadText = uniq(out.deadText);
  return out;
};

const findings = [];
const note = (route, theme, kind, detail) => findings.push({ route, theme, kind, detail });

for (const theme of ["light", "dark"]) {
  const { ctx, page } = await makeContext(theme);
  console.log(`\n${"═".repeat(72)}\n  ${theme === "light" ? "מצב בהיר" : "מצב כהה"}\n${"═".repeat(72)}`);

  for (const [route, label] of ROUTES) {
    const errors = [];
    const onConsole = (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); };
    const onPageError = (e) => errors.push("UNCAUGHT: " + String(e).slice(0, 120));
    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);

    const landed = new URL(page.url()).pathname;
    const a = await page.evaluate(AUDIT);

    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    const flags = [];
    if (landed !== route) { flags.push(`הפניה → ${landed}`); note(route, theme, "redirect", landed); }
    if (errors.length) { flags.push(`${errors.length} שגיאות קונסולה`); note(route, theme, "console", errors.join(" | ")); }
    if (a.overflow) { flags.push(`גלילה אופקית ${a.overflow.scroll}>${a.overflow.client}`); note(route, theme, "overflow", JSON.stringify(a.overflow)); }
    if (a.keyLeaks.length) { flags.push(`מפתחות i18n: ${a.keyLeaks.join(", ")}`); note(route, theme, "i18n-key", a.keyLeaks.join(", ")); }
    if (a.latin.length) { flags.push(`טקסט לועזי: ${a.latin.join(" / ")}`); note(route, theme, "latin", a.latin.join(" / ")); }
    if (a.deadText.length) { flags.push(`ערכים ריקים: ${a.deadText.join(" / ")}`); note(route, theme, "dead-text", a.deadText.join(" / ")); }
    if (a.hidden.length) { flags.push(`מוסתר מתחת לסרגל: ${a.hidden.join(" / ")}`); note(route, theme, "under-topbar", a.hidden.join(" / ")); }
    if (a.lightOnDark.length) { flags.push(`רקע בהיר בכהה: ${a.lightOnDark.join(" ; ")}`); note(route, theme, "theme-mix", a.lightOnDark.join(" ; ")); }

    console.log(`${route.padEnd(30)} ${flags.length ? "✘ " + flags.join(" · ") : "✔"}`);

    if (SHOTS) {
      await page.screenshot({ path: `qa/shots/${theme}-${route.replace(/\//g, "_") || "_root"}.png` });
    }
  }
  await ctx.close();
}

console.log(`\n${"═".repeat(72)}`);
if (!findings.length) console.log("  אין ממצאים");
else {
  const byKind = {};
  for (const f of findings) (byKind[f.kind] ??= []).push(f);
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`\n▸ ${kind} (${list.length})`);
    for (const f of list) console.log(`   ${f.theme} ${f.route} → ${f.detail}`);
  }
}
await browser.close();
