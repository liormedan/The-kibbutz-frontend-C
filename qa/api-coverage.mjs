// הקיבוץ – Full backend endpoint coverage
// Calls EVERY endpoint across all 7 controllers with real setup (3 users) and
// records status + verdict per endpoint. Writes qa/API_COVERAGE.md.
// Requires the backend running on :19653.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:19653";
const __dirname = dirname(fileURLToPath(import.meta.url));
const uid = () => String(process.hrtime.bigint()).slice(-9);

async function call(method, path, { body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

const results = [];
function rec(group, method, path, res, ok = res.status >= 200 && res.status < 300) {
  results.push({ group, method, path, status: res.status, ok });
  const tag = ok ? "PASS" : "FAIL";
  console.log(`${tag}  ${method.padEnd(6)} ${path}  [${res.status}]`);
  return res;
}

async function register(tag) {
  const id = uid();
  const r = await call("POST", "/api/auth/register", {
    body: { firstName: tag, lastName: id.slice(-3), username: `${tag}_${id}`, email: `${tag}_${id}@k.local`, password: "Passw0rd!23", role: 1 },
  });
  return r;
}

// ── Users ──
const ra = rec("Auth", "POST", "/api/auth/register", await register("a"));
const rb = await register("b");
const rc = await register("c");
const A = ra.json.data;
const B = rb.json.data;
const C = rc.json.data;

// ── Auth ──
const loginA = rec("Auth", "POST", "/api/auth/login", await call("POST", "/api/auth/login", { body: { email: A.user.email, password: "Passw0rd!23" } }));
let aTok = loginA.json?.data?.accessToken ?? A.accessToken;

rec("Auth", "GET", "/api/auth/me", await call("GET", "/api/auth/me", { token: aTok }));

const refresh = rec("Auth", "POST", "/api/auth/refresh-token", await call("POST", "/api/auth/refresh-token", { body: { refreshToken: A.refreshToken } }));
if (refresh.json?.data?.accessToken) aTok = refresh.json.data.accessToken;

const bTok = B.accessToken;
const cTok = C.accessToken;

// ── Posts ──
const p1 = rec("Posts", "POST", "/api/posts", await call("POST", "/api/posts", { token: aTok, body: { content: "coverage post 1", tags: ["qa"] } }));
const postId = p1.json?.data?.postId;
const p2 = rec("Posts", "POST", "/api/posts (2nd, to delete)", await call("POST", "/api/posts", { token: aTok, body: { content: "coverage post 2" } }));
const postId2 = p2.json?.data?.postId;
rec("Posts", "GET", "/api/posts/feed", await call("GET", "/api/posts/feed?pageNumber=1&pageSize=10", { token: aTok }));
if (postId) rec("Posts", "GET", "/api/posts/{id}", await call("GET", `/api/posts/${postId}`, { token: aTok }));
if (postId) rec("Posts", "POST", "/api/posts/{id}/like", await call("POST", `/api/posts/${postId}/like`, { token: aTok }));
if (postId) rec("Posts", "DELETE", "/api/posts/{id}/like", await call("DELETE", `/api/posts/${postId}/like`, { token: aTok }));
if (postId2) rec("Posts", "DELETE", "/api/posts/{id}", await call("DELETE", `/api/posts/${postId2}`, { token: aTok }));

// B likes A's post → generates a notification for A
if (postId) await call("POST", `/api/posts/${postId}/like`, { token: bTok });

// ── Comments ──
let commentId, commentId2;
if (postId) {
  const c1 = rec("Comments", "POST", "/api/comments/posts/{postId}", await call("POST", `/api/comments/posts/${postId}`, { token: aTok, body: { content: "coverage comment" } }));
  commentId = c1.json?.data?.commentId;
  const c2 = rec("Comments", "POST", "/api/comments/posts/{postId} (2nd)", await call("POST", `/api/comments/posts/${postId}`, { token: aTok, body: { content: "to delete" } }));
  commentId2 = c2.json?.data?.commentId;
  rec("Comments", "GET", "/api/comments/posts/{postId}", await call("GET", `/api/comments/posts/${postId}?pageNumber=1&pageSize=20`, { token: aTok }));
}
if (commentId) rec("Comments", "POST", "/api/comments/{id}/like", await call("POST", `/api/comments/${commentId}/like`, { token: aTok }));
if (commentId) rec("Comments", "DELETE", "/api/comments/{id}/like", await call("DELETE", `/api/comments/${commentId}/like`, { token: aTok }));
if (commentId2) rec("Comments", "DELETE", "/api/comments/{id}", await call("DELETE", `/api/comments/${commentId2}`, { token: aTok }));

// ── Notifications ──
const notifs = rec("Notifications", "GET", "/api/notifications", await call("GET", "/api/notifications?pageNumber=1&pageSize=20", { token: aTok }));
rec("Notifications", "GET", "/api/notifications/unread-count", await call("GET", "/api/notifications/unread-count", { token: aTok }));
const notifId = notifs.json?.data?.items?.[0]?.notificationId;
if (notifId) rec("Notifications", "PUT", "/api/notifications/{id}/read", await call("PUT", `/api/notifications/${notifId}/read`, { token: aTok }));
else results.push({ group: "Notifications", method: "PUT", path: "/api/notifications/{id}/read", status: "—", ok: null });
rec("Notifications", "PUT", "/api/notifications/mark-all-read", await call("PUT", "/api/notifications/mark-all-read", { token: aTok }));

// ── Messages ──
const conv = rec("Messages", "POST", "/api/messages/conversations", await call("POST", "/api/messages/conversations", { token: aTok, body: { participantIds: [B.user.userId], type: 0 } }));
const convId = conv.json?.data?.conversationId;
if (convId) rec("Messages", "POST", "/api/messages", await call("POST", "/api/messages", { token: aTok, body: { conversationId: convId, content: "hi" } }));
rec("Messages", "GET", "/api/messages/conversations", await call("GET", "/api/messages/conversations?pageNumber=1&pageSize=20", { token: aTok }));
if (convId) rec("Messages", "GET", "/api/messages/conversations/{id}", await call("GET", `/api/messages/conversations/${convId}?pageNumber=1&pageSize=50`, { token: aTok }));
if (convId) rec("Messages", "PUT", "/api/messages/conversations/{id}/read", await call("PUT", `/api/messages/conversations/${convId}/read`, { token: aTok }));

// ── Portfolios ──
const pf1 = rec("Portfolios", "POST", "/api/portfolios", await call("POST", "/api/portfolios", { token: aTok, body: { title: "cov pf", category: "dev", description: "d", tags: ["x"] } }));
const pfId = pf1.json?.data?.portfolioId;
const pf2 = rec("Portfolios", "POST", "/api/portfolios (2nd, to delete)", await call("POST", "/api/portfolios", { token: aTok, body: { title: "cov pf2", category: "dev" } }));
const pfId2 = pf2.json?.data?.portfolioId;
rec("Portfolios", "GET", "/api/portfolios", await call("GET", "/api/portfolios?pageNumber=1&pageSize=12", { token: aTok }));
if (pfId) rec("Portfolios", "GET", "/api/portfolios/{id}", await call("GET", `/api/portfolios/${pfId}`, { token: aTok }));
if (pfId) rec("Portfolios", "POST", "/api/portfolios/{id}/like", await call("POST", `/api/portfolios/${pfId}/like`, { token: aTok }));
if (pfId) rec("Portfolios", "DELETE", "/api/portfolios/{id}/like", await call("DELETE", `/api/portfolios/${pfId}/like`, { token: aTok }));
if (pfId2) rec("Portfolios", "DELETE", "/api/portfolios/{id}", await call("DELETE", `/api/portfolios/${pfId2}`, { token: aTok }));

// ── Friendships ──
// Note: POST /requests returns success but no Data (backend gap), so we read the
// friendshipId from the addressee's pending-requests list.
rec("Friendships", "POST", "/api/friendships/requests", await call("POST", "/api/friendships/requests", { token: aTok, body: { addresseeId: B.user.userId } }));
const bReqs = rec("Friendships", "GET", "/api/friendships/requests", await call("GET", "/api/friendships/requests?pageNumber=1&pageSize=20", { token: bTok }));
const fidAB = bReqs.json?.data?.items?.[0]?.friendshipId;
if (fidAB) rec("Friendships", "PUT", "/api/friendships/requests/{id}/accept", await call("PUT", `/api/friendships/requests/${fidAB}/accept`, { token: bTok }));
else results.push({ group: "Friendships", method: "PUT", path: "/api/friendships/requests/{id}/accept", status: "—", ok: null });
rec("Friendships", "GET", "/api/friendships", await call("GET", "/api/friendships?pageNumber=1&pageSize=20", { token: aTok }));
rec("Friendships", "POST", "/api/friendships/requests (for reject)", await call("POST", "/api/friendships/requests", { token: aTok, body: { addresseeId: C.user.userId } }));
const cReqs = await call("GET", "/api/friendships/requests?pageNumber=1&pageSize=20", { token: cTok });
const fidAC = cReqs.json?.data?.items?.[0]?.friendshipId;
if (fidAC) rec("Friendships", "PUT", "/api/friendships/requests/{id}/reject", await call("PUT", `/api/friendships/requests/${fidAC}/reject`, { token: cTok }));
else results.push({ group: "Friendships", method: "PUT", path: "/api/friendships/requests/{id}/reject", status: "—", ok: null });

// ── Logout (throwaway user C) ──
rec("Auth", "POST", "/api/auth/logout", await call("POST", "/api/auth/logout", { token: cTok }));

// ── Report ──
const total = results.length;
const passed = results.filter((r) => r.ok === true).length;
const failed = results.filter((r) => r.ok === false);
const skipped = results.filter((r) => r.ok === null);

let md = `# דוח כיסוי API — כל ה-endpoints של הבקאנד\n\n`;
md += `API: ${API}\n\n`;
md += `**כיסוי: ${passed}/${total} עברו** · ${failed.length} נכשלו · ${skipped.length} דולגו (אין נתונים).\n\n`;
const groups = [...new Set(results.map((r) => r.group))];
for (const g of groups) {
  md += `## ${g}\n\n| Method | Endpoint | Status | תוצאה |\n|---|---|---|---|\n`;
  for (const r of results.filter((x) => x.group === g)) {
    const mark = r.ok === true ? "✅" : r.ok === false ? "⛔" : "⏭️";
    md += `| \`${r.method}\` | \`${r.path}\` | ${r.status} | ${mark} |\n`;
  }
  md += `\n`;
}
if (failed.length) {
  md += `## ⛔ כשלים\n\n`;
  for (const r of failed) md += `- \`${r.method} ${r.path}\` → ${r.status}\n`;
}
writeFileSync(join(__dirname, "API_COVERAGE.md"), md, "utf8");
console.log(`\n=== COVERAGE: ${passed}/${total} passed, ${failed.length} failed, ${skipped.length} skipped ===`);
console.log("report:", join(__dirname, "API_COVERAGE.md"));
