import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const API="http://localhost:19653",BASE="http://localhost:3000";
const uniq=String(process.hrtime.bigint()).slice(-9);
const r=await fetch(API+"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:"ליאור",lastName:"מדן",username:`h_${uniq}`,email:`h_${uniq}@k.local`,password:"Passw0rd!23",role:1})});
const s=(await r.json()).data;
const authUser={id:s.user.userId,name:s.user.fullName,email:s.user.email,avatar:"",role:"participant",canCreateProjects:true,canJoinProjects:true,isProfileComplete:true,emailVerified:true};
const seed=JSON.stringify({state:{token:s.accessToken,refreshToken:s.refreshToken,user:authUser,isAuthenticated:true},version:0});
const b=await chromium.launch();
const ctx=await b.newContext({locale:"he-IL",viewport:{width:1440,height:900}});
await ctx.addInitScript((v)=>{try{sessionStorage.setItem("kibbutz-auth",v)}catch{}},seed);
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();
const errs=[];p.on("pageerror",e=>errs.push("PE:"+e.message.slice(0,90)));

console.log("=== redirects ===");
for(const from of ["/applications","/my-applications","/teams"]){
  await p.goto(BASE+from,{waitUntil:"load"}).catch(()=>{});
  await p.waitForTimeout(900);
  console.log(`  ${from.padEnd(18)} → ${p.url().replace(BASE,"")}`);
}
console.log("=== hub tabs ===");
for(const [route,file] of [["/my-projects","hub-1.png"],["/my-projects/requests","hub-2.png"],["/my-projects/applications","hub-3.png"],["/my-projects/teams","hub-4.png"]]){
  await p.goto(BASE+route,{waitUntil:"load"}).catch(()=>{});
  await p.waitForTimeout(1300);
  const info=await p.evaluate(()=>{
    const tabs=[...document.querySelectorAll("nav a")].filter(a=>a.getAttribute("href")?.startsWith("/my-projects"));
    const active=tabs.find(a=>a.className.includes("border-primary"));
    const side=[...document.querySelectorAll("[data-testid^='sidebar-']")].map(e=>e.getAttribute("data-testid").replace("sidebar-",""));
    return {tabCount:tabs.length, activeTab:active?.textContent?.trim(), sidebarItems:side.length};
  }).catch(()=>({}));
  console.log(`  ${route.padEnd(28)} tabs=${info.tabCount} active="${info.activeTab}" sidebarItems=${info.sidebarItems}`);
  await p.screenshot({path:join(__dirname,file)});
}
console.log("errors:",errs.length,errs.slice(0,2));
await b.close();
