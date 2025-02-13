//Init
var Layout = require("Layout");
require("Font7x11Numeric7Seg").add(Graphics);
require("FontTeletext5x9Ascii").add(Graphics);

const Light_on='#fff';
const Light_off='#554';
const Light_warn='#f90';
const Light_COMPACTY='#0F0';
const Light_width=43;
const Light_height=25;
const EL7_height=30;
const LightFont='Teletext5x9Ascii';
const DataFont='7x11Numeric7Seg:2';
var mode = 0;

if (global.WIDGETS) {require("widget_utils").swipeOn();} // If `dsky_clock` was fast loaded into we seemingly need to hide the widgets before setting the layout so elements are not moved down.

var layout = new Layout(
  {type:"h", c:[
    {type:"",width:6},
    { type:"v", c: [
        {type:"txt", font:LightFont, col:"#000", bgCol:"#555", id:'L1', label:"UPLINK\nACTY", width:Light_width, height:Light_height},
        {type:"txt", font:LightFont, col:"#000", bgCol:"#555", id:'L2', label:"TEMP", width:Light_width, height:Light_height },
        {type:"txt", font:LightFont, col:"#000", bgCol:"#555", id:'L3', label:"GIMBAL\nLOCK", width:Light_width, height:Light_height },
        {type:"txt", font:LightFont, col:"#000", bgCol:"#555", id:'L4', label:"STBY", width:Light_width, height:Light_height },
        {type:"txt", font:LightFont, col:"#000", bgCol:"#555", id:'L5', label:"PROG", width:Light_width, height:Light_height },
        {type:"txt", font:LightFont, col:"#000", bgCol:"#eee", id:'L6', label:"OPR ERR", width:Light_width, height:Light_height },
    ]},
    { type:"", width:25},
    { type:"v", c: [
      {type:"",height:2},
      {type:"h", c: [
        {type:"", width:50},{type:"txt", font:"6x8", col:"#000",bgCol:"#0F0", label:"PROG", width:25, height:10},
      ]},
      {type:"h", c: [
        {type:"",width:10},
        {type:"txt", font:"6x8", col:"#000", bgCol:"#000", id:"COMPACTY", label:"COMP\nACTY", width:26, height:26 },
        {type:"",width:17},
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000",label:"00", id:"PROG", fillx:1, height:EL7_height },
      ]},
      {type:"",height:1},
      {type:"h", c: [
        {type:"txt", font:"6x8", col:"#000", bgCol:"#0F0",label:"VERB", width:25, height:10},
        {type:"",width:30},
        {type:"txt", font:"6x8", col:"#000",bgCol:"#0F0",label:"NOUN", width:25, height:10},
      ]},
      {type:"h", c: [
          {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00", id:"VERB", fillx:1, height:EL7_height},
          {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00", id:"NOUN", fillx:1, height:EL7_height}, 
      ]},
      { type:"",bgCol:'#070', width:80, height:2 },
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00000", id:"R1", halign:1, fillx:1, height:EL7_height},
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00000", id:"R2", halign:1, fillx:1, height:EL7_height},
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00000", id:"R3", halign:1, fillx:1, height:EL7_height},
      ]},
    {type:"",width:5},
  ],
    lazy:true}, 
  {btns:[
    {label:"", cb: Bangle.showLauncher}
  ], lazy:true});
layout.update();

//support functioe_ns

function getWeather() {
  var weather = {};
  try {
    weather = require("Storage").readJSON('weather.json', 1).weather;
  } catch(e) {
    return {};
  }
  return weather;
}

function getdatetime(){
  var datetime = [];
  var d = new Date();
//  var offsets = require("Storage").readJSON("worldclock.settings.json") || [];
//  var meridian = require("locale").meridian(d);
  datetime.clock = require("locale").time(d, 1);
  datetime.month = d.getMonth()+1;
  datetime.day = d.getDate();
  datetime.localtime=String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');
  let utchour=((d.getHours()+(Math.round(d.getTimezoneOffset()/60))) % 24);
  datetime.utctime=String(utchour).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');
  return datetime;
}

function getSteps(){
  let steps=Bangle.getHealthStatus("day").steps;
  steps = typeof steps !== 'undefined' ? steps:0;
  return steps;
}

function getStepGoal(){
  let stepGoal = (require("Storage").readJSON("health.json",1)||10000).stepGoal;
  stepGoal = typeof stepGoal !== 'undefined' ? stepGoal:10000;
  return stepGoal;
}

function isAlarmSet(){
  let alarmStatus = (require('Storage').readJSON('sched.json',1)||[]).some(alarm=>alarm.on);
  return alarmStatus;
}

function isMessagesNotify(){
  if (require("Storage").read("messages.json")!==undefined) {
    return true;
  } else {
    return false;
  }
}

function getHRM(){
 let hrm=Bangle.getHealthStatus('last');
 hrm = typeof hrm !== 'undefined' ? hrm:0;
 return hrm;
}

function isBTConnected(){
  return NRF.getSecurityStatus().connected;
}

function getBattery(){
  let battlevel = E.getBattery();
  if (Bangle.isCharging()) {
    battlevel = -1;
  } else if (battlevel >= 100) {
    battlevel = 99;
  }
  battlevel=String(battlevel);
  return battlevel;
}

function isActive(){
  if (Bangle.isCompassOn() || Bangle.isGPSOn() || Bangle.isHRMOn() || Bangle.isBarometerOn() ) {
    return true;
  } else {
    return false;
  }
}

function setLight(id,label,check,onColour,offColour){
  // print('setlight:',id); //debug
  layout.clear(layout[id]);
  onColour = typeof onColour !== 'undefined' ? onColour:Light_on;
  offColour = typeof offColour !== 'undefined' ? offColour:Light_off;
  if (label !== '') {
    layout[id].label=label;
  }
  if (check) {
    layout[id].bgCol=onColour;
  } else {
    layout[id].bgCol=offColour;
  }
  layout.render(layout[id]);
}

function setDATA(id,label) {
  layout.clear(layout[id]);
  let data='-----';
  let sign='';
  try {
    if (!isNaN(label)) {
      if (label < 0) {
        label=Math.abs(label);
        sign='-';
      }
      data=String(String(label).toString(16)).toUpperCase().padStart(5,'0').substring(0,5);
      data=sign+data;
    }
  } catch(e) {
    data='-----';
  }
  layout[id].label=data;
  layout.render(layout[id]);
}

function setWORD(id,label){
  layout.clear(layout[id]);
  let data='--';
  if (!isNaN(label)) {
    data=String(String(label).toString(16)).toUpperCase().padStart(2,'0').substring(0,2);
  }
  //  print(id, data); //debug
  layout[id].label=data;
  layout.render(layout[id]);
}

function draw_bg(){
  g.setColor('#666');
  g.fillRect(0,0,176,176);
  g.setColor('#000');
  g.fillRect(69,2,172,174);
  g.fillCircle(59,10,5);
  g.fillCircle(59,166,5);
}

// actual display
function drawMain(){
  let datetime=getdatetime();

  setDATA('R1',datetime.localtime);
  setDATA('R2',datetime.utctime);
  setDATA('R3',getSteps());

  setWORD('PROG',getBattery());
  setWORD('VERB',datetime.month);
  setWORD('NOUN',datetime.day);
  
  setLight('COMPACTY','',isActive(),Light_COMPACTY);
  setLight('L1','MSG',isMessagesNotify());
  setLight('L2','LOCK',Bangle.isLocked());
  setLight('L3','BT',!isBTConnected(),Light_warn);
  setLight('L4','BATT',(getBattery()<=20),Light_warn);
  setLight('L5','ALARM',isAlarmSet(),Light_warn);
  setLight('L6','STEP',(getSteps()>=getStepGoal()),'#0a0');

//  layout.setUI();
  layout.forgetLazyState();
  layout.render();
  queueDraw();
}

////// ALT modes /////
var AltDrawTimer;
function drawAlt(mode) {
  if (AltDrawTimer) clearTimeout(AltDrawTimer); 
  mode = typeof mode !== 'undefined' ? mode:0;
  mode=Math.abs(mode);
  // print('drawAlt: ', mode);  // debug
  // Show mode in PROG
  setWORD('PROG',mode);
  setWORD('NOUN','');
  setWORD('VERB','');
  // Disable Battery warning light in to show PROG no longer shows battery level
  setLight('L4','BATT',false);
  setDATA('R1');
  setDATA('R2');
  setDATA('R3');
  switch (mode) {
    case 1:
      setLight('L6','HRM',true);
      mode_HRM();
      break;
    case 2:
      setLight('L6','TEMP',true);
      mode_weather();
      break;
    case 3:
      setLight('L6','GPS',true);
      mode_GPS();
      break;
    case 4:
      setLight('L6','ACCEL',true);
      mode_accel();
      break;
    case 5:
      setLight('L6','HDG',true);
      mode_compass();
      break;
    default:
      drawMain();
  }
  layout.render();
}

function mode_HRM() {
  setLight('COMPACTY','',true,Light_COMPACTY);
  AltDrawTimer = setTimeout( function() {
    Bangle.setHRMPower(true, 'dsky_clock');
    let hrm=getHRM();
    setDATA('R1',hrm.bpm);
    setDATA('R2',hrm.bpmConfidence);
    setDATA('R3',getSteps());
    mode_HRM();
  }, 5000);
  Bangle.setHRMPower(false);
}

function mode_weather() {
  let weather=getWeather();
  try {
    weather.temp = Math.round(weather.temp-273.15);
    setDATA('R1',weather.temp);
    setDATA('R2',weather.hum);
    setDATA('R3',weather.code);
    setWORD('NOUN',weather.hum);
    setWORD('VERB',weather.rain);
  } catch(e) {
    setDATA('R1','-----');
    setDATA('R2','-----');
    setDATA('R3','-----');
    setDATA('R1','--');
    setDATA('R1','--');
  }
}

function mode_compass() {
  AltDrawTimer = setTimeout ( function() {
    setLight('COMPACTY','',true,Light_COMPACTY); //isCompassOn seems to be incorrect?
    Bangle.setCompassPower(1);
    let compass=Bangle.getCompass();
    setDATA('R1',compass.heading);
    setDATA('R2');
    setDATA('R3');
    mode_compass();
  }, 200);
  Bangle.setCompassPower(0);
}

function mode_GPS() {
  setLight('COMPACTY','',true,Light_COMPACTY);
  AltDrawTimer = setTimeout( function() {
    Bangle.setGPSPower(1,'dsky_clock');
    let gps=Bangle.getGPSFix();
    setWORD('NOUN',gps.fix);
    setWORD('VERB',gps.satellites);
    setDATA('R1',gps.lat);
    setDATA('R2',gps.lon);
    setDATA('R3',gps.speed);
    mode_GPS();
  }, 5000);
  Bangle.setGPSPower(0);
}

function mode_accel() {
  AltDrawTimer = setTimeout( function() {
    setLight('COMPACTY','',isActive(),Light_COMPACTY);
    let accel=Bangle.getAccel();
    setDATA('R1',accel.x);
    setDATA('R2',accel.y);
    setDATA('R3',accel.z);
    mode_accel();
  }, 100);
}

//////////// Main

var drawTimeout;
// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    mode = 0;
    if (AltDrawTimer) clearTimeout(AltDrawTimer);
    drawMain();
  }, 60000 - (Date.now() % 60000));
}

Bangle.on('lock',on=>{
  mode = 0;
  drawMain(); // draw immediately
  });
Bangle.on("message",function() { setLight('COMPACTY','',isActive(),Light_COMPACTY);});
Bangle.on('charging',drawMain);
NRF.on('connect',function() { setLight('L3','BT',!isBTConnected(),Light_warn); });
NRF.on('disconnect',function() { setLight('L3','BT',!isBTConnected(),Light_warn); });

Bangle.on('swipe', function(directionLR) {
  if (directionLR == 1) {
    mode=mode-1;
  }
  if (directionLR == -1) {
    mode=mode+1;
  }
  if (mode < 0 ) { mode=5; }
  mode=(mode % 6);
  drawAlt(mode);
});

g.clear();
draw_bg();
drawMain();

Bangle.CLOCK = 1;
Bangle.loadWidgets(); // loading widgets after drawing the layout in `drawMain()` to display the app UI ASAP.
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
