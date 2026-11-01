const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function setup(width = 1440, height = 900, fps = 60) {
  class El {
    constructor(top=0) { this.top=top; this.offsetHeight=height; this.dataset={}; this.style={setProperty(k,v){this[k]=v}}; this.classList={add(){},remove(){},toggle(){}}; this.open=false; this.events={}; }
    addEventListener(k,fn) { this.events[k]=fn; }
    getBoundingClientRect(){return {top:this.top-c.scrollY,left:width*.6,width:width*.3,height:300};}
    setAttribute(){}
  }
  const ids={}, events={}, pending=new Map(); let serial=0, time=0;
  const sections=Array.from({length:5},(_,i)=>new El(i*height));
  sections[2].dataset.theme='dark';
  const site={motion:{enabled:true},tick(){}};
  const c={window:{Gothos:site},innerWidth:width,innerHeight:height,scrollY:0,Math,
    document:{hidden:false,body:new El(),getElementById:id=>ids[id]??=new El(),querySelector:()=>new El(),querySelectorAll:s=>s==='[data-flight-section]'?sections:[],fonts:{ready:{then(){}}},addEventListener:(k,fn)=>events[k]=fn},
    addEventListener:(k,fn)=>events[k]=fn,requestAnimationFrame:fn=>{pending.set(++serial,fn);return serial;},cancelAnimationFrame:id=>pending.delete(id),
    MutationObserver:class {observe(){}},ResizeObserver:class {observe(){}},console};
  vm.runInNewContext(fs.readFileSync('owl.js','utf8'),c);
  function step(n=1){for(let i=0;i<n;i++){time+=1000/fps;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn(time));}}
  function sample(){const s=ids.owl.style.transform;assert(!/NaN|Infinity/.test(s));const m=s.match(/translate3d\(([-+.e\d]+)px,([-+.e\d]+)px/);const angle=+s.match(/rotate\(([-+.e\d]+)deg/)[1];return {x:+m[1],y:+m[2],angle,wing:ids.wingL.style.transform};}
  function move(from,to,seconds=1.1){let samples=[];for(let i=0;i<=Math.round(fps*seconds);i++){const t=i/Math.round(fps*seconds);c.scrollY=from+(to-from)*t*t*t*(t*(t*6-15)+10);site.flight.request();step();samples.push(sample());}return samples;}
  step(fps*2);
  return {c,site,ids,events,pending,step,sample,move,fps,height};
}
const results=[];
for(const [w,h,fps] of [[1440,900,60],[390,844,60],[1440,900,30],[1440,900,120]]) {
  const a=setup(w,h,fps);const {c,site,ids,events,step,sample,move}=a;
  move(0,h);step(fps*3);const left=sample();
  const outbound=move(h,h*2);step(fps*3);const right=sample();
  const inbound=move(h*2,h*3);step(fps*3);const returned=sample();
  assert(right.x>left.x+w*.2,'crosses to right');assert(returned.x<right.x-w*.2,'crosses back to left');
  assert(outbound.some(p=>p.angle>8),'banks right');assert(inbound.some(p=>p.angle < -8),'banks left');
  for(const p of [...outbound,...inbound]) assert(p.x>=12&&p.x<=w-12&&p.y>0&&p.y<h,'viewport bounds');
  move(h*3,h*2.5,.6);step(fps*4);const rest=site.flight.wingPose(0,0)[0];
  const angle=s=>+s.match(/rotate\(([-+.e\d]+)/)[1];
  assert(Math.abs(angle(sample().wing)-angle(rest))<.001,'wings fold when stopped between sections');
  ids['chat-dialog'].open=true;events['gothos-chat']();step(fps);
  assert.equal(ids['owl-layer'].style.visibility,'hidden');
  ids['chat-dialog'].open=false;events['gothos-chat']();step(fps);
  assert.equal(ids['owl-layer'].style.visibility,'');
  const afterChat=move(h*2.5,h*2);assert(afterChat.some(p=>p.angle>2),'flight resumes after chat');
  c.scrollY=h*4;site.flight.request();step(fps*3);assert.equal(ids.owl.style['--L'],'0','footer never morphs character');
  site.motion.enabled=false;events['gothos-motion']();step();const frozen=ids.owl.style.transform;step(fps);assert.equal(ids.owl.style.transform,frozen);assert.equal(ids.wingL.style.transform,rest);
  site.motion.enabled=true;events['gothos-motion']();step();c.document.hidden=true;events.visibilitychange();assert.equal(a.pending.size,0);c.document.hidden=false;events.visibilitychange();step();assert(!/NaN/.test(ids.owl.style.transform));
  results.push({viewport:[w,h],fps,leftX:Math.round(left.x),rightX:Math.round(right.x),returnX:Math.round(returned.x),maxRightBank:Math.round(Math.max(...outbound.map(x=>x.angle))),maxLeftBank:Math.round(Math.min(...inbound.map(x=>x.angle))),passed:true});
}
const a=setup();const p=a.site.flight.wingPose;
const numbers = s => s.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g).map(Number);
numbers(p(0,1)[0]).forEach((n,i)=>assert(Math.abs(n-numbers(p(Math.PI*2,1)[0])[i])<1e-10));
assert(Math.abs(+p(.43*Math.PI*2,1)[0].match(/rotate\(([-+.e\d]+)/)[1]+48)<1e-9);
console.log(JSON.stringify({checks:'Crossings, bank direction, bounds, stop-midway folding, chat recovery, footer identity, pause, visibility, wingbeat continuity',results},null,2));
