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
const authUser = { id: s.user.userId, name: s.user.fullName, email: s.user.email, avatar: "", role: "participant", canCreateProjects: true, canJoinProjects: true, isProfileComplete: true, emailVerified: true };
const seed = JSON.stringify({ state: { token: s.accessToken, refreshToken: s.refreshToken, user: authUser, isAuthenticated: true }, version: 0 });
const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: "he-IL", viewport: { width: 1280, height: 800 } });
await ctx.addInitScript((v) => { try { sessionStorage.setItem("kibbutz-auth", v); } catch {} }, seed);
await ctx.addCookies([{ name: "kibbutz-session", value: "1", url: BASE }, { name: "kibbutz-role", value: "participant", url: BASE }]);
const page = await ctx.newPage();
for (const [route, file] of [["/my-projects","new-my-projects.png"],["/teams","new-teams.png"],["/friends","new-friends.png"],["/settings","new-settings.png"],["/my-applications","new-my-applications.png"]]) {
  const errs = [];
  const onErr = (e) => errs.push("PAGEERROR: " + e.message.slice(0, 160));
  const onCon = (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); };
  page.on("pageerror", onErr); page.on("console", onCon);
  await page.goto(BASE + route, { waitUntil: "load" });
  await page.waitForTimeout(1800);
  console.log(`${route.padEnd(20)} url=${page.url().replace(BASE, "").padEnd(18)} errs=${errs.length}`, errs.slice(0,2));
  await page.screenshot({ path: join(__dirname, file) });
  page.off("pageerror", onErr); page.off("console", onCon);
}
await browser.close();
console.log("done");
