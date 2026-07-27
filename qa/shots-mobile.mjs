// Screenshots of every main screen at 390×844, light + dark, for design review.
//   QA_BASE=http://localhost:3001 node qa/shots-mobile.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.QA_BASE || "http://localhost:3001";
const OUT = "qa/shots-mobile";
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["projects", "/projects"],
  ["feed", "/feed"],
  ["messages", "/messages"],
  ["my-projects", "/my-projects"],
  ["profile", "/profile"],
  ["settings", "/settings"],
  ["portfolios", "/portfolios"],
  ["nda", "/nda"],
];

const AUTH = {
  state: {
    token: "qa", refreshToken: "qa", isAuthenticated: true,
    user: { id: "qa-1", name: "ליאור מדן", email: "qa@kibbutz.local", avatar: "",
      role: "entrepreneur", canCreateProjects: true, canJoinProjects: true,
      isProfileComplete: true, emailVerified: true },
  },
  version: 0,
};

const browser = await chromium.launch();

for (const theme of ["light", "dark"]) {
  // Deliberately NOT isMobile. Chromium's mobile emulation reserves a classic
  // scrollbar, so innerHeight is 14px taller than clientHeight; a `fixed
  // bottom-0` bar correctly sizes to that and then renders *below* the 844px
  // the screenshot captures — the bottom-nav labels come out sliced in half.
  // That is a capture artifact, not a layout bug: real phones use overlay
  // scrollbars and reserve nothing. A plain context has no gutter, so what you
  // see here is what a phone shows. (Same trap as the retracted 7px width
  // finding — see MOBILE_SPEC.md §2.)
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
  });
  await ctx.addCookies([
    { name: "kibbutz-session", value: "qa", url: BASE },
    { name: "kibbutz-role", value: "user", url: BASE },
  ]);
  await ctx.addInitScript(([a, t]) => {
    sessionStorage.setItem("kibbutz-auth", a);
    localStorage.setItem("new-kibbutz-lang", "he");
    localStorage.setItem("new-kibbutz-theme", t);
  }, [JSON.stringify(AUTH), theme]);

  const page = await ctx.newPage();
  for (const [name, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${theme}-${name}.png` });
    console.log(`${theme}/${name}`);
  }
  await ctx.close();
}

await browser.close();
console.log(`\n→ ${OUT}`);
