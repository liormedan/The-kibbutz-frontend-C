// QA: the "⋯" menu on feed post cards. Runs against the DEV server so demo
// data is available to populate the feed.
//
//   npx next dev -p 3002
//   QA_BASE=http://localhost:3002 node qa/card-menu.mjs
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3002";
const ME = "qa-1";

// One demo post is authored by the viewer, so both variants of the menu appear.
const AUTH = {
  state: {
    token: "qa", refreshToken: "qa", isAuthenticated: true,
    user: { id: ME, name: "ליאור מדן", email: "qa@kibbutz.local", avatar: "",
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
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
await ctx.addCookies([
  { name: "kibbutz-session", value: "qa", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);
await ctx.route("**/api/**", (r) =>
  r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, data: { items: [], pageNumber: 1, pageSize: 30, totalCount: 0, totalPages: 0 } }) }));

const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); });
await page.addInitScript((a) => {
  sessionStorage.setItem("kibbutz-auth", a);
  localStorage.setItem("new-kibbutz-lang", "he");
  localStorage.setItem("kibbutz-demo:feed", "true");
}, JSON.stringify(AUTH));

await page.goto(BASE + "/feed", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const cards = page.locator("ul > li");
const cardCount = await cards.count();
ok("יש כרטיסי פוסט להצגה", cardCount > 0, String(cardCount));

const triggers = page.locator('[data-testid="card-menu-trigger"]');
ok("לכל כרטיס יש כפתור שלוש נקודות",
   await triggers.count() === cardCount, `${await triggers.count()} מול ${cardCount}`);

// ── open / close ───────────────────────────────────────────────────────────
await triggers.first().click();
await page.waitForTimeout(200);
ok("הקליק פותח תפריט", await page.locator('[data-testid="card-menu-panel"]').count() === 1);

const box = await page.locator('[data-testid="card-menu-panel"]').boundingBox();
const vw = await page.evaluate(() => document.documentElement.clientWidth);
ok("התפריט לא נחתך מחוץ למסך", box && box.x >= 0 && box.x + box.width <= vw,
   box ? `x=${Math.round(box.x)} w=${Math.round(box.width)} vw=${vw}` : "");

await page.keyboard.press("Escape");
await page.waitForTimeout(200);
ok("Escape סוגר", await page.locator('[data-testid="card-menu-panel"]').count() === 0);

await triggers.first().click();
await page.waitForTimeout(150);
await page.mouse.click(700, 700);
await page.waitForTimeout(200);
ok("קליק בחוץ סוגר", await page.locator('[data-testid="card-menu-panel"]').count() === 0);

// ── items differ for my post vs someone else's ─────────────────────────────
const itemsFor = async (i) => {
  await triggers.nth(i).click();
  await page.waitForTimeout(200);
  const labels = await page.locator('[data-testid="card-menu-panel"] [role="menuitem"]').allInnerTexts();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  return labels.map((s) => s.trim());
};

const authors = await page.locator("ul > li p.font-semibold").allInnerTexts();
let mineIdx = -1, othersIdx = -1;
for (let i = 0; i < authors.length; i++) {
  if (authors[i].trim() === AUTH.state.user.name) mineIdx = i; else if (othersIdx < 0) othersIdx = i;
}

ok("יש פוסט של המשתמש עצמו בדמו", mineIdx >= 0, authors.join(" / "));
ok("ויש פוסט של מישהו אחר", othersIdx >= 0);

if (othersIdx >= 0) {
  const items = await itemsFor(othersIdx);
  console.log(`\n  פוסט של מישהו אחר (${authors[othersIdx].trim()}): ${items.join(" · ")}`);
  ok("מציע דיווח", items.some((s) => s.includes("דיווח")));
  ok("לא מציע מחיקה", !items.some((s) => s.includes("מחיקת")));
  ok("מציע פתיחה והעתקת קישור",
     items.some((s) => s.includes("פתיחת")) && items.some((s) => s.includes("העתקת")));
}

if (mineIdx >= 0) {
  const items = await itemsFor(mineIdx);
  console.log(`\n  הפוסט שלי: ${items.join(" · ")}`);
  ok("מציע מחיקה", items.some((s) => s.includes("מחיקת")));
  ok("לא מציע דיווח על עצמי", !items.some((s) => s.includes("דיווח")));

  // Cancelling the confirm must leave the post in place.
  const before = await cards.count();
  page.once("dialog", (d) => d.dismiss());
  await triggers.nth(mineIdx).click();
  await page.waitForTimeout(150);
  await page.locator('[data-testid="card-menu-panel"] [role="menuitem"]', { hasText: "מחיקת הפוסט" }).click();
  await page.waitForTimeout(400);
  ok("ביטול האישור משאיר את הפוסט", await cards.count() === before,
     `${before} → ${await cards.count()}`);

  // Accepting removes it.
  page.once("dialog", (d) => d.accept());
  await triggers.nth(mineIdx).click();
  await page.waitForTimeout(150);
  await page.locator('[data-testid="card-menu-panel"] [role="menuitem"]', { hasText: "מחיקת הפוסט" }).click();
  await page.waitForTimeout(500);
  ok("אישור מוחק את הפוסט", await cards.count() === before - 1,
     `${before} → ${await cards.count()}`);
}

// ── copy link actually copies ──────────────────────────────────────────────
await triggers.first().click();
await page.waitForTimeout(200);
await page.locator('[data-testid="card-menu-panel"] [role="menuitem"]', { hasText: "העתקת קישור" }).click();
await page.waitForTimeout(400);
const clip = await page.evaluate(() => navigator.clipboard.readText());
ok("העתקת קישור מעתיקה כתובת פוסט", /\/feed\/[\w-]+$/.test(clip), clip);
ok("מוצגת הודעת אישור", await page.getByText("הקישור הועתק").count() > 0);

// ── open navigates ─────────────────────────────────────────────────────────
await page.goto(BASE + "/feed", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.locator('[data-testid="card-menu-trigger"]').first().click();
await page.waitForTimeout(200);
await page.locator('[data-testid="card-menu-panel"] [role="menuitem"]', { hasText: "פתיחת הפוסט" }).click();
await page.waitForURL("**/feed/**", { timeout: 5000 }).catch(() => {});
ok("פתיחת הפוסט מנווטת לדף הפוסט", /\/feed\/.+/.test(new URL(page.url()).pathname), page.url());

console.log("");
ok("אין שגיאות קונסולה/חריגות", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${"═".repeat(60)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(60)}`);
await browser.close();
process.exit(fail ? 1 : 0);
