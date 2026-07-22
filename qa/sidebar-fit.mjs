// QA: the sidebar must fit without scrolling, and must no longer carry the
// "new project" button or the account card.
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";
const HEIGHTS = [900, 800, 700, 620, 560];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Dev session cookies so the shell renders.
await ctx.addCookies([
  { name: "kibbutz-session", value: "dev", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);

await page.goto(`${BASE}/projects`, { waitUntil: "networkidle" });

const removed = await page.evaluate(() => {
  const txt = document.querySelector("aside")?.innerText ?? "";
  return {
    hasCreateBtn: /פרויקט חדש/.test(txt),
    hasAccountCard: /חבר קהילה|Dev Account|אורח/.test(txt),
    items: [...document.querySelectorAll("aside [data-testid^='sidebar-']")].map(
      (b) => b.getAttribute("data-testid").replace("sidebar-", ""),
    ),
  };
});
console.log("create button present:", removed.hasCreateBtn);
console.log("account card present :", removed.hasAccountCard);
console.log("nav items            :", removed.items.join(" · "));

for (const h of HEIGHTS) {
  await page.setViewportSize({ width: 1280, height: h });
  await page.waitForTimeout(350);
  const m = await page.evaluate(() => {
    const nav = document.querySelector("aside nav");
    const rail = document.querySelector("aside > div");
    const last = document.querySelector("aside [data-testid='sidebar-settings']");
    return {
      navScrolls: nav.scrollHeight > nav.clientHeight + 1,
      contentH: Math.round(rail.scrollHeight),
      railH: Math.round(rail.clientHeight),
      lastBottom: Math.round(last.getBoundingClientRect().bottom),
    };
  });
  const ok = !m.navScrolls && m.lastBottom <= h;
  console.log(
    `${h}px → nav scrollbar: ${m.navScrolls ? "YES" : "no"} | content ${m.contentH}px in ${m.railH}px | last item bottom ${m.lastBottom} ${ok ? "✔" : "✘"}`,
  );
}

await browser.close();
