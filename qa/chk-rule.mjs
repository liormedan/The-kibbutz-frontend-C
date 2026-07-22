import { chromium } from "playwright";
const BASE="http://localhost:3001";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900}});
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","dark")}catch{}});
const p=await ctx.newPage();
await p.goto(BASE+"/",{waitUntil:"load"});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{
  const found=[];
  for(const ss of document.styleSheets){let rs;try{rs=ss.cssRules}catch(e){continue}
    for(const x of rs){const t=x.cssText||"";if(/force-light (input|textarea|select)/.test(t))found.push(t.slice(0,160));}}
  const inp=document.querySelector(".force-light input");
  return {ruleFound:found.length, rule:found[0]||null, inputBg:inp?getComputedStyle(inp).backgroundColor:"n/a", inputCls:inp?inp.className.slice(0,70):null};
});
console.log(JSON.stringify(r,null,2));
await b.close();
