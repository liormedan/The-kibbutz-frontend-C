// QA: every route in the app, authed and unauthed, desktop and mobile.
//
// The other suites cover the ~17 routes the mobile work touched. This one walks
// all 34 that exist under src/app, so a page nobody has opened in a while can't
// rot unnoticed.
//
//   QA_BASE=http://localhost:3001 node qa/all-routes.mjs
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";

// Every page.tsx under src/app. Dynamic segments get a sample id.
const AUTHED = [
  "/projects", "/projects/create", "/projects/1", "/projects/1/manage", "/projects/1/team",
  "/feed", "/feed/1",
  "/messages", "/friends", "/matches",
  "/my-projects", "/my-projects/requests", "/my-projects/applications", "/my-projects/teams",
  "/my-portfolio", "/portfolios", "/portfolios/create", "/portfolios/1",
  "/profile", "/profile/1",
  "/settings", "/nda", "/nda/inbox",
  "/applications", "/my-applications", "/teams", "/admin", "/onboarding",
];
const PUBLIC = ["/", "/login", "/register", "/reset-password", "/verify-email"];

const AUTH = {
  state: {
    token: "qa", refreshToken: "qa", isAuthenticated: true,
    user: { id: "qa-1", name: "ליאור מדן", email: "qa@kibbutz.local", avatar: "",
      role: "entrepreneur", canCreateProjects: true, canJoinProjects: true,
      isProfileComplete: true, emailVerified: true },
  },
  version: 0,
};

// What a page must never render.
const AUDIT = () => {
  const de = document.documentElement;
  const bad = { keyLeaks: [], dead: [], overflow: null, empty: false };

  if (de.scrollWidth > de.clientWidth + 1) {
    bad.overflow = { scroll: de.scrollWidth, client: de.clientWidth };
  }
  const text = document.body.innerText.trim();
  bad.empty = text.length < 10;

  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length || !el.textContent.trim()) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    const txt = el.textContent.trim();
    // A dictionary key rendered verbatim instead of its translation.
    if (/^[a-z][a-zA-Z0-9]{7,}$/.test(txt) && !txt.includes(" ")) bad.keyLeaks.push(txt);
    if (/\b(undefined|NaN|\[object Object\]|\{[a-z]+\})/.test(txt)) bad.dead.push(txt.slice(0, 50));
  }
  bad.keyLeaks = [...new Set(bad.keyLeaks)];
  bad.dead = [...new Set(bad.dead)];
  return bad;
};

let pass = 0, fail = 0;
const findings = [];
const note = (route, mode, kind, detail) => {
  findings.push({ route, mode, kind, detail });
  fail++;
};

const browser = await chromium.launch();

async function sweep(label, routes, { authed, width, height }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    ...(width < 768 ? { deviceScaleFactor: 2 } : {}),
  });
  if (authed) {
    await ctx.addCookies([
      { name: "kibbutz-session", value: "qa", url: BASE },
      { name: "kibbutz-role", value: "user", url: BASE },
    ]);
    await ctx.addInitScript((a) => {
      sessionStorage.setItem("kibbutz-auth", a);
      localStorage.setItem("new-kibbutz-lang", "he");
    }, JSON.stringify(AUTH));
  } else {
    await ctx.addInitScript(() => localStorage.setItem("new-kibbutz-lang", "he"));
  }
  // Backend is not part of this repo — answer every call with a valid envelope
  // so a page is judged on its own rendering, not on a missing server.
  //
  // A LIST endpoint returns PaginatedResponse; a DETAIL endpoint returns the
  // item itself. Serving the paginated shape everywhere hands a detail page an
  // object with no `author` and no `title` — both non-optional in the DTO —
  // and the page dies on a TypeError that no real backend could produce. Match
  // the contract instead, or the suite reports its own stub as an app bug.
  await ctx.route("**/api/**", (r) => {
    const path = new URL(r.request().url()).pathname;
    const json = (data) =>
      r.fulfill({ status: 200, contentType: "application/json",
                  body: JSON.stringify({ success: true, data }) });

    const user = {
      userId: "u1", firstName: "ליאור", lastName: "מדן", fullName: "ליאור מדן",
      username: "lior", email: "qa@kibbutz.local", profilePictureUrl: null,
      coverImageUrl: null, bio: null, role: 1, followersCount: 0, followingCount: 0,
    };
    // /api/<collection>/<id> — a single resource, not a page of them.
    const detail = /^\/api\/[a-z-]+\/[^/]+\/?$/i.test(path) && !/\/(me|search)\/?$/i.test(path);
    if (detail && /posts?/i.test(path)) {
      return json({ postId: "1", author: user, content: "פוסט בדיקה", imageUrl: null,
                    likesCount: 0, commentsCount: 0, isLikedByCurrentUser: false,
                    createdAt: new Date(0).toISOString(), comments: [] });
    }
    if (detail && /portfolios?/i.test(path)) {
      return json({ portfolioId: "1", owner: user, title: "תיק בדיקה", description: null,
                    category: "עיצוב", imageUrl: null, tags: [], likesCount: 0,
                    viewsCount: 0, isLikedByCurrentUser: false,
                    createdAt: new Date(0).toISOString() });
    }
    return json({ items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 });
  });

  const page = await ctx.newPage();
  console.log(`\n${"═".repeat(70)}\n  ${label}\n${"═".repeat(70)}`);

  for (const route of routes) {
    const errors = [];
    const onConsole = (m) => m.type() === "error" && errors.push(m.text().slice(0, 120));
    const onPageError = (e) => errors.push("UNCAUGHT: " + String(e).slice(0, 120));
    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    let landed = route, a = null, crashed = null;
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 20000 });
      await page.waitForTimeout(250);
      landed = new URL(page.url()).pathname;
      a = await page.evaluate(AUDIT);
    } catch (e) {
      crashed = String(e).slice(0, 90);
    }
    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    const flags = [];
    if (crashed) { flags.push("לא נטען"); note(route, label, "load", crashed); }
    else {
      if (a.empty) { flags.push("דף ריק"); note(route, label, "empty", "פחות מ-10 תווים"); }
      if (a.overflow) { flags.push(`גלישה ${a.overflow.scroll}>${a.overflow.client}`); note(route, label, "overflow", JSON.stringify(a.overflow)); }
      if (a.keyLeaks.length) { flags.push(`מפתחות i18n`); note(route, label, "i18n-key", a.keyLeaks.join(", ")); }
      if (a.dead.length) { flags.push(`ערכים ריקים`); note(route, label, "dead-text", a.dead.join(" / ")); }
      if (errors.length) { flags.push(`${errors.length} שגיאות`); note(route, label, "console", errors.join(" | ")); }
    }
    if (!flags.length) pass++;

    const redirect = landed !== route ? ` → ${landed}` : "";
    console.log(`${route.padEnd(30)}${redirect.padEnd(22)} ${flags.length ? "✘ " + flags.join(" · ") : "✔"}`);
  }
  await ctx.close();
}

await sweep("מחובר · דסקטופ 1440", AUTHED, { authed: true, width: 1440, height: 900 });
await sweep("מחובר · מובייל 390", AUTHED, { authed: true, width: 390, height: 844 });
await sweep("לא מחובר · דסקטופ", PUBLIC, { authed: false, width: 1440, height: 900 });
await sweep("לא מחובר · מובייל", PUBLIC, { authed: false, width: 390, height: 844 });

console.log(`\n${"═".repeat(70)}`);
if (findings.length) {
  const byKind = {};
  for (const f of findings) (byKind[f.kind] ??= []).push(f);
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`\n▸ ${kind} (${list.length})`);
    for (const f of list) console.log(`   ${f.mode} · ${f.route} → ${f.detail}`);
  }
  console.log("");
}
console.log(`  ${pass} מסלולים נקיים · ${fail} ממצאים`);
console.log("═".repeat(70));

await browser.close();
process.exit(fail ? 1 : 0);
