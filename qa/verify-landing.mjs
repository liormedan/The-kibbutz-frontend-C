import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900}}); // NO session cookie
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","dark")}catch{}});
const p=await ctx.newPage();
const errs=[];p.on("pageerror",e=>errs.push(e.message.slice(0,80)));
await p.goto(BASE+"/",{waitUntil:"load"});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const fl=document.querySelector(".force-light");
  const card=document.querySelector(".force-light .glass-card, .force-light .glass-panel");
  const inp=document.querySelector(".force-light input");
  return {url:location.pathname, htmlClass:document.documentElement.className,
    forceLightBg: fl?getComputedStyle(fl).backgroundColor:"MISSING",
    cardBg: card?getComputedStyle(card).backgroundColor:"n/a",
    inputBg: inp?getComputedStyle(inp).backgroundColor:"n/a"};
});
console.log(JSON.stringify(r,null,2),"errs:",errs.length);
await b.close();
