// הקיבוץ – QA navigation sweep
// Visits every route, captures console errors, page errors, failed requests,
// and error-boundary renders. Classifies failures as FRONTEND bug vs BACKEND-down.
//
// Usage: make sure `npm run dev` is running on :3000, then:
//   node qa/qa-nav.mjs
// Writes qa/QA_REPORT.md and prints a summary.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:3000";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:19653";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Seed a logged-in dev user so auth-gated pages render.
const DEV_USER = {
  id: "dev-user-1",
  name: "מפתח בדיקה",
  email: "dev@kibbutz.local",
  avatar: "",
  role: "admin",
  canCreateProjects: true,
  canJoinProjects: true,
  isProfileComplete: true,
  emailVerified: true,
};
const AUTH_SEED = JSON.stringify({
  state: {
    token: "dev-token",
    refreshToken: "dev-refresh-token",
    user: DEV_USER,
    isAuthenticated: true,
  },
  version: 0,
});

const ROUTES = [
  ["/", "עמוד בית / הפניה"],
  ["/login", "התחברות"],
  ["/register", "הרשמה"],
  ["/oauth/callback?provider=google&code=x&state=y", "OAuth callback"],
  ["/reset-password", "איפוס סיסמה"],
  ["/verify-email", "אימות אימייל"],
  ["/onboarding", "Onboarding"],
  ["/dashboard", "לוח בקרה"],
  ["/dashboard/applications", "מועמדויות (לוח)"],
  ["/dashboard/my-applications", "המועמדויות שלי"],
  ["/profile", "הפרופיל שלי"],
  ["/profile/sample-user-1", "פרופיל משתמש אחר"],
  ["/projects", "פרויקטים"],
  ["/projects/create", "יצירת פרויקט"],
  ["/projects/sample-1", "פרטי פרויקט"],
  ["/projects/sample-1/manage", "ניהול פרויקט"],
  ["/projects/sample-1/team", "צוות פרויקט"],
  ["/matches", "התאמות"],
  ["/messages", "הודעות (ללא שיחה)"],
  ["/messages?userId=sample-user-2", "הודעות (שיחה)"],
  ["/nda", "יצירת NDA"],
  ["/nda/inbox", "תיבת NDA"],
  ["/admin", "אדמין (הפניה חיצונית)"],
  ["/feed", "פיד"],
  ["/feed/sample-post-1", "פרטי פוסט"],
  ["/portfolios", "תיקי עבודות"],
  ["/portfolios/create", "יצירת תיק עבודות"],
  ["/portfolios/sample-portfolio-1", "פרטי תיק עבודות"],
];

// Console/error text that indicates a real FRONTEND defect (not backend-down).
const FRONTEND_SIGNATURES = [
  "getSnapshot",
  "Maximum update depth",
  "is not a function",
  "Cannot read properties",
  "Cannot destructure",
  "undefined is not",
  "Hydration",
  "Rendered more hooks",
  "Rendered fewer hooks",
  "Objects are not valid as a React child",
  "Each child in a list should have a unique",
  "Text content does not match",
];
// Signatures that mean "backend is down" (expected while API isn't running).
const BACKEND_SIGNATURES = [
  "Failed to fetch",
  "ERR_CONNECTION",
  "NetworkError",
  "לא ניתן להתחבר",
  "net::",
  API,
  "localhost:19653",
];

function classify(text) {
  if (FRONTEND_SIGNATURES.some((s) => text.includes(s))) return "frontend";
  if (BACKEND_SIGNATURES.some((s) => text.includes(s))) return "backend";
  return "other";
}

const results = [];

const browser = await chromium.launch();
const context = await browser.newContext({ locale: "he-IL" });
await context.addInitScript((seed) => {
  try { window.sessionStorage.setItem("kibbutz-auth", seed); } catch {}
}, AUTH_SEED);

for (const [route, label] of ROUTES) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedReq = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("requestfailed", (req) => {
    const f = req.failure();
    failedReq.push(`${req.method()} ${req.url()} — ${f ? f.errorText : "failed"}`);
  });

  let status = null;
  let finalUrl = "";
  let navError = null;
  try {
    const resp = await page.goto(BASE + route, {
      waitUntil: "load",
      timeout: 20000,
    });
    status = resp ? resp.status() : null;
    // let client effects / data fetches settle (backend calls fail fast)
    await page.waitForTimeout(2600);
    finalUrl = page.url();
  } catch (e) {
    navError = e.message;
    finalUrl = page.url();
  }

  // Detect the Next.js dev error overlay ONLY when it actually shows an error
  // (the <nextjs-portal> element exists on every page, so check its content).
  let overlay = false;
  let visibleText = "";
  try {
    overlay = await page.evaluate(() => {
      const portal = document.querySelector("nextjs-portal");
      const txt = (portal?.shadowRoot?.textContent ?? portal?.textContent ?? "");
      return /Unhandled Runtime Error|Runtime Error|Build Error|Console Error|Maximum update depth/i.test(txt);
    });
    visibleText = (await page.evaluate(() => document.body?.innerText ?? "")).slice(0, 300);
  } catch {}

  const allText = [...consoleErrors, ...pageErrors, ...failedReq].join("\n");
  const frontendHits = [...consoleErrors, ...pageErrors].filter((t) => classify(t) === "frontend");
  const backendHits = [...consoleErrors, ...pageErrors, ...failedReq].filter((t) => classify(t) === "backend");
  const otherHits = [...consoleErrors, ...pageErrors].filter((t) => classify(t) === "other");

  let verdict;
  if (navError) verdict = "NAV-FAIL";
  else if (frontendHits.length || overlay) verdict = "FRONTEND-BUG";
  else if (otherHits.length) verdict = "WARN";
  else if (backendHits.length) verdict = "OK (backend down)";
  else verdict = "OK";

  results.push({
    route, label, status, finalUrl, navError, overlay,
    verdict,
    frontend: dedupe(frontendHits),
    backend: dedupe(backendHits).length,
    other: dedupe(otherHits),
    sampleText: visibleText.replace(/\s+/g, " ").trim().slice(0, 140),
  });

  console.log(`${verdict.padEnd(18)} ${route}`);
  await page.close();
}

await browser.close();

function dedupe(arr) {
  return [...new Set(arr.map((s) => s.split("\n")[0].slice(0, 160)))];
}

// ── Build report ──
const now = new Date().toISOString();
const counts = results.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] ?? 0) + 1), a), {});
const bugs = results.filter((r) => r.verdict === "FRONTEND-BUG" || r.verdict === "NAV-FAIL");

let md = `# דוח QA – ניווט ותרחישים\n\n`;
md += `נוצר: ${now}\nבסיס: ${BASE} · API: ${API}\n\n`;
md += `> **הערה:** הבדיקה רצה כשהבקאנד (\`${API}\`) לא בהכרח פעיל. כשלים מסוג "backend down" הם צפויים ואינם באג בפרונט.\n\n`;
md += `## סיכום\n\n`;
md += `נבדקו **${results.length}** נתיבים.\n\n`;
for (const [k, v] of Object.entries(counts)) md += `- ${k}: ${v}\n`;
md += `\n`;

if (bugs.length) {
  md += `## ⛔ באגים בפרונט (${bugs.length})\n\n`;
  for (const r of bugs) {
    md += `### ${r.route} — ${r.label}\n`;
    if (r.navError) md += `- ניווט נכשל: \`${r.navError}\`\n`;
    if (r.overlay) md += `- מוצג Error Overlay / Error Boundary\n`;
    for (const f of r.frontend) md += `- \`${f}\`\n`;
    md += `\n`;
  }
} else {
  md += `## ✅ לא נמצאו באגים בפרונט\n\n`;
}

md += `## טבלה מלאה\n\n`;
md += `| נתיב | תיאור | סטטוס | תוצאה | שגיאות פרונט | בקאנד-כבוי |\n`;
md += `|---|---|---|---|---|---|\n`;
for (const r of results) {
  const fe = r.frontend.length ? r.frontend.length : "-";
  md += `| \`${r.route}\` | ${r.label} | ${r.status ?? "—"} | ${r.verdict} | ${fe} | ${r.backend || "-"} |\n`;
}
md += `\n## פירוט לפי נתיב\n\n`;
for (const r of results) {
  md += `### ${r.verdict === "OK" || r.verdict.startsWith("OK") ? "✅" : r.verdict === "WARN" ? "⚠️" : "⛔"} \`${r.route}\` — ${r.label}\n`;
  md += `- סטטוס HTTP: ${r.status ?? "—"}${r.finalUrl && !r.finalUrl.endsWith(r.route) ? ` · הופנה ל: ${r.finalUrl}` : ""}\n`;
  if (r.sampleText) md += `- תוכן מוצג: "${r.sampleText}"\n`;
  if (r.frontend.length) md += `- שגיאות פרונט: ${r.frontend.map((s) => `\`${s}\``).join("; ")}\n`;
  if (r.other.length) md += `- אזהרות: ${r.other.map((s) => `\`${s}\``).join("; ")}\n`;
  if (r.backend) md += `- קריאות שנכשלו לבקאנד: ${r.backend} (צפוי כשהשרת כבוי)\n`;
  md += `\n`;
}

const out = join(__dirname, "QA_REPORT.md");
writeFileSync(out, md, "utf8");
console.log("\n=== SUMMARY ===");
console.log(counts);
console.log("report:", out);
