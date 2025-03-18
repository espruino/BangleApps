/*
 * Limelight analoguce clock with bolted hands
 * Based on the work of @Andreas_Rozek
 * [Simple_Clock](https://github.com/espruino/BangleApps/tree/master/apps/simple_clock)
 *
 * . Demonstrates simpler approach to establishing the available size of the appRect in relation
 *   to widgets, avoids having to take on the responsibility for managing the widget draw.
 * . Demonstrates a settings menu and various configuration options
 * . Demonstrates fullscreen verses, widgets and app area.
 *
 */

Bangle.setUI('clock');

g.clear();

const widget_utils = require('widget_utils');
const SETTINGS_FILE = "limelight.json";
var UPDATE_PERIOD;
var drawTimeout;

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.secondhand = settings.secondhand||false;
  settings.font = settings.font||"Limelight";
  settings.vector = settings.vector||false;
  settings.fullscreen = settings.fullscreen||false;
  settings.vector_size = settings.vector_size||42;
  UPDATE_PERIOD = (settings.secondhand ? 1000 : 60000);
}

loadSettings();

// if we are not full screen then load and draw the widgets so that Bangle.appRect gets set
if (!settings.fullscreen) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}

// fonts.google.com
Graphics.prototype.setFontLimelight = function(scale) {
  // Actual height 28 (28 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAeAAAAAD8AAAAAf4AAAAB/gAAAAH+AAAAAf4AAAAB/gAAAAD8AAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAPwAAAAH8AAAAD+AAAAD+AAAAB/AAAAA/gAAAAfwAAAAD4AAAAAMAAAAAAAAAAAAAAAAAAAAA/gAAAA//wAAAP//wAAB///wAAP///gAA///+AAH///8AAf///4AD////gAP///+AA////4AD////gAMAAAGAAwAAAYADAAABgAMAAAGAAwAAAwABgAADAAHAAAYAAOAADgAAeAA8AAAfh/AAAAf/wAAAAHgAAAAAAAAAAGAAAAAAYAAAAABAAAAAAMAAAAAAwAAAAAD///+AAf///4AB////gAH///+AAf///4AD////gAP///+AA////4AH////gAf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgABAAAeAAOAAH4AAwAA/gAGAAP+AAYAB/4ADAAf/gAMAD/+AAwAf/4ADAH//gAMA//+AAwH//4ADB//9gAOP//GAA///wYAD//+BgAH//gGAAf/8AYAA//ABgAB/4AGAAD+AAYAADAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAHAAAwAAGAAHAAAMAAYAAAwADAEABgAMAwAGAAwDAAYADAMABgAMAwAGAAwDAAYAD////gAP///+AA////4AD////gAP///8AAf///wAB/7//AAD/H/4AAP4f/AAAPA/4AAAAA+AAAAAAAAAAAAAAAAAAAGAAAAAB8AAAAAPwAAAADzAAAAAcMAAAAHgwAAAA8DAAAAHAMAAAB4AwAAAOADAAADwAMAAAcAAwAAD///+AA////4AD////gAP///+AA////4AD////gAP///+AA////4AD////gAP///+AAAAAMAAAAAAwAAAAADAAAAAAcAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAHAAAH4AOAAP/gAcAA+GAAwADAwABgAMDAAGAAwMAAYADAwABgAMDAAGAAwMAAYADA///gAMD//+AAwP//4ADA///AAMB//8AAwH//wADAP/+AAIAf/wAAAA/+AAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAD/8AAAA//8AAAH//4AAB///wAAH///gAA////AAH///8AAf///4AD////gAP///+AAwAAAYADAYABgAMBgAGAAwGAAYADAYABgAMBgAGAAwGAAwABgYADAAHAwAYAAMDgHAAAAHh4AAAAP/AAAAAHgAAAAAAAAAAAAAAAA+AAAAAD4AAAAAMAAAAAAwAAAAADAAAAAAMAA/+AAwB//4ADB///gAM///+AA////4AD////gAP///+AA////4AD////gAP///+AA////4AD//+AAAP/wAAAA/wAAAAD4AAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAA/g/wAAH/GDgAA/+wGAAD//AMAAf/4AwAB//gBgAP//AGAAx/+AYADD/4BgAMH/wGAAwP/AYACA/+BgAMB/8GAAwD/wYADAP/jgAMBf/+AAYH//wABgz//AADHH/4AAH4f/gAAOA/8AAAAB/AAAAAAwAAAAAAAAAAAAAAAAAeAAAAAH/AAAAB8eAAAAGAcBgAAwAwHAAGABgMAAYAGAYADAAIBgAMAAwGAAwADAYADAAYBgAMAAgGAAwAAAYAD////gAP///+AA////wAB////AAH///4AAP///AAA///8AAA///AAAB//4AAAB/+AAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAeAAAD8D8AAAf4f4AAB/h/gAAH+H+AAAf4f4AAB/h/gAAD8D8AAAHgHgAAAAAAAAAAAAAAA="), 46, atob("DQ0aExgZHRkbGBsbDQ=="), 40+(scale<<8)+(1<<16));
}

// fonts.google.com
Graphics.prototype.setFontGochiHand = function(scale) {
  // Actual height 29 (31 - 3)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAB4AAAAAD4AAAAAB4AAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAH/gAAAD//gAAD///gAD///+AAH///AAAH//gAAAH/wAAAAHwAAAAAAAAwAAAAAP+AAAAA//gAAAB//wAAAD//4AAAD8P4AAAHwD8AAAHgB8AAAPgA8AAAPAA8AAAPAA8AAAPAA8AAAPgA8AAAPgA8AAAPgB8AAAHwB4AAAH4D4AAAD+PwAAAD//gAAAB//gAAAA/+AAAAAP8AAAAAAAAAAAAAAAAAAAcAAAAAA8AAAAAB8AAAAAD4AAAAAD4AAAAAHwAAAAAHgAAAAAPgAAAAAPgAAAAAf/AAAAAf//wAAAP//wAAAH//wAAAAf/wAAAAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAA8AAAeAB8AAA+AD8AAB+AH8AAB4AP8AAD4AP8AADwAf8AADwB+8AAD4D88AAD4H48AAD//w+AAB//g+AAB//A+AAA/8A+AAAPwA+AAAAAA+AAAAAAcAAAAAAIAAAAAAAAAA8AAAAAB8AAAAAB8AAAAAB4AHgAAD4AHwAAD4AH4AADwPH8AADwfB8AADwfA8AAD4fA+AAD4fA+AAB//A+AAB//A+AAA//A8AAA//x8AAAPP/8AAAAH/4AAAAD/wAAAAB/gAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAH8AAAAAP+AAAAA/+AAAAB/+AAAAD8+AAAAP4+AAAB/weAAAD/weAAAD/8eAAAB///AAAA///AAAAH//8AAAAf//AAAAD//AAAAAf/AAAAAf+AAAAAfAAAAAAMAAAAAAAAAAAAAAAAAAPA/gAAAfh/wAAA/x/4AAA/x/4AAB/4/8AAB74B8AAB58A8AAB58A+AAB5+A+AAB4+A+AAB4+A+AAB4fA+AAB4fg+AAB4Pg8AAB4P58AAB4H/4AAB4D/4AAB4D/wAAAQA/gAAAAAAAAAAAAAAAAAAAAAAAAAf8AAAAB/+AAAAD//gAAAH//gAAAPwfwAAAPgf4AAAfAf4AAAeA/8AAAeA98AAAeA88AAAfB48AAAfB48AAAPB48AAAOB48AAAAB98AAAAB/8AAAAA/4AAAAA/wAAAAAfgAAA8AAAAAA8BAAAAA8HgAAAA8HgAAAA8HgAAAA8HgAAAA8HgAAAA+HgAAAA+HgAAAA+HgAAAAfHgAAAAf//+AAAf//+AAAP//+AAAH//8AAAAPwAAAAAHgAAAAAHwAAAAAHwAAAAAHwAAAAADwAAAAADgAAAAAAAAAAAAAAAAAAAB/AAAAP3/wAAAf//wAAA///4AAA//D8AAB9+B8AAB4+A8AAB4+A+AAB4+A+AAB4+A+AAB8+A+AAB8+A+AAA/+A8AAA//A8AAAf/x8AAAP//4AAAH//wAAAAD/gAAAAB/AAAAAAAAAAAAAAAAAAD/AAAAAD/gAAAAH/gAAAAP/wAAAAPHwAAAAPDwAAAAeDwAAAAeDwAAAAeDwAAAAeHwAAAAeHgAAAAePgAAAAefAAAAAf/AAAAAf///gAAf///wAAP///wAAP///gAAH8AAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8BwAAAA8B4AAAA+D4AAAA8B4AAAAcB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="), 46, atob("DQoYERUWFBYVFhcVDQ=="), 42+(scale<<8)+(1<<16));
}

// free for commercial use
// https://www.1001fonts.com/search.html?search=Grenadier+NF
Graphics.prototype.setFontGrenadierNF = function(scale) {
  // Actual height 39 (39 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAB4AAAAAAPAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAEAAAAAAPgAAAAA/8AAAAB//gAAAD//4AAAP//wAAAf//AAAB//+AAAD//8AAAB//wAAAAP/gAAAAB+AAAAAAMAAAAAAAAAAAAAAAAB4AAAAAD/8AAAAB//4AAAA///wAAAP8D/AAAD8AD8AAA/AAPwAAPgAAfAAD4AAB8AAeAAAHgAHwAAA+AA8AAADwAHgAAAeAB4AAAB4APAAAAPAB4AAAB4APAAAAPAB4AAAB4APAAAAPAB4AAAB4APAAAAPAB4AAAB4APgAAAfAA8AAADwAHwAAA+AAeAAAHgAD4AAB8AAPgAAfAAA+AAHwAAD8AD8AAAP8D/AAAA///wAAAD//8AAAAH/+AAAAAD8AAAAAAAAAAAAAAAAAAABAAAAAAAcAAAAAAHwAAAAAB8AAAAAAfgAAAAAH/////AB/////4AP/////AB/////4AAAAAAAAAAAAAAAAAAAAADAAAAAAA4APAAAAPAB4AAAD4APAAAA/AB4AAAP4APAAAD/AB8AAA/4AHgAAPvAA8AAD54ADwAB+PAAfAAfh4AB8AH4PAAPwD+B4AA///gPAAD//wB4AAH/4APAAAP8AAAAAAAAAAAAAAAAAAAPAAAAHAB4AAAB4APAAAAPAB4PAAB4APB4AAPAB+/gAB4AH/8AAfAAf/wADwAB/fAA+AABD8APgAAAPwH4AAAA//+AAAAD//gAAAAH/4AAAAAP8AAAAAAAAAAAAAAAAAAAAAAYAAAAAAPAAAAAAH4AAAAAD/AAAAAB/4AAAAA//AAAAAf94AAAAH+PAAAAD/B4AAAB/gPAAAA/wB4AAAf8APAAAP////4AH/////AD/////4AAAAAPAAAAAAA4AAAAAAAAAAAAAAAAAAAIAAPAAAPAAB4AAf4AAPAA//gAB4AP/8AAPAB/3gAB4APg8AAfAB4DwADwAPAfAA+AB4B8APgAPAP4H4AB4A//+AAPAB//gAB4AH/4AAAAAP8AAAAAAAAAAAAAB4AAAAAD/4AAAAA//wAAAAf//AAAAP+H8AAAH+AHwAAB/gAfAAA/4AB4AAf+AAPAAP/wAA8AH+eAAHgB/ngAA8APw8AAHgB4HgAA8AMA8AAHgAADwAA8AAAeAAPgAAD4AB4AAAPgAfAAAA+AHwAAAH4D8AAAAf//AAAAB//wAAAAD/8AAAAAH8AAAAAAAAAAAAAAAAAAAAAAAYAAAAAAfAB4AAAP4APAAAH/AB4AAH/gAPAAD/wAB4AD/wAAPAB/4AAB4A/8AAAPA/8AAAB4f+AAAAPP+AAAAB//AAAAAP/gAAAAB/gAAAAAPwAAAAAB4AAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAB//AAAAAf/+AAAAH//4AAAB+AfgAA+fAB8AAP/wAHwAD/+AAeAA//gAB4APj8AAPAB4PAAB4APB4AAPAB4PAAB4APB4AAPAB8fgAB4AH/8AAPAAf/wADwAB/eAA+AADj4APgAAAPwD8AAAA///AAAAD//wAAAAP/4AAAAAf8AAAAAAAAAAAB4AAAAAB/4AAAAA//wAAAAP//AAAAD+H8AAAA/AHwAAAHgAfAAAB8AB4AAAPAAHgAADwAA8AAAeAAHgBADwAAeA4AeAADwfADwAAeP4AeAAD3+ADwAA9/gAfAAH/wAB4AB/4AAPgAf8AAA+AH+AAAD8B/gAAAP//wAAAA//4AAAAD/8AAAAAD+AAAAAAAAAAAAAAAAAAAAAAAeB4AAAADwPAAAAAeB4AAAAAAAAAAAAAAAA=="), 46, atob("Bg4kChURExEaFBoaBg=="), 45+(scale<<8)+(1<<16));
}

// fonts.google.com
Graphics.prototype.setFontMonoton = function(scale) {
  // Actual height 38 (37 - 0)
  g.setFontCustom(atob("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"), 46, atob("ChIiERcYGRwfGSAfCw=="), 40+(scale<<8)+(1<<16));
}

/*
 * If only 1 widget is loaded at the top, then Bangle.appRect changes
 * to report as if widgets were loaded at the bottom as well.  The
 * other option would be for Bangle.appRect to adjust for different
 * combinations EG: no widgets, wigets on top, widgets on bottom and
 * widgets on top and bottom areas, but it does not at present.
 *
 * Example of Bangle.appRect with 3 widges on the top, note h = 152, not 176
 * ={ x: 0, y: 24, w: 176, h: 152, x2: 175, y2: 175 }
 *
 * With the example below we are going assume that the bottom widget
 * space is not used.
 *
 */
const CenterX = g.getWidth()/2;
const CenterY = (g.getHeight()/2) + (Bangle.appRect.y/2); 
const outerRadius = (g.getHeight() - Bangle.appRect.y)/2;

if (settings.fullscreen) {
  Bangle.loadWidgets();
  /*
   * We load the widgets as some like widpedom accumualte the step count.
   * we are not drawing the widgets as we are taking over the whole screen
   */
  widget_utils.hide();
}

function debug(o) {
  //console.log(o);
}

debug("limelight.app.js");
debug("CenterX=" + CenterX);
debug("CenterY=" + CenterY);
debug("outerRadius=" + outerRadius);
debug("y12=" + (CenterY - outerRadius));
debug("y6=" + (CenterY + outerRadius));

let HourHandLength = outerRadius * 0.5;
let HourHandWidth  = 2*5, halfHourHandWidth = HourHandWidth/2;

let MinuteHandLength = outerRadius * 0.7;
let MinuteHandWidth  = 2*3, halfMinuteHandWidth = MinuteHandWidth/2;

let SecondHandLength = outerRadius * 0.9;
let SecondHandOffset = halfHourHandWidth + 10;

let outerBoltRadius = halfHourHandWidth + 2, innerBoltRadius = outerBoltRadius - 4;
let HandOffset = outerBoltRadius + 4;

let twoPi  = 2*Math.PI, deg2rad = Math.PI/180;
let Pi     = Math.PI;

let sin = Math.sin, cos = Math.cos;

let sine = [0, sin(30*deg2rad), sin(60*deg2rad), 1];

let HandPolygon = [
  -sine[3],-sine[0], -sine[2],-sine[1], -sine[1],-sine[2], -sine[0],-sine[3],
  sine[0],-sine[3],  sine[1],-sine[2],  sine[2],-sine[1],  sine[3],-sine[0],
  sine[3], sine[0],  sine[2], sine[1],  sine[1], sine[2],  sine[0], sine[3],
  -sine[0], sine[3], -sine[1], sine[2], -sine[2], sine[1], -sine[3], sine[0],
];

let HourHandPolygon = new Array(HandPolygon.length);
for (let i = 0, l = HandPolygon.length; i < l; i+=2) {
  HourHandPolygon[i]   = halfHourHandWidth*HandPolygon[i];
  HourHandPolygon[i+1] = halfHourHandWidth*HandPolygon[i+1];
  if (i < l/2) { HourHandPolygon[i+1] -= HourHandLength; }
  if (i > l/2) { HourHandPolygon[i+1] += HandOffset; }
}
let MinuteHandPolygon = new Array(HandPolygon.length);
for (let i = 0, l = HandPolygon.length; i < l; i+=2) {
  MinuteHandPolygon[i]   = halfMinuteHandWidth*HandPolygon[i];
  MinuteHandPolygon[i+1] = halfMinuteHandWidth*HandPolygon[i+1];
  if (i < l/2) { MinuteHandPolygon[i+1] -= MinuteHandLength; }
  if (i > l/2) { MinuteHandPolygon[i+1] += HandOffset; }
}

/**** transforme polygon ****/

let transformedPolygon = new Array(HandPolygon.length);

function transformPolygon (originalPolygon, OriginX,OriginY, Phi) {
  let sPhi = sin(Phi), cPhi = cos(Phi), x,y;

  for (let i = 0, l = originalPolygon.length; i < l; i+=2) {
    x = originalPolygon[i];
    y = originalPolygon[i+1];

    transformedPolygon[i]   = OriginX + x*cPhi + y*sPhi;
    transformedPolygon[i+1] = OriginY + x*sPhi - y*cPhi;
  }
}

/**** draw clock hands ****/

function drawClockHands () {
  let now = new Date();

  let Hours   = now.getHours() % 12;
  let Minutes = now.getMinutes();
  let Seconds = now.getSeconds();

  let HoursAngle   = (Hours+(Minutes/60))/12 * twoPi - Pi;
  let MinutesAngle = (Minutes/60)            * twoPi - Pi;
  let SecondsAngle = (Seconds/60)            * twoPi - Pi;

  g.setColor(g.theme.fg);

  transformPolygon(HourHandPolygon, CenterX,CenterY, HoursAngle);
  g.fillPoly(transformedPolygon);

  transformPolygon(MinuteHandPolygon, CenterX,CenterY, MinutesAngle);
  g.fillPoly(transformedPolygon);

  let sPhi = Math.sin(SecondsAngle), cPhi = Math.cos(SecondsAngle);

  if (settings.secondhand) {
    g.setColor(g.theme.fg2);
    g.drawLine(
      CenterX + SecondHandOffset*sPhi,
      CenterY - SecondHandOffset*cPhi,
      CenterX - SecondHandLength*sPhi,
      CenterY + SecondHandLength*cPhi
    );
  }
  
  g.setColor(g.theme.fg);
  g.fillCircle(CenterX,CenterY, outerBoltRadius);

  g.setColor(g.theme.bg);
  g.drawCircle(CenterX,CenterY, outerBoltRadius);
  g.fillCircle(CenterX,CenterY, innerBoltRadius);
}

function setNumbersFont() {
  if (settings.vector) {
    g.setFont('Vector', settings.vector_size);
    return;
  }

  if (settings.font == "GochiHand")
    g.setFontGochiHand();
  else if (settings.font == "Grenadier")
    g.setFontGrenadierNF();
  else if (settings.font == "Monoton")
    g.setFontMonoton();
  else
    g.setFontLimelight();
}

function drawNumbers() {
  g.setColor(g.theme.fg);
  setNumbersFont();

  g.setFontAlign(0,-1);
  g.drawString('12', CenterX, CenterY - outerRadius);

  g.setFontAlign(1,0);
  g.drawString('3', CenterX + outerRadius, CenterY);

  g.setFontAlign(0,1);
  g.drawString('6', CenterX, CenterY + outerRadius);

  g.setFontAlign(-1,0);
  g.drawString('9', CenterX - outerRadius,CenterY);
}

function draw() {
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);

  drawClockHands();
  drawNumbers();
  queueDraw();
}

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, UPDATE_PERIOD - (Date.now() % UPDATE_PERIOD));
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

draw();
