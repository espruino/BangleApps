/* global Map, Proxy, __dirname */
/* Run: node apps/orbit/test.js. No dependency packages required.
 * NASA reference: SE2017Aug21Tbeselm.html / SE2024Apr08Tbeselm.html at
 * https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/ .
 * 2017 remembered 37.6N,89.1W refers to greatest duration, NOT greatest eclipse.
 * Tests report geographic AND projected errors at the requested R=48 pixels.
 * Test harness is Node-only and is not installed on the watch.
 */
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path");
const e=require("./eclipse.js"),renderer=require("./eclipse-render.js"),rad=Math.PI/180;
const refs=[
  {date:"2017-08-21T18:25:31.800Z",dt:68.4,lat:36+58/60,lon:-(87+40.3/60),
    x:[-0.129576,0.5406409,-0.0000293,-0.0000081],
    y:[0.485417,-0.1416394,-0.0000905,0.0000021],d:[11.86697,-0.013622,-0.000002],mu:[89.24545,15.003937]},
  {date:"2024-04-08T18:17:18.300Z",dt:70.6,lat:25+17.2/60,lon:-(104+8.3/60),
    x:[-0.318157,0.5117105,0.0000326,-0.0000085],
    y:[0.219747,0.2709586,-0.0000594,-0.0000047],d:[7.58620,0.014844,-0.000002],mu:[89.59122,15.004084]}
];
function projectedError(a,b,r=48){
  const xy=p=>[r*Math.cos(p.lat*rad)*Math.cos(p.lon*rad),r*Math.cos(p.lat*rad)*Math.sin(p.lon*rad)];
  const x=xy(a),y=xy(b);return Math.hypot(x[0]-y[0],x[1]-y[1]);
}
function besselReference(ref,date){
  const ut=date.getUTCHours()+date.getUTCMinutes()/60+(date.getUTCSeconds()+date.getUTCMilliseconds()/1000)/3600;
  const t=ut+ref.dt/3600-18,poly=a=>a.reduce((s,c,i)=>s+c*Math.pow(t,i),0);
  const x=poly(ref.x)*6378.137,y=poly(ref.y)*6378.137,d=poly(ref.d)*rad;
  // NASA mu polynomial has zero Delta T convention; restore UT rotation.
  const m=(poly(ref.mu)-ref.dt*360.98564736629/86400)*rad;
  const c=[x*Math.sin(m)-y*Math.sin(d)*Math.cos(m),x*Math.cos(m)+y*Math.sin(d)*Math.sin(m),y*Math.cos(d)];
  const u=[-Math.cos(d)*Math.cos(m),Math.cos(d)*Math.sin(m),-Math.sin(d)];
  const p=e.intersectWGS84Km({c:c,u:u,mu:-380000});
  return p?{lat:Math.atan2(p[2],(1-e.constants.eccentricitySquared)*Math.hypot(p[0],p[1]))/rad,
    lon:Math.atan2(p[1],p[0])/rad}:null;
}
for(const ref of refs){
  const date=new Date(ref.date),a=e.prepare(date,{deltaT:ref.dt}),r=a.result;
  assert(r.axisHitsEarth&&r.type==="total");
  const dl=r.lat-ref.lat,dn=r.lon-ref.lon,px=projectedError(r,ref);
  console.log(ref.date,JSON.stringify({lat:r.lat,lon:r.lon,latErrorDeg:dl,lonErrorDeg:dn,errorPx48:px}));
  if(Math.abs(dl)>1||Math.abs(dn)>1){
    console.error("Suspect TT/UTC, degrees/radians, longitude sign/frame, solar low-precision formula or lunar terms.");
  }
  assert(Math.abs(dl)<1&&Math.abs(dn)<1);assert(px<0.5);
  assert(e.obscurationKm(a,...e.geodeticVectorKm(r.lat,r.lon))===1);
  assert(e.obscurationKm(a,...e.geodeticVectorKm(-r.lat,r.lon+180))===0);
  assert(projectedError(besselReference(ref,date),ref)<0.002);
  let worst=0,count=0,contactDisagreements=0;
  for(let minute=0;minute<=360;minute++){
    const d=new Date(ref.date.substr(0,10)+"T15:00:00Z");d.setUTCMinutes(minute);
    const b=besselReference(ref,d),model=e.prepare(d,{deltaT:ref.dt}),p=model.result;
    if(model.active)assert(e.shadowPossible(d),"Conservative gate missed penumbra");
    if(b&&p.axisHitsEarth){worst=Math.max(worst,projectedError(p,b));count++;}
    else if(!!b!==p.axisHitsEarth)contactDisagreements++;
  }
  console.log("NASA Bessel minute sweep",ref.date.substr(0,10),{samples:count,worstErrorPx48:worst,contactDisagreements});
  assert(worst<0.5,"Common-hit samples exceed target; suspect lunar series near contacts");
}
// Meeus ch.47 published worked example, epoch in TT.
const t=(Date.parse("1992-04-12T00:00:00Z")/86400000+2440587.5-2451545)/36525;
const moon=e.moonEclipticKm(t,{psi:0});
assert(Math.abs(moon.lonRad/rad-133.162655)<0.000002);
assert(Math.abs(moon.latRad/rad+3.229126)<0.000002);
assert(Math.abs(moon.distanceKm-368409.7)<0.1);
assert.strictEqual(e.diskObscuration(0,1,2),1);
assert.strictEqual(e.diskObscuration(0,2,1),0.25);
assert.strictEqual(e.diskObscuration(4,1,1),0);
assert(Math.abs(e.diskObscuration(1,1,1)-0.3910022189557707)<1e-12);
assert.throws(()=>e.calculate(new Date(NaN)));
assert.throws(()=>e.calculate(new Date(),{deltaT:NaN}));
// Partial-only: the axis misses Earth, but the penumbra is displayed.
const partial=e.prepare(new Date("2025-03-29T10:47:00Z"));
assert(!partial.result.axisHitsEarth&&partial.active);
assert(e.obscurationKm(partial,...e.geodeticVectorKm(65,-60))>0);
const annular=e.prepare(new Date("2023-10-14T18:00:00Z"));
assert(annular.result.type==="annular");
const af=e.obscurationKm(annular,...e.geodeticVectorKm(annular.result.lat,annular.result.lon));
assert(af>0&&af<1);
assert(!e.prepare(new Date("2024-04-23T12:00:00Z")).active); // full Moon: no false eclipse
assert(!e.nearNewMoon(new Date("2024-04-23T12:00:00Z")));
// Cache, partial rendering, clip to disk and one-pixel total center.
let calls=0;
const wrapped=Object.assign({},e,{prepare:(...a)=>{calls++;return e.prepare(...a);}});
const display=renderer.create(wrapped),date=new Date(refs[1].date);
display.update(date);display.update(date);assert.strictEqual(calls,1);
display.update(new Date(+date+30000));assert.strictEqual(calls,2);
const pixels=[];
display.draw({setColor:()=>{},setPixel:(x,y)=>pixels.push([x,y])},
  {radiusPx:48,cx:60,cy:60,longitudeDeg:0,south:false,rotationRad:0});
assert(pixels.length>1&&pixels.length<Math.PI*48*48);
assert(pixels.every(([x,y])=>Math.hypot(x-60,y-60)<=48+0.71));
display.update(new Date("2024-04-23T12:00:00Z"));assert(!display.getState());
const before=pixels.length;display.draw({setColor:()=>{},setPixel:()=>pixels.push([0,0])},{});
assert.strictEqual(before,pixels.length);
// Full app in a fake Espruino environment: installed modules, one scheduler,
// shadow beneath observer, off mode avoids module loads, LCD-off cancels.
function appHarness(enabled,iso){
  let now=Date.parse(iso),nextId=0,color=0;
  const timers=new Map(),events={},log=[],reads=[];
  const sources={"orbit.eclipse":"eclipse.js","orbit.ecldraw":"eclipse-render.js","orbit.ecldata":"eclipse-terms.js","orbit.eclsun":"eclipse-sun-terms.js"};
  const storage={readJSON:name=>name==="orbit.json"?{eclipseEnabled:enabled,locationSource:"manual",coordVersion:2,
    manualLat:25.3,manualLon:-104.1}:name==="setting.json"?{timeout:0}:undefined,
    writeJSON:()=>{},read:name=>{reads.push(name);return sources[name]?fs.readFileSync(path.join(__dirname,sources[name]),"utf8"):undefined;}};
  const g=new Proxy({getWidth:()=>176,getHeight:()=>176,stringWidth:s=>s.length*10}, {
    get:(o,k)=>k in o?o[k]:k==="transformVertices"?undefined:(...a)=>{
      if(k==="setColor")color=a[0];
      log.push({op:k,args:a,color});return g;
    }});
  class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
  const bangle={setGPSPower:()=>{},setUI:()=>{},loadWidgets:()=>{},drawWidgets:()=>{},
    setLocked:()=>{},setBacklight:()=>{},isLCDOn:()=>true,on:(n,f)=>events[n]=f,removeListener:()=>{},showLauncher:()=>{}};
  const context={g,Bangle:bangle,Date:Clock,require:n=>{assert(n==="Storage");return storage;},
    E:{on:(n,f)=>events[n]=f,removeListener:()=>{}},setTimeout:(f,ms)=>{timers.set(++nextId,{f,ms});return nextId;},
    clearTimeout:id=>timers.delete(id),load:()=>{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"app.js"),"utf8"),context);
  return {timers,events,log,reads,advance:ms=>now+=ms};
}
const app=appHarness(true,refs[1].date);
assert(app.timers.size>=2); // Clock timer plus finite idle/backlight timer.
// Red outer Moon rim must appear while an eclipse is active anywhere on Earth.
function redMoonRims(a){
  return a.log.filter(x=>x.op==="drawCircle"&&x.color===0xF800&&x.args[2]>=14&&x.args[2]<=16);
}
assert.strictEqual(redMoonRims(app).length,1);
assert.strictEqual(redMoonRims(appHarness(true,"2025-03-29T10:47:00Z")).length,1); // partial only
assert.strictEqual(redMoonRims(appHarness(true,"2024-04-23T12:00:00Z")).length,0); // no eclipse

assert(app.reads.includes("orbit.ecldata"));
const lastShadow=app.log.reduce((last,x,i)=>x.op==="setPixel"&&x.color===0?i:last,-1);
const red=app.log.findIndex(x=>x.op==="fillCircle"&&x.color===0xF800&&x.args[2]===2);
assert(lastShadow>=0&&red>lastShadow);
assert(app.log.slice(lastShadow+1,red).some(x=>x.op==="fillPoly"&&[0x07E0,0xFFE0].includes(x.color)));
const timer=[...app.timers.values()].find(t=>t.ms>10000);
assert(timer&&timer.ms<=30025);
app.timers.clear();app.advance(30000);timer.f();assert(app.timers.size===1);
app.events.lcdPower(false);assert(app.timers.size===0);
const off=appHarness(false,refs[1].date);assert(!off.reads.some(n=>n.startsWith("orbit.ecl")));
assert.strictEqual(redMoonRims(off).length,0);
assert([...off.timers.values()][0].ms>30000);
console.log("PASS: lunar example, NASA centers, partial/annular/night/full-Moon, shading/cache/layers/timer/off/LCD.");
if(process.argv[2]==="--preview"){
  fs.writeFileSync(process.argv[3],JSON.stringify([
    {title:"Total 2024",log:appHarness(true,refs[1].date).log},
    {title:"Partial 2025",log:appHarness(true,"2025-03-29T10:47:00Z").log},
    {title:"Annular 2023",log:appHarness(true,"2023-10-14T18:00:00Z").log}
  ]));
}
