Bangle.setBarometerPower(true, "tinyVario");
Bangle.setGPSPower(true, "tinyVario");

var intTime=10,pressureInterval=100;
var altH = [];
var altFast=-10000, altSlow=0;
var fastGain=0.2, slowGain=0.168;
var roc=0,rocAvg=0;
var gs;
var lastPressure = Date.now();
var flying=false;
var takeoffTime, flyingTime;
var Layout = require("Layout");

function drawVario() {
  var p = pfd.vario;
  //roc=(altFast-altSlow)/(pressureInterval/1000/slowGain)-(pressureInterval/1000/fastGain);
  g.reset();
  g.drawRect(p.x,p.y,p.x+p.w,p.y+p.h);
  g.clearRect(p.x+1,p.y+1,p.x+p.w-1,p.y+p.h-1);

  if (roc>0.1) g.setColor(0,1,0);
  if (roc<-1) g.setColor(1,0,0);
  var y=p.y+p.h/2-roc*(p.h/2)/5;
  g.fillRect(p.x+1,p.y+(p.h/2),p.x+p.w-1,Math.clip(y,p.y+1,p.y+p.h-1));
  //print (pfd.vario);
}

var pfd = new Layout(
  {type:"v",c: [
    {type:"h",c: [
      {type:"", fillx:1, height:"1"}
      ]},
    {type:"h",c: [
      {type:"custom", width:"20", render:drawVario, id:"vario",filly:1 },
      {type:"v",fillx:"1", c: [
        {type:"txt", font:"25%", halign:1, filly:1, label:"-", id:"alt"},
        {type:"", fillx:1, height:"1", bgCol:"#FFF"},
        {type:"txt", font:"18%", halign:1, filly:1, label:"-", id:"roc" },
        {type:"", fillx:1, height:"1", bgCol:"#FFF"},
        {type:"txt", font:"18%", halign:1, filly:1, label:"-", id:"gs" },
        {type:"", fillx:1, height:"1", bgCol:"#FFF"}

      ]}
    ]},
    {type:"h",pad:"5",c: [
      {type:"txt", font:"15%",fillx:"1", label:"-", id:"time"},
      {type:"", width:"1", bgCol:"#FFF"},

      {type:"txt", font:"15%", fillx:"1", label:"-", id:"flyingtime" }
    ]}
  ]},{lazy:"true"}
);
Bangle.on('pressure', function(e) {
  if ((altFast)==-10000) {
    altFast=e.altitude;
    altSlow=e.altitude;
  }
  altFast=altFast+(e.altitude-altFast)*fastGain;
  altSlow=altSlow+(e.altitude-altSlow)*0.09093;
});

Bangle.on('GPS', function(fix) {
  gs=fix.speed;
});
          
/*setWatch(function() {
  
}, BTN1);*/

setInterval(function () { 
  altH.push(altSlow);
  while (altH.length>intTime*1000/pressureInterval) altH.shift();
}, pressureInterval);

setInterval(function() {
  if ((!flying) && ((rocAvg>1) || (rocAvg<-1) || (gs>10))) { //take-off detected
    takeoffTime=Date().getTime();
    flying=true;
   // flyingTime=0;
  } 
  if (flying) {
    flyingTime=Date().getTime()-takeoffTime;
    pfd.flyingtime.label=(flyingTime / 3600000).toFixed(0)+":"+(flyingTime / 60000 % 60).toFixed(0).padStart(2,'0');
  } else pfd.flyingtime.label="--:--";
  if (altH.length==intTime*1000/pressureInterval) rocAvg=(altH[altH.length-1]-altH[0])/intTime;
  roc=(altFast-altSlow)/(pressureInterval/1000/slowGain)-(pressureInterval/1000/fastGain);
  pfd.alt.label=(altSlow).toFixed(0)+"m";
  if (rocAvg>0.1) {pfd.roc.col="#0f0";}
  else if (rocAvg<-1) {pfd.roc.col="#f00";}
  else {pfd.roc.col="#fff";}
  pfd.roc.label=rocAvg.toFixed(1)+"m/s";
  if (!isNaN(gs)) pfd.gs.label=gs.toFixed(0)+"km/h";
  else pfd.gs.label="NO GPS";
  pfd.time.label=require("locale").time(Date(),1);
  pfd.update();

  pfd.render();
  drawVario();
}, 250);

g.clear();
