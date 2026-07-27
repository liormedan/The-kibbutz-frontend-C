// Preparatory check: does every endpoint the frontend calls line up with the
// backend contract, and is every call wired the same way?
//
// Static audit — the backend isn't running. It cross-references the calls in
// src/services against the endpoints verified live in qa/API_COVERAGE.md, and
// checks each service for the things that break only once a real server
// answers: envelope handling, error handling, and pages calling fetch directly.
//
//   node qa/endpoint-audit.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SERVICES = "src/services";
const METHODS = { get: "GET", post: "POST", put: "PUT", patch: "PATCH", del: "DELETE" };

// ── what the backend actually answers ─────────────────────────────────────
// Source of truth: the seven controllers in Controllers/Controllers.cs of
// github.com/the-kibbutz/KibbutzBackend @ 832540b. Cross-checked against the
// live run in qa/API_COVERAGE.md.
//
// There is NO UsersController. An earlier version of this list carried four
// invented /api/users/* rows, which made the audit report them as "the backend
// serves this, the frontend just isn't wired" — the opposite of the truth.
// Every row below is a real [Http*] attribute; see BACKEND_CONTRACT.md.
const VERIFIED = `
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/refresh-token
POST /api/auth/logout
POST /api/posts
GET /api/posts/feed
GET /api/posts/{id}
POST /api/posts/{id}/like
DELETE /api/posts/{id}/like
DELETE /api/posts/{id}
POST /api/comments/posts/{id}
GET /api/comments/posts/{id}
POST /api/comments/{id}/like
DELETE /api/comments/{id}/like
DELETE /api/comments/{id}
GET /api/notifications
GET /api/notifications/unread-count
PUT /api/notifications/{id}/read
PUT /api/notifications/mark-all-read
POST /api/messages/conversations
POST /api/messages
GET /api/messages/conversations
GET /api/messages/conversations/{id}
PUT /api/messages/conversations/{id}/read
POST /api/portfolios
GET /api/portfolios
GET /api/portfolios/{id}
POST /api/portfolios/{id}/like
DELETE /api/portfolios/{id}/like
DELETE /api/portfolios/{id}
POST /api/friendships/requests
GET /api/friendships/requests
PUT /api/friendships/requests/{id}/accept
GET /api/friendships
PUT /api/friendships/requests/{id}/reject
`.trim().split("\n").map((l) => l.trim());

/** `/api/posts/${postId}/like` → `/api/posts/{id}/like` */
const normalise = (p) =>
  p.replace(/\$\{[^}]+\}/g, "{id}").replace(/\/+$/, "") || "/";

const files = readdirSync(SERVICES).filter((f) => f.endsWith(".ts"));
const calls = [];
const serviceNotes = [];

for (const file of files) {
  const src = readFileSync(join(SERVICES, file), "utf8");

  // api.get<T>("/path" | `/path${x}`  — the path is the first argument.
  const re = /api\.(get|post|put|patch|del)\s*(?:<[^>]*(?:<[^>]*>)?[^>]*>)?\s*\(\s*[`"']([^`"']+)[`"']/g;
  let m;
  while ((m = re.exec(src))) {
    calls.push({ file, method: METHODS[m[1]], path: normalise(m[2]) });
  }

  const hasApiCall = /api\.(get|post|put|patch|del)\s*[<(]/.test(src);
  const usesPending = /pending|NOT_IMPLEMENTED|BACKEND_GAPS/i.test(src);
  serviceNotes.push({ file, hasApiCall, usesPending });
}

// Services deliberately do NOT try/catch — apiFetch throws ApiError and the
// call site turns it into UI. So the layer worth checking is the callers.
//
// But only callers of functions that can ACTUALLY throw: logoutUser swallows
// its own error on purpose, and the pending stubs never reach the network, so
// importing them needs no catch. Two earlier versions of this audit flagged
// first the services and then every caller, and reported six false positives
// between them. Build the throwing set first, then flag against it.
const THROWERS = new Set();
for (const file of files) {
  const src = readFileSync(join(SERVICES, file), "utf8");
  // Split on export boundaries so each function is judged on its own body.
  const parts = src.split(/\n(?=export\s+(?:async\s+)?function\s)/);
  for (const part of parts) {
    const name = part.match(/^export\s+(?:async\s+)?function\s+(\w+)/)?.[1];
    if (!name) continue;
    if (!/api\.(get|post|put|patch|del)\s*[<(]/.test(part)) continue;
    // A body that catches everything it calls cannot surface an ApiError.
    if (/catch\s*[({]/.test(part)) continue;
    THROWERS.add(name);
  }
}

const CALLER_DIRS = ["src/app", "src/components"];
const uncaughtCallers = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith(".tsx") && !e.name.endsWith(".ts")) continue;
    const src = readFileSync(p, "utf8");
    if (!/from "@\/services\//.test(src)) continue;
    if (/catch\s*[({]/.test(src)) continue;
    const risky = [...THROWERS].filter((fn) => new RegExp(`\\b${fn}\\b`).test(src));
    if (risky.length) {
      uncaughtCallers.push(`${p.replace(/\\/g, "/")}  (${risky.join(", ")})`);
    }
  }
};
for (const d of CALLER_DIRS) walk(d);

// ── report ────────────────────────────────────────────────────────────────
const key = (c) => `${c.method} ${c.path}`;
const called = [...new Set(calls.map(key))].sort();
const verified = new Set(VERIFIED);

const matched = called.filter((c) => verified.has(c));
const unmatched = called.filter((c) => !verified.has(c));
const unused = VERIFIED.filter((v) => !called.includes(v)).sort();

const line = (n = 74) => console.log("═".repeat(n));

line();
console.log("  בדיקת מוכנות — endpoints של הפרונט מול חוזה הבקאנד");
line();

console.log(`\n▸ נקראים מהפרונט ומאומתים בבקאנד (${matched.length})\n`);
for (const c of matched) {
  const where = [...new Set(calls.filter((x) => key(x) === c).map((x) => x.file))].join(", ");
  console.log(`  ✔ ${c.padEnd(46)} ${where}`);
}

console.log(`\n▸ נקראים מהפרונט אך לא ברשימה המאומתת (${unmatched.length})\n`);
if (!unmatched.length) console.log("  — אין");
for (const c of unmatched) {
  const where = [...new Set(calls.filter((x) => key(x) === c).map((x) => x.file))].join(", ");
  console.log(`  ✘ ${c.padEnd(46)} ${where}`);
}

console.log(`\n▸ קיימים בבקאנד ולא נקראים עדיין (${unused.length})\n`);
if (!unused.length) console.log("  — אין");
for (const c of unused) console.log(`  ○ ${c}`);

// What the UI shows instead. These are the ones to watch in the live run: the
// screen renders and looks fine, but the data never came from the server.
console.log("\n▸ מסומנים כ-pending בפרונט (מה שיוצג במקום נתוני אמת)\n");
const stubs = [];
for (const file of files) {
  const src = readFileSync(join(SERVICES, file), "utf8");
  for (const m of src.matchAll(/pendingRead\(\s*["'`]([^"'`]+)/g)) stubs.push([file, m[1]]);
  for (const m of src.matchAll(/\[pending-backend\]\s*([^"'`\n]+)/g)) stubs.push([file, m[1].trim()]);
}
if (!stubs.length) console.log("  — אין");
for (const [file, label] of stubs) console.log(`  ○ ${file.padEnd(26)} ${label}`);

console.log(`\n▸ שירותים (${serviceNotes.length})\n`);
for (const s of serviceNotes.sort((a, b) => a.file.localeCompare(b.file))) {
  const state = s.hasApiCall ? "מחובר"
    : s.usesPending ? "ממתין לבקאנד (מסומן)" : "אין קריאות API ולא מסומן";
  const flag = s.hasApiCall ? "✔" : s.usesPending ? "○" : "!";
  console.log(`  ${flag} ${s.file.padEnd(28)} ${state}`);
}

console.log(`\n▸ קוראים לשירות בלי catch (${uncaughtCallers.length})\n`);
if (!uncaughtCallers.length) console.log("  — אין. כל קורא מטפל ב-ApiError.");
for (const c of uncaughtCallers) console.log(`  ✘ ${c}`);

const problems = unmatched.length
  + uncaughtCallers.length
  + serviceNotes.filter((s) => !s.hasApiCall && !s.usesPending).length;

console.log("");
line();
console.log(problems === 0
  ? `  ${matched.length} endpoints מיושרים · אין אי-התאמות`
  : `  ${problems} נקודות לבדיקה לפני הרצת הבקאנד`);
line();

process.exit(problems ? 1 : 0);
