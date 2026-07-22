import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const BASE="http://localhost:3001";
const b=await chromium.launch();
// dark mode ON — the landing page must still render light
const ctx=await b.newContext({viewport:{width:1280,height:800}});
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","dark")}catch{}});
const p=await ctx.newPage();
await p.goto(BASE+"/",{waitUntil:"load"});await p.waitForTimeout(1800);
const bg=await p.evaluate(()=>{const el=document.querySelector(".force-light");return el?getComputedStyle(el).backgroundColor:"NO .force-light"});
console.log("html class:",await p.evaluate(()=>document.documentElement.className));
console.log("landing root bg:",bg);
await p.screenshot({path:join(__dirname,"landing-light.png")});
await b.close();console.log("done");
