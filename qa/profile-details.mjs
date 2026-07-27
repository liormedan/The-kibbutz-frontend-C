// QA: the profile additions — editable personal-links list and the payment tab.
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
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
await ctx.addCookies([
  { name: "kibbutz-session", value: "qa", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);
await ctx.route("**/api/**", (r) =>
  r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); });
// A fresh context starts with empty storage, so nothing to clear. Crucially we
// do NOT wipe kibbutz-* on every load — that would erase the persisted store
// (kibbutz-user) on the reload whose whole point is to prove persistence.
await page.addInitScript((a) => {
  sessionStorage.setItem("kibbutz-auth", a);
  localStorage.setItem("new-kibbutz-lang", "he");
}, JSON.stringify(AUTH));

await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// ── Personal links: enter edit, add one, save, confirm it renders ────────────
console.log("קישורים אישיים / פרופילים ציבוריים");
await page.getByRole("button", { name: "עריכה" }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "הוספת קישור" }).click();
await page.waitForTimeout(150);
// two inputs added: label + url
const labelInput = page.locator('input[placeholder="שם (אופציונלי)"]').last();
const urlInput = page.locator('input[placeholder="https://..."]').last();
ok("שדות קישור נוספו", await labelInput.count() > 0 && await urlInput.count() > 0);
await labelInput.fill("אתר אישי");
await urlInput.fill("liormedan.dev");
await page.getByRole("button", { name: "שמור" }).click();
await page.waitForTimeout(400);

const linkChip = page.locator('a[href="https://liormedan.dev"]');
ok("הקישור מוצג אחרי שמירה", await linkChip.count() === 1);
ok("התווית מוצגת", (await page.getByText("אתר אישי").count()) > 0);
ok("נורמל עם https", (await linkChip.getAttribute("href")) === "https://liormedan.dev");

// survives reload (persisted to the store)
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);
ok("נשמר אחרי רענון", await page.locator('a[href="https://liormedan.dev"]').count() === 1);

// ── Payment tab ──────────────────────────────────────────────────────────────
console.log("\nטאב תשלום");
await page.getByRole("button", { name: "תשלום" }).click();
await page.waitForTimeout(300);
ok("כותרת אמצעי מועדף", (await page.getByText("אמצעי תשלום מועדף").count()) > 0);
const opts = await page.evaluate(() =>
  [...document.querySelectorAll("button")].map(b => b.innerText.trim()).filter(Boolean));
ok("שלוש אפשרויות (Bit/PayPal/כרטיס)",
   opts.some(o => o.includes("ביט")) && opts.some(o => o.includes("PayPal")) && opts.some(o => o.includes("כרטיס אשראי")));
ok("הערת בטיחות — לא נאספים מספרים", (await page.getByText("לא נאספים כאן מספרי כרטיס", { exact: false }).count()) > 0);

// select one → saved indicator, persists
await page.getByRole("button", { name: "ביט (Bit)" }).click();
await page.waitForTimeout(300);
ok("בחירה מסומנת (aria-pressed)",
   (await page.getByRole("button", { name: "ביט (Bit)" }).getAttribute("aria-pressed")) === "true");
ok("הודעת נשמר", (await page.getByText("האמצעי המועדף נשמר").count()) > 0);

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.getByRole("button", { name: "תשלום" }).click();
await page.waitForTimeout(300);
ok("הבחירה נשמרה אחרי רענון",
   (await page.getByRole("button", { name: "ביט (Bit)" }).getAttribute("aria-pressed")) === "true");

// no field ever asks for a card number
const askedForNumbers = await page.evaluate(() =>
  [...document.querySelectorAll("input")].some(i =>
    /card|כרטיס|cvv|מספר/i.test((i.placeholder || "") + (i.name || "") + (i.getAttribute("aria-label") || ""))));
ok("אין שום שדה שמבקש מספר כרטיס", !askedForNumbers);

console.log("");
ok("אין שגיאות קונסולה/חריגות", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${"═".repeat(56)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(56)}`);
await browser.close();
process.exit(fail ? 1 : 0);
