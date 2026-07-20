// הקיבוץ – End-to-end QA (real backend must be running on :19653)
// Registers a real user via the REST API, seeds a real session, sweeps every
// route, and exercises key write flows (post, comment, like, portfolio).
// With the backend UP, failed API calls / errors are REAL bugs (not "backend down").
//
// Usage:  (backend running on 19653, frontend dev on 3000)
//   node qa/qa-e2e.mjs
// Writes qa/E2E_REPORT.md

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:3000";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:19653";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Deterministic-ish unique suffix without Date.now (allowed in node here, but
// keep it simple): use high-res time.
const uniq = String(process.hrtime.bigint()).slice(-9);
const cred = {
  firstName: "QA",
  lastName: "Tester",
  username: `qa_${uniq}`,
  email: `qa_${uniq}@kibbutz.local`,
  password: "QaTester!2026",
  role: 1, // Member
};

const log = (...a) => console.log(...a);
const steps = [];
function record(name, ok, detail = "") {
  steps.push({ name, ok, detail });
  log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

async function apiPost(path, body, token) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
async function apiGet(path, token) {
  const res = await fetch(API + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

// ── 1. Backend smoke + register/login via API ──
let session = null;
try {
  const reg = await apiPost("/api/auth/register", cred);
  if (reg.json?.success && reg.json.data?.accessToken) {
    session = reg.json.data;
    record("POST /api/auth/register", true, `user ${session.user?.username}`);
  } else {
    record("POST /api/auth/register", false, `status ${reg.status} ${JSON.stringify(reg.json?.errors ?? reg.json?.message ?? "")}`);
  }
} catch (e) {
  record("POST /api/auth/register", false, e.message);
}

if (session) {
  const login = await apiPost("/api/auth/login", { email: cred.email, password: cred.password });
  record("POST /api/auth/login", Boolean(login.json?.success), `status ${login.status}`);
  const me = await apiGet("/api/auth/me", session.accessToken);
  record("GET /api/auth/me", Boolean(me.json?.success ?? me.json?.data), `status ${me.status}`);

  // Write flows
  const post = await apiPost("/api/posts", { content: `בדיקת E2E ${uniq}` }, session.accessToken);
  const postId = post.json?.data?.postId;
  record("POST /api/posts", Boolean(postId), `status ${post.status}`);
  if (postId) {
    const like = await apiPost(`/api/posts/${postId}/like`, {}, session.accessToken);
    record("POST /api/posts/{id}/like", like.status < 400, `status ${like.status}`);
    const comment = await apiPost(`/api/comments/posts/${postId}`, { content: "תגובת בדיקה" }, session.accessToken);
    record("POST /api/comments/posts/{id}", comment.status < 400, `status ${comment.status}`);
  }
  const feed = await apiGet("/api/posts/feed?pageNumber=1&pageSize=10", session.accessToken);
  record("GET /api/posts/feed", Boolean(feed.json?.data?.items), `items ${feed.json?.data?.items?.length ?? "?"}`);
  const portfolio = await apiPost("/api/portfolios", { title: `תיק ${uniq}`, category: "פיתוח", description: "E2E" }, session.accessToken);
  record("POST /api/portfolios", Boolean(portfolio.json?.data?.portfolioId), `status ${portfolio.status}`);
  const portfolios = await apiGet("/api/portfolios?pageNumber=1&pageSize=12", session.accessToken);
  record("GET /api/portfolios", Boolean(portfolios.json?.data?.items), `items ${portfolios.json?.data?.items?.length ?? "?"}`);
  const notifs = await apiGet("/api/notifications?pageNumber=1&pageSize=20", session.accessToken);
  record("GET /api/notifications", notifs.status < 400, `status ${notifs.status}`);

  // Messages / conversations flow (needs a second user)
  const regB = await apiPost("/api/auth/register", {
    firstName: "QA", lastName: "Peer", username: `qb_${uniq}`,
    email: `qb_${uniq}@kibbutz.local`, password: "QaTester!2026", role: 1,
  });
  const peerId = regB.json?.data?.user?.userId;
  record("register peer user", Boolean(peerId));
  if (peerId) {
    const conv = await apiPost("/api/messages/conversations", { participantIds: [peerId], type: 0 }, session.accessToken);
    const convId = conv.json?.data?.conversationId;
    record("POST /api/messages/conversations", Boolean(convId), `status ${conv.status}`);
    if (convId) {
      const msg = await apiPost("/api/messages", { conversationId: convId, content: "שלום E2E" }, session.accessToken);
      record("POST /api/messages", msg.status < 400, `status ${msg.status}`);
      const convList = await apiGet("/api/messages/conversations?pageNumber=1&pageSize=20", session.accessToken);
      record("GET /api/messages/conversations", Boolean(convList.json?.data?.items), `items ${convList.json?.data?.items?.length ?? "?"}`);
      const msgList = await apiGet(`/api/messages/conversations/${convId}?pageNumber=1&pageSize=50`, session.accessToken);
      record("GET /api/messages/conversations/{id}", Boolean(msgList.json?.data?.items), `items ${msgList.json?.data?.items?.length ?? "?"}`);
    }
  }
}

// ── 2. Browser nav sweep with a REAL session ──
const authUser = session
  ? {
      id: session.user.userId,
      name: session.user.fullName || `${session.user.firstName} ${session.user.lastName}`,
      email: session.user.email,
      avatar: session.user.profilePictureUrl ?? "",
      role: session.user.role === 5 ? "admin" : "participant",
      canCreateProjects: true,
      canJoinProjects: true,
      isProfileComplete: true,
      emailVerified: true,
    }
  : null;
const AUTH_SEED = session
  ? JSON.stringify({
      state: {
        token: session.accessToken,
        refreshToken: session.refreshToken,
        user: authUser,
        isAuthenticated: true,
      },
      version: 0,
    })
  : null;

const ROUTES = [
  "/", "/login", "/dashboard", "/profile", "/matches", "/messages",
  "/feed", "/portfolios", "/portfolios/create", "/nda", "/projects",
];

const FRONTEND_SIG = ["getSnapshot", "Maximum update depth", "is not a function", "Cannot read properties", "Hydration", "Rendered more hooks", "Objects are not valid as a React child"];
const pageResults = [];

const browser = await chromium.launch();
const context = await browser.newContext({ locale: "he-IL" });
if (AUTH_SEED) {
  await context.addInitScript((seed) => {
    try { window.sessionStorage.setItem("kibbutz-auth", seed); } catch {}
  }, AUTH_SEED);
}

for (const route of ROUTES) {
  const page = await context.newPage();
  const consoleErrors = [];
  const failedApi = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("requestfailed", (r) => { if (r.url().includes("19653")) failedApi.push(`${r.method()} ${r.url()} ${r.failure()?.errorText ?? ""}`); });
  page.on("response", (r) => { if (r.url().includes("/api/") && r.status() >= 500) failedApi.push(`${r.status()} ${r.url()}`); });

  let status = null, navErr = null, text = "";
  try {
    const resp = await page.goto(BASE + route, { waitUntil: "load", timeout: 20000 });
    status = resp?.status() ?? null;
    await page.waitForTimeout(2500);
    text = (await page.evaluate(() => document.body?.innerText ?? "")).replace(/\s+/g, " ").trim().slice(0, 120);
  } catch (e) { navErr = e.message; }

  const feErrors = consoleErrors.filter((t) => FRONTEND_SIG.some((s) => t.includes(s)));
  const verdict = navErr ? "NAV-FAIL" : feErrors.length ? "FRONTEND-BUG" : failedApi.length ? "API-ERROR" : "OK";
  pageResults.push({ route, status, verdict, feErrors: [...new Set(feErrors.map((s) => s.split("\n")[0].slice(0, 140)))], failedApi: [...new Set(failedApi)].slice(0, 3), text });
  log(`${verdict.padEnd(13)} ${route}`);
  await page.close();
}
await browser.close();

// ── Report ──
const backendUp = Boolean(session);
let md = `# דוח E2E – מול בקאנד אמיתי\n\n`;
md += `בסיס: ${BASE} · API: ${API}\nבקאנד פעיל: ${backendUp ? "כן ✅" : "לא ❌"}\n\n`;
md += `## שלב 1 – API / זרימות\n\n| בדיקה | תוצאה | פרטים |\n|---|---|---|\n`;
for (const s of steps) md += `| ${s.name} | ${s.ok ? "✅" : "⛔"} | ${s.detail} |\n`;
md += `\n## שלב 2 – ניווט עם session אמיתי\n\n| נתיב | סטטוס | תוצאה | תוכן |\n|---|---|---|---|\n`;
for (const r of pageResults) md += `| \`${r.route}\` | ${r.status ?? "—"} | ${r.verdict} | ${r.text.slice(0, 60)} |\n`;
const problems = pageResults.filter((r) => r.verdict !== "OK");
if (problems.length) {
  md += `\n## בעיות\n\n`;
  for (const r of problems) {
    md += `### \`${r.route}\` — ${r.verdict}\n`;
    for (const e of r.feErrors) md += `- FE: \`${e}\`\n`;
    for (const a of r.failedApi) md += `- API: \`${a}\`\n`;
    md += `\n`;
  }
}
writeFileSync(join(__dirname, "E2E_REPORT.md"), md, "utf8");
const apiFails = steps.filter((s) => !s.ok).length;
console.log("\n=== E2E SUMMARY ===");
console.log(`API steps: ${steps.length - apiFails}/${steps.length} passed`);
console.log("Nav:", pageResults.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] ?? 0) + 1), a), {}));
console.log("report:", join(__dirname, "E2E_REPORT.md"));
