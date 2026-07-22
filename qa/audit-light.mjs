import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const API="http://localhost:19653",BASE="http://localhost:3000";
const uniq=String(process.hrtime.bigint()).slice(-9);
const r=await fetch(API+"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:"ליאור",lastName:"מדן",username:`qa_${uniq}`,email:`qa_${uniq}@k.local`,password:"Passw0rd!23",role:1})});
const s=(await r.json()).data;
await fetch(API+"/api/posts",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.accessToken}`},body:JSON.stringify({content:"פוסט לבדיקת עיצוב"})});
const authUser={id:s.user.userId,name:s.user.fullName,email:s.user.email,avatar:"",role:"participant",canCreateProjects:true,canJoinProjects:true,isProfileComplete:true,emailVerified:true};
const seed=JSON.stringify({state:{token:s.accessToken,refreshToken:s.refreshToken,user:authUser,isAuthenticated:true},version:0});
const b=await chromium.launch();
const ctx=await b.newContext({locale:"he-IL",viewport:{width:1280,height:900}});
// LIGHT mode explicitly
await ctx.addInitScript((v)=>{try{sessionStorage.setItem("kibbutz-auth",v);localStorage.setItem("new-kibbutz-theme","light");localStorage.removeItem("new-kibbutz-lang")}catch{}},seed);
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();

const routes=["/projects","/feed","/portfolios","/my-projects","/teams","/friends","/messages","/profile","/settings","/matches","/my-applications","/nda","/projects/create"];
const report=[];
for(const route of routes){
  await p.goto(BASE+route,{waitUntil:"load"}).catch(()=>{});
  await p.waitForTimeout(1300);
  const res = await p.evaluate(()=>{
    const lum=(c)=>{const m=c.match(/[\d.]+/g);if(!m)return null;const[r,g,bl,a]=m.map(Number);if(a!==undefined&&a<0.15)return null;return 0.2126*r+0.7152*g+0.0722*bl;};
    const out=[];
    for(const el of document.querySelectorAll("*")){
      const rect=el.getBoundingClientRect();
      if(rect.width<70||rect.height<24) continue;              // ignore tiny bits
      const st=getComputedStyle(el);
      const L=lum(st.backgroundColor);
      if(L===null||L>120) continue;                             // only genuinely dark fills
      const area=Math.round(rect.width*rect.height);
      out.push({area,bg:st.backgroundColor,color:st.color,tag:el.tagName.toLowerCase(),cls:(el.className||"").toString().slice(0,95)});
    }
    // biggest offenders first, drop nested duplicates by class+bg
    const seen=new Set();
    return out.sort((a,b)=>b.area-a.area).filter(o=>{const k=o.cls+o.bg;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,6);
  }).catch(()=>[]);
  report.push({route,offenders:res});
  console.log(`\n### ${route}  (${res.length} dark blocks)`);
  res.forEach(o=>console.log(`  area=${String(o.area).padStart(7)} bg=${o.bg.padEnd(26)} <${o.tag}> ${o.cls}`));
}
await b.close();
