// QA: the /nda payment step must never ask for payment details.
//
// It used to render a full card form — number, holder, expiry, CVV, VISA/MC/AMEX
// badges and a "pay ₪57.33 securely" button — while handlePay only advanced a
// step. Nothing was ever charged, so every card number typed there was collected
// for nothing, behind a screen that claimed to be secure. This suite exists so
// that never comes back: when a provider is chosen, its own hosted checkout
// takes the details, not this page.
//
//   QA_BASE=http://localhost:3001 node qa/nda-payment.mjs
import { chromium } from "playwright";

const BASE = process.env.QA_BASE || "http://localhost:3001";

let pass = 0, fail = 0;
const ok = (label, good, detail = "") => {
  if (good) { pass++; console.log(`  ✔ ${label}`); }
  else { fail++; console.log(`  ✘ ${label}${detail ? "  → " + detail : ""}`); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([
  { name: "kibbutz-session", value: "qa", url: BASE },
  { name: "kibbutz-role", value: "user", url: BASE },
]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));

await page.goto(BASE + "/nda", { waitUntil: "networkidle" });
await page.waitForTimeout(300);

// Fill the four required fields so the generate button enables.
const inputs = page.locator("input[type=text], input[type=email]");
await inputs.nth(0).fill("ליאור מדן");
await inputs.nth(1).fill("דנה כהן");
await inputs.nth(2).fill("פרויקט בדיקה");
await page.locator("input[type=email]").first().fill("qa@kibbutz.local");
await page.waitForTimeout(200);

const genBtn = page.locator("button:not([disabled])").filter({ hasText: /חוזה|contract/i }).last();
ok("כפתור יצירת החוזה פעיל אחרי מילוי הטופס", await genBtn.count() > 0);
await genBtn.click();
await page.waitForTimeout(400);

console.log("\nשלב התשלום");

const probe = await page.evaluate(() => {
  const txt = document.body.innerText;
  const fields = [...document.querySelectorAll("input, textarea")]
    .filter((e) => e.offsetParent !== null)
    .map((e) => [e.getAttribute("placeholder") || "", e.getAttribute("name") || "",
                 e.getAttribute("aria-label") || "", e.id || ""].join(" ").toLowerCase());
  return { txt, fields, fieldCount: fields.length };
});

// Nothing on the page may ask for a card, an account or any payment credential.
const CARD_FIELD = /card|cvv|cvc|expiry|mm\/yy|0000|כרטיס|תוקף|אשראי|iban|account/i;
const offending = probe.fields.filter((f) => CARD_FIELD.test(f));
ok("אין אף שדה שמבקש פרטי תשלום", offending.length === 0, offending.join(" | "));
ok("אין בכלל שדות קלט בשלב התשלום", probe.fieldCount === 0, `${probe.fieldCount} שדות`);

// And it may not claim to be a working, secure checkout.
const CLAIMS = [
  [/שלם\s|pay\s+₪|pay\s+\d/i, "כפתור תשלום"],
  [/באבטחה|securely/i, "הבטחת אבטחה"],
  [/PCI|SSL/i, "תגי PCI/SSL"],
  [/Stripe|VISA|AMEX/i, "מיתוג ספק סליקה"],
  [/מעבד תשלום|processing payment/i, "מצב עיבוד תשלום"],
];
for (const [re, label] of CLAIMS) {
  ok(`אין ${label}`, !re.test(probe.txt), re.source);
}

// It must say plainly what the state is.
ok("מוסבר שהתשלום ייפתח כשנבחר ספק",
   /ייפתח כשנבחר ספק|opens once a provider/i.test(probe.txt));
ok("מוצהר שלא בוצע חיוב",
   /לא בוצע חיוב|no charge was made/i.test(probe.txt));

// The flow still reaches the contract.
await page.locator("button").filter({ hasText: /תצוגה מקדימה|preview/i }).first().click();
await page.waitForTimeout(400);
const reached = await page.evaluate(() =>
  /הסכם סודיות|non-disclosure|NDA/i.test(document.body.innerText));
ok("אפשר להמשיך לתצוגה מקדימה של החוזה", reached);

ok("אין שגיאות קונסולה/חריגות", errors.length === 0, errors.join(" | "));

console.log(`\n${"═".repeat(56)}\n  ${pass} עברו · ${fail} נכשלו\n${"═".repeat(56)}`);
await browser.close();
process.exit(fail ? 1 : 0);
