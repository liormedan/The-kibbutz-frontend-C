// QA: the mobile shell — MOBILE_SPEC.md acceptance for Sprint 1.
//
//   npx next start -p 3001
//   QA_BASE=http://localhost:3001 node qa/mobile.mjs
//
// The headline assertion is ZERO horizontal overflow at every width on every
// route: that was the app-wide bug S1 exists to kill.
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";
const WIDTHS = [360, 390, 430];
const ROUTES = [
  "/projects", "/feed", "/messages", "/friends",
  "/my-projects", "/my-projects/requests", "/my-projects/teams",
  "/my-portfolio", "/portfolios", "/profile", "/settings",
  "/projects/create", "/matches", "/nda",
];

const AUTH = {
  state: {
    token: "qa", refreshToken: "qa", isAuthenticated: true,
    user: { id: "qa-1", name: "ליאור מדן", email: "qa@kibbutz.local", avatar: "",
      role: "entrepreneur", canCreateProjects: true, canJoinProjects: true,
      isProfileComplete: true, emailVerified: true },
  },
  version: 0,
};

let pass = 0, fail = 0;
const ok = (label, good, detail = "") => {
  if (good) { pass++; console.log(`  ✔ ${label}`); }
  else { fail++; console.log(`  ✘ ${label}${detail ? "  → " + detail : ""}`); }
};

const browser = await chromium.launch();

async function ctxAt(width) {
  const ctx = await browser.newContext({
    viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  await ctx.route("**/api/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ success: true, data: { items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 } }) }));
  const page = await ctx.newPage();
  await page.addInitScript((a) => {
    sessionStorage.setItem("kibbutz-auth", a);
    localStorage.setItem("new-kibbutz-lang", "he");
  }, JSON.stringify(AUTH));
  return { ctx, page };
}

// ── 1. no horizontal scrolling, every width × every route ───────────────────
// NOTE on the measurement: under Chromium's mobile emulation innerWidth is 7px
// wider than clientWidth because a classic scrollbar is reserved, so a
// full-bleed `fixed inset-x-0` bar measures 7px past clientWidth and
// scrollWidth-clientWidth reads 7 on a perfectly healthy page. Real phones use
// overlay scrollbars. So assert what the user can actually do — scroll the page
// sideways — and separately catch content that genuinely exceeds the layout
// viewport. See MOBILE_SPEC.md §2 finding 1.
console.log("גלישה אופקית");
for (const width of WIDTHS) {
  const { ctx, page } = await ctxAt(width);
  const scrollable = [], wide = [];
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(180);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const x0 = window.scrollX;
      window.scrollTo(9999, window.scrollY);
      const moved = Math.abs(window.scrollX - x0) > 0.5;
      window.scrollTo(0, window.scrollY);
      // in-flow content that spills past the true containing block
      let worst = 0;
      document.querySelectorAll("main, main *, header *").forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width && b.right > window.innerWidth + 0.5) {
          worst = Math.max(worst, Math.round(b.right - window.innerWidth));
        }
      });
      return { moved, worst };
    });
    if (r.moved) scrollable.push(route);
    if (r.worst > 0) wide.push(`${route} +${r.worst}px`);
  }
  ok(`${width}px — הדף לא נגלל לצדדים (${ROUTES.length} נתיבים)`, scrollable.length === 0, scrollable.join(", "));
  ok(`${width}px — אין תוכן שחורג מרוחב הפריסה`, wide.length === 0, wide.join(", "));
  await ctx.close();
}

// ── 2. the bottom bar itself ────────────────────────────────────────────────
console.log("\nניווט תחתון");
{
  const { ctx, page } = await ctxAt(360);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 100)));
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const nav = page.locator('[data-testid="mobile-nav"]');
  ok("קיים", await nav.count() === 1);

  const ids = ["explore", "feed", "messages", "my-projects", "more"];
  const present = [];
  for (const id of ids) {
    if (await page.locator(`[data-testid="mobilenav-${id}"]`).count() === 1) present.push(id);
  }
  ok("חמישה סלוטים נכונים", present.length === 5, present.join(" · "));

  // no label may be visually clipped, and no slot may exceed its 1/5 share
  const m = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="mobile-nav"]');
    const btns = [...nav.querySelectorAll("button")];
    return btns.map((b) => {
      const span = b.querySelector("span:last-child");
      return {
        label: span ? span.innerText.trim() : "",
        clipped: span ? span.scrollWidth > span.clientWidth + 1 : false,
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
      };
    });
  });
  ok("אין תווית חתוכה ב-360px", m.every((x) => !x.clipped),
     m.filter((x) => x.clipped).map((x) => x.label).join(", "));
  ok("יעדי מגע ≥44px", m.every((x) => x.h >= 44 && x.w >= 44),
     m.map((x) => `${x.label} ${x.w}×${x.h}`).join(" | "));
  console.log(`     תוויות: ${m.map((x) => x.label).join(" · ")}`);

  // the removed tab must be gone
  ok("הטאב 'צוותים' הישן הוסר", !m.some((x) => x.label === "צוותים"));

  // navigation works
  await page.click('[data-testid="mobilenav-feed"]');
  await page.waitForURL("**/feed", { timeout: 5000 }).catch(() => {});
  ok("ניווט לפיד", new URL(page.url()).pathname === "/feed", page.url());
  const activeMark = await page.evaluate(() =>
    document.querySelector('[data-testid="mobilenav-feed"]').getAttribute("aria-current"));
  ok("הפריט הפעיל מסומן", activeMark === "page");

  ok("אין חריגות JS", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// ── 3. the "עוד" sheet ──────────────────────────────────────────────────────
console.log("\nגיליון עוד");
{
  const { ctx, page } = await ctxAt(390);
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  await page.click('[data-testid="mobilenav-more"]');
  await page.waitForTimeout(250);
  ok("נפתח", await page.locator('[data-testid="more-sheet"]').count() === 1);
  for (const [key, label] of [["friends", "חברים"], ["my-portfolio", "תיק העבודות"], ["settings", "הגדרות"], ["logout", "התנתקות"]]) {
    ok(`כולל ${label}`, await page.locator(`[data-testid="more-${key}"]`).count() === 1);
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  ok("Escape סוגר", await page.locator('[data-testid="more-sheet"]').count() === 0);

  await page.click('[data-testid="mobilenav-more"]');
  await page.waitForTimeout(200);
  await page.click('[data-testid="more-settings"]');
  await page.waitForURL("**/settings", { timeout: 5000 }).catch(() => {});
  ok("ניווט להגדרות", new URL(page.url()).pathname === "/settings", page.url());
  await page.waitForTimeout(250);
  ok("הגיליון נסגר אחרי ניווט", await page.locator('[data-testid="more-sheet"]').count() === 0);
  ok("סלוט 'עוד' מסומן פעיל בדף מהגיליון", await page.evaluate(() =>
    document.querySelector('[data-testid="mobilenav-more"]').className.includes("text-primary")));
  await ctx.close();
}

// ── 4. top bar: round + on mobile, full button on desktop ───────────────────
console.log("\nכפתור יצירה");
{
  const { ctx, page } = await ctxAt(390);
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const btn = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="topbar-create"]');
    const r = b.getBoundingClientRect();
    const span = b.querySelector("span");
    return { w: Math.round(r.width), h: Math.round(r.height),
             labelShown: span ? getComputedStyle(span).display !== "none" : false };
  });
  ok("עגול וקומפקטי במובייל", btn.w <= 48 && btn.h >= 44, `${btn.w}×${btn.h}`);
  ok("התווית מוסתרת במובייל", !btn.labelShown);
  await page.click('[data-testid="topbar-create"]');
  await page.waitForURL("**/projects/create", { timeout: 5000 }).catch(() => {});
  ok("עדיין מנווט ליצירה", new URL(page.url()).pathname === "/projects/create");
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  await ctx.route("**/api/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  const page = await ctx.newPage();
  await page.addInitScript((a) => {
    sessionStorage.setItem("kibbutz-auth", a);
    localStorage.setItem("new-kibbutz-lang", "he");
  }, JSON.stringify(AUTH));
  await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const d = await page.evaluate(() => ({
    labelShown: getComputedStyle(document.querySelector('[data-testid="topbar-create"] span')).display !== "none",
    navHidden: !document.querySelector('[data-testid="mobile-nav"]')
      || getComputedStyle(document.querySelector('[data-testid="mobile-nav"]')).display === "none",
    sidebar: !!document.querySelector("aside"),
  }));
  ok("בדסקטופ התווית חוזרת", d.labelShown);
  ok("בדסקטופ הניווט התחתון מוסתר", d.navHidden);
  ok("בדסקטופ הסייד-בר מוצג", d.sidebar);
  await ctx.close();
}

// ── 5. messages: list ↔ chat (S2) ───────────────────────────────────────────
console.log("\nהודעות — רשימה ↔ צ׳אט");
{
  const { ctx, page } = await ctxAt(390);
  await page.goto(BASE + "/messages", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const shown = async (sel) => page.locator(sel).first().isVisible().catch(() => false);

  ok("נוחתים על רשימת השיחות", await shown('[data-testid="conv-list"]'));
  ok("הצ׳אט לא פתוח כברירת מחדל", !(await shown('[data-testid="chat-pane"]')));

  // open a conversation (demo data is what renders with no backend)
  const firstConv = page.locator('[data-testid^="demo-conv-"]').first();
  const hasDemo = await firstConv.count() > 0;
  if (hasDemo) {
    await firstConv.click();
    await page.waitForTimeout(300);
    ok("לחיצה על שיחה פותחת צ׳אט", await shown('[data-testid="chat-pane"]'));
    ok("הרשימה מתחלפת (לא שתי עמודות)", !(await shown('[data-testid="conv-list"]')));
    ok("יש כפתור חזרה", await shown('[data-testid="chat-back"]'));

    await page.click('[data-testid="chat-back"]');
    await page.waitForTimeout(300);
    ok("חזרה מחזירה לרשימה", await shown('[data-testid="conv-list"]'));
    ok("הצ׳אט נסגר", !(await shown('[data-testid="chat-pane"]')));
  } else {
    ok("יש שיחות דמו לבדיקה", false, "לא נמצאו [data-testid^=demo-conv-]");
  }

  // the composer must clear the fixed bottom nav
  const clear = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="mobile-nav"]');
    const card = document.querySelector("main > div");
    if (!nav || !card) return null;
    return { cardBottom: Math.round(card.getBoundingClientRect().bottom),
             navTop: Math.round(nav.getBoundingClientRect().top) };
  });
  ok("הכרטיס לא נחבא מתחת לניווט התחתון",
     clear && clear.cardBottom <= clear.navTop,
     clear ? `card ${clear.cardBottom} vs nav ${clear.navTop}` : "לא נמדד");
  await ctx.close();
}
{
  // desktop keeps both panes side by side
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  await ctx.route("**/api/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  const page = await ctx.newPage();
  await page.addInitScript((a) => {
    sessionStorage.setItem("kibbutz-auth", a);
    localStorage.setItem("new-kibbutz-lang", "he");
  }, JSON.stringify(AUTH));
  await page.goto(BASE + "/messages", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const both = await page.evaluate(() => ({
    list: !!document.querySelector('[data-testid="conv-list"]')
      && getComputedStyle(document.querySelector('[data-testid="conv-list"]')).display !== "none",
    chat: !!document.querySelector('[data-testid="chat-pane"]')
      && getComputedStyle(document.querySelector('[data-testid="chat-pane"]')).display !== "none",
    backHidden: (() => {
      const b = document.querySelector('[data-testid="chat-back"]');
      return !b || getComputedStyle(b).display === "none";
    })(),
  }));
  ok("בדסקטופ שתי העמודות מוצגות יחד", both.list && both.chat, JSON.stringify(both));
  ok("בדסקטופ כפתור החזרה מוסתר", both.backHidden);
  await ctx.close();
}

// ── 6. tabs & layout (S3) ───────────────────────────────────────────────────
console.log("\nטאבים ופריסה");
for (const width of [360, 390]) {
  const { ctx, page } = await ctxAt(width);

  // settings must stack — the 12rem rail beside content left ~164px on a phone
  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const s = await page.evaluate(() => {
    const shell = document.querySelector('[data-testid="settings-shell"]');
    const nav = document.querySelector('[data-testid="settings-nav"]');
    const content = shell ? shell.children[1] : null;
    return {
      stacked: shell ? getComputedStyle(shell).display === "flex" : false,
      contentW: content ? Math.round(content.getBoundingClientRect().width) : 0,
      navScrolls: nav ? getComputedStyle(nav).overflowX === "auto" : false,
      shellW: shell ? Math.round(shell.getBoundingClientRect().width) : 0,
    };
  });
  ok(`${width}px — הגדרות בעמודה אחת`, s.stacked);
  ok(`${width}px — לתוכן ההגדרות יש את כל הרוחב`,
     s.contentW > s.shellW * 0.9, `${s.contentW} מתוך ${s.shellW}`);
  ok(`${width}px — סרגל ההגדרות נגלל`, s.navScrolls);

  // hub tabs: scrollable, never wrapped, active one visible
  await page.goto(BASE + "/my-projects/teams", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const h = await page.evaluate(() => {
    const nav = document.querySelector('[data-testid="hub-tabs"]');
    if (!nav) return null;
    const active = nav.querySelector('[aria-current="page"]');
    const nr = nav.getBoundingClientRect(), ar = active?.getBoundingClientRect();
    return {
      scrolls: getComputedStyle(nav).overflowX === "auto",
      wrap: getComputedStyle(nav).flexWrap,
      activeInView: ar ? ar.left >= nr.left - 1 && ar.right <= nr.right + 1 : false,
      activeLabel: active?.textContent.trim() ?? "",
    };
  });
  ok(`${width}px — טאבי המרכז נגללים ולא נשברים`, h && h.scrolls && h.wrap === "nowrap");
  ok(`${width}px — הטאב הפעיל גלול לתצוגה`, h && h.activeInView, h ? h.activeLabel : "");

  // profile tabs: no clipped label
  await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const pr = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="profile-tabs"]');
    if (!bar) return null;
    return {
      scrolls: getComputedStyle(bar).overflowX === "auto",
      clipped: [...bar.children].filter((c) => c.scrollWidth > c.clientWidth + 1)
        .map((c) => c.textContent.trim()),
    };
  });
  ok(`${width}px — אין תווית חתוכה בטאבי הפרופיל`,
     pr && pr.clipped.length === 0, pr ? pr.clipped.join(", ") : "לא נמצא");

  await ctx.close();
}
{
  // desktop must keep the settings rail beside the content
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  await ctx.route("**/api/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  const page = await ctx.newPage();
  await page.addInitScript((a) => {
    sessionStorage.setItem("kibbutz-auth", a);
    localStorage.setItem("new-kibbutz-lang", "he");
  }, JSON.stringify(AUTH));
  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const d = await page.evaluate(() => {
    const shell = document.querySelector('[data-testid="settings-shell"]');
    return { grid: getComputedStyle(shell).display === "grid",
             cols: getComputedStyle(shell).gridTemplateColumns };
  });
  ok("בדסקטופ ההגדרות נשארות רייל + תוכן", d.grid, d.cols);
  await ctx.close();
}

console.log(`\n${"═".repeat(60)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(60)}`);
await browser.close();
process.exit(fail ? 1 : 0);
