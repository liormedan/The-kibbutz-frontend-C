import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900}});
// Simulate the offline dev-login mock session hitting a live backend
const seed=JSON.stringify({state:{token:"dev-token",refreshToken:"dev-refresh-token",
  user:{id:"dev-user-1",name:"מפתח בדיקה",email:"dev@kibbutz.local",avatar:"",role:"admin",
  canCreateProjects:true,canJoinProjects:true,isProfileComplete:true,emailVerified:true},
  isAuthenticated:true},version:0});
await ctx.addInitScript((v)=>{try{sessionStorage.setItem("kibbutz-auth",v)}catch{}},seed);
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"admin",url:BASE}]);
const p=await ctx.newPage();
const errs=[];p.on("pageerror",e=>errs.push(e.message.slice(0,90)));
await p.goto(BASE+"/friends",{waitUntil:"load"});
await p.waitForTimeout(4000);
const cookies=await ctx.cookies();
console.log("final URL      :", p.url().replace(BASE,"") || "/");
console.log("session cookie :", cookies.find(c=>c.name==="kibbutz-session")?.value ?? "CLEARED ✓");
console.log("uncaught errors:", errs.length, errs.slice(0,2));
await b.close();
