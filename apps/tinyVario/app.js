/*
To do:
  -flight log
  -statistics page
  -navigation
*/

const getAltitude = (p,baseP) => (44330 * (1.0 - Math.pow(p/baseP, 0.1903)));
//const getFL = () => (44330 * (1.0 - Math.pow(pressure/1013.25, 0.1903))).toFixed(0);
const getTimeString = () => (settings.localTime) ? (require("locale").time(Date(),1)):(Date().toUTCString().slice(Date().toUTCString().length-12,Date().toUTCString().length-7));

var fg=g.getColor();
//var bg=g.getBgColor();
var red="#F00",green="#0F0";

const unitsRoc=[
  {name:"m/s", factor:1, precision:1, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"m"},
            {type:"", height:1,width:"20", bgCol:fg},
            {type:"txt", font:"12%", halign:0, filly:0, label:"s"}]}},
  {name:"ft/m", factor:196.85039370078738, precision:0, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"ft"},
            {type:"", height:1,width:"30", bgCol:fg},
            {type:"txt", font:"12%", halign:0, filly:0, label:"min"}]}},
  {name:"kt", factor:1.9438444924406, precision:1, layoutCode:
            {type:"txt", font:"12%", halign:0, filly:0, label:"kt"}}
  ];
const unitsGs=[
  {name:"km/h", factor:1, precision:1, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"km"},
            {type:"", height:1,width:"30", bgCol:fg},
            {type:"txt", font:"12%", halign:0, filly:0, label:"h"}]}},
  {name:"kt", factor:0.5399568, precision:0, layoutCode:{type:"txt", font:"12%", halign:0, filly:0, label:"kt"}},
  {name:"m/s", factor:0.2777777777777778, precision:1, layoutCode:{type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"m"},
            {type:"", height:1,width:"20", bgCol:fg},
            {type:"txt", font:"12%", halign:0, filly:0, label:"s"}]}}
  ];
const unitsAlt=[
  {name:"m", factor:1, precision:0, layoutCode:{type:"txt", font:"12%", halign:0, filly:0, label:"m"}},
  {name:"ft", factor:3.280839895013123, precision:0, layoutCode:{type:"txt", font:"12%", halign:0, filly:0, label:"ft"}}
  ];
/*
const unitROC={type:"v", halign:1, c: [
            {type:"txt", font:"12%", halign:0, filly:0, label:"m"},
            {type:"", height:1,width:"20", bgCol:fg},
            {type:"txt", font:"12%", halign:0, filly:0, label:"s"}
          ]};
*/

const ground=0, flying=1, landed=2, maybeFlying=3, maybeLanded=4;

var settings = Object.assign({
  rocU: 0,
  altU: 0,
  gsU:0,
  intTime:10,
  localTime:true,
  autoDetect:true,
  bargraph:false
}, require('Storage').readJSON("tinyVario.json", true) || {});

var qnh=Math.floor(Bangle.getOptions().seaLevelPressure) || 1013;
var pfdHandle;
var rawP=0, samples=0;
var altH = [];
var altRaw=-9999, altFast=0, altSlow=0;
var fastGain=0.5, slowGain=0.3;
var roc=0,rocAvg=0, gs;
//var lastPressure = Date.now();
var pressure = 1000;
var state=ground;
var takeoffTime=0, landingTime=0, flyingTime;
var Layout = require("Layout");
var oldSettings;

//var delta=0;//TESTING


function updateText(t) {
  g.reset();
  g.clearRect(t.x,t.y,t.x+t.w-1,t.y+t.h-1);
  if (t.col) g.setColor(t.col);
  else g.setColor(fg);
  if (t.halign==1)
    g.setFont(t.font).setFontAlign(1,0,0).drawString(t.label, t.x+t.w, t.y+(t.h>>1));
  else if (t.halign==-1)
    g.setFont(t.font).setFontAlign(-1,0,0).drawString(t.label, t.x, t.y+(t.h>>1));
  else
    g.setFont(t.font).setFontAlign(0,0,0).drawString(t.label, t.x+(t.w>>1), t.y+(t.h>>1));
}

function initPFD() {
  Bangle.setUI();
  var pfd = new Layout(
    {type:"v",c: [
      /*{type:"h",c: [
        {type:"", fillx:1, height:"1"}
        ]},*/
      {type:"h",filly:1, c: [
        {type:"custom", width:"25", render:()=>{
          var p = pfd.vario;
          if (roc>0.1) g.setColor(0,1,0);
          if (roc<-1) g.setColor(1,0,0);
          var y=p.y+p.h/2-roc*(p.h/2)/5;
          if (settings.bargraph==false) {
            g.clearRect(p.x,p.y,p.x+p.w-1,p.y+p.h-1);
            g.fillRect(p.x,p.y+(p.h/2),p.x+p.w-1,Math.clip(y,p.y,p.y+p.h-1));
          } else {
            g.setClipRect(p.x,p.y,p.x+p.w-1,p.y+p.h-1);
            g.scroll(-1,0);
            g.drawLine(p.x+p.w-1,p.y+(p.h/2),p.x+p.w-1,Math.clip(y,p.y,p.y+p.h-1));
          }
          g.reset();
        }, id:"vario",filly:1, cb:()=>initVarioMenu()},
        {type:"", filly:1, width:1, bgCol:fg},
        {type:"v",fillx:1, c: [
          {type:"h", halign:1, c:[
            {type:"txt", font:"22%", halign:1, filly:1, fillx:1, label:"9999", id:"alt", cb:()=>initAltMenu()},
            unitsAlt[settings.altU].layoutCode
          ]},
          {type:"", fillx:1, height:"1", bgCol:fg},
          {type:"h", halign:1, c:[
            {type:"txt", font:"25%", halign:1, filly:1, fillx:1, label:"-9.9", id:"avg", cb:()=>initAvgMenu()},
            unitsRoc[settings.rocU].layoutCode
          ]},
          {type:"", fillx:1, height:"1", bgCol:fg},
          {type:"h", halign:1, c:[
            {type:"txt", font:"25%", halign:1, filly:1, fillx:1, label:"XXX", id:"gs", cb:()=>initGsMenu()},
            unitsGs[settings.gsU].layoutCode
          ]}
        ]}
      ]},
      {type:"", fillx:1, height:"1", bgCol:fg},
      {type:"h",c: [
        {type:"txt",pad:0, halign:0, font:"15%",fillx:1, label:"99:99", id:"time", cb:()=>initTimeMenu()},
        {type:"", width:1,height:g.getHeight()*0.15, bgCol:fg},
        {type:"txt",pad:0, halign:0, font:"15%", fillx:1, label:"--:--", id:"flyingtime", cb:()=>initFlyingTimeMenu() }
      ]}
    ]},{lazy:true}
  );
  g.clear();
  pfd.render();
  //-------testing------
  //rawP=1000;
  //samples=1;
  //--------------------
  pfdHandle = setInterval(function() {
    //const t1=Date().getTime();
    //process pressure readings
    if (samples) {
      pressure=rawP/samples;
      samples=0;
      rawP=0;
      if (altRaw==-9999) {//first measurement)
        altRaw=getAltitude(pressure,qnh);
        altFast=altRaw;
        altSlow=altRaw;
        for (let i = 0; i < settings.intTime*4+1; i++) altH.push(altRaw);
      }
    }
    //altRaw=altRaw+delta;getAltitude(pressure,qnh);//TESTING
    altRaw=getAltitude(pressure,qnh);
    altFast=altFast+(altRaw-altFast)*fastGain;
    altSlow=altSlow+(altRaw-altSlow)*slowGain;
    altH.push(altFast);
    while (altH.length>settings.intTime*4) {
      rocAvg=(altH[altH.length-1]-altH[0])/settings.intTime;
      altH.shift();
    }
    roc=(altFast-altSlow)/((0.25/slowGain)-(0.25/fastGain));

    if (settings.autoDetect==true) switch (state) {
      case ground:
        if ((gs>=5) || (roc>=1) || (roc<=-1)) {
          state=maybeFlying;
          takeoffTime=Date().getTime();
        }
        break;
      case maybeFlying:
        if (!(gs>=5) && (roc<1) && (roc>-1)) state=ground;
        else if (Date().getTime()-takeoffTime>60000) state=flying;
        break;
      case flying:
        if (!(gs>=5) && (roc<1) && (roc>-1)) {
          state=maybeLanded;
          landingTime=Date().getTime();
        }
        break;
      case maybeLanded:
        if ((gs>=5) || (roc>=1) || (roc<=-1)) state=flying;
        else if (Date().getTime()-landingTime>60000) state=landed;
        break;
    }
    if ((state==flying) || (state==maybeLanded)) {
      flyingTime=Date().getTime()-takeoffTime;
      pfd.flyingtime.label=(flyingTime / 3600000).toFixed(0)+":"+(flyingTime / 60000 % 60).toFixed(0).padStart(2,'0');
      pfd.flyingtime.col=fg;
    } else if (state==landed) {
      flyingTime=landingTime-takeoffTime;
      pfd.flyingtime.label=(flyingTime / 3600000).toFixed(0)+":"+(flyingTime / 60000 % 60).toFixed(0).padStart(2,'0');
      pfd.flyingtime.col=green;
    }

    pfd.alt.label=(altRaw*unitsAlt[settings.altU].factor).toFixed(unitsAlt[settings.altU].precision);
    pfd.avg.col=(rocAvg<-1) ? (red):((rocAvg>0.1) ? (green):(fg));
    pfd.avg.label=(rocAvg*unitsRoc[settings.rocU].factor).toFixed(unitsRoc[settings.rocU].precision);

    var gps = Bangle.getGPSFix();
    if (gps!=undefined) {
      pfd.gs.label=(gps.speed*unitsGs[settings.gsU].factor).toFixed(unitsGs[settings.gsU].precision);
      updateText(pfd.gs);
      gs=gps.speed;
    } //else gs=0;
    
    pfd.time.label=getTimeString();
    updateText(pfd.alt);
    updateText(pfd.avg);
    updateText(pfd.time);
    updateText(pfd.flyingtime);

    pfd.vario.render();
    //print(Date().getTime()-t1);
  }, 250);

}

function initAltMenu() {
  //var oldQnh=qnh;
  function updateAltMenu() {
    altMenu.clear();
    altMenu.alt.label=
      (getAltitude(pressure,qnh)*unitsAlt[settings.altU].factor).toFixed(unitsAlt[settings.altU].precision)
      +unitsAlt[settings.altU].name;
    altMenu.qnh.label=qnh;
    altMenu.render();
  }
  oldSettings=Object.assign({},settings);
  clearInterval(pfdHandle);
  var altMenu = new Layout ({
    type:"v", c: [{
      type:"v", width:180, c: [
        {type:"h", c: [
          {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"-", cb:l=>{qnh--; updateAltMenu();}},
          {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"+", cb:l=>{qnh++; updateAltMenu();}}
        ]},
        {type:"v", c: [
          {type:"h", c: [
            {type:"txt", font:"13%", fillx:1, filly:1, label:"QNH: "},
            {type:"txt", font:"13%", fillx:1, filly:1, id:"qnh", label:"    "},
          ]},
          {type:"h", c: [
            {type:"txt", font:"13%", fillx:1, filly:1, label:"Alt: "},
            {type:"txt", font:"13%", fillx:1, filly:1, id:"alt", label: "      "},
          ]}
        ]},
        {type:"btn", font:"12%", id:"units", pad:2, fillx:1, filly:1, label:"Units: "+unitsAlt[settings.altU].name, cb:()=>{
          settings.altU=(settings.altU+1)%unitsAlt.length;
          altMenu.units.label="Units: "+unitsAlt[settings.altU].name;
          altMenu.render();
        }},
      ]},
      {type:"h", c: [
        {type:"btn", font:"16%", pad:1, fillx:1, label:"BACK", cb: ()=>{
          settings=Object.assign({},oldSettings);
          print("old settings restored");
          initPFD();
        }},
        {type:"btn", font:"16%", pad:1, fillx:1, label:"SAVE", cb: ()=>{
          require('Storage').writeJSON("tinyVario.json", settings);
          Bangle.setOptions({seaLevelPressure:qnh});
          initPFD();
        }}
      ]}
    ], lazy:true});
  g.clear();
  altMenu.render();
  updateAltMenu();
}

function initAvgMenu() {
  oldSettings=Object.assign({},settings);
  clearInterval(pfdHandle);
  var avgMenu = new Layout ({
    type:"v", c: [{
      type:"v", width:180, c: [
        {type:"h", c: [
          {type:"btn", font:"12%", pad:2, fillx:1, filly:1, label:"-", cb:l=>{
            settings.intTime=Math.clip(settings.intTime-1,1,60);
            avgMenu.clear();
            avgMenu.interval.label="Interval: "+settings.intTime+"s";
            avgMenu.render();
          }},
          {type:"btn", font:"12%", pad:1, fillx:1, filly:1, label:"+", cb:l=>{
            settings.intTime=Math.clip(settings.intTime+1,1,60);
            avgMenu.clear();
            avgMenu.interval.label="Interval: "+settings.intTime+"s";
            avgMenu.render();
          }}
        ]},
        {type:"txt", id:"interval", font:"10%", pad:1, fillx:1, filly:1, label:"Interval: "+settings.intTime+"s"},
        {type:"btn", font:"12%", id:"units", pad:1, fillx:1, filly:1, label:"Units: "+unitsRoc[settings.rocU].name, cb:()=>{
          settings.rocU=(settings.rocU+1)%unitsRoc.length;
          avgMenu.units.label="Units: "+unitsRoc[settings.rocU].name;
          avgMenu.render();
        }},
      ]},
      {type:"h", c: [
        {type:"btn", font:"16%", pad:1, fillx:1, label:"BACK", cb: ()=>{
          settings=Object.assign({},oldSettings);
          initPFD();
        }},
        {type:"btn", font:"16%", pad:1, fillx:1, label:"SAVE", cb: ()=>{
          require('Storage').writeJSON("tinyVario.json", settings);
          initPFD();
        }}
      ]}
    ], lazy:true});
  g.clear();
  avgMenu.render();
}

function initGsMenu() {
  oldSettings=Object.assign({},settings);
  clearInterval(pfdHandle);
  var gsMenu = new Layout ({
    type:"v", c: [
      {type:"btn", font:"20%", id:"units", pad:1, fillx:1, filly:1, label:"Units:\n"+unitsGs[settings.gsU].name, cb:()=>{
        settings.gsU=(settings.gsU+1)%unitsGs.length;
        gsMenu.units.label="Units:\n"+unitsGs[settings.gsU].name;
        gsMenu.render();
      }},
      {type:"h", c: [
        {type:"btn", font:"16%", pad:1, fillx:1, label:"BACK", cb: ()=>{
          settings=Object.assign({},oldSettings);
          print("old settings restored");
          initPFD();
        }},
        {type:"btn", font:"16%", pad:1, fillx:1, label:"SAVE", cb: ()=>{
          require('Storage').writeJSON("tinyVario.json", settings);
          initPFD();
        }}
      ]}
    ], lazy:true});
  g.clear();
  gsMenu.render();
}

function initTimeMenu() {
  oldSettings=Object.assign({},settings);
  clearInterval(pfdHandle);
  var timeMenu = new Layout ({
    type:"v", c: [
      {type:"btn", font:"20%", id:"format", pad:1, fillx:1, filly:1, label:"Time:\n"+((settings.localTime==true) ? ("LCL") : ("UTC")), cb:()=>{
        settings.localTime=!settings.localTime;
        timeMenu.format.label="Time:\n"+((settings.localTime==true) ? ("LCL") : ("UTC"));
        timeMenu.render();
      }},
      {type:"h", c: [
        {type:"btn", font:"16%", pad:1, fillx:1, label:"BACK", cb: ()=>{
          settings=Object.assign({},oldSettings);
          initPFD();
        }},
        {type:"btn", font:"16%", pad:1, fillx:1, label:"SAVE", cb: ()=>{
          require('Storage').writeJSON("tinyVario.json", settings);
          initPFD();
        }}
      ]}
    ], lazy:true});
  g.clear();
  timeMenu.render();
}

function initVarioMenu() {
  oldSettings=Object.assign({},settings);
  clearInterval(pfdHandle);
  var varioMenu = new Layout ({
    type:"v", c: [
      {type:"btn", font:"20%", id:"format", pad:1, fillx:1, filly:1, label:"Display:\n"+((settings.bargraph==true) ? ("graph") : ("simple")), cb:()=>{
        settings.bargraph=!settings.bargraph;
        varioMenu.format.label="Display:\n"+((settings.bargraph==true) ? ("graph") : ("simple"));
        varioMenu.render();
      }},
      {type:"h", c: [
        {type:"btn", font:"16%", pad:1, fillx:1, label:"BACK", cb: ()=>{
          settings=Object.assign({},oldSettings);
          initPFD();
        }},
        {type:"btn", font:"16%", pad:1, fillx:1, label:"SAVE", cb: ()=>{
          require('Storage').writeJSON("tinyVario.json", settings);
          initPFD();
        }}
      ]}
    ], lazy:true});
  g.clear();
  varioMenu.render();
}
function initFlyingTimeMenu() {
  oldSettings=Object.assign({},settings);
  clearInterval(pfdHandle);
  var ftMenu = new Layout (
    {type:"v", c: [
      {type:"v", c: [
        {type:"h", c: [
          {type:"btn", font:"12%", pad:1, fillx:1, filly:1, label:"Toggle\nAuto", cb:()=>{
            settings.autoDetect=!settings.autoDetect;
            ftMenu.manual.label= (settings.autoDetect==true)? 
              ("AUTO"):((state==flying) ? ("LAND") : ("TAKE\nOFF"));
            ftMenu.render();
          }},
          {type:"btn", font:"12%", id:"manual", pad:1, fillx:1, filly:1, label:(settings.autoDetect==true)? 
            ("AUTO"):((state==flying) ? ("LAND") : ("TAKE\nOFF")), cb:()=>{
              if (settings.autoDetect==false) {
                if (state!=flying) {
                  E.showPrompt("Take off now?").then((v)=> {
                    if (v) {
                      state=flying;
                      takeoffTime=Date().getTime();
                      initPFD();
                    }
                  });
                } else {
                  E.showPrompt("Land now?").then((v)=> {
                    if (v) {
                      state=landed;
                      landingTime=Date().getTime();
                      initPFD();
                    }
                  });
                }
              }
            }
          }
        ]},
        {type:"btn", font:"12%", pad:1, fillx:1, filly:1, label:"Reset", cb:()=>{
          E.showPrompt("Reset Flight?").then((v)=> {
            state=ground;
            initPFD();
          });
        }}
      ]},
      {type:"h", c: [
        {type:"btn", font:"16%", pad:1, fillx:1, label:"BACK", cb: ()=>{
          settings=Object.assign({},oldSettings);
          initPFD();
        }},
        {type:"btn", font:"16%", pad:1, fillx:1, label:"SAVE", cb: ()=>{
          require('Storage').writeJSON("tinyVario.json", settings);
          initPFD();
        }}
      ]}
    ], lazy:true});
  g.clear();
  ftMenu.render();
}

Bangle.setGPSPower(true, "tinyVario");
Bangle.setBarometerPower(true, "tinyVario");

Bangle.on('pressure', function(e) {
  if (samples<10) { //no need to gather more samples when stuck in a menu
    rawP+=e.pressure;
    samples++;
  }
});

initPFD();
