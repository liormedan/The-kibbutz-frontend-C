import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const API = "http://localhost:19653";
const BASE = "http://localhost:3000";
const uniq = String(process.hrtime.bigint()).slice(-9);

async function post(path, body, token) {
  const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return r.json();
}
const reg = await post("/api/auth/register", { firstName: "ליאור", lastName: "מדן", username: `lior_${uniq}`, email: `lior_${uniq}@k.local`, password: "Passw0rd!23", role: 1 });
const s = reg.data;
await post("/api/posts", { content: "ברוכים הבאים לקיבוץ! זה הפיד בתוך הדשבורד 🎉" }, s.accessToken);
await post("/api/posts", { content: "פוסט שני לבדיקה — הכול מהבקאנד האמיתי." }, s.accessToken);

const authUser = { id: s.user.userId, name: s.user.fullName, email: s.user.email, avatar: "", role: "participant", canCreateProjects: true, canJoinProjects: true, isProfileComplete: true, emailVerified: true };
const seed = JSON.stringify({ state: { token: s.accessToken, refreshToken: s.refreshToken, user: authUser, isAuthenticated: true }, version: 0 });

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: "he-IL", viewport: { width: 1280, height: 800 } });
await ctx.addInitScript((v) => { try { sessionStorage.setItem("kibbutz-auth", v); } catch {} }, seed);
// The middleware (proxy.ts) gates protected routes on this cookie (set by AuthPage on real login).
await ctx.addCookies([
  { name: "kibbutz-session", value: "1", url: BASE },
  { name: "kibbutz-role", value: "participant", url: BASE },
]);
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message.slice(0, 200)));
await page.goto(BASE + "/dashboard", { waitUntil: "load" });
await page.waitForTimeout(2500);
console.log("URL:", page.url());
console.log("TEXT:", (await page.evaluate(() => document.body?.innerText ?? "")).replace(/\s+/g, " ").slice(0, 200));
console.log("ERRORS:", errs.slice(0, 6));
await page.screenshot({ path: join(__dirname, "dashboard-feed.png") });
await page.goto(BASE + "/dashboard?tab=portfolios", { waitUntil: "load" });
await page.waitForTimeout(2000);
await page.screenshot({ path: join(__dirname, "dashboard-portfolios.png") });
await browser.close();
console.log("shots saved");
