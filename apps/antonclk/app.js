// Clock with large digits using the "Anton" bold font

var SETTINGSFILE = "antonclk.json";

Graphics.prototype.setFontAnton = function(scale) {
// Actual height 69 (68 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAA/gAAAAAAAAAAP/gAAAAAAAAAH//gAAAAAAAAB///gAAAAAAAAf///gAAAAAAAP////gAAAAAAD/////gAAAAAA//////gAAAAAP//////gAAAAH///////gAAAB////////gAAAf////////gAAP/////////gAD//////////AA//////////gAA/////////4AAA////////+AAAA////////gAAAA///////wAAAAA//////8AAAAAA//////AAAAAAA/////gAAAAAAA////4AAAAAAAA///+AAAAAAAAA///gAAAAAAAAA//wAAAAAAAAAA/8AAAAAAAAAAA/AAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAB///////8AAAAH////////AAAAf////////wAAA/////////4AAB/////////8AAD/////////+AAH//////////AAP//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wA//8AAAAAB//4A//wAAAAAAf/4A//gAAAAAAP/4A//gAAAAAAP/4A//gAAAAAAP/4A//wAAAAAAf/4A///////////4Af//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH//////////AAD/////////+AAB/////////8AAA/////////4AAAP////////gAAAD///////+AAAAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAP/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/AAAAAAAAAAA//AAAAAAAAAAA/+AAAAAAAAAAB/8AAAAAAAAAAD//////////gAH//////////gAP//////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAB/gAAD//4AAAAf/gAAP//4AAAB//gAA///4AAAH//gAB///4AAAf//gAD///4AAA///gAH///4AAD///gAP///4AAH///gAP///4AAP///gAf///4AAf///gAf///4AB////gAf///4AD////gA////4AH////gA////4Af////gA////4A/////gA//wAAB/////gA//gAAH/////gA//gAAP/////gA//gAA///8//gA//gAD///w//gA//wA////g//gA////////A//gA///////8A//gA///////4A//gAf//////wA//gAf//////gA//gAf/////+AA//gAP/////8AA//gAP/////4AA//gAH/////gAA//gAD/////AAA//gAB////8AAA//gAA////wAAA//gAAP///AAAA//gAAD//8AAAA//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAAD/wAAB//8AAAAP/wAAB///AAAA//wAAB///wAAB//wAAB///4AAD//wAAB///8AAH//wAAB///+AAP//wAAB///+AAP//wAAB////AAf//wAAB////AAf//wAAB////gAf//wAAB////gA///wAAB////gA///wAAB////gA///w//AAf//wA//4A//AAA//wA//gA//AAAf/wA//gB//gAAf/wA//gB//gAAf/wA//gD//wAA//wA//wH//8AB//wA///////////gA///////////gA///////////gA///////////gAf//////////AAf//////////AAP//////////AAP/////////+AAH/////////8AAH///+/////4AAD///+f////wAAA///8P////gAAAf//4H///+AAAAH//gB///wAAAAAP4AAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAA//wAAAAAAAAAP//wAAAAAAAAB///wAAAAAAAAf///wAAAAAAAH////wAAAAAAA/////wAAAAAAP/////wAAAAAB//////wAAAAAf//////wAAAAH///////wAAAA////////wAAAP////////wAAA///////H/wAAA//////wH/wAAA/////8AH/wAAA/////AAH/wAAA////gAAH/wAAA///4AAAH/wAAA//+AAAAH/wAAA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAH/4AAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//8AAA/////+B///AAA/////+B///wAA/////+B///4AA/////+B///8AA/////+B///8AA/////+B///+AA/////+B////AA/////+B////AA/////+B////AA/////+B////gA/////+B////gA/////+B////gA/////+A////gA//gP/gAAB//wA//gf/AAAA//wA//gf/AAAAf/wA//g//AAAAf/wA//g//AAAA//wA//g//gAAA//wA//g//+AAP//wA//g////////gA//g////////gA//g////////gA//g////////gA//g////////AA//gf///////AA//gf//////+AA//gP//////+AA//gH//////8AA//gD//////4AA//gB//////wAA//gA//////AAAAAAAH////8AAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////gAAAAB///////+AAAAH////////gAAAf////////4AAB/////////8AAD/////////+AAH//////////AAH//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wAf//////////4A//wAD/4AAf/4A//gAH/wAAP/4A//gAH/wAAP/4A//gAP/wAAP/4A//gAP/4AAf/4A//wAP/+AD//4A///wP//////4Af//4P//////wAf//4P//////wAf//4P//////wAf//4P//////wAP//4P//////gAP//4H//////gAH//4H//////AAH//4D/////+AAD//4D/////8AAB//4B/////4AAA//4A/////wAAAP/4AP////AAAAB/4AD///4AAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAADgA//gAAAAAAP/gA//gAAAAAH//gA//gAAAAB///gA//gAAAAP///gA//gAAAD////gA//gAAAf////gA//gAAB/////gA//gAAP/////gA//gAB//////gA//gAH//////gA//gA///////gA//gD///////gA//gf///////gA//h////////gA//n////////gA//////////gAA/////////AAAA////////wAAAA///////4AAAAA///////AAAAAA//////4AAAAAA//////AAAAAAA/////4AAAAAAA/////AAAAAAAA////8AAAAAAAA////gAAAAAAAA///+AAAAAAAAA///4AAAAAAAAA///AAAAAAAAAA//4AAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gB///wAAAAP//4H///+AAAA///8P////gAAB///+f////4AAD///+/////8AAH/////////+AAH//////////AAP//////////gAP//////////gAf//////////gAf//////////wAf//////////wAf//////////wA///////////wA//4D//wAB//4A//wB//gAA//4A//gA//gAAf/4A//gA//AAAf/4A//gA//gAAf/4A//wB//gAA//4A///P//8AH//4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////gAP//////////gAP//////////AAH//////////AAD/////////+AAD///+/////8AAB///8f////wAAAf//4P////AAAAH//wD///8AAAAA/+AAf//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//gAAAAAAAAB///+AA/+AAAAP////gA//wAAAf////wA//4AAB/////4A//8AAD/////8A//+AAD/////+A///AAH/////+A///AAP//////A///gAP//////A///gAf//////A///wAf//////A///wAf//////A///wAf//////A///wA///////AB//4A//4AD//AAP/4A//gAB//AAP/4A//gAA//AAP/4A//gAA/+AAP/4A//gAB/8AAP/4A//wAB/8AAf/4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH/////////+AAD/////////8AAB/////////4AAAf////////wAAAP////////AAAAB///////4AAAAAD/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAB/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("EiAnGicnJycnJycnEw=="), 78+(scale<<8)+(1<<16));
};

// variables defined from settings
var secondsOnUnlock;
var secondsAlways;
var secondsColoured;
var dateAsISO;
var dateOnSecs;
var longDate;
var weekDay;
var upperCase;

// dynamic variables
var drawTimeout;
var queueMillis = 1000;
var secondsScreen = true;

var isBangle1 = (g.getWidth() == 240);

/* For development purposes
require('Storage').writeJSON(SETTINGSFILE, {
  secondsOnUnlock: false,
  secondsAlways: false,
  secondsColoured: true,
  dateAsISO: false,
  dateOnSecs: true,
  longDate: true,
  weekDay: true,
  upperCase: false,
});
/* */

/* OR (also for development purposes)
require('Storage').erase(SETTINGSFILE);
/* */

// Helper method for loading the settings
function def(value, def) {
  return (value !== undefined ? value : def);
}

// Load settings
function loadSettings() {
  var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
  secondsOnUnlock = def(settings.secondsOnUnlock, false);
  secondsAlways = def(settings.secondsAlways, false);
  secondsColoured = def(settings.secondsColoured, false);
  dateAsISO = def(settings.dateAsISO, false);
  dateOnSecs = def(settings.dateOnSecs, true);
  longDate = def(settings.longDate, true);
  weekDay = def(settings.weekDay, true);
  upperCase = def(settings.upperCase, true);
}

// schedule a draw for the next second or minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, queueMillis - (Date.now() % queueMillis));
}

function updateState() {
  if (Bangle.isLCDOn()) {
    if ((secondsOnUnlock && !Bangle.isLocked()) || secondsAlways) {
      secondsScreen = true;
      queueMillis = 1000;
    } else {
      secondsScreen = false;
      queueMillis = 60000;
    }
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
}

function isoStr(date) {
  return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).substr(-2) + "-" + ("0" + date.getDate()).substr(-2);
}

function doColor() {
  return !isBangle1 && !Bangle.isLocked() && secondsColoured;
}

function draw() {
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2 - (secondsOnUnlock || secondsAlways ? 24 : 12);
  g.reset();
  g.clearRect(0, 24, g.getWidth(), g.getHeight()); // clear whole background
  var date = new Date();
  var timeStr = require("locale").time(date, 1);
  // draw time
  g.setFontAlign(0, 0).setFont("Anton");
  g.drawString(timeStr, x, y);
  if (secondsScreen) {
    y += 76;
    var secStr = ":" + ("0" + date.getSeconds()).substr(-2);
    if (doColor())
      g.setColor(0, 0, 1);
    g.setFont("Anton");
    if (dateOnSecs) {
      g.setFontAlign(1, 0).drawString(secStr, g.getWidth() - (isBangle1 ? 32 : 2), y);
      y -= 16;
      x = g.getWidth() / 4 + (isBangle1 ? 12 : -4);
      var dateStr2 = (dateAsISO ? isoStr(date) : require("locale").date(date, 1));
      var year;
      var md;
      var yearfirst;
      if (dateStr2.match(/\d\d\d\d$/)) {
        year = dateStr2.slice(-4);
        md = dateStr2.slice(0, -4);
        if (!md.endsWith("."))
          md = md.slice(0, -1);
        yearfirst = false;
      } else {
        if (!dateStr2.match(/^\d\d\d\d/))
          dateStr2 = isoStr(date);
        year = dateStr2.slice(0, 4);
        md = dateStr2.slice(5);
        yearfirst = true;
      }
      g.setFontAlign(0, 0).setFont("Vector", 24);
      if (doColor())
        g.setColor(1, 0, 0);
      g.drawString(md, x, (yearfirst ? y + 28 : y));
      g.drawString(year, x, (yearfirst ? y : y + 28));
    } else {
      g.setFontAlign(0, 0).drawString(secStr, x, y);
    }
  } else { // No seconds screen
    y += 50;
    var dateStr = (dateAsISO ? isoStr(date) : require("locale").date(date, (longDate ? 0 : 1)));
    if (upperCase)
      dateStr = dateStr.toUpperCase();
    g.setFontAlign(0, 0).setFont("Vector", 24);
    g.drawString(dateStr, x, y);
    if (weekDay) {
      var dowStr = require("locale").dow(date);
      if (upperCase)
        dowStr = dowStr.toUpperCase();
      g.drawString(dowStr, x, y + 26);
    }
  }

  // queue next draw
  queueDraw();
}

// Init the settings of the app
loadSettings();
// Clear the screen once, at startup
g.clear();
// Set dynamic state and perform initial drawing
updateState();
// Register hooks for LCD on/off event and screen lock on/off event
Bangle.on('lcdPower', on => {
  updateState();
});
Bangle.on('lock', on => {
  updateState();
});
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// end of file
