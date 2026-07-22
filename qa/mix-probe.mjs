import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","dark")}catch{}});
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();
await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const cs=getComputedStyle(document.documentElement);
  return {
    theme:"dark",
    "--background (runtime, switches)": cs.getPropertyValue("--background").trim(),
    "--color-background (tailwind token, STATIC)": cs.getPropertyValue("--color-background").trim(),
    "--foreground (runtime)": cs.getPropertyValue("--foreground").trim(),
    "--color-foreground (tailwind, STATIC)": cs.getPropertyValue("--color-foreground").trim(),
    "--color-card (tailwind, STATIC)": cs.getPropertyValue("--color-card").trim(),
    "--color-border (tailwind, STATIC)": cs.getPropertyValue("--color-border").trim(),
  };
});
console.log(JSON.stringify(r,null,2));
await b.close();
