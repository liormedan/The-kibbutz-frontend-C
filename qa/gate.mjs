// QA gate — runs every UI sweep against one production server and returns a
// single exit code. This is the check to run before merging.
//
//   npm run qa:gate            # assumes .next is current
//   npm run qa:gate -- --build # build first
//   QA_PORT=3005 npm run qa:gate
//
// Each suite owns its own assertions; the gate only starts the server, hands
// every suite the same QA_BASE, and fails if any suite exits non-zero. A suite
// that merely *logs* a failure is invisible here — that is why every file in
// SUITES ends with process.exit(fail ? 1 : 0).
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = Number(process.env.QA_PORT || 3001);
const BASE = `http://localhost:${PORT}`;
const BUILD = process.argv.includes("--build");
const isWin = process.platform === "win32";

const SUITES = [
  ["mobile", "מובייל — 360/390/430, קבלת MOBILE_SPEC"],
  ["deep-check", "בדיקת עומק — ניווט, שפה, ערכות נושא"],
  ["ui-walkthrough", "סריקת UI — כל המסלולים, בהיר וכהה"],
  ["topbar", "סרגל עליון — הצמדה, סדר, מראה הפוך ב-LTR"],
  ["viewport-fit", "התאמה לגובה החלון — בלי גלילה מיותרת"],
  ["sidebar-fit", "סרגל צד — נכנס בלי גלילה"],
  ["account-menu", "תפריט חשבון — פתיחה, ניווט, התנתקות"],
  ["profile-details", "פרופיל — פרטים, קישורים, טאב תשלום"],
  ["nda-payment", "NDA — שלב התשלום לא מבקש פרטי אשראי"],
];

/** Spawn through a shell so .cmd shims resolve on Windows. */
function run(cmd, opts = {}) {
  return spawn(cmd, { shell: true, stdio: "inherit", ...opts });
}

/**
 * A shell-spawned server is a cmd.exe with next underneath — kill the tree.
 * spawnSync, not spawn: this runs from an `exit` handler, and process.exit
 * tears the loop down before an async spawn ever reaches taskkill. That left
 * `next start` orphaned on the port, which then tripped the guard below on the
 * next run and looked like a stale server the user had left behind.
 */
function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (isWin) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGTERM");
}

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  return false;
}

function runSuite(file) {
  return new Promise((resolve) => {
    const child = run(`node qa/${file}.mjs`, { env: { ...process.env, QA_BASE: BASE } });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

if (BUILD) {
  console.log("▸ next build\n");
  const code = await new Promise((r) => run("npm run build").on("exit", r));
  if (code !== 0) {
    console.error("\n✘ הבנייה נכשלה — הריצה נעצרה.");
    process.exit(1);
  }
}

// A server already on this port would make `next start` fail to bind while the
// gate happily tests whatever is there — usually a stale build. Refuse instead.
// The abort timer is cleared explicitly: an AbortSignal.timeout still pending
// when process.exit runs trips a libuv assertion on Windows, so the guard would
// crash with 127 instead of failing cleanly with 1.
let occupied = false;
{
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 2000);
  try {
    await fetch(BASE, { redirect: "manual", signal: ac.signal });
    occupied = true;
  } catch {
    /* nothing listening — good */
  } finally {
    clearTimeout(timer);
  }
}
if (occupied) {
  console.error(
    `✘ פורט ${PORT} כבר תפוס. השער חייב להריץ את השרת בעצמו, אחרת ייבדק בילד ישן.\n` +
    `  סגור את השרת הקיים או הרץ עם QA_PORT אחר.`,
  );
  process.exit(1);
}

console.log(`▸ next start -p ${PORT}\n`);
const server = run(`npx next start -p ${PORT}`, { stdio: "ignore" });
process.on("exit", () => killTree(server));
process.on("SIGINT", () => { killTree(server); process.exit(130); });

if (!(await waitForServer())) {
  console.error(`✘ השרת לא עלה על ${BASE}`);
  killTree(server);
  process.exit(1);
}

const results = [];
for (const [file, label] of SUITES) {
  console.log(`\n${"━".repeat(72)}\n▸ ${file} — ${label}\n${"━".repeat(72)}`);
  const code = await runSuite(file);
  results.push({ file, label, code });
}

killTree(server);

const failed = results.filter((r) => r.code !== 0);
console.log(`\n${"═".repeat(72)}\n  QA GATE\n${"═".repeat(72)}`);
for (const r of results) {
  console.log(`  ${r.code === 0 ? "✔" : "✘"}  ${r.file.padEnd(18)} ${r.label}`);
}
console.log("═".repeat(72));
console.log(
  failed.length === 0
    ? `  כל ${results.length} החליפות עברו ✔`
    : `  ${failed.length}/${results.length} חליפות נכשלו: ${failed.map((r) => r.file).join(", ")}`,
);
console.log("═".repeat(72));

process.exit(failed.length ? 1 : 0);
