import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const API="http://localhost:19653",BASE="http://localhost:3000";
const uniq=String(process.hrtime.bigint()).slice(-9);
const r=await fetch(API+"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:"ליאור",lastName:"מדן",username:`qa_${uniq}`,email:`qa_${uniq}@k.local`,password:"Passw0rd!23",role:1})});
const s=(await r.json()).data;
const tok=s.accessToken;
await fetch(API+"/api/posts",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${tok}`},body:JSON.stringify({content:"פוסט לבדיקת עיצוב — איך נראה הפיד במצב בהיר?"})});
await fetch(API+"/api/portfolios",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${tok}`},body:JSON.stringify({title:"תיק עבודות לדוגמה",description:"בדיקת עיצוב",category:"עיצוב"})});
const authUser={id:s.user.userId,name:s.user.fullName,email:s.user.email,avatar:"",role:"participant",canCreateProjects:true,canJoinProjects:true,isProfileComplete:true,emailVerified:true};
const seed=JSON.stringify({state:{token:tok,refreshToken:s.refreshToken,user:authUser,isAuthenticated:true},version:0});
const b=await chromium.launch();
const ctx=await b.newContext({locale:"he-IL",viewport:{width:1440,height:900}});
await ctx.addInitScript((v)=>{try{sessionStorage.setItem("kibbutz-auth",v);localStorage.setItem("new-kibbutz-theme","light")}catch{}},seed);
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();
for(const [route,file] of [["/feed","A-feed.png"],["/portfolios","L-portfolios.png"],["/messages","L-messages.png"],["/my-applications","L-myapps.png"],["/nda","L-nda.png"],["/projects/create","L-create.png"],["/friends","L-friends.png"]]){
  await p.goto(BASE+route,{waitUntil:"load"}).catch(()=>{});
  await p.waitForTimeout(1400);
  await p.screenshot({path:join(__dirname,file)});
  console.log("shot",route);
}
await b.close();
