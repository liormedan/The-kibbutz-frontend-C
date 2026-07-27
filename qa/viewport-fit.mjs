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

console.log("route                          scroller  page    content  dead-scroll");
let bad = 0;
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => {
    const bar = document.querySelector("header.sticky");
    const scroller = bar?.parentElement;
    if (!scroller) return null;
    // The page root is the scroller's child that isn't the top bar.
    const root = [...scroller.children].find((el) => el !== bar);
    if (!root) return null;
    const rootBox = root.getBoundingClientRect();
    const cs = getComputedStyle(root);
    // How tall the root WOULD be from its content alone, ignoring any
    // min-height: the lowest child edge, plus the root's own bottom padding.
    const lowest = [...root.children].reduce(
      (b, c) => Math.max(b, c.getBoundingClientRect().bottom), rootBox.top);
    return {
      client: scroller.clientHeight,
      scroll: scroller.scrollHeight,
      barH: Math.round(bar.getBoundingClientRect().height),
      rootH: Math.round(rootBox.height),
      contentH: Math.round(lowest - rootBox.top + parseFloat(cs.paddingBottom || "0")),
    };
  });
  // A route that doesn't render the shell is a failure, not a route to skip —
  // silently continuing here let a broken page score as a pass.
  if (!m) { console.log(`${route.padEnd(30)} ✘ אין שלד — הדף לא נטען`); bad++; continue; }
  const dead = m.scroll - m.client;
  // Overflow alone isn't the defect — a long form legitimately scrolls. The
  // bug this suite exists for is a page sized to the VIEWPORT (min-h-screen /
  // calc(100vh - x)) inside a scroller the top bar already shortened: the box
  // is taller than the space available even though the content would have fit.
  const avail = m.client - m.barH;
  const deadScroll = dead > 4 && m.contentH <= avail;
  const flag = deadScroll ? `✘ +${dead}px` : dead > 4 ? `✔ (${dead}px של תוכן אמיתי)` : "✔";
  if (deadScroll) bad++;
  console.log(
    `${route.padEnd(30)} ${String(m.client).padEnd(9)} ${String(m.rootH).padEnd(7)} ${String(m.contentH).padEnd(8)} ${flag}`,
  );
}
console.log(`\n${bad}/${ROUTES.length} routes scroll with no content to scroll to.`);

// ── negative control ───────────────────────────────────────────────────────
// The check above only fails on viewport-sized boxes, so it could silently
// become a check that can never fail. Re-introduce the original bug on a
// nearly-empty route and confirm it is still caught.
await page.goto(BASE + "/friends", { waitUntil: "networkidle" });
await page.waitForTimeout(200);
const control = await page.evaluate(() => {
  const bar = document.querySelector("header.sticky");
  const scroller = bar.parentElement;
  const root = [...scroller.children].find((el) => el !== bar);
  root.style.minHeight = "100vh"; // the bug: viewport-sized inside a shortened box
  const rootBox = root.getBoundingClientRect();
  const cs = getComputedStyle(root);
  const lowest = [...root.children].reduce(
    (b, c) => Math.max(b, c.getBoundingClientRect().bottom), rootBox.top);
  return {
    dead: scroller.scrollHeight - scroller.clientHeight,
    avail: scroller.clientHeight - Math.round(bar.getBoundingClientRect().height),
    contentH: Math.round(lowest - rootBox.top + parseFloat(cs.paddingBottom || "0")),
  };
});
const caught = control.dead > 4 && control.contentH <= control.avail;
console.log(
  `\nבקרה שלילית — min-height:100vh מוזרק ל-/friends: ${caught ? "✔ נתפס" : "✘ לא נתפס — הבדיקה חסרת ערך"}`,
);
if (!caught) bad++;

await browser.close();
process.exit(bad ? 1 : 0);
