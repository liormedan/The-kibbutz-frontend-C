import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const BASE="http://localhost:3000";
const b=await chromium.launch();
for(const collapsed of [false,true]){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript((c)=>{try{localStorage.setItem("new-kibbutz-sidebar-collapsed",String(c))}catch{}},collapsed);
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1500);
  const el=await p.$("aside > div");
  await el.screenshot({path:join(__dirname,collapsed?"logo-collapsed.png":"logo-expanded.png")});
  console.log(collapsed?"collapsed shot":"expanded shot");
  await ctx.close();
}
await b.close();
