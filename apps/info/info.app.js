var s = require("Storage");
const locale = require('locale');
var ENV = process.env;
var W = g.getWidth(), H = g.getHeight();
var screen = 0;
const maxScreen = 2;

function getVersion(file) {
  var j = s.readJSON(file,1);
  var v = ("object"==typeof j)?j.version:false;
  return v?((v?"v"+v:"Unknown")):"NO ";
}


function drawData(name, value, y){
  g.drawString(name, 5, y);
  g.drawString(value, 100, y);
}

function getSteps(){
  try{
    return Bangle.getHealthStatus("day").steps;
  } catch(e) {
    return ">= 2v12";
  }
}

function getBpm(){
  try{
    return Math.round(Bangle.getHealthStatus("day").bpm) + "bpm";
  } catch(e) {
    return ">= 2v12";
  }
}

function drawInfo() {
  g.reset().clearRect(Bangle.appRect);
  var h=18, y = h;//-h;

  // Header
  g.setFont("Vector", h+2).setFontAlign(0,-1);
  g.drawString("--==|| INFO ||==--", W/2, 0);
  g.setFont("Vector",h).setFontAlign(-1,-1);

  // Dynamic data
  if(screen == 0){
    drawData("Steps", getSteps(), y+=h);
    drawData("HRM", getBpm(), y+=h);
    drawData("Battery", E.getBattery() + "%", y+=h);
    drawData("Voltage", E.getAnalogVRef().toFixed(2) + "V", y+=h);
    drawData("IntTemp.", locale.temp(parseInt(E.getTemperature())), y+=h);
  }

  if(screen == 1){
    drawData("Charging?", Bangle.isCharging() ? "Yes" : "No", y+=h);
    drawData("Bluetooth", NRF.getSecurityStatus().connected ? "Conn." : "Disconn.", y+=h);
    drawData("GPS", Bangle.isGPSOn() ? "On" : "Off", y+=h);
    drawData("Compass", Bangle.isCompassOn() ? "On" : "Off", y+=h);
    drawData("HRM", Bangle.isHRMOn() ? "On" : "Off", y+=h);
  }

  // Static data
  if(screen == 2){
    drawData("Firmw.", ENV.VERSION, y+=h);
    drawData("Boot.", getVersion("boot.info"), y+=h);
    drawData("Settings", getVersion("setting.info"), y+=h);
    drawData("Storage", "", y+=h);
    drawData("  Total", ENV.STORAGE>>10, y+=h);
    drawData("  Free", require("Storage").getFree()>>10, y+=h);
  }

  if(Bangle.isLocked()){
    g.setFont("Vector",h-2).setFontAlign(-1,-1);
    g.drawString("Locked", 0, H-h+2);
  }

  g.setFont("Vector",h-2).setFontAlign(1,-1);
  g.drawString((screen+1) + "/3", W, H-h+2);
}

drawInfo();
setWatch(_=>load(), BTN1);

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    screen = (screen + 1) % (maxScreen+1);
  }

  if(isLeft){
    screen -= 1;
    screen = screen < 0 ? maxScreen : screen;
  }

  drawInfo();
});

Bangle.on('lock', function(isLocked) {
  drawInfo();
});

Bangle.loadWidgets();
for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
// Bangle.drawWidgets();