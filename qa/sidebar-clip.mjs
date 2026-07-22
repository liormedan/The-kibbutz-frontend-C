import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
for(const h of [900, 760, 680]){
  const ctx=await b.newContext({viewport:{width:1440,height:h}});
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1200);
  const r=await p.evaluate((vh)=>{
    const btn=[...document.querySelectorAll("aside button")].find(b=>b.textContent.trim()==="הגדרות");
    if(!btn) return {found:false};
    const rect=btn.getBoundingClientRect();
    const nav=btn.closest("nav");
    return {found:true, bottom:Math.round(rect.bottom), viewportH:vh,
            visible: rect.bottom<=vh && rect.top>=0,
            navScrollable: nav?getComputedStyle(nav).overflowY:"n/a"};
  }, h);
  console.log(`viewport ${h}px →`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
