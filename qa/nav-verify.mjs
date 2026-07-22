import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const BASE="http://localhost:3000";
const b=await chromium.launch();
for(const h of [900, 620]){
  const ctx=await b.newContext({viewport:{width:1440,height:h}});
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1300);
  const r=await p.evaluate((vh)=>{
    const aside=document.querySelector("aside");
    const labels=[...aside.querySelectorAll("p")].map(e=>e.textContent.trim()).filter(t=>t.length<20);
    const set=document.querySelector('[data-testid="sidebar-settings"]');
    const rect=set?.getBoundingClientRect();
    return {groupLabels:labels.slice(0,2),
      settingsReachable: rect? (rect.bottom<=vh && rect.top>=0) : false,
      items:[...aside.querySelectorAll("[data-testid^='sidebar-']")].map(e=>e.getAttribute("data-testid").replace("sidebar-",""))};
  }, h);
  console.log(`\nviewport ${h}px`);
  console.log("  groups :", r.groupLabels);
  console.log("  items  :", r.items.join(" · "));
  console.log("  settings visible:", r.settingsReachable ? "YES ✓" : "NO ✗");
  if(h===900) await p.screenshot({path:join(__dirname,"nav-new.png")});
  await ctx.close();
}
await b.close();
