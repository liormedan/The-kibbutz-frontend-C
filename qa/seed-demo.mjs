// Seeds a demo account + content so the system has something to show.
// Credentials: demo@kibbutz.local / Demo1234!
const API = "http://localhost:19653";
const DEMO = { firstName: "דמו", lastName: "משתמש", username: "demo_user", email: "demo@kibbutz.local", password: "Demo1234!", role: 1 };

async function post(path, body, token) {
  const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => null) };
}
async function get(path, token) {
  const r = await fetch(API + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return { status: r.status, json: await r.json().catch(() => null) };
}

// register or login
let reg = await post("/api/auth/register", DEMO);
let session = reg.json?.data;
if (!session) {
  const login = await post("/api/auth/login", { email: DEMO.email, password: DEMO.password });
  session = login.json?.data;
}
if (!session) { console.error("could not get demo session:", reg.json); process.exit(1); }
const token = session.accessToken;
console.log("demo user ready:", session.user.email);

// seed content only if the feed is empty
const feed = await get("/api/posts/feed?pageNumber=1&pageSize=5", token);
if ((feed.json?.data?.items?.length ?? 0) === 0) {
  await post("/api/posts", { content: "ברוכים הבאים לקיבוץ! 🎉 זו המערכת רצה מול הבקאנד האמיתי.", tags: ["ברוכים-הבאים"] }, token);
  await post("/api/posts", { content: "כאן משתפים עדכונים, תיקי עבודות, ומתחברים לקהילה.", tags: ["קהילה"] }, token);
  await post("/api/portfolios", { title: "פרויקט לדוגמה", category: "עיצוב", description: "תיק עבודות לדוגמה בקיבוץ.", tags: ["דמו"] }, token);

  // a peer + a conversation so the messages tab has content
  const peer = await post("/api/auth/register", { firstName: "נועה", lastName: "כהן", username: "noa_demo", email: "noa@kibbutz.local", password: "Demo1234!", role: 1 });
  const peerId = peer.json?.data?.user?.userId;
  if (peerId) {
    const conv = await post("/api/messages/conversations", { participantIds: [peerId], type: 0 }, token);
    const convId = conv.json?.data?.conversationId;
    if (convId) await post("/api/messages", { conversationId: convId, content: "היי! ברוכה הבאה לקיבוץ 👋" }, token);
  }
  console.log("seeded posts, a portfolio, and a conversation.");
} else {
  console.log("feed already has content — skipping seed.");
}

console.log("\n=== LOGIN AS ===\nemail:    demo@kibbutz.local\npassword: Demo1234!");
