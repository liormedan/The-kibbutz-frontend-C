// Provisions a local dev account so Lior can log in. Local SQLite backend only.
const API = "http://localhost:19653";
const CRED = {
  firstName: "ליאור",
  lastName: "מדן",
  username: "liormedan",
  email: process.env.DEV_EMAIL,
  password: process.env.DEV_PASSWORD,
  role: 5, // Administrator
};

async function post(path, body) {
  const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => null) };
}

let res = await post("/api/auth/register", CRED);
if (res.json?.success) {
  console.log("account created:", res.json.data.user.email, "(role: admin)");
} else {
  // maybe already exists — try logging in
  const login = await post("/api/auth/login", { email: CRED.email, password: CRED.password });
  if (login.json?.success) console.log("account already existed; login works:", CRED.email);
  else console.log("register failed:", res.json?.message, res.json?.errors, "| login:", login.json?.message);
}
