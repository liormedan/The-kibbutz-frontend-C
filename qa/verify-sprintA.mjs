import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
async function probe(theme, route, sel){
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  await ctx.addInitScript((t)=>{try{localStorage.setItem("new-kibbutz-theme",t)}catch{}},theme);
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(e.message.slice(0,80)));
  await p.goto(BASE+route,{waitUntil:"load"}).catch(()=>{});
  await p.waitForTimeout(1300);
  const r=await p.evaluate((s)=>{
    const el=document.querySelector(s);
    const inp=document.querySelector("input,textarea");
    return {page:getComputedStyle(document.body).backgroundColor,
            card:el?getComputedStyle(el).backgroundColor:"n/a",
            input:inp?getComputedStyle(inp).backgroundColor:"n/a"};
  },sel).catch(()=>({}));
  console.log(`${theme.padEnd(5)} ${route.padEnd(18)} page=${String(r.page).padEnd(24)} card=${String(r.card).padEnd(28)} input=${String(r.input).padEnd(26)} errs=${errs.length}`);
  await ctx.close();
}
await probe("light","/projects/create",".glass-panel");
await probe("dark","/projects/create",".glass-panel");
await probe("light","/feed",".glass-card");
await probe("dark","/feed",".glass-card");
await probe("dark","/",".force-light");
await b.close();
