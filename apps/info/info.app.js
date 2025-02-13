const storage = require("Storage");
const locale = require('locale');
var ENV = process.env;
var W = g.getWidth(), H = g.getHeight();
var screen = 0;


var screens = [
  {
    name: "General",
    items: [
      {name: "Steps", fun:  () => getSteps()},
      {name: "HRM", fun:  () => getBpm()},
      {name: "", fun:  () => ""},
      {name: "Temp.", fun:  () => getWeatherTemp()},
      {name: "Humidity", fun:  () => getWeatherHumidity()},
      {name: "Wind", fun:  () => getWeatherWind()},
    ]
  },
  {
    name: "Hardware",
    items: [
      {name: "Battery", fun: () => E.getBattery() + "%"},
      {name: "Charge?", fun: () => Bangle.isCharging() ? /*LANG*/"Yes" : /*LANG*/"No"},
      {name: "TempInt.", fun: () => locale.temp(parseInt(E.getTemperature()))},
      {name: "Bluetooth", fun:  () => NRF.getSecurityStatus().connected ? /*LANG*/"Conn" : /*LANG*/"NoConn"},
      {name: "GPS", fun:  () => Bangle.isGPSOn() ? /*LANG*/"On" : /*LANG*/"Off"},
      {name: "Compass", fun:  () => Bangle.isCompassOn() ? /*LANG*/"On" : /*LANG*/"Off"},
    ]
  },
  {
    name: "Software",
    items: [
      {name: "Firmw.", fun: () => ENV.VERSION},
      {name: "Git", fun: () => ENV.GIT_COMMIT},
      {name: "Boot.", fun: () => getVersion("boot.info")},
      {name: "Settings.", fun: () => getVersion("setting.info")},
    ]
  },
  {
    name: "Storage [kB]",
    items: [
      {name: "Total", fun: () => storage.getStats().totalBytes>>10},
      {name: "Free", fun: () => storage.getStats().freeBytes>>10},
      {name: "Trash", fun: () => storage.getStats().trashBytes>>10},
      {name: "", fun: () => ""},
      {name: "#File", fun: () => storage.getStats().fileCount},
      {name: "#Trash", fun: () => storage.getStats().trashCount},
    ]
  },
];


function getWeatherTemp(){
  try {
    var weather = storage.readJSON('weather.json').weather;
    return locale.temp(weather.temp-273.15);
  } catch(ex) { }

  return "?";
}


function getWeatherHumidity(){
  try {
    var weather = storage.readJSON('weather.json').weather;
    return weather.hum = weather.hum + "%";
  } catch(ex) { }

  return "?";
}


function getWeatherWind(){
  try {
    var weather = storage.readJSON('weather.json').weather;
    var speed = locale.speed(weather.wind).replace("mph", "");
    return Math.round(speed * 1.609344) + "kph";
  } catch(ex) { }

  return "?";
}


function getVersion(file) {
  var j = storage.readJSON(file,1);
  var v = ("object"==typeof j)?j.version:false;
  return v?((v?"v"+v:"Unknown")):"NO ";
}


function getSteps(){
  try{
    return Bangle.getHealthStatus("day").steps;
  } catch(e) {
    return ">2v12";
  }
}

function getBpm(){
  try{
    return Math.round(Bangle.getHealthStatus("day").bpm) + "bpm";
  } catch(e) {
    return ">2v12";
  }
}

function drawData(name, value, y){
  g.drawString(name, 10, y);
  g.drawString(value, 100, y);
}

function drawInfo() {
  g.reset().clearRect(Bangle.appRect);
  var h=18, y = h;//-h;

  // Header
  g.drawLine(0,25,W,25);
  g.drawLine(0,26,W,26);

  // Info body depending on screen
  g.setFont("Vector",h).setFontAlign(-1,-1);
  screens[screen].items.forEach(function (item, index){
    drawData(item.name, item.fun(), y+=h);
  });

  // Bottom
  g.drawLine(0,H-h-3,W,H-h-3);
  g.drawLine(0,H-h-2,W,H-h-2);
  g.setFont("Vector",h-2).setFontAlign(-1,-1);
  g.drawString(screens[screen].name, 2, H-h+2);
  g.setFont("Vector",h-2).setFontAlign(1,-1);
  g.drawString((screen+1) + "/" + screens.length, W, H-h+2);
}

drawInfo();
setWatch(_=>load(), BTN1);

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    screen = (screen + 1) % screens.length;
  }

  if(isLeft){
    screen -= 1;
    screen = screen < 0 ? screens.length-1 : screen;
  }

  Bangle.buzz(40, 0.6);
  drawInfo();
});

Bangle.on('lock', function(isLocked) {
  drawInfo();
});

Bangle.loadWidgets();
Bangle.drawWidgets();
