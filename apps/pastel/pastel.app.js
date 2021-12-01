var SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");
require("f_latosmall").add(Graphics);
const SETTINGS_FILE = "pastel.json";
const LOCATION_FILE = "mylocation.json";
let settings;
let location;

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.grid = settings.grid||false;
  settings.font = settings.font||"Lato";
}

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{"lat":51.5072,"lon":0.1276,"location":"London"};
}

function extractTime(d){
  var h = d.getHours(), m = d.getMinutes();
  return(("0"+h).substr(-2) + ":" + ("0"+m).substr(-2));
}

var sunRise = "00:00";
var sunSet = "00:00";
var drawCount = 0;

function updateSunRiseSunSet(now, lat, lon, line){
  // get today's sunlight times for lat/lon
  var times = SunCalc.getTimes(new Date(), lat, lon);

  // format sunrise time from the Date object
  sunRise = extractTime(times.sunrise);
  sunSet = extractTime(times.sunset);
}

function loadFonts() {
  // load font files based on settings.font
  if (settings.font == "Architect")
    require("f_architect").add(Graphics);
  else if (settings.font == "GochiHand")
    require("f_gochihand").add(Graphics);
  else if (settings.font == "CabinSketch")
    require("f_cabin").add(Graphics);
  else if (settings.font == "Orbitron")
    require("f_orbitron").add(Graphics);
  else if (settings.font == "Monoton")
    require("f_monoton").add(Graphics);
  else if (settings.font == "Elite")
    require("f_elite").add(Graphics);
  else
    require("f_lato").add(Graphics);
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}

const infoData = {
  ID_BLANK: { calc: () => '' },
  ID_DATE:  { calc: () => {var d = (new Date).toString().split(" "); return d[2] + ' ' + d[1] + ' ' + d[3];} },
  ID_DAY:   { calc: () => {var d = require("locale").dow(new Date).toLowerCase(); return d[0].toUpperCase() + d.substring(1);} },
  ID_SR:    { calc: () => 'Sunrise: ' + sunRise },
  ID_SS:    { calc: () => 'Sunset: ' + sunSet },
  ID_STEP:  { calc: () => 'Steps: ' + stepsWidget().getSteps() },
  ID_BATT:  { calc: () => 'Battery: ' + E.getBattery() + '%' },
  ID_MEM:   { calc: () => {var val = process.memory(); return 'Ram: ' + Math.round(val.usage*100/val.total) + '%';} },
  ID_ID:    { calc: () => {var val = NRF.getAddress().split(':'); return 'Id: ' + val[4] + val[5];} },
  ID_FW:    { calc: () => 'Fw: ' + process.env.VERSION }
};

const infoList = Object.keys(infoData).sort();
let infoMode = infoList[0];

function nextInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === infoList.length - 1) infoMode = infoList[0];
    else infoMode = infoList[idx + 1];
  }
}

function prevInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === 0) infoMode = infoList[infoList.length - 1];
    else infoMode = infoList[idx - 1];
  }
}

var mm_prev = "xx";

function draw() {
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0,5);
  
  var hh = da[4].substr(0,2);
  var mm = da[4].substr(3,2);
  var day = da[0];
  var month_day = da[1] + " " + da[2];
  
  // fix hh for 12hr clock
  var h2 = "0" + parseInt(hh) % 12 || 12;
  if (parseInt(hh) > 12)
    hh = h2.substr(h2.length -2);

  var w = g.getWidth();
  var h = g.getHeight();
  var x = (g.getWidth()/2);
  var y = (g.getHeight()/3);
  
  g.reset();

  if (process.env.HWVERSION == 1) {
    // avoid flicker on a bangle 1 by comparing with previous minute
    if (mm_prev != mm) {
      mm_prev = mm;
      g.clearRect(0, 30, w, h - 24);
    }
  } else {
    // on a b2 safe to just clear anyway as there is no flicker
    g.clearRect(0, 30, w, h - 24);
  }
    
  // draw a grid like graph paper
  if (settings.grid && process.env.HWVERSION !=1) {
    g.setColor("#0f0");
    for (var gx=20; gx <= w; gx += 20)
      g.drawLine(gx, 30, gx, h - 24); 
    for (var gy=30; gy <= h - 24; gy += 20)
      g.drawLine(0, gy, w, gy);
  }

  g.setColor(g.theme.fg);

  if (settings.font == "Architect")
    g.setFontArchitect();
  else if (settings.font == "GochiHand")
    g.setFontGochiHand();
  else if (settings.font == "CabinSketch")
    g.setFontCabinSketch();
  else if (settings.font == "Orbitron")
    g.setFontOrbitron();
  else if (settings.font == "Monoton")
    g.setFontMonoton();
  else if (settings.font == "Elite")
    g.setFontSpecialElite();
  else
    g.setFontLato();
    
  g.setFontAlign(1,-1);  // right aligned
  g.drawString(hh, x - 6, y);
  g.setFontAlign(-1,-1); // left aligned
  g.drawString(mm, x + 6, y);

  // for the colon
  g.setFontAlign(0,-1); // centre aligned

  if (d.getSeconds()&1) {
    g.drawString(":", x,y);
  } else {
    // on bangle 1, we are not using clearRect(), hide : by printing over it in reverse color
    if (process.env.HWVERSION == 1) {
      g.setColor(g.theme.bg);
      g.drawString(":", x,y);
      g.setColor(g.theme.fg);
    }
  }

  g.setFontLatoSmall();
  g.setFontAlign(0, -1);
  g.drawString((infoData[infoMode].calc()), w/2, h - 24 - 24);

  if (drawCount % 3600 == 0)
    updateSunRiseSunSet(new Date(), location.lat, location.lon);
  drawCount++;
}

// Only update when display turns on
if (process.env.BOARD!="SMAQ3") // hack for Q3 which is always-on
Bangle.on('lcdPower', function(on) {
  if (secondInterval)
    clearInterval(secondInterval);
  secondInterval = undefined;
  if (on)
    secondInterval = setInterval(draw, 1000);
  draw();
});

Bangle.setUI("clockupdown", btn=> {
  if (btn<0) prevInfo();
  if (btn>0) nextInfo();
  draw();
});

loadSettings();
loadFonts();
loadLocation();

g.clear();
var secondInterval = setInterval(draw, 1000);
draw();

Bangle.loadWidgets();
Bangle.drawWidgets();
