//Init
var Layout = require("Layout");
require("Font7x11Numeric7Seg").add(Graphics);
require("FontTeletext5x9Ascii").add(Graphics);

borders = 1;
Light_on='#fff';
Light_off='#554';
Light_warn='#f90';
Light_COMPACTY='#0F0';
Light_width=43;
Light_height=25;
EL7_height=30;
LightFont='Teletext5x9Ascii';
DataFont='7x11Numeric7Seg:2';

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
    { type:"", width:20},
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
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00000", id:"R1", fillx:1, height:EL7_height},
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00000", id:"R2", fillx:1, height:EL7_height},
        {type:"txt", font:DataFont, col:"#0F0", bgCol:"#000", label:"00000", id:"R3", fillx:1, height:EL7_height},
      ]},
    {type:"",width:5},
  ]},
  {lazy:true});
layout.update();

//support functions

function getdatetime(){
  var datetime = [];
  var d = new Date();
  var offsets = require("Storage").readJSON("worldclock.settings.json") || [];
//  var meridian = require("locale").meridian(d);
  datetime.clock = require("locale").time(d, 1);
  datetime.month = d.getMonth()+1;
  datetime.day = d.getDate();
  datetime.localtime=String(String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')).padStart(5,'0');
  utchour=((d.getHours()+(Math.round(d.getTimezoneOffset()/60))) % 24);
  datetime.utctime=String(String(utchour).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')).padStart(5,'0');
  return datetime;
}

function getSteps(){
  steps=Bangle.getHealthStatus("day").steps;
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

//function getTemperature(){
//    var temperature = E.getTemperature();
//    temperature = typeof temperature !== 'undefined' ? temperature:99999;
//    return Math.round(temperature);
//}

//function getHRM(){
//  hrm=Bangle.getHealthStatus('10min').bpm;
//  hrm = typeof hrm !== 'undefined' ? hrm:0;
//  return hrm;
//}

//function getGPS(){
//  GPS=Bangle.getPressure();
//  GPS = typeof GPS !== 'undefined' ? GPS:{temperature:0,pressure:0,altitude:0};
//  return GPS;
//}

function isBTConnected(){
  return NRF.getSecurityStatus().connected;
}

function getBattery(){
  battlevel = E.getBattery();
  if (Bangle.isCharging()) {
    battlevel = -1;
  } else if (battlevel >= 100) {
    battlevel = 99;
  }
  battlevel=String(battlevel).padStart(2,'0');
  return battlevel;
}

function isActive(){
  if (Bangle.isCompassOn() || Bangle.isGPSOn() || Bangle.isHRMOn() | Bangle.isBarometerOn() ) {
    return true;
  } else {
    return false;
  }
}

function setLight(id,label,check,onColour,offColour){
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
function draw(){
  datetime=getdatetime();
  
  layout.R1.label=datetime.localtime;
  layout.R2.label=datetime.utctime;
  layout.R3.label=String(getSteps()).padStart(5,'0');
  
  layout.PROG.label=String(getBattery()).padStart(2,'0');
  layout.VERB.label=String(datetime.month).padStart(2,'0');
  layout.NOUN.label=String(datetime.day).padStart(2,'0');
  
  setLight('COMPACTY','',isActive(),Light_COMPACTY);
  setLight('L1','MSG',isMessagesNotify());
  setLight('L2','LOCK',Bangle.isLocked());
  setLight('L3','BT',!isBTConnected(),Light_warn);
  setLight('L4','BATT',(getBattery()<=20),Light_warn);
  setLight('L5','ALARM',isAlarmSet(),Light_warn);
  setLight('L6','STEP',(getSteps()>=getStepGoal()),'#0a0');  
  
  layout.render();
  //  layout.debug();
}

var drawTimeout;
// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

//////////// Main

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    require("widget_utils").show(); // re-show widgets
  }});
Bangle.loadWidgets();
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe

Bangle.on('lock',on=>{
  draw(); // draw immediately
  });

Bangle.on('GPS',draw);
Bangle.on('HRM',draw);
Bangle.on("message",draw);
Bangle.on('charging',draw);
NRF.on('connect',draw);
NRF.on('disconnect',draw);

g.clear();
draw_bg();
draw();
queueDraw();