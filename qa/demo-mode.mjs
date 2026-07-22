// QA: the "מצב פיתוח" toggle. Runs against the DEV server — the toggle is
// development-only by design, so a production build correctly has no button.
//
//   npm run dev -- -p 3002   then   QA_BASE=http://localhost:3002 node qa/demo-mode.mjs
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3002";

// route → a selector that only matches once the page has content to show
const PAGES = [
  ["/feed", "מצב פיתוח – פיד", "ul li"],
  ["/friends", "מצב פיתוח – חברים", "button, a"],
  ["/my-projects", "מצב פיתוח – הפרויקטים שלי", "section"],
  ["/my-projects/teams", "מצב פיתוח – הצוותים שלי", ".glass-card"],
  ["/my-portfolio", "מצב פיתוח – תיק העבודות שלי", "a[href^='/portfolios/']"],
  ["/portfolios", "מצב פיתוח – תיקי עבודות", "a[href^='/portfolios/']"],
  ["/profile", "מצב פיתוח – פרופיל", "h1"],
  ["/matches", "מצב פיתוח – התאמות", "select"],
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
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([
  { name: "kibbutz-session", value: "qa", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);
// Empty-but-successful API — exactly the state demo mode exists for.
await ctx.route("**/api/**", (r) =>
  r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, data: { items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 } }) }));

const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); });
// Note: the demo keys are NOT cleared here. addInitScript runs on every load,
// including the reload that the persistence check depends on.
await page.addInitScript((a) => {
  sessionStorage.setItem("kibbutz-auth", a);
  localStorage.setItem("new-kibbutz-lang", "he");
}, JSON.stringify(AUTH));

const textLen = () => page.evaluate(() => {
  const main = document.querySelector("header.sticky")?.parentElement;
  return (main?.innerText ?? "").replace(/\s+/g, " ").trim().length;
});

for (const [route, label, contentSel] of PAGES) {
  console.log(`\n${label}  (${route})`);
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // Start each page from "demo off", once, before any measurement.
  await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("kibbutz-demo:")) localStorage.removeItem(k);
    }
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const toggle = page.locator('[data-testid="dev-data-toggle"]');
  const visible = await toggle.count() > 0 && await toggle.first().isVisible();
  ok("הכפתור מופיע כשאין נתונים", visible);
  if (!visible) continue;

  const beforeLen = await textLen();
  const beforeItems = await page.locator(contentSel).count();

  await toggle.first().click();
  await page.waitForTimeout(500);

  const afterLen = await textLen();
  const afterItems = await page.locator(contentSel).count();
  ok("נתוני דמו נטענו", afterLen > beforeLen && afterItems >= beforeItems,
     `טקסט ${beforeLen}→${afterLen}, פריטים ${beforeItems}→${afterItems}`);
  ok("הכפתור מסמן שהוא פעיל",
     (await toggle.first().getAttribute("aria-pressed")) === "true");

  // survives a reload
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const reloadedLen = await textLen();
  ok("נשמר אחרי רענון", reloadedLen >= afterLen - 5, `${afterLen} → ${reloadedLen}`);

  // and turns back off
  await page.locator('[data-testid="dev-data-toggle"]').first().click();
  await page.waitForTimeout(400);
  const offLen = await textLen();
  ok("כיבוי מחזיר למצב ריק", offLen < afterLen, `${afterLen} → ${offLen}`);
}

console.log("");
ok("אין שגיאות קונסולה/חריגות בכל המסלול", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${"═".repeat(60)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(60)}`);
await browser.close();
process.exit(fail ? 1 : 0);
