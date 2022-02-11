var btm = g.getHeight()-1;
var intervalInt;
var intervalBt;

function clear(y){
  g.reset();
  g.clearRect(0,y,g.getWidth(),y+75);
}

function draw(y, type, event) {
  clear(y);
  var px = g.getWidth()/2;
  var str = event.bpm + "";
  g.reset();
  g.setFontAlign(0,0);
  g.setFontVector(40).drawString(str,px,y+20);
  str = "Event: " + type;
  if (type == "HRM") {
    str += " Confidence: " + event.confidence;
    g.setFontVector(12).drawString(str,px,y+40);
    str = " Source: " + (event.src ? event.src : "internal");
    g.setFontVector(12).drawString(str,px,y+50);
  }
  if (type == "BTHRM"){
    if (event.battery) str += " Bat: " + (event.battery ? event.battery : "");
    g.setFontVector(12).drawString(str,px,y+40);
    str= "";
    if (event.location) str += "Loc: " + event.location.toFixed(0) + "ms";
    if (event.rr && event.rr.length > 0) str += " RR: " + event.rr.join(",");
    g.setFontVector(12).drawString(str,px,y+50);
    str= "";
    if (event.contact) str += " Contact: " + event.contact;
    if (event.energy) str += " kJoule: " + event.energy.toFixed(0);
    g.setFontVector(12).drawString(str,px,y+60);
  }
  
}

var firstEventBt = true;
var firstEventInt = true;

function onBtHrm(e) {
  if (firstEventBt){
    clear(24);
    firstEventBt = false;
  }
  draw(100, "BTHRM", e);
  if (e.bpm == 0){
    Bangle.buzz(100,0.2);
  }
  if (intervalBt){
    clearInterval(intervalBt);
  }
  intervalBt = setInterval(()=>{
    clear(100);
  }, 2000);
}

function onHrm(e) {
  if (firstEventInt){
    clear(24);
    firstEventInt = false;
  }
  draw(24, "HRM", e);
  if (intervalInt){
    clearInterval(intervalInt);
  }
  intervalInt = setInterval(()=>{
    clear(24);
  }, 2000);
}


var settings = require('Storage').readJSON("bthrm.json", true) || {};

Bangle.on('BTHRM', onBtHrm);
Bangle.on('HRM', onHrm);

Bangle.setHRMPower(1,'bthrm');
if (!(settings.startWithHrm)){
  Bangle.setBTHRMPower(1,'bthrm');
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
if (Bangle.setBTHRMPower){
  g.reset().setFont("6x8",2).setFontAlign(0,0);
  g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2 - 24);
} else {
  g.reset().setFont("6x8",2).setFontAlign(0,0);
  g.drawString("BTHRM disabled",g.getWidth()/2,g.getHeight()/2 + 32);
}

E.on('kill', ()=>Bangle.setBTHRMPower(0,'bthrm'));
