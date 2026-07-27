// QA: the avatar account menu in AppTopBar — items, open/close, and logout.
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

let pass = 0, fail = 0;
const ok = (label, good, detail = "") => {
  if (good) { pass++; console.log(`  ✔ ${label}`); }
  else { fail++; console.log(`  ✘ ${label}${detail ? "  → " + detail : ""}`); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
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
}, JSON.stringify(AUTH));

await page.goto(BASE + "/projects", { waitUntil: "networkidle" });

// ── open / structure ────────────────────────────────────────────────────────
await page.click('[data-testid="topbar-avatar"]');
await page.waitForTimeout(200);
ok("האווטאר פותח תפריט", await page.locator('[data-testid="account-menu-panel"]').count() === 1);

const panelText = await page.locator('[data-testid="account-menu-panel"]').innerText();
ok("כותרת עם שם", panelText.includes("ליאור מדן"), panelText.slice(0, 60));
ok("כותרת עם תפקיד", panelText.includes("חבר קהילה"));
ok("פריט פרופיל", await page.locator('[data-testid="account-profile"]').count() === 1);
ok("פריט הגדרות", await page.locator('[data-testid="account-settings"]').count() === 1);
ok("פריט התנתקות", await page.locator('[data-testid="account-logout"]').count() === 1);

// not clipped
const box = await page.locator('[data-testid="account-menu-panel"]').boundingBox();
const vw = await page.evaluate(() => document.documentElement.clientWidth);
ok("לא נחתך מחוץ למסך", box && box.x >= 0 && box.x + box.width <= vw,
   box ? `x=${Math.round(box.x)} w=${Math.round(box.width)} vw=${vw}` : "");

// ── close behaviours ─────────────────────────────────────────────────────────
await page.keyboard.press("Escape");
await page.waitForTimeout(150);
ok("Escape סוגר", await page.locator('[data-testid="account-menu-panel"]').count() === 0);
await page.click('[data-testid="topbar-avatar"]');
await page.waitForTimeout(150);
await page.mouse.click(600, 600);
await page.waitForTimeout(150);
ok("קליק בחוץ סוגר", await page.locator('[data-testid="account-menu-panel"]').count() === 0);

// ── navigation ───────────────────────────────────────────────────────────────
await page.click('[data-testid="topbar-avatar"]');
await page.waitForTimeout(150);
await page.click('[data-testid="account-settings"]');
await page.waitForURL("**/settings", { timeout: 5000 }).catch(() => {});
ok("הגדרות מנווט", new URL(page.url()).pathname === "/settings", page.url());

await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
await page.click('[data-testid="topbar-avatar"]');
await page.waitForTimeout(150);
await page.click('[data-testid="account-profile"]');
await page.waitForURL("**/profile", { timeout: 5000 }).catch(() => {});
ok("פרופיל מנווט", new URL(page.url()).pathname === "/profile", page.url());

// ── logout: clears the session and lands on "/" ───────────────────────────────
await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
await page.click('[data-testid="topbar-avatar"]');
await page.waitForTimeout(150);
await page.click('[data-testid="account-logout"]');
await page.waitForURL(`${BASE}/`, { timeout: 5000 }).catch(() => {});
ok("התנתקות מובילה לדף הבית", new URL(page.url()).pathname === "/", page.url());
const cleared = await page.evaluate(() => {
  const raw = sessionStorage.getItem("kibbutz-auth");
  if (!raw) return true;
  try { return JSON.parse(raw).state?.isAuthenticated === false; } catch { return false; }
});
ok("הסשן נוקה", cleared);

console.log("");
ok("אין שגיאות קונסולה/חריגות", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${"═".repeat(56)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(56)}`);
await browser.close();
process.exit(fail ? 1 : 0);
