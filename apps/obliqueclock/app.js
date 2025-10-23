const STRATEGIES = [
  "Use an old idea","State the problem in words as clearly as possible","Only a part, not the whole",
  "What would your closest friend do?","Work at a different speed","Try faking it","Emphasize the flaws",
  "Simplify, then add lightness","Look closely at the most embarrassing details","Use an unacceptable color",
  "Change instrument roles","Abandon normal instruments","Honor thy error as a hidden intention",
  "Is something missing?","What would happen if you didn't do it?","Think inside the box",
  "Repetition is a form of change","Reverse the order","Turn it upside down","Move towards the unimportant",
  "Make a sudden, destructive, unpredictable action","Remove specifics and convert to ambiguities",
  "Ask your body","Use fewer notes","Do the last thing first","Disconnect from desire",
  "Question the heroic approach","Breathe more deeply","Make a blank valuable by putting it in an exquisite frame",
  "Take away the elements in order of apparent non-importance","Emphasize differences",
  "Use an accidental or random detail","What would you do if you had no fear?","Do something boring",
  "Make it more physical","Don't be frightened to display your talents","Work outside",
  "Shortest distance is not the most interesting","Change nothing and continue with immaculate consistency",
  "Remove a safety net","Make a list of everything you do not do","Your mistake was a hidden intention",
  "Work to rule","Do something sudden, destructive and unpredictable","Use filters","Do the words need changing?",
  "Be extravagant","Make the middle more important","Try another context","Give way to your worst impulse"
];

let state = { idx:0, lastChange:0, motionLevel:0 };
let boundaryTimeout = 0;
let accelBuf = [];

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WDAY = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function wrapText(txt, w){
  if (g.wrapString) return g.wrapString(txt, w);
  const words=txt.split(" "); let lines=[], line="";
  for (let i=0;i<words.length;i++){
    let test=line?line+" "+words[i]:words[i];
    if (g.stringWidth(test)>w && line){ lines.push(line); line=words[i]; }
    else line=test;
  }
  if (line) lines.push(line);
  return lines;
}
function isoWeekNumber(d){
  const target=new Date(d.valueOf());
  const dayNr=(d.getDay()+6)%7;
  target.setDate(target.getDate()-dayNr+3);
  const firstThursday=new Date(target.getFullYear(),0,4);
  const firstDayNr=(firstThursday.getDay()+6)%7;
  firstThursday.setDate(firstThursday.getDate()-firstDayNr+3);
  return 1+Math.round((target-firstThursday)/(7*24*3600*1000));
}
function dayOfYear(d){ const s=new Date(d.getFullYear(),0,0); return Math.floor((d-s)/86400000); }
function roundedUpHM(d){
  let h=d.getHours(), m=d.getMinutes();
  let r=Math.ceil(m/5)*5; if (r===60){ r=0; h=(h+1)%24; }
  return {h,m:r};
}

// info row: Day N | Wed Oct. 22 | W43
function makeInfoText(now, width){
  const doy=dayOfYear(now);
  const week=isoWeekNumber(now);
  const wd=WDAY[now.getDay()];
  const mon=MON[now.getMonth()];
  const d=(""+now.getDate());
  let text=`Day ${doy} | ${wd} ${mon}. ${d} | W${week}`;
  for (let s of [12,11,10,9,8]){
    g.setFont("Vector",s);
    if (g.stringWidth(text)<=width) return {text,size:s};
  }
  text=`D${doy}|${wd}${mon}.${d}|W${week}`;
  for (let s of [12,11,10,9,8]){
    g.setFont("Vector",s);
    if (g.stringWidth(text)<=width) return {text,size:s};
  }
  return {text:`D${doy}|${mon}.${d}|W${week}`,size:8};
}

function pickStrategy(seed){ let x=seed|0; x^=x<<13; x^=x>>>17; x^=x<<5; return Math.abs(x)%STRATEGIES.length; }
function updateStrategy(forceNew){
  const now=new Date();
  if (!forceNew && (now - state.lastChange) < 250) return;
  state.lastChange=now;
  const seed=(now.getFullYear()*10000 + (now.getMonth()+1)*100 + now.getDate())*100000 +
              now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  state.idx=pickStrategy(seed + Math.floor(now.getMinutes()/5));
  draw();
}

function accelHandler(a){
  const m=Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z);
  accelBuf.push(m); if (accelBuf.length>20) accelBuf.shift();
  const avg=accelBuf.reduce((s,v)=>s+v,0)/accelBuf.length;
  const v=accelBuf.reduce((s,u)=>s+(u-avg)*(u-avg),0)/accelBuf.length;
  state.motionLevel=Math.min(1, Math.sqrt(v)/0.2);
}

// --- UI ---
function panel(x1,y1,x2,y2,bg){
  const old=g.getColor?g.getColor():1;
  g.setColor(bg); g.fillRect(x1,y1,x2,y2);
  g.setColor(0,0,0); g.drawRect(x1,y1,x2,y2);
  if (g.setColor) g.setColor(old);
}
function draw(){
  g.reset(); g.clear();
  const R=Bangle.appRect, w=R.x2-R.x+1;
  const now=new Date(), G1="#F0F0F0", G2="#E0E0E0", G3="#D0D0D0";

  const timeTop=R.y+1, timeBottom=timeTop+32;
  panel(R.x+2,timeTop,R.x2-2,timeBottom,G1);
  const hm=roundedUpHM(now), hh=("0"+hm.h).slice(-2), mm=("0"+hm.m).slice(-2), ts=hh+":"+mm;
  g.setFont("Vector",28); if (g.stringWidth(ts)>w-20) g.setFont("Vector",24);
  g.setFontAlign(-1,-1); g.drawString(ts,R.x+8,timeTop+4);

  const infoTop=timeBottom+3, infoBottom=infoTop+14;
  panel(R.x+2,infoTop,R.x2-2,infoBottom,G2);
  const info=makeInfoText(now,w-16);
  g.setFont("Vector",info.size); g.setFontAlign(-1,-1); g.drawString(info.text,R.x+6,infoTop+1);

  const stratTop=infoBottom+5, stratBottom=R.y2-40;
  panel(R.x+2,stratTop,R.x2-2,stratBottom,G1);
  const boxW=w-24; let sizes=[17,16,15,14,13], chosen=13, lines;
  for (let s of sizes){ g.setFont("Vector",s); lines=wrapText('"'+STRATEGIES[state.idx]+'"',boxW);
    if (lines.length*s*1.2 <= (stratBottom-stratTop-12)){ chosen=s; break; } }
  g.setFont("Vector",chosen);
  let y=stratTop+7; for (let i=0;i<lines.length;i++){ if (y>stratBottom-chosen) break; g.setFontAlign(-1,-1); g.drawString(lines[i],R.x+10,y); y+=chosen*1.2; }

  const motTop=stratBottom+5, motBottom=R.y2-2;
  panel(R.x+2,motTop,R.x2-2,motBottom,G3);
  const barX1=R.x+12, barX2=R.x2-12, barY=motTop+Math.round((motBottom-motTop)/2)-4;
  g.setColor("#B0B0B0"); g.fillRect(barX1,barY,barX2,barY+8); g.setColor(0,0,0); g.drawRect(barX1,barY,barX2,barY+8);
  const lvl=Math.max(0,Math.min(1,state.motionLevel));
  const fx=barX1+Math.round(lvl*(barX2-barX1)); g.fillRect(barX1,barY,fx,barY+8);
}

function scheduleNextBoundary(){
  if (boundaryTimeout) clearTimeout(boundaryTimeout);
  const now=new Date(), m=now.getMinutes(), s=now.getSeconds(), ms=now.getMilliseconds();
  const minsToNext=(5-(m%5))%5 || 5;
  const msToNext=minsToNext*60000 - s*1000 - ms;
  boundaryTimeout=setTimeout(function(){ updateStrategy(true); draw(); scheduleNextBoundary(); }, msToNext);
}
function onTap(){ updateStrategy(true); }

Bangle.setHRMPower(false);
Bangle.on('lcdPower', on=>{
  if (on){ Bangle.on('accel', accelHandler); draw(); }
  else Bangle.removeListener('accel', accelHandler);
});
Bangle.on('touch', onTap);
Bangle.on('tap', onTap);
Bangle.setUI({
  mode:"clock",
  redraw:draw,
  remove:function(){
    if (boundaryTimeout) clearTimeout(boundaryTimeout);
    Bangle.removeListener('accel', accelHandler);
    Bangle.removeListener('touch', onTap);
    Bangle.removeListener('tap', onTap);
    Bangle.removeAllListeners('lcdPower');
  }
});

g.clear();
updateStrategy(true);
draw();
scheduleNextBoundary();
if (Bangle.isLCDOn()) Bangle.on('accel', accelHandler);
