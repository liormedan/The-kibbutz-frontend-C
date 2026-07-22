import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:800}});
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","dark");localStorage.setItem("new-kibbutz-lang","en")}catch{}});
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();
const errs=[];
p.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,220))});
p.on("pageerror",e=>errs.push("PAGEERROR: "+e.message.slice(0,220)));
for(const r of ["/","/projects","/settings"]){
  errs.length=0;
  await p.goto(BASE+r,{waitUntil:"load"});await p.waitForTimeout(2200);
  const hyd=errs.filter(e=>/hydrat/i.test(e));
  const info=await p.evaluate(()=>({cls:document.documentElement.className,lang:document.documentElement.lang,dir:document.documentElement.dir}));
  console.log(r.padEnd(11),"hydrationErrs=",hyd.length,"| otherErrs=",errs.length-hyd.length,"|",JSON.stringify(info));
  if(hyd.length)console.log("   ",hyd[0]);
}
await b.close();
