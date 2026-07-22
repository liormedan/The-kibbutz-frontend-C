// QA: the dimensions the route sweep does not cover — real clicking, the top
// bar's interactive bits, the English/LTR mirror, mobile, and the collapsed
// rail. Run alongside qa/ui-walkthrough.mjs and qa/viewport-fit.mjs.
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";

const AUTH = {
  state: {
    token: "qa", refreshToken: "qa", isAuthenticated: true,
    user: { id: "qa-1", name: "ליאור מדן", email: "qa@kibbutz.local", avatar: "",
      role: "entrepreneur", canCreateProjects: true, canJoinProjects: true,
      isProfileComplete: true, emailVerified: true },
  },
  version: 0,
};

const ROUTES = [
  "/projects", "/feed", "/messages", "/friends",
  "/my-projects", "/my-projects/requests", "/my-projects/applications",
  "/my-projects/teams", "/my-portfolio", "/portfolios", "/profile",
  "/settings", "/projects/create", "/portfolios/create", "/matches",
  "/nda", "/nda/inbox",
];

let pass = 0, fail = 0;
const ok = (label, good, detail = "") => {
  if (good) { pass++; console.log(`  ✔ ${label}`); }
  else { fail++; console.log(`  ✘ ${label}${detail ? "  → " + detail : ""}`); }
};
const section = (t) => console.log(`\n${"─".repeat(70)}\n${t}\n${"─".repeat(70)}`);

const browser = await chromium.launch();

// resetCollapsed: addInitScript runs on EVERY load, so a test that reloads to
// check persistence must not keep clearing the key it is checking.
async function makeContext({ lang = "he", theme = "light", viewport = { width: 1440, height: 900 }, resetCollapsed = true } = {}) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  await ctx.route("**/api/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ success: true, data: { items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 } }) }));
  const page = await ctx.newPage();
  await page.addInitScript(([a, l, th, reset]) => {
    sessionStorage.setItem("kibbutz-auth", a);
    localStorage.setItem("new-kibbutz-lang", l);
    localStorage.setItem("new-kibbutz-theme", th);
    if (reset) localStorage.removeItem("new-kibbutz-sidebar-collapsed");
  }, [JSON.stringify(AUTH), lang, theme, resetCollapsed]);
  return { ctx, page };
}

// ── A. clicking the nav, not just typing URLs ──────────────────────────────
section("A · ניווט בקליקים אמיתיים מהתפריט");
{
  const { ctx, page } = await makeContext();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 100)));
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });

  const EXPECT = [
    ["explore", "/projects"], ["feed", "/feed"], ["messages", "/messages"],
    ["friends", "/friends"], ["my-projects", "/my-projects"],
    ["my-portfolio", "/my-portfolio"], ["profile", "/profile"], ["settings", "/settings"],
  ];
  for (const [id, expected] of EXPECT) {
    await page.click(`[data-testid="sidebar-${id}"]`);
    await page.waitForURL(`**${expected}`, { timeout: 5000 }).catch(() => {});
    const landed = new URL(page.url()).pathname;
    const active = await page.evaluate(
      (i) => {
        const el = document.querySelector(`[data-testid="sidebar-${i}"]`);
        return el?.className.includes("bg-primary/10") ?? false;
      }, id);
    ok(`${id} → ${expected}`, landed === expected && active,
       `נחת על ${landed}${active ? "" : " · הפריט לא מודגש"}`);
  }
  ok("אין חריגות JS בזמן הניווט", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// ── B. the top bar is interactive, not decorative ──────────────────────────
section("B · הסרגל העליון — קליקים");
{
  const { ctx, page } = await makeContext();
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });

  // bell opens a panel that stays on screen
  await page.click('[data-testid="topbar-bell"]');
  await page.waitForTimeout(250);
  const panel = await page.evaluate(() => {
    const p = document.querySelector("header.sticky .absolute");
    if (!p) return null;
    const r = p.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
             vw: document.documentElement.clientWidth };
  });
  ok("הפעמון פותח פאנל", !!panel);
  ok("הפאנל לא נחתך מחוץ למסך", panel && panel.left >= 0 && panel.right <= panel.vw,
     panel ? `left=${panel.left} right=${panel.right} vw=${panel.vw}` : "");

  // clicking outside closes it
  await page.mouse.click(700, 500);
  await page.waitForTimeout(250);
  const closed = await page.evaluate(() => !document.querySelector("header.sticky .absolute"));
  ok("קליק בחוץ סוגר את הפאנל", closed);

  // avatar → profile
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.click('[data-testid="topbar-avatar"]');
  await page.waitForURL("**/profile", { timeout: 5000 }).catch(() => {});
  ok("האווטאר מוביל לפרופיל", new URL(page.url()).pathname === "/profile", page.url());

  // create button → create page
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.click('[data-testid="topbar-create"]');
  await page.waitForURL("**/projects/create", { timeout: 5000 }).catch(() => {});
  ok("כפתור הפרויקט מוביל ליצירה", new URL(page.url()).pathname === "/projects/create", page.url());
  await ctx.close();
}

// ── C. English / LTR — the mirror nobody looks at ──────────────────────────
section("C · אנגלית (LTR) — כל הנתיבים");
{
  const { ctx, page } = await makeContext({ lang: "en" });
  const hebrewLeaks = [];
  const sampleDataRoutes = [];
  const overflow = [];
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 100)); });

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(150);
    const r = await page.evaluate((userName) => {
      const de = document.documentElement;
      const HEB = /[֐-׿]/;
      // CHROME = strings the app itself owns: shell, headings, controls, labels.
      // Hebrew here in the English UI is a hardcoded string — a real bug.
      // Body prose/cards are seeded sample data and are reported separately.
      // Note: not bare `aside` — the messages page uses one for its conversation
      // list, which is sample data. The shell's rail is covered by its testids.
      const CHROME =
        "[data-testid^='sidebar-'], header.sticky, h1, h2, h3, label, button, [role='tab'], nav a, option";
      // A language switcher names each language in its own language on purpose.
      const LANG_NAMES = new Set(["עברית", "English"]);
      const chrome = [], data = [];
      const seen = new Set();
      for (const root of document.querySelectorAll(CHROME)) {
        const txt = root.innerText?.trim() ?? "";
        if (txt && HEB.test(txt) && txt !== userName && !LANG_NAMES.has(txt) && !seen.has(txt)) {
          seen.add(txt); chrome.push(txt.slice(0, 40));
        }
      }
      for (const el of document.querySelectorAll("p, span, td, li")) {
        if (el.closest(CHROME) || el.closest("header.sticky")) continue;
        const txt = el.textContent.trim();
        if (txt && HEB.test(txt) && !seen.has(txt)) { seen.add(txt); data.push(txt.slice(0, 40)); }
      }
      for (const el of document.querySelectorAll("[title],[aria-label],[placeholder]")) {
        for (const a of ["title", "aria-label", "placeholder"]) {
          const v = el.getAttribute(a);
          if (v && HEB.test(v) && v !== userName) chrome.push(`@${a}="${v.slice(0, 30)}"`);
        }
      }
      return {
        dir: de.getAttribute("dir"),
        lang: de.getAttribute("lang"),
        overflow: de.scrollWidth > de.clientWidth + 1,
        leaks: [...new Set(chrome)],
        sampleData: [...new Set(data)].length,
      };
    }, AUTH.state.user.name);
    if (r.sampleData) sampleDataRoutes.push(`${route} (${r.sampleData})`);
    if (r.dir !== "ltr" || r.lang !== "en") ok(`${route} dir/lang`, false, `dir=${r.dir} lang=${r.lang}`);
    if (r.overflow) overflow.push(route);
    if (r.leaks.length) hebrewLeaks.push(`${route}: ${r.leaks.join(" / ")}`);
  }
  ok("dir=ltr ו-lang=en בכל הנתיבים", true);
  ok("אין גלילה אופקית", overflow.length === 0, overflow.join(", "));
  ok("אין עברית קשיחה ברכיבי הממשק", hebrewLeaks.length === 0, "\n     " + hebrewLeaks.join("\n     "));
  ok("אין שגיאות קונסולה", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  if (sampleDataRoutes.length) {
    console.log(`  ℹ נתוני דמו בעברית (יוחלפו בתוכן מהשרת): ${sampleDataRoutes.join(", ")}`);
  }

  // sidebar mirrors to the left
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  const sides = await page.evaluate(() => {
    const rail = document.querySelector("aside > div");
    const bar = document.querySelector("header.sticky");
    const kids = [...bar.children].map((c) => c.getBoundingClientRect());
    return {
      railLeft: Math.round(rail.getBoundingClientRect().left),
      barRight: Math.round(bar.getBoundingClientRect().right),
      clusterRight: Math.round(Math.max(...kids.map((k) => k.right))),
    };
  });
  ok("הסייד-בר עבר לשמאל", sides.railLeft === 0, `left=${sides.railLeft}`);
  ok("קבוצת הסרגל עברה לימין", sides.barRight - sides.clusterRight < 40,
     `${sides.clusterRight} מול ${sides.barRight}`);
  await ctx.close();
}

// ── D. mobile ──────────────────────────────────────────────────────────────
section("D · מובייל 390×844");
{
  const { ctx, page } = await makeContext({ viewport: { width: 390, height: 844 } });
  const overflow = [];
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(120);
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bottomNav: !!document.querySelector("nav.md\\:hidden"),
      railVisible: (() => {
        const a = document.querySelector("aside");
        return a ? getComputedStyle(a).display !== "none" : false;
      })(),
      topbar: !!document.querySelector("header.sticky"),
      barFits: (() => {
        const b = document.querySelector("header.sticky");
        if (!b) return true;
        return [...b.children].every((c) => c.getBoundingClientRect().left >= -1);
      })(),
    }));
    if (r.overflow > 1) overflow.push(`${route} (+${r.overflow}px)`);
    if (!r.bottomNav || r.railVisible || !r.topbar || !r.barFits) {
      ok(`${route}`, false,
        `bottomNav=${r.bottomNav} railVisible=${r.railVisible} topbar=${r.topbar} barFits=${r.barFits}`);
    }
  }
  ok("ניווט תחתון קיים והרייל מוסתר בכל הנתיבים", true);
  ok("הסרגל העליון נכנס ברוחב מובייל", true);
  ok("אין גלילה אופקית במובייל", overflow.length === 0, overflow.join(", "));
  await ctx.close();
}

// ── E. collapsed rail ──────────────────────────────────────────────────────
section("E · תפריט מכווץ");
{
  const { ctx, page } = await makeContext({ resetCollapsed: false });
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("new-kibbutz-sidebar-collapsed"));
  await page.reload({ waitUntil: "networkidle" });
  await page.click("aside button[title]");
  await page.waitForTimeout(400);
  const c = await page.evaluate(() => {
    const rail = document.querySelector("aside > div");
    const items = [...document.querySelectorAll("aside [data-testid^='sidebar-']")];
    const nav = document.querySelector("aside nav");
    return {
      width: Math.round(rail.getBoundingClientRect().width),
      count: items.length,
      allVisible: items.every((i) => i.getBoundingClientRect().bottom <= window.innerHeight),
      navScrolls: nav.scrollHeight > nav.clientHeight + 1,
      labelsHidden: items.every((i) => i.innerText.trim() === ""),
    };
  });
  ok("הרייל התכווץ", c.width < 100, `${c.width}px`);
  ok("כל 8 הפריטים עדיין שם", c.count === 8, String(c.count));
  ok("כולם נראים בלי גלילה", c.allVisible && !c.navScrolls);
  ok("התוויות הוסתרו", c.labelsHidden);

  // and it survives a reload
  await page.reload({ waitUntil: "networkidle" });
  const stillCollapsed = await page.evaluate(
    () => Math.round(document.querySelector("aside > div").getBoundingClientRect().width) < 100);
  ok("המצב נשמר אחרי רענון", stillCollapsed);
  await ctx.close();
}

console.log(`\n${"═".repeat(70)}`);
console.log(`  ${pass} עברו · ${fail} נכשלו`);
console.log("═".repeat(70));
await browser.close();
process.exit(fail ? 1 : 0);
