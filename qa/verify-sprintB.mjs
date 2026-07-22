import { chromium } from "playwright";
const BASE="http://localhost:3000";
const b=await chromium.launch();
async function run(theme){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript((t)=>{try{localStorage.setItem("new-kibbutz-theme",t)}catch{}},theme);
  await ctx.addCookies([{name:"kibbutz-session",value:"1",url:BASE},{name:"kibbutz-role",value:"participant",url:BASE}]);
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(e.message.slice(0,70)));
  const bad=[];
  for(const r of ["/my-applications","/nda","/nda/inbox","/matches","/friends"]){
    await p.goto(BASE+r,{waitUntil:"load"}).catch(()=>{});
    await p.waitForTimeout(1100);
    const hits=await p.evaluate(()=>{
      // flag anything still rendering a blue/purple hue (b noticeably > r)
      const out=[];
      for(const el of document.querySelectorAll("*")){
        for(const prop of ["backgroundColor","color","borderTopColor"]){
          const c=getComputedStyle(el)[prop];
          const m=c && c.match(/\d+/g);
          if(!m||m.length<3) continue;
          const [r,g,bl]=m.map(Number);
          const a=m[3]!==undefined?Number(m[3]):1;
          if(a<0.2) continue;
          if(bl>r+30 && bl>g+30) out.push(`${prop}=${c} <${el.tagName.toLowerCase()}> ${(el.className||"").toString().slice(0,50)}`);
        }
      }
      return [...new Set(out)].slice(0,4);
    }).catch(()=>[]);
    if(hits.length) bad.push({route:r,hits});
  }
  console.log(`[${theme}] blue/purple leftovers:`, bad.length===0?"NONE ✓":JSON.stringify(bad,null,1), "| errors:",errs.length);
  await ctx.close();
}
await run("light"); await run("dark");
await b.close();
