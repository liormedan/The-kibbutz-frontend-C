// QA: AppShell's scroller is 100vh, and AppTopBar eats 64px of it. Any page
// sized with min-h-screen / calc(100vh - x) is therefore 64px too tall.
// Measures the dead scroll each route carries with nothing to show.
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";
const ROUTES = [
  "/projects", "/feed", "/messages", "/friends",
  "/my-projects", "/my-projects/requests", "/my-projects/applications",
  "/my-projects/teams", "/my-portfolio", "/portfolios", "/profile",
  "/settings", "/projects/create", "/portfolios/create", "/matches",
  "/nda", "/nda/inbox",
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

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

console.log("route                          scroller  content   dead-scroll");
let bad = 0;
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => {
    const bar = document.querySelector("header.sticky");
    const scroller = bar?.parentElement;
    if (!scroller) return null;
    return {
      client: scroller.clientHeight,
      scroll: scroller.scrollHeight,
      barH: Math.round(bar.getBoundingClientRect().height),
    };
  });
  if (!m) { console.log(`${route.padEnd(30)} — no shell`); continue; }
  const dead = m.scroll - m.client;
  // A page with nothing to show should not scroll at all.
  const flag = dead > 4 ? `✘ +${dead}px` : "✔";
  if (dead > 4) bad++;
  console.log(`${route.padEnd(30)} ${String(m.client).padEnd(9)} ${String(m.scroll).padEnd(9)} ${flag}`);
}
console.log(`\n${bad}/${ROUTES.length} routes scroll with no content to scroll to.`);
await browser.close();
