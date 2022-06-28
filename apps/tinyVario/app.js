/*
To do:
  -setup page
  -different units
  -flight log
  -statistics page
  -nav page
*/
Bangle.setBarometerPower(true, "tinyVario");
Bangle.setGPSPower(true, "tinyVario");

const unitsRoc=[
  {name:"m/s", factor:1, precision:1, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"m"},
            {type:"", height:1,width:"20", bgCol:"#FFF"},
            {type:"txt", font:"12%", halign:0, filly:0, label:"s"}]}},
  {name:"ft/m", factor:196.85039370078738, precision:0, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"ft"},
            {type:"", height:1,width:"30", bgCol:"#FFF"},
            {type:"txt", font:"12%", halign:0, filly:0, label:"min"}]}},
  {name:"kt", factor:1.9438444924406, precision:1, layoutCode:
            {type:"txt", font:"12%", halign:0, filly:0, label:"kt"}}
  ];

const unitsGs=[
  {name:"km/h", factor:1, precision:1, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"km"},
            {type:"", height:1,width:"30", bgCol:"#FFF"},
            {type:"txt", font:"12%", halign:0, filly:0, label:"h"}]}},
  {name:"kt", factor:196.85039370078738, precision:0, layoutCode:{type:"txt", font:"12%", halign:0, filly:0, label:"kt"}},
  {name:"m/s", factor:0.2777777777777778, precision:1, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"m"},
            {type:"", height:1,width:"20", bgCol:"#FFF"},
            {type:"txt", font:"12%", halign:0, filly:0, label:"s"}]}}
  ];

const unitsAlt=[
  {name:"m", factor:1, precision:0, layoutCode:{type:"txt", font:"12%", halign:0, filly:0, label:"m"}},
  {name:"ft", factor:3.280839895013123, precision:0, layoutCode:{type:"txt", font:"12%", halign:0, filly:0, label:"ft"}}
  ];

var intTime=10,pressureInterval=100;
var altH = [];
var altRaw=-9999, altFast=0, altSlow=0;
var fastGain=0.2, slowGain=0.168;
var roc=0,rocAvg=0;
var gs;
var lastPressure = Date.now();
var flying=false;
var takeoffTime, flyingTime;
var Layout = require("Layout");
var speedUnit="km/h", speedFactor=1;
var altUnit="m", altFactor=1;
var rocUnit=unitsRoc[0];
var altUnit=unitsAlt[0];
var gsUnit=unitsGs[0];

function drawVario() {
  var p = pfd.vario;
  g.reset();
  g.clearRect(p.x,p.y,p.x+p.w-1,p.y+p.h-1);
  if (roc>0.1) g.setColor(0,1,0);
  if (roc<-1) g.setColor(1,0,0);
  var y=p.y+p.h/2-roc*(p.h/2)/5;
  g.fillRect(p.x,p.y+(p.h/2),p.x+p.w-1,Math.clip(y,p.y,p.y+p.h-1));
}

function updateText(t) {
  if (t.halign==1) 
    g.setFont(t.font).setFontAlign(1,0,0).drawString(t.label, t.x+t.w, t.y+(t.h>>1));
  else if (t.halign==-1)
    g.setFont(t.font).setFontAlign(-1,0,0).drawString(t.label, t.x, t.y+(t.h>>1));
  else 
    g.setFont(t.font).setFontAlign(0,0,0).drawString(t.label, t.x+(t.w>>1), t.y+(t.h>>1));
}

unitROC={type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"m"},
            {type:"", height:1,width:"20", bgCol:"#FFF"},
            {type:"txt", font:"12%", halign:0, filly:0, label:"s"}
          ]};

var pfd = new Layout(
  {type:"v",c: [
    {type:"h",c: [
      {type:"", fillx:1, height:"1"}
      ]},
    {type:"h", c: [
      /*{type:"v", c:[
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"},
        {type:"", filly:1},
        {type:"", width:"3", height:"3", bgCol:"#FFF"}
      ]},*/
      {type:"custom", width:"25", render:drawVario, id:"vario",filly:1 },
      {type:"", filly:1, width:1, bgCol:"#FFF"},
      {type:"v",fillx:1, c: [
        {type:"h", halign:1, c:[
          {type:"txt",font:"22%", halign:1, filly:1, label:"19999", id:"alt"},
          altUnit.layoutCode 
        ]},
        {type:"", fillx:1, height:"1", bgCol:"#FFF"},
        {type:"h", halign:1, c:[
          {type:"txt", font:"25%", halign:1, filly:1, label:"-99.9", id:"avg" },
          rocUnit.layoutCode
        ]},
        {type:"", fillx:1, height:"1", bgCol:"#FFF"},
        {type:"h", halign:1, c:[
          {type:"txt", font:"25%", halign:1, filly:1, label:"XXX", id:"gs" },
          gsUnit.layoutCode
        ]}
      ]}
    ]},
    {type:"", fillx:1, height:"1", bgCol:"#FFF"},
    {type:"h",c: [
      {type:"txt",pad:"1", halign:0, font:"15%",fillx:"1", label:"99:99", id:"time"},
      {type:"", width:"1", height:g.getHeight()*0.15+2, bgCol:"#FFF"},
      {type:"txt",pad:"1", halign:0, font:"15%", fillx:"1", label:"99:99", id:"flyingtime" }
    ]}
  ]}//,{lazy:"true"}
);
pfd.update();

Bangle.on('pressure', function(e) {
  if (altRaw==-9999) {
    altFast=e.altitude;
    altSlow=e.altitude;
    altRaw=e.altitude;
  }
  altRaw=altRaw+(e.altitude-altRaw)*0.2;
});

Bangle.on('GPS', function(fix) {
  gs=fix.speed;
});
          
/*setWatch(function() {
  
}, BTN1);*/

setInterval(function () { 
  altFast=altFast+(altRaw-altFast)*fastGain;
  altSlow=altSlow+(altRaw-altSlow)*0.09093;
  altH.push(altSlow);
  if (altH.length>intTime*1000/pressureInterval) {
    altH.shift();
    rocAvg=(altH[altH.length-1]-altH[0])/intTime;
  }
}, pressureInterval);

g.clear();
pfd.render();

setInterval(function() {
  pfd.clear(pfd.alt);
  pfd.clear(pfd.avg);
  pfd.clear(pfd.time);
  if ((!flying) && ((rocAvg>1) || (rocAvg<-1) || (gs>10))) { //take-off detected
    takeoffTime=Date().getTime();
    flying=true;
  } 
  if (flying) {
    pfd.clear(pfd.flyingtime);
    flyingTime=Date().getTime()-takeoffTime;
    pfd.flyingtime.label=(flyingTime / 3600000).toFixed(0)+":"+(flyingTime / 60000 % 60).toFixed(0).padStart(2,'0');
  } 
  roc=(altFast-altSlow)/(pressureInterval/1000/slowGain)-(pressureInterval/1000/fastGain);
  pfd.alt.label=(altSlow).toFixed(0);
  if (rocAvg>0.1) pfd.avg.col="#0f0";
    else if (rocAvg<-1) pfd.avg.col="#f00";
    else pfd.avg.col="#fff";
  pfd.avg.label=(rocAvg*rocUnit.factor).toFixed(rocUnit.precision);
  if (!isNaN(gs)) {
    pfd.gs.label=gs.toFixed(0);
    pfd.clear(pfd.gs);
  } 
  pfd.time.label=require("locale").time(Date(),1);
  updateText(pfd.alt);
  updateText(pfd.avg);
  updateText(pfd.gs);
  updateText(pfd.time);
  updateText(pfd.flyingtime);
  drawVario();
 // pfd.debug(pfd.roc);
  //pfd.render();  
}, 250);

