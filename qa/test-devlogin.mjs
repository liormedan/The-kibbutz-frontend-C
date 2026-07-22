import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname=dirname(fileURLToPath(import.meta.url));
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900}});
const p=await ctx.newPage();
const errs=[];p.on("pageerror",e=>errs.push("PE:"+e.message.slice(0,140)));
await p.goto(BASE+"/login",{waitUntil:"load"});await p.waitForTimeout(2500);
const btn = p.locator('button:has-text("כניסת מפתחים")').first();
const visible = await btn.isVisible().catch(()=>false);
console.log("dev button visible:", visible);
await p.screenshot({path:join(__dirname,"devlogin-before.png")});
if(visible){
  await btn.click();
  await p.waitForTimeout(3000);
  const state = await p.evaluate(()=>({
    url: location.pathname,
    cookie: document.cookie.includes("kibbutz-session"),
    auth: (()=>{try{const s=JSON.parse(sessionStorage.getItem("kibbutz-auth")||"{}");return {authed:s?.state?.isAuthenticated, user:s?.state?.user?.name, token:(s?.state?.token||"").slice(0,12)};}catch{return null}})(),
  }));
  console.log("after click:", JSON.stringify(state));
  await p.screenshot({path:join(__dirname,"devlogin-after.png")});
}
console.log("errors:",errs.length,errs.slice(0,2));
await b.close();
