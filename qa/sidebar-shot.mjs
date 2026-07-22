import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const BASE="http://localhost:3000";
const b=await chromium.launch();
for(const theme of ["light","dark"]){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript((t)=>{try{localStorage.setItem("new-kibbutz-theme",t)}catch{}},theme);
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1500);
  const el=await p.$("aside .glass-panel");
  if(el) await el.screenshot({path:join(__dirname,`sb-${theme}.png`)});
  await ctx.close();
}
await b.close();console.log("done");
