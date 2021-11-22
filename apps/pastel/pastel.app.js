require("f_latosmall").add(Graphics);
const SETTINGS_FILE = "pastel.json";
let settings;

function loadSettings() {
  //console.log("loadSettings()");
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.grid = settings.grid||false;
  settings.date = settings.date||false;
  settings.font = settings.font||"Lato";
  //console.log(settings);
}

function loadFonts() {
  //console.log("loadFonts()");
  console.log(settings);
  
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

  if (settings.date) {
    g.setFontLatoSmall();
    g.setFontAlign(1, -1);
    g.drawString(day + "   ", w, h - 24 - 24);
    g.drawString(month_day + "   ", w, h - 24);
  }
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

loadSettings();
loadFonts();
g.clear();
var secondInterval = setInterval(draw, 1000);
draw();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
