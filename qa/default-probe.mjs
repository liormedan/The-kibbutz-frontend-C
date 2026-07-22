import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}}); // FRESH: no localStorage at all
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();
await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const cs=getComputedStyle(document.documentElement);
  const el=(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e):null};
  const shell=document.querySelector("div.flex.h-screen");
  return {
    savedTheme: localStorage.getItem("new-kibbutz-theme"),
    htmlClass: document.documentElement.className,
    runtimeVar_background: cs.getPropertyValue("--background").trim(),
    tailwindToken_colorBackground: cs.getPropertyValue("--color-background").trim(),
    runtimeVar_foreground: cs.getPropertyValue("--foreground").trim(),
    tailwindToken_colorForeground: cs.getPropertyValue("--color-foreground").trim(),
    shellBg: shell?getComputedStyle(shell).backgroundColor:"n/a",
    sidebarBg: el("aside .glass-panel")?.backgroundColor,
  };
});
console.log(JSON.stringify(r,null,2));
await b.close();
