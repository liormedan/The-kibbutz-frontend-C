import { chromium } from "playwright";
const BASE="http://localhost:3001";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:800}});
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","dark")}catch{}});
const p=await ctx.newPage();
await p.goto(BASE+"/",{waitUntil:"load"});await p.waitForTimeout(2000);
const info=await p.evaluate(()=>{
  let found=[];
  for(const ss of document.styleSheets){
    try{ for(const r of ss.cssRules){ if(r.cssText && r.cssText.includes("force-light")) found.push(r.cssText.slice(0,140)); } }catch(e){}
  }
  const el=document.querySelector(".force-light");
  return {
    rulesFound: found.length,
    sample: found.slice(0,3),
    elClass: el?el.className:"none",
    elBg: el?getComputedStyle(el).backgroundColor:"none",
    elVarBg: el?getComputedStyle(el).getPropertyValue("--background").trim():"none",
  };
});
console.log(JSON.stringify(info,null,2));
await b.close();
