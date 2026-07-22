import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
for(const theme of ["light","dark"]){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript((t)=>{try{localStorage.setItem("new-kibbutz-theme",t)}catch{}},theme);
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  await p.goto(BASE+"/projects",{waitUntil:"load"});await p.waitForTimeout(1400);
  const r=await p.evaluate(()=>{
    const el=document.querySelector("aside .glass-panel");
    const s=el?getComputedStyle(el):null;
    return {htmlClass:document.documentElement.className,
      sidebarBg:s?s.backgroundColor:"NOT FOUND",
      surfaceVar:getComputedStyle(document.documentElement).getPropertyValue("--surface").trim(),
      pageBg:getComputedStyle(document.body).backgroundColor};
  });
  console.log(theme.padEnd(6), JSON.stringify(r));
  await ctx.close();
}
await b.close();
