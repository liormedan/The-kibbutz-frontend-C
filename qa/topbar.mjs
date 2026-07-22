// QA: the top-bar cluster (new project · bell · avatar) must sit at the top-LEFT
// of the content area on EVERY hosted route, and stay put while the page scrolls.
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";
const ROUTES = [
  "/projects", "/feed", "/messages", "/friends",
  "/my-projects", "/my-projects/requests", "/my-projects/applications",
  "/my-projects/teams", "/my-portfolio", "/portfolios", "/profile",
  "/settings", "/matches", "/nda",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addCookies([
  { name: "kibbutz-session", value: "dev", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);
// Stub the REST API: this run is about layout, and a 401 would end the session
// and bounce every route to "/".
await ctx.route("**/api/**", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      data: { items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 },
    }),
  }),
);

const page = await ctx.newPage();
// Seed a logged-in session the way the auth store persists it.
await page.addInitScript(() => {
  sessionStorage.setItem(
    "kibbutz-auth",
    JSON.stringify({
      state: {
        token: "qa-token",
        refreshToken: "qa-refresh",
        isAuthenticated: true,
        user: {
          id: "qa-1", name: "QA User", email: "qa@kibbutz.local", avatar: "",
          role: "entrepreneur", canCreateProjects: true, canJoinProjects: true,
          isProfileComplete: true, emailVerified: true,
        },
      },
      version: 0,
    }),
  );
});

const probe = () =>
  page.evaluate(() => {
    const bar = document.querySelector("header.sticky");
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    const kids = [...bar.children].map((c) => {
      const k = c.getBoundingClientRect();
      return { left: Math.round(k.left), text: c.innerText.trim().slice(0, 20) };
    });
    const content = document.querySelector("header.sticky + *");
    return {
      top: Math.round(r.top),
      barLeft: Math.round(r.left),
      groupLeft: Math.round(Math.min(...kids.map((k) => k.left))),
      groupRight: Math.round(Math.max(...[...bar.children].map((c) => c.getBoundingClientRect().right))),
      order: kids.sort((a, b) => a.left - b.left).map((k) => k.text || "•"),
      count: bar.children.length,
      overlaps: content ? Math.round(content.getBoundingClientRect().top) < Math.round(r.bottom) - 1 : false,
    };
  });

let fails = 0;
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  const m = await probe();
  if (!m) { console.log(`${route.padEnd(30)} ✘ NO TOP BAR`); fails++; continue; }
  // Cluster hugs the LEFT edge of the content area (RTL) → gap on the left is
  // small, gap on the right is large.
  const leftGap = m.groupLeft - m.barLeft;
  const ok = m.top === 0 && m.count === 3 && leftGap < 40;
  if (!ok) fails++;
  console.log(
    `${route.padEnd(30)} top=${m.top} items=${m.count} leftGap=${leftGap}px order=[${m.order.join(" | ")}] ${ok ? "✔" : "✘"}`,
  );
}

// Sticky check: scroll a long page and confirm the bar stays at y=0.
await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
await page.evaluate(() => document.querySelector("header.sticky").parentElement.scrollBy(0, 600));
await page.waitForTimeout(300);
const after = await probe();
console.log(`\nafter scrolling 600px → bar top = ${after.top} ${after.top === 0 ? "✔ sticky" : "✘ scrolled away"}`);
if (after.top !== 0) fails++;

// LTR mirror: cluster should flip to the right edge.
await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("new-kibbutz-lang", "en"));
await page.reload({ waitUntil: "networkidle" });
const en = await probe();
const barRight = await page.evaluate(() => Math.round(document.querySelector("header.sticky").getBoundingClientRect().right));
console.log(`English → cluster right edge ${en.groupRight} vs bar right ${barRight} ${barRight - en.groupRight < 40 ? "✔ mirrored" : "✘ not mirrored"}`);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILURES`);
await browser.close();
