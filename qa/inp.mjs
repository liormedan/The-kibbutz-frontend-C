import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900}});
await ctx.addInitScript(()=>{try{localStorage.setItem("new-kibbutz-theme","light")}catch{}});
await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
const p=await ctx.newPage();
await p.goto(BASE+"/projects/create",{waitUntil:"load"});await p.waitForTimeout(1500);
const out=await p.evaluate(()=>{
  const g=(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e).backgroundColor:null};
  const inp=document.querySelector("input[type=text], input:not([type])");
  const card=document.querySelector("form");
  return {pageBg:getComputedStyle(document.body).backgroundColor, cardBg:card?getComputedStyle(card).backgroundColor:null, inputBg:inp?getComputedStyle(inp).backgroundColor:null, inputCls:inp?inp.className.slice(0,80):null};
});
console.log(JSON.stringify(out,null,2));
await b.close();
