/* global Map, Set, Proxy, __dirname */
/* node apps/orbit/test-rest.js -- 3D threshold-gated five-minute activity sums. */
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path");
const EventEmitter=require("events"),r=require("./rest.js"),S=r.constants.slotMs;
const base=Math.floor(Date.parse("2026-10-19T18:00:00Z")/S)*S;
// The flash-backed city directory must give exact access to all 197 records.
const placeIndex={},cityRaw=fs.readFileSync(path.join(__dirname,"cities.dat"),"utf8");
vm.runInNewContext(fs.readFileSync(path.join(__dirname,"locations.js"),"utf8"),
  {exports:placeIndex});
const countryNames=placeIndex.countryNames.split("|");
assert.strictEqual(countryNames.length,197);
assert.strictEqual(placeIndex.cityOffsets.length,198);
assert.strictEqual(placeIndex.cityOffsets.at(-1),cityRaw.length);
const allCountryNames=new Set();
for(let i=0;i<countryNames.length;i++){
  const raw=cityRaw.substr(placeIndex.cityOffsets[i],
    placeIndex.cityOffsets[i+1]-placeIndex.cityOffsets[i]-1);
  const cities=JSON.parse(raw);
  assert(cities.length>0||countryNames[i]==="Japan",
    "No cities for "+countryNames[i]);
  assert(!allCountryNames.has(countryNames[i]),"Duplicated country "+countryNames[i]);
  allCountryNames.add(countryNames[i]);
  for(const city of cities){
    assert(typeof city[0]==="string"&&city[0]);
    assert(Number.isFinite(city[1])&&Number.isFinite(city[2]));
  }
}
const quiet={x:0,y:0,z:1,mag:1,diff:0.001};
function feed(e,start,end,a=quiet,step=1000){
  for(let t=start;t<=end;t+=step)e.sample(a,t);
}
function pattern(e,amplitude,step=1000){
  for(let t=0;t<=S;t+=step){
    const k=Math.floor(t/8000);
    const a=typeof amplitude==="function"?amplitude(k):amplitude;
    const z=t%8000===3000?1+a:1;
    e.sample({x:0,y:0,z:z,mag:z,diff:Math.abs(z-1)},base+t);
  }
  e.sync(base+S);
}
assert.deepStrictEqual(r.thresholds,[.001,.003,.009,.027,.081,.243,.729]);
assert.strictEqual(r.thresholdG(.03),.027);
assert.deepStrictEqual(r.activityDefaults,[.5,2,6,18]);
assert.deepStrictEqual(r.activityThresholds(),[.5,2,6,18]);
assert.deepStrictEqual([0,.49,.5,1.99,2,5.99,6,17.99,18]
  .map(x=>r.activityLevel(x,r.activityDefaults)),[100,100,60,60,40,40,20,20,0]);
const low=r.create({thresholdG:.027});pattern(low,.004);
assert.strictEqual(low.level(base/S),100);
const high=r.create({thresholdG:.027});pattern(high,.2);
assert(high.level(base/S)<100,"Repeated suprathreshold motion must reduce rest level");
const zeroBars=[];high.visit(base+S*2,(b,v)=>zeroBars.push([b,v]));
assert.deepStrictEqual(zeroBars,[[base/S,high.level(base/S)]]);
assert(r.stageFor(high.level(base/S))<5,"Moving intervals draw shortened bars");
assert.deepStrictEqual([0,19,20,39,40,59,60,79,80,100].map(r.stageFor),
 [1,1,2,2,3,3,4,4,5,5]);
const stageAngles=[];
r.draw({setColor:()=>{},drawLine:(...a)=>stageAngles.push(a)},high,
 {nowMs:base+S*2,radiusPx:70,maxHeightPx:10,cx:85,cy:90,currentAngleRad:0});
assert.strictEqual(stageAngles.length,1);
assert(Math.abs(Math.hypot(stageAngles[0][2]-85,stageAngles[0][3]-90)-
  (70+10*r.stageFor(high.level(base/S))/5))<1);
const mixed=r.create({thresholdG:.027});pattern(mixed,k=>k%2?.2:.004);
assert(mixed.level(base/S)>=high.level(base/S)&&mixed.level(base/S)<=100);
// Dedicated 12.5Hz three-axis peak tests: never count sub-gate events.
function trial(axis,n,amplitude,opts){
  const x=r.create(Object.assign({thresholdG:.027,wearEnabled:false,
    activityThresholds:[.5,2,6,18]},opts||{}));
  for(let t=0;t<=S;t+=80){
    const a={x:0,y:0,z:1};
    if(t>=8000&&t<8000+n*8000&&t%8000===0)a[axis]+=amplitude;
    x.sample(a,base+t);
  }
  x.sync(base+S);
  return {level:x.level(base/S),data:x.getDiagnostics().recent.at(-1)};
}
const sub=trial("x",20,.01),single=trial("x",1,.3),
  many=trial("x",20,.3),manyY=trial("y",20,.3),manyZ=trial("z",20,.3);
assert.strictEqual(sub.data.peaks,0);
assert.strictEqual(sub.data.activity,0);
assert.strictEqual(single.data.peaks,1);
assert.strictEqual(single.level,100,"One large motion impulse must not force stage 1");
assert(many.data.peaks>=19&&many.data.activity>single.data.activity*10);
assert.strictEqual(many.level,manyY.level);
assert.strictEqual(many.level,manyZ.level);
assert.strictEqual(many.data.peaks,manyY.data.peaks);
assert(many.data.activity>0);

// v0.076: 270..300s valid XYZ coverage normalizes peak sum to 300s
// BEFORE stage boundaries; <270s must remain unknown (FF).
assert.strictEqual(r.activity300(6,300000),6);
assert.strictEqual(r.activity300(6,270000),6*300/270);
assert.strictEqual(r.activity300(6,269000),6); // never applied: invalid bin
function coverageTrial(seconds,cuts){
  const x=r.create({thresholdG:.027,wearEnabled:false,
    activityThresholds:cuts||[.5,2,6,18],nowMs:base});
  for(let t=0;t<=seconds*1000;t+=80){
    const a={x:t>0&&t%8000===0?.3:0,y:0,z:1};
    x.sample(a,base+t);
  }
  x.sync(base+S);
  return {engine:x,diagnostic:x.getDiagnostics().recent.at(-1)};
}
const cv270=coverageTrial(270);
const cv300=coverageTrial(300);
const cv269=coverageTrial(269);
assert(Math.abs(cv270.diagnostic.activity300-
  cv270.diagnostic.activity*300/270)<.002);
assert(Math.abs(cv300.diagnostic.activity300-cv300.diagnostic.activity)<.002);
assert.strictEqual(cv269.diagnostic.result,255);
assert.strictEqual(cv269.diagnostic.activity300,null);
assert.strictEqual(cv269.engine.snapshot().levels.slice(-2),"ff");
const cut=cv270.diagnostic.activity*1.05;
assert(cut>0);
const boundary=coverageTrial(270,[cut,cut*2,cut*3,cut*4]);
assert.strictEqual(boundary.diagnostic.result,60,
  "Corrected 270s sum must cross L5/L4 boundary while raw sum would not");

// User-chosen boundaries change only bar stages, not the activity sum.
const custom=trial("x",20,.3,{activityThresholds:[.1,.2,.3,.4]});
assert.strictEqual(custom.data.activity,many.data.activity);
assert.strictEqual(custom.level,0);
assert.strictEqual(r.activityLevel(many.data.activity,[10,20,30,40]),100);
const still=r.create();feed(still,base,base+S);
assert.strictEqual(still.level(base/S),100);
assert.strictEqual(still.snapshot().v,3);
assert.strictEqual(still.snapshot().levels.length,576);
for(const step of [80,800]){
  const x=r.create();feed(x,base,base+S,quiet,step);x.sync(base+S);
  assert.strictEqual(x.level(base/S),100);
}
const gap=r.create();feed(gap,base,base+20000);gap.sample(quiet,base+S);
assert.strictEqual(gap.level(base/S),0);
assert(gap.snapshot().levels.includes("ff")); // missing data is distinct from non-wear

const partial=r.create();feed(partial,base,base+100000);
const resumed=r.create({saved:partial.snapshot(),nowMs:base+101000});
feed(resumed,base+101000,base+S);
assert.strictEqual(resumed.level(base/S),100);
const ring=r.create();feed(ring,base,base+S*289);
assert.strictEqual(ring.level(base/S),0);
assert.strictEqual(ring.level(base/S+288),100);
let visits=[];ring.visit(base+S*289,(b,l)=>visits.push([b,l]));
assert.strictEqual(visits.length,288);
const restored=r.create({saved:ring.snapshot(),nowMs:base+S*289});
assert.strictEqual(restored.level(base/S+288),100);
ring.sample(quiet,base+S*100);
assert.strictEqual(ring.level(base/S+288),0);
const legacy=r.create({saved:{v:1,end:base/S,levels:"5".repeat(288)},nowMs:base+S});
assert.strictEqual(legacy.level(base/S),0);
const lines=[];r.draw({setColor:()=>{},drawLine:(...p)=>lines.push(p)},restored,
  {nowMs:base+S*289,radiusPx:70,maxHeightPx:10,cx:85,cy:90,currentAngleRad:0});
assert.strictEqual(lines.length,288);
for(const [x,y,u,v] of lines){
  assert(Math.abs(Math.hypot(x-85,y-90)-70)<.71);
  assert(Math.abs(Math.hypot(u-85,v-90)-80)<.71);
}
const colors=[],times=[];
r.draw({setColor:c=>colors.push(c),drawLine:()=>{}},
  {visit:(ms,fn)=>{fn(base/S-1,50);fn(base/S,100);}},
  {nowMs:base+S,radiusPx:70,maxHeightPx:10,cx:85,cy:90,
    currentAngleRad:0,isDayAt:ms=>{times.push(ms);return ms>=base+S;}});
assert.deepStrictEqual(times,[base,base+S]);
assert.deepStrictEqual(colors,[0xffe0,0x07e0]);
function environment(start,config={},data,extraModules){
  let now=start,color=0,serial=0,writes=0;
  const log=[],timers=new Map(),store=data||{};
  const cfg=Object.assign({eclipseEnabled:false,restEnabled:true,restBarHeight:10,
    restWearEnabled:false,coordVersion:2,locationSource:"manual",manualLat:25.3,manualLon:-104.1},config);
  const modules=Object.assign({"orbit.rest":"rest.js","orbit.eclipse":"eclipse.js","orbit.ecldraw":"eclipse-render.js",
    "orbit.ecldata":"eclipse-terms.js","orbit.eclsun":"eclipse-sun-terms.js"},extraModules||{});
  const placeReads=[];
  const storage={readJSON:n=>n==="orbit.json"?cfg:n==="setting.json"?{timeout:0}:store[n],
    writeJSON:(n,v)=>{writes++;store[n]=JSON.parse(JSON.stringify(v));},
    read:(n,start,length)=>{
      if(n==="orbitcities.dat"||n==="orbitjp.dat"){
        placeReads.push({name:n,offset:start,length:length});
        if(n==="orbitcities.dat")return fakeCityData.substr(start,length);
        return undefined;
      }
      return modules[n]?(modules[n].indexOf("\n")>=0||modules[n].charAt(0)==="("?
        modules[n]:fs.readFileSync(path.join(__dirname,modules[n]),"utf8")):undefined;
    }};
  const g=new Proxy({getWidth:()=>176,getHeight:()=>176,stringWidth:s=>s.length*8,theme:{bg:0,fg:0xffff}},
    {get:(o,k)=>k in o?o[k]:k==="transformVertices"?undefined:(...args)=>{
      if(k==="setColor")color=args[0];log.push({op:k,args,color});return g;}});
  const b=new EventEmitter(),events=new EventEmitter(),locks=[],lights=[];
  for(const n of ["setGPSPower","loadWidgets","drawWidgets"])
    b[n]=()=>{};
  b.setUI=ui=>{b.ui=ui;};
  b.showLauncher=()=>log.push({op:"showLauncher"});
  b.setLocked=v=>locks.push([now,v]);
  b.setBacklight=v=>lights.push([now,v]);
  const power=[];b.setHRMPower=(on,id)=>{power.push([now,on,id]);return !!on;};
  b.isLCDOn=()=>true;
  class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
  let placeIndexLoads=0;
  const fakeCountries=["Afghanistan","Albania","Algeria","Andorra","Angola",
    "Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
    "Azerbaijan","Belgium","Japan","Zimbabwe"].map(n=>[n,[[n+" City",0,0]]]);
  const cityLines=fakeCountries.map(c=>JSON.stringify(c[1])+"\n");
  const fakeCityData=cityLines.join("");
  const cityOffsets=[0];
  for(const line of cityLines)cityOffsets.push(cityOffsets.at(-1)+line.length);
  const locData={countryNames:fakeCountries.map(c=>c[0]).join("|"),
    countryCount:fakeCountries.length,cityOffsets:cityOffsets,
    prefs:[["Tokyo",[["Chiyoda-ku",35.69,139.75]]]],jpidx:[]};
  const context={Date:Clock,g,Bangle:b,E:events,require:n=>{
    if(n==="Storage")return storage;
    if(n==="orbitloc"){placeIndexLoads++;return locData;}
    if(n==="orbittz")return {get:()=>[540,0]};
    throw new Error("Unknown module "+n);
  },
    setTimeout:(f,ms)=>{timers.set(++serial,{f,ms,at:now+ms});return serial;},clearTimeout:id=>timers.delete(id),load:()=>{}};
  function execute(file){return vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),"utf8"),context);}
  function advance(t){
    for(;;){const due=[...timers].filter(([id,x])=>x.at<=t).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!due)break;timers.delete(due[0]);now=due[1].at;due[1].f();}
    now=t;
  }
  return {b,events,log,timers,cfg,store,storage,placeReads,
    placeIndexLoads:()=>placeIndexLoads,
    execute,power,locks,lights,advance,writes:()=>writes,setNow:t=>now=t,
    feed:(end,a=quiet)=>{for(let t=now;t<=end;t+=800){now=t;b.emit("accel",a);}now=end;}};
}

// Boot/app integration, continuous recording while display is off and persistence.
const app=environment(base);
app.execute("boot.js");assert.strictEqual(app.b.listenerCount("accel"),1);
app.execute("app.js");assert.strictEqual(app.b.listenerCount("accel"),1);
assert([...app.timers.values()].some(x=>x.ms<=10000),
  "Backlight must have a finite default-off timer");
app.advance(base+10000);
assert(app.lights.some(x=>x[1]===false)&&app.locks.some(x=>x[1]===true),
  "Idle must disable both the backlight and the touchscreen");
app.b.emit("faceUp",true);
assert.strictEqual(app.locks.at(-1)[1],false); // wrist raise wakes and unlocks
assert.strictEqual(app.lights.at(-1)[1],true);
const writes=app.writes();app.feed(base+S);app.b.orbitRest.sync(base+S);
assert.strictEqual(app.writes()-writes,1);
app.log.length=0;app.b.emit("lcdPower",true);
assert(app.log.some(x=>x.op==="drawString"&&x.args[0]==="Orbit..."));
app.advance(base+S+1); // Complete the deferred clock redraw after first frame.
const graph=app.log.findIndex(x=>x.op==="drawLine"&&x.color===0x07e0);
const observer=app.log.findIndex(x=>x.op==="fillCircle"&&x.color===0xf800&&x.args[2]===2);
assert(graph>=0&&observer>graph);
// v0.078: dial glyphs are drawn BEFORE the rest bars and non-wear arcs.
// The red observer marker must remain above both.
const layered=environment(base,{orbitHourEnabled:true,orbitHourStep:3,restWearEnabled:false},
  {"orbit.rest.json":{v:3,end:base/S-1,levels:"ff".repeat(287)+"64"}});
layered.execute("boot.js");layered.execute("app.js");
const dialIndices=[];
layered.log.forEach((e,i)=>{
  if(e.op==="drawString"&&/^(XII|I|II|III|IV|V|VI|VII|VIII|IX|X|XI)$/.test(e.args[0]))
    dialIndices.push(i);
});
assert.strictEqual(dialIndices.length,8,"All dial numerals must be rendered");
const lastDial=dialIndices[dialIndices.length-1];
const restOnTop=layered.log.findIndex((e,i)=>i>lastDial&&e.op==="drawLine"&&
  (e.color===0x07E0||e.color===0xFFE0));
const pointOnTop=layered.log.findIndex((e,i)=>i>restOnTop&&e.op==="fillCircle"&&
  e.color===0xF800&&e.args[2]===2);
assert(restOnTop>lastDial&&pointOnTop>restOnTop,
  "Dial must be behind rest graph, with red observer marker on top");
app.b.emit("lcdPower",false);assert.strictEqual(app.timers.size,0);
app.feed(base+S*2);
app.b.orbitRest.sync(base+S*2);
assert.strictEqual(app.b.orbitRest.getEngine().level(base/S+1),100);
app.events.emit("kill");
const other=environment(base+S*2+1000,{},app.store);
other.execute("boot.js");
assert.strictEqual(other.b.orbitRest.getEngine().level(base/S+1),100);
other.b.orbitRest.configure({restEnabled:false});
assert.strictEqual(other.b.listenerCount("accel"),0);
other.b.orbitRest.configure({restEnabled:true,restThreshold:.027});
assert.strictEqual(other.b.listenerCount("accel"),1);
const off=environment(base,{restEnabled:false});
off.execute("boot.js");off.execute("app.js");
assert.strictEqual(off.b.listenerCount("accel"),0);
// Menus expose five-level height, seven 3-axis peak gates and four boundaries.
const menus=[];app.events.showMenu=m=>menus.push(m);
app.execute("settings.js")(()=>{});
assert.strictEqual(menus.at(-1)[""].title,"tenkyu v0.080");
assert(!menus.at(-1)["Version"],"Version is a static title, not a button");
menus.at(-1)["Rest graph"]();
assert.strictEqual(menus.at(-1)["Max bar height"].max,14);
menus.at(-1)["Max bar height"].onchange(14);
assert.strictEqual(app.cfg.restBarHeight,14);
const q=menus.at(-1)["Peak gate"];
assert.strictEqual(q.max,6);
for(let i=0;i<7;i++){q.onchange(i);assert.strictEqual(app.cfg.restThreshold,r.thresholds[i]);}
menus.at(-1)["Stage boundaries"]();
assert.deepStrictEqual([1,2,3,4].map(i=>app.cfg["restActivityT"+i]),r.activityDefaults);
const newLevel=menus.at(-1)["L5/4 boundary"];
newLevel.onchange(.6);
assert.strictEqual(app.cfg.restActivityT1,.6);
assert.strictEqual(app.cfg.restActivityT2,2);
menus.at(-1)["< Back"]();
menus.at(-1)["Non-wear"]();
menus.at(-1)["3D drift"].onchange(0);
assert.strictEqual(app.cfg.restWearThreshold,.001);
assert(!menus.at(-1)["Min pulse BPM"]&&!menus.at(-1)["Max pulse BPM"]);
assert(!("restPulseMin" in app.cfg)&&!("restPulseMax" in app.cfg));
assert(menus.at(-1)["Pulse confidence"]);
assert(menus.at(-1)["Keep until move"]);
menus.at(-1)["< Back"](); // Rest graph menu
menus.at(-1)["Last check"]();
assert(menus.at(-1)["Reason"]);
assert(menus.at(-1)["Pulse"]);
assert(menus.at(-1)["Hold"]);
assert(menus.at(-1)["Shared HRM"]);
assert(menus.at(-1)["Conf."]);
assert(menus.at(-1)["3D drift"]);
assert(menus.at(-1)["Peak sum"]);
assert(menus.at(-1)["Data"]);
assert(menus.at(-1)["Raw sum"],"Valid latest check exposes raw and corrected sums");
// Location must acknowledge the click immediately and open on the next tick.
// Long country lists are split into initial-letter groups and 7-item pages.
const loc=environment(base);
const locMenus=[];
loc.events.showMenu=m=>locMenus.push(m);
loc.execute("settings.js")(()=>{});
locMenus.at(-1)["Location"]();
assert(locMenus.at(-1)["Place name"],"Location menu must expose Place name");
locMenus.at(-1)["Place name"]();
assert(loc.log.some(x=>x.op==="drawString"&&x.args[0]==="Places..."));
assert(locMenus.at(-1)["Country"],"Place menu must open immediately, without timers");
assert.strictEqual(loc.placeIndexLoads(),0,"No data may be loaded before the first menu");
loc.advance(base+1);
assert.strictEqual(loc.placeReads.length,0,"Initial place screen must not load cities or municipality");
assert.strictEqual(loc.placeIndexLoads(),0,
  "Place name first screen must not even require the location index");
assert(locMenus.at(-1)["Country"],"Place selection must open after visible ACK");
locMenus.at(-1)["Country"]();
assert(loc.log.some(x=>x.op==="drawString"&&x.args[0]==="Countries..."));
loc.advance(base+2);
assert(locMenus.at(-1)["A-D"]&&locMenus.at(-1)["U-Z"]);
assert.strictEqual(loc.placeIndexLoads(),1,
  "Country index must be required only after requesting Country");
locMenus.at(-1)["A-D"]();
assert(locMenus.at(-1)["A (11)"]);
locMenus.at(-1)["A (11)"]();
assert(locMenus.at(-1)["Afghanistan"]);
assert(locMenus.at(-1)["Next >"]);
locMenus.at(-1)["Next >"]();
assert(locMenus.at(-1)["< Previous"]);
locMenus.at(-1)["< Previous"]();
locMenus.at(-1)["Afghanistan"]();
loc.advance(base+3);
assert.strictEqual(loc.cfg.countryName,"Afghanistan");
assert.strictEqual(loc.placeReads.length,0,"Country selection must only change index");
assert(locMenus.at(-1)["City"],"Open cities only when user requests a city");
locMenus.at(-1)["City"]();
loc.advance(base+4);
assert.strictEqual(loc.placeReads.length,1);
assert.strictEqual(loc.placeReads[0].name,"orbitcities.dat");
assert(locMenus.at(-1)["Afghanistan City"]);
locMenus.at(-1)["Afghanistan City"]();
assert.strictEqual(loc.cfg.locName,"Afghanistan City");
assert(locMenus.at(-1)["Use place"]);
locMenus.at(-1)["Country"]();
loc.advance(base+5);
locMenus.at(-1)["Japan (quick)"]();
loc.advance(base+6);
assert.strictEqual(loc.cfg.countryName,"Japan");
assert(locMenus.at(-1)["Prefecture"]);
assert.strictEqual(loc.placeReads.length,1,
  "Japan opening must not load municipalities before selecting Municipality");
locMenus.at(-1)["Municipality"]();
loc.advance(base+7);
assert(locMenus.at(-1)["Chiyoda-ku"]);
// Day/night timestamps and backward-compatible v2 percentage history render.
for(const [iso,c] of [["2026-10-19T18:00:00Z",0x07e0],["2026-10-19T06:00:00Z",0xffe0]]){
  const now=Date.parse(iso),end=Math.floor(now/S);
  const h=environment(now,{},{"orbit.rest.json":{v:2,end:end-1,
    levels:"64".repeat(288),active:{bucket:end,covered:0,peaks:0,quietPeaks:0}}});
  h.execute("boot.js");h.execute("app.js");
  const bars=h.log.filter(x=>x.op==="drawLine"&&(x.color===0x07e0||x.color===0xffe0));
  assert.strictEqual(bars.length,288);
  assert(bars.some(x=>x.color===0x07e0)&&bars.some(x=>x.color===0xffe0));
  assert.strictEqual(bars.at(-1).color,c);
}
// A five-minute HRM probe prevents a motionless unworn watch being drawn.
function runWear(pulse,zAt=()=>1,cfg={}){
  const h=environment(base,Object.assign({restWearEnabled:true},cfg));
  h.execute("boot.js");
  for(let t=0;t<=S;t+=1000){
    h.advance(base+t);
    const v=zAt(t),xyz=typeof v==="number"?{x:0,y:0,z:v}:v;
    h.b.emit("accel",Object.assign({mag:1,diff:0},xyz));
    if(t===280000)h.b.emit("HRM",pulse||{bpm:0,confidence:0});
  }
  return h;
}
const nw=runWear();assert.strictEqual(nw.b.orbitRest.getEngine().level(base/S),0);
assert.strictEqual(nw.b.orbitRest.getDiagnostics().recent.at(-1).reason,"nonwear");
// Non-wear (FE) is a red *one-pixel arc on the lunar orbit*, never a bar.
// No-data (FF) must not be drawn red. The original five-stage bars remain.
function restStrokes(engine,ms){
  const lines=[];let ink;
  const graphics={setColor:c=>{ink=c;return graphics;},
    drawLine:(...p)=>lines.push({color:ink,points:p})};
  r.draw(graphics,engine,{nowMs:ms,radiusPx:70,maxHeightPx:10,
    cx:85,cy:90,south:false,currentAngleRad:0,isDayAt:()=>true});
  return lines;
}
const arcLines=restStrokes(nw.b.orbitRest.getEngine(),base+S+1000);
assert.strictEqual(arcLines.length,1);
assert.strictEqual(arcLines[0].color,0xF800);
const [x1,y1,x2,y2]=arcLines[0].points;
assert(Math.abs(Math.hypot(x1-85,y1-90)-70)<1,"Red start must lie on the orbit");
assert(Math.abs(Math.hypot(x2-85,y2-90)-70)<1,"Red end must lie on the orbit");
assert(Math.hypot(x1-x2,y1-y2)<=3,"Five-minute arc must stay short");
const missing=r.create({wearEnabled:true,nowMs:base});
feed(missing,base,base+100000);
missing.sync(base+S);
assert.strictEqual(missing.snapshot().levels.slice(-2),"ff");
assert.deepStrictEqual(restStrokes(missing,base+S+1000),[],
  "Unknown data must not be painted red");
const restoredNonWear=r.create({saved:nw.b.orbitRest.getEngine().snapshot(),
  nowMs:base+S+1000});
assert.deepStrictEqual(restStrokes(restoredNonWear,base+S+1000),arcLines,
  "Unworn red arcs must survive saving and reopening the clock");
const normalBar=restStrokes(high,base+S*2);
assert(normalBar.length===1&&normalBar[0].color===0x07E0,
  "Normal motion must retain its green radial bar");
// Full-day absence paints 288 joined red chords on the existing orbit.
const allOff=r.create({saved:{v:3,end:base/S+287,
  levels:"fe".repeat(288)},nowMs:base+S*288+1000});
const allOffLines=restStrokes(allOff,base+S*288+1000);
assert.strictEqual(allOffLines.length,288);
assert(allOffLines.every(x=>x.color===0xF800));
for(let i=1;i<allOffLines.length;i++)
  assert.deepStrictEqual(allOffLines[i-1].points.slice(2),
    allOffLines[i].points.slice(0,2),
    "Adjacent non-wear arcs must join without angular gaps");
// A legacy v2 code 00 is "missing", not a red non-wear interval.
const legacyMissing=r.create({saved:{v:2,end:base/S,
  levels:"ff".repeat(287)+"00"},nowMs:base+S+1000});
assert.deepStrictEqual(restStrokes(legacyMissing,base+S+1000),[]);
// 297 seconds are more than 270s coverage and are valid for non-wear.
// Previous code incorrectly required a sample within 2.5s of the slot start.
const lateStart=environment(base+3000,{restWearEnabled:true});
lateStart.execute("boot.js");
for(let t=3000;t<=S;t+=1000){
  lateStart.advance(base+t);
  lateStart.b.emit("accel",{x:0,y:0,z:1,mag:1,diff:0});
  if(t===280000)lateStart.b.emit("HRM",{bpm:0,confidence:0});
}
assert.strictEqual(lateStart.b.orbitRest.getEngine().snapshot().levels.slice(-2),"fe");
assert.strictEqual(lateStart.b.orbitRest.getDiagnostics().recent.at(-1).reason,"nonwear");
// Unknown/failed pulse on a motionless clock is non-wear (FE), not stage 5.
const skipped=r.create({wearEnabled:true,wearThresholdG:.009,nowMs:base});
feed(skipped,base,base+S);
assert.strictEqual(skipped.snapshot().levels.slice(-2),"fe");
assert.strictEqual(skipped.getDiagnostics().recent.at(-1).reason,"nonwear_hrm_unknown");
const failed=r.create({wearEnabled:true,nowMs:base});
feed(failed,base,base+S);
failed.failedProbe(base/S);
assert.strictEqual(failed.snapshot().levels.slice(-2),"fd");
assert.strictEqual(failed.getDiagnostics().recent.at(-1).reason,"nonwear_hrm_failed");
const whiteLines=restStrokes(failed,base+S+1000);
assert.strictEqual(whiteLines.length,1);
assert.strictEqual(whiteLines[0].color,0xFFFF,
  "Failed HRM must produce a white orbital arc");
// Failure backoff: +60 seconds once, then +900 seconds.
const retry=environment(base,{restWearEnabled:true});
let badStarts=0;
retry.b.setHRMPower=on=>{if(on)badStarts++;return !on;};
retry.execute("boot.js");
for(let t=0;t<=1230000;t+=1000){
  retry.advance(base+t);
  retry.b.emit("accel",{x:0,y:0,z:1});
  if(t===270000||t===330000||t===1230000)
    assert.strictEqual(badStarts,t===270000?1:t===330000?2:3);
}
assert.strictEqual(badStarts,3);
assert.strictEqual(retry.b.orbitRest.getEngine().snapshot().levels.slice(-2),"fd");
assert(restStrokes(retry.b.orbitRest.getEngine(),base+1230000)
  .every(line=>line.color===0xFFFF));
const rejected=environment(base,{restWearEnabled:true});
rejected.b.setHRMPower=(on)=>!on; // Hardware declines the HRM-power request.
rejected.execute("boot.js");
for(let t=0;t<=S;t+=1000){
  rejected.advance(base+t);
  rejected.b.emit("accel",{x:0,y:0,z:1});
}
assert.strictEqual(rejected.b.orbitRest.getEngine().snapshot().levels.slice(-2),"fd");
assert.strictEqual(rejected.b.orbitRest.getDiagnostics().recent.at(-1).reason,"nonwear_hrm_failed");
// A late no-pulse callback still updates the just-closed five-minute bin.
skipped.absentPulse(base/S);
assert.strictEqual(skipped.snapshot().levels.slice(-2),"fe");
assert.strictEqual(skipped.getDiagnostics().recent.at(-1).reason,"nonwear");
assert(nw.b.orbitRest.getEngine().snapshot().levels.endsWith("fe"));
assert.deepStrictEqual(nw.power,[[base+270000,1,"orbitrest"],[base+S,0,"orbitrest"]]);
assert.strictEqual(nw.b.listenerCount("HRM"),0);
// Motion detected before the HRM window must save all optical LED energy.
const moving=runWear(null,t=>({x:.6+.02*t/S,y:.8,z:0}));
assert.deepStrictEqual(moving.power,[],
  "Motion establishes wearing without any optical HRM probe");
// Reuse HRM readings from another app's power request, without
// overriding its power state or starting a duplicate optical probe.
const shared=environment(base,{restWearEnabled:true});
shared.b.isHRMOn=()=>true;
shared.execute("boot.js");
for(let t=0;t<=S*2;t+=1000){
  shared.advance(base+t);
  shared.b.emit("accel",{x:0,y:0,z:1});
  if(t===260000)shared.b.emit("HRM",{bpm:68,confidence:95});
}
assert.deepStrictEqual(shared.power,[],
  "Reliable HRM reading from an existing owner must avoid own power requests");
assert.strictEqual(shared.b.orbitRest.getEngine().snapshot().levels.slice(-2),"64");
assert(shared.b.orbitRest.getDiagnostics().sharedPulseCount>=1);
assert.strictEqual(shared.b.listenerCount("HRM"),1);
// A powered external sensor without a good pulse is observed passively
// and never switched off by tenkyu (even when the window times out).
const passive=environment(base,{restWearEnabled:true});
passive.b.isHRMOn=()=>true;
passive.execute("boot.js");
for(let t=0;t<=S;t+=1000){
  passive.advance(base+t);passive.b.emit("accel",{x:0,y:0,z:1});
  if(t===280000)passive.b.emit("HRM",{bpm:0,confidence:0});
}
assert.deepStrictEqual(passive.power,[]);
assert.strictEqual(passive.b.orbitRest.getEngine().snapshot().levels.slice(-2),"fe");
const detected=runWear({bpm:60,confidence:91});
assert.strictEqual(detected.b.orbitRest.getEngine().level(base/S),100);
assert.deepStrictEqual(detected.power,[[base+270000,1,"orbitrest"],[base+280000,0,"orbitrest"]]);
assert.strictEqual(detected.b.orbitRest.getDiagnostics().recent.at(-1).reason,"pulse_detected_still");
// After a valid early HRM detection, do not immediately start a second
// optical probe during the same 5-minute interval.
assert.deepStrictEqual(detected.power.filter(x=>x[1]===1).map(x=>x[0]),[base+270000]);
assert.strictEqual(detected.b.orbitRest.isProbing(),false);
assert.strictEqual(nw.b.orbitRest.isProbing(),false);
// A new movement during an already-running probe must release the LED
// before the five-minute boundary, not leave it on for the full window.
const interrupted=environment(base,{restWearEnabled:true});
interrupted.execute("boot.js");
for(let t=0;t<=S;t+=1000){
  interrupted.advance(base+t);
  interrupted.b.emit("accel",{x:t>=275000?.06:0,y:0,z:1});
}
assert.deepStrictEqual(interrupted.power.slice(0,2).map(q=>q[1]),[1,0]);
assert(interrupted.power[1][0]<base+S,
  "Motion must turn the optical sensor off before its timeout");
assert.strictEqual(interrupted.b.orbitRest.isProbing(),false);
assert.strictEqual(interrupted.b.listenerCount("HRM"),0);
assert.strictEqual(detected.b.orbitRest.getDiagnostics().recent.at(-1).confidence,91);
assert.strictEqual(runWear({bpm:60,confidence:90}).b.orbitRest.getEngine().level(base/S),0,
  "Confidence equal to configured threshold is insufficient");
assert.strictEqual(runWear({bpm:60,confidence:89}).b.orbitRest.getEngine().level(base/S),0);
assert.strictEqual(runWear({bpm:10,confidence:95}).b.orbitRest.getEngine().level(base/S),100);
assert.strictEqual(runWear({bpm:260,confidence:95}).b.orbitRest.getEngine().level(base/S),100);
assert.strictEqual(runWear({bpm:0,confidence:100}).b.orbitRest.getEngine().level(base/S),0);
assert.strictEqual(runWear(null,t=>1+t/S*.02).b.orbitRest.getEngine().snapshot().levels.slice(-2),"64");
// Wristband may be vertical, sideways or tilted on a table: one shared 3D
// vector-drift threshold must recognize all constant orientations as unworn.
for(const vector of [
  {x:0,y:0,z:1}, {x:1,y:0,z:0}, {x:0,y:-1,z:0},
  {x:.6,y:.8,z:0}, {x:.3,y:.4,z:Math.sqrt(.75)}
]){
  const e=runWear(null,()=>vector).b.orbitRest.getEngine();
  assert.strictEqual(e.snapshot().levels.slice(-2),"fe",
    "Motionless watch must be unworn in any orientation");
}
// Changes in X or Y alone disqualify stillness and must show a bar
// irrespective of pulse, even when the Z peak-rate stays at stage 5.
for(const axis of ["x","y","z"]){
  const e=runWear(null,t=>{
    const a={x:.6,y:.8,z:0};
    a[axis]+=.02*t/S;
    return a;
  }).b.orbitRest.getEngine();
  assert.strictEqual(e.snapshot().levels.slice(-2),"64",
    "3D movement on "+axis+" must plot rest independently of pulse");
  assert.strictEqual(e.getDiagnostics().recent.at(-1).reason,"motion");
}
// The scalar is an orientation-independent g threshold, not per-axis thresholds.
const relaxed=runWear(null,t=>({x:.6+t/S*.02,y:.8,z:0}),
  {restWearThreshold:.027}).b.orbitRest.getEngine();
assert.strictEqual(relaxed.snapshot().levels.slice(-2),"fe");
// A single 40 mg impulse among fast 80ms samples should average out
// over the 1s window instead of defeating the non-wear classification.
const filtered=r.create({wearThresholdG:.009,wearEnabled:true});
for(let t=0;t<=S;t+=80){
  filtered.sample({x:t===150040?.04:0,y:0,z:1},base+t);
}
filtered.absentPulse(base/S);
filtered.sync(base+S);
assert.strictEqual(filtered.snapshot().levels.slice(-2),"fe");
// One invalid reading is not sufficient to erase 270+ seconds of good
// motionless XYZ coverage. Repeated missing readings still mean unknown.
const badAxis=r.create({wearEnabled:true});
for(let t=0;t<=S;t+=1000){
  const a=t===4000?{z:1}:{x:0,y:0,z:1};
  badAxis.sample(a,base+t);
}
badAxis.absentPulse(base/S);badAxis.sync(base+S);
assert.strictEqual(badAxis.snapshot().levels.slice(-2),"fe",
  "One missing XYZ reading must not hide non-wear red arc");
const repeatedMissing=r.create({wearEnabled:true});
for(let t=0;t<=S;t+=1000)
  repeatedMissing.sample(t%3000===0?{z:1}:{x:0,y:0,z:1},base+t);
repeatedMissing.absentPulse(base/S);repeatedMissing.sync(base+S);
assert.strictEqual(repeatedMissing.snapshot().levels.slice(-2),"ff");
// Completion callback 3.5 seconds late: the previous code ignored this
// result and permanently displayed a stage-5 bar for an unworn watch.
const delayed=environment(base,{restWearEnabled:true});
delayed.execute("boot.js");
for(let t=0;t<=270000;t+=1000){
  delayed.advance(base+t);delayed.b.emit("accel",{x:0,y:0,z:1});
}
const endTimer=[...delayed.timers.values()].find(x=>x.at===base+S);
assert(endTimer,"HRM end timer must be scheduled");
endTimer.at+=3500;
for(let t=271000;t<=S;t+=1000){
  delayed.advance(base+t);delayed.b.emit("accel",{x:0,y:0,z:1});
  if(t===280000)delayed.b.emit("HRM",{bpm:0,confidence:0});
}
assert.strictEqual(delayed.b.orbitRest.getEngine().snapshot().levels.slice(-2),"fe");
assert.strictEqual(delayed.b.orbitRest.getDiagnostics().recent.at(-1).reason,"nonwear_hrm_unknown");
delayed.advance(base+S+3500);
assert.strictEqual(delayed.b.orbitRest.getEngine().snapshot().levels.slice(-2),"fe");
assert.strictEqual(delayed.b.orbitRest.getDiagnostics().recent.at(-1).reason,"nonwear");
// Missing three-axis coverage is an independent reason, not false non-wear.
const killing=environment(base,{restWearEnabled:true});
killing.execute("boot.js");killing.advance(base+270000);
killing.events.emit("kill");
assert.strictEqual(killing.b.listenerCount("HRM"),0);
assert.strictEqual(killing.timers.size,0);
// Acknowledgement must precede expensive screen creation, tested via the UI.
const fakeCalendar="({create:function(){var live=false,onReturn;" +
  "return {isActive:function(){return live},stop:function(){live=false}," +
  "start:function(opts){live=true;onReturn=opts.onReturn;" +
  "g.drawString('CALENDAR READY',10,80);g.flip()}," +
  "touch:function(){if(onReturn)onReturn(undefined)},swipe:function(){}};}})";
const nav=environment(base,{},undefined,{"orbit.cal.js":fakeCalendar});
nav.execute("boot.js");nav.execute("app.js");nav.log.length=0;
nav.b.ui.touch(1,{x:50,y:70});
assert(nav.log.some(x=>x.op==="fillCircle"),"First tap needs instant cue");
nav.advance(base+400);
const calendarAck=nav.log.findIndex(x=>x.op==="drawString"&&x.args[0]==="Calendar...");
const calendarReady=nav.log.findIndex(x=>x.op==="drawString"&&x.args[0]==="CALENDAR READY");
assert(calendarAck>=0&& (calendarReady<0||calendarAck<calendarReady),
 "Calendar acknowledgement must precede its full render");
nav.advance(base+401);
assert(nav.log.some(x=>x.op==="drawString"&&x.args[0]==="CALENDAR READY"));
nav.log.length=0;
nav.b.ui.touch(1,{x:50,y:70});
assert(nav.log.some(x=>x.op==="drawString"&&x.args[0]==="Orbit..."));
const beforeReturn=nav.log.filter(x=>x.op==="drawString").length;
nav.advance(base+402);
assert(nav.log.filter(x=>x.op==="drawString").length>beforeReturn);
const navSettings=environment(base,{},undefined,{"orbit.settings.js":
  "(function(back){g.drawString('SETTINGS READY',10,80);g.flip();})"});
navSettings.execute("boot.js");navSettings.execute("app.js");
navSettings.log.length=0;
navSettings.b.ui.touch(1,{x:30,y:60});
navSettings.b.ui.touch(1,{x:30,y:60});
assert(navSettings.log.some(x=>x.op==="drawString"&&x.args[0]==="Settings..."));
assert(!navSettings.log.some(x=>x.op==="drawString"&&x.args[0]==="SETTINGS READY"));
navSettings.advance(base+1);
assert(navSettings.log.some(x=>x.op==="drawString"&&x.args[0]==="SETTINGS READY"));
const navWake=environment(base);
navWake.execute("app.js");navWake.log.length=0;
navWake.b.emit("lcdPower",true);
assert(navWake.log.some(x=>x.op==="drawString"&&x.args[0]==="Orbit..."));
navWake.advance(base+1);
assert([...navWake.timers.values()].some(x=>x.ms<=10000),
  "LCD wake must re-arm its idle timeout");
const navButton=environment(base);
navButton.execute("app.js");navButton.log.length=0;
navButton.b.ui.btn();
assert(navButton.log.some(x=>x.op==="drawString"&&x.args[0]==="Launcher..."));
assert(!navButton.log.some(x=>x.op==="showLauncher"));
navButton.advance(base+1);
assert(navButton.log.some(x=>x.op==="showLauncher"));
// Repeated 12.5 Hz accelerometer events should not allocate growing sample arrays.
const perf=r.create({thresholdG:.027});
const benchStart=Date.now(),benchSamples=15000;
for(let i=0;i<benchSamples;i++){
  const t=i*80;
  perf.sample({x:0,y:0,z:1+(t%8000===80?.01:0)},base+t);
}
perf.sync(base+benchSamples*80);
assert.strictEqual(perf.snapshot().v,3);
console.log("Accelerometer CPU benchmark: "+benchSamples+
  " synthetic 12.5 Hz samples in "+(Date.now()-benchStart)+" ms (Node runtime; not watch power)");
console.log("PASS: tap/calendar/settings/wake/launcher immediate acknowledgement,");
console.log("motion-first HRM-independent bars, still/no-pulse stage 0, still/pulse stage 5,");
console.log("robust slot finalization, three-way HRM status,");
console.log("bounded persisted diagnostics, 3-axis stillness and 1s filtering,");
console.log("five-stage 3D peak amplitude sum, v3 storage, early HRM-off,");
console.log("12.5Hz events, 24 h history, idle lock/wake, app drawing.");
