// QA: /profile must not hang on its loading skeleton when /api/auth/me fails.
// Reproduces offline dev login — the user is authenticated in the store, but
// the backend call errors — and asserts the page renders from the store user.
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3000";

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
// Every backend call fails — exactly the offline-dev / backend-down situation.
await ctx.route("**/api/**", (r) => r.fulfill({ status: 500, contentType: "application/json", body: "{}" }));

const page = await ctx.newPage();
await page.addInitScript((a) => {
  sessionStorage.setItem("kibbutz-auth", a);
  localStorage.setItem("new-kibbutz-lang", "he");
}, JSON.stringify(AUTH));

const probe = () => page.evaluate(() => ({
  stillSkeleton: !!document.querySelector(".animate-pulse"),
  bodyText: (document.querySelector("header.sticky")?.parentElement?.innerText ?? "").replace(/\s+/g, " ").trim(),
  hasEdit: [...document.querySelectorAll("button")].some((b) => b.innerText.includes("עריכה")),
  hasRetry: [...document.querySelectorAll("button")].some((b) => b.innerText.includes("רענון")),
}));

// ── Case 1: authenticated in the store, backend down → recover from the store ──
console.log("\nמקרה 1 — משתמש קיים ב-store, השרת נכשל");
await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
let s = await probe();
ok("הדף לא תקוע על שלד הטעינה", !s.stillSkeleton);
ok("מוצג שם המשתמש מה-store", s.bodyText.includes("ליאור מדן"), s.bodyText.slice(0, 80));
ok("כפתור עריכה נגיש", s.hasEdit);

// ── Case 2: fresh load, no store user AND backend down → fallback card, not a hang.
//    A separate context so no profile persisted by case 1 leaks in (useUserStore
//    persists to localStorage; a real first-load user has neither auth nor it).
console.log("\nמקרה 2 — טעינה נקייה, אין משתמש ב-store, השרת נכשל");
const ctx2 = await browser.newContext({ viewport: { width: 1200, height: 800 } });
await ctx2.addCookies([
  { name: "kibbutz-session", value: "qa", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);
await ctx2.route("**/api/**", (r) => r.fulfill({ status: 500, contentType: "application/json", body: "{}" }));
const page2 = await ctx2.newPage();
await page2.addInitScript(() => localStorage.setItem("new-kibbutz-lang", "he"));
await page2.goto(BASE + "/profile", { waitUntil: "networkidle" });
await page2.waitForTimeout(1500);
const s2 = await page2.evaluate(() => ({
  stillSkeleton: !!document.querySelector(".animate-pulse"),
  hasRetry: [...document.querySelectorAll("button")].some((b) => b.innerText.includes("רענון")),
  bodyText: (document.body.innerText ?? "").replace(/\s+/g, " ").trim(),
}));
ok("לא תקוע על שלד הטעינה", !s2.stillSkeleton);
ok("מוצג כרטיס 'לא ניתן לטעון' עם רענון", s2.hasRetry, s2.bodyText.slice(0, 80));
await ctx2.close();

console.log(`\n${"═".repeat(56)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(56)}`);
await browser.close();
process.exit(fail ? 1 : 0);
