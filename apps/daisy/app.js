var SunCalc = require("suncalc"); // from modules folder
const storage = require('Storage');
const widget_utils = require('widget_utils');
let settings = undefined;
let location = undefined;
const SETTINGS_FILE = "daisy.json";
const global_settings = storage.readJSON("setting.json", true) || {};
const LOCATION_FILE = "mylocation.json";
const h = g.getHeight();
const w = g.getWidth();
const rad = h/2;
const hyp = Math.sqrt(Math.pow(rad, 2) + Math.pow(rad, 2));

// variable for controlling idle alert
let lastStep = getTime();
let warned = 0;
let idle = false;
let IDLE_MINUTES = 26;

var pals = Array(3).fill().map(() => (
  { pal1: null, // palette for 0-49%
    pal2: null  // palette for 50-100%
  }));

let palbg;
const infoLineDefault = (3*h/4) - 6;
const infoWidthDefault = 64;
const infoHeightDefault = 8;
const ringEdge = 4;
const ringIterOffset = 10;
const ringThick = 6;
const minStepToUpdate = 10; // In number of steps as a minumum to update the text.
const minStepPctUpdateRings = 3;  // If the current step is less percent than last updated, don't redraw the rings
let nextUpdateMs;
var drawingSteps = false;
var innerMostRing = 0;
var outerMostRing = 0;
var prevStepDisplayed = 0;
var prevRing = Array(3).fill().map(() => ({ start: null, end: null, max: null }));

function log_debug(o) {
  //print(o);
}

var hrmImg = require("heatshrink").decompress(atob("i0WgIKHgPh8Ef5/g///44CBz///1///5A4PnBQk///wA4PBA4MDA4MH/+Ah/8gEP4EAjw0GA"));

// https://www.1001fonts.com/rounded-fonts.html?page=3
//one ring
Graphics.prototype.setFontBloggerSansLight46 = function(scale) {
  // Actual height 46 (45 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAA/AAAAAAAAPwAAAAAAAD4AAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH/gAAAAAAP/wAAAAAAf/gAAAAAAf/AAAAAAA//AAAAAAB/+AAAAAAD/8AAAAAAH/4AAAAAAH/wAAAAAAP/gAAAAAAf/gAAAAAA//AAAAAAB/+AAAAAAA/8AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///8AAAAP////4AAAP/////AAAH/////4AAD+AAAB/AAA8AAAAHwAAeAAAAA+AAHgAAAAHgADwAAAAB4AA8AAAAAPAAPAAAAADwADwAAAAA8AA8AAAAAPAAPAAAAADwAB4AAAAB4AAeAAAAAeAAHwAAAAPgAA/AAAAPwAAH/////4AAA/////8AAAH////+AAAAf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAPAAAAAAAAHwAAAAAAAB4AAAAAAAA+AAAAAAAAfAAAAAAAAHgAAAAAAAD4AAAAAAAB8AAAAAAAAeAAAAAAAAPgAAAAAAADwAAAAAAAB//////4AAf//////AAH//////gAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAD4AAHAAAAD+AAD4AAAB/gAA8AAAB/4AAfAAAA/+AAHgAAAf3gAB4AAAPx4AA8AAAH4eAAPAAAD4HgADwAAB8B4AA8AAA+AeAAPAAAfAHgADwAAPgB4AA8AAHwAeAAHgAD4AHgAB4AD8AB4AAfAB+AAeAAD8B/AAHgAAf//gAB4AAH//wAAeAAAf/wAAHgAAB/wAAA4AAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AADgAAAAPAAB4AAAADwAAeAAAAA+AAHgAAAAHgAB4ABgAB4AAeAA8AAeAAHgA/AADwAB4AfwAA8AAeAP8AAPAAHgH/AADwAB4H7wAA8AAeD48AAPAAHh8PAAHgAB5+BwAB4AAe/AeAA+AAH/AHwAfAAB/gA/AfgAAfwAH//wAAHwAA//4AAA4AAH/8AAAAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAD+AAAAAAAD/gAAAAAAH/4AAAAAAH/+AAAAAAP/ngAAAAAP/h4AAAAAf/AeAAAAAf/AHgAAAA/+AB4AAAA/+AAeAAAB/8AAHgAAA/8AAB4AAAP4AAAeAAAB4AAAHgAAAAAAAB4AAAAAAAAeAAAAAAP///4AAAAH////AAAAA////gAAAAP///4AAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAD4AA8AAD///gAPAAB///4AD4AAf//+AAeAAH+APAAHgAB4AHgAA4AAeAB4AAOAAHgAcAADwAB4AHAAA8AAeADwAAPAAHgAcAADwAB4AHAAA8AAeAB4AAeAAHgAeAAHgAB4AHwAD4AAeAA+AB8AAHgAP4B+AAB4AB///gAAOAAP//gAABAAA//wAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAB///4AAAAD////wAAAD////+AAAB/////4AAA/gPgB/AAAfgDwAHwAAPgA8AA+AADwAeAAHgAB4AHgAB4AAeAB4AAfAAHgAeAADwABwAHgAA8AAcAB4AAPAAHAAeAAHwAB4AHgAB4AAeAB8AAeAAHgAPAAPgAB4AD8APwAAOAAfwP4AADgAD//8AAAAAAf/+AAAAAAB/+AAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAAB4AAAAA4AAeAAAAB/AAHgAAAB/wAB4AAAB/4AAeAAAD/4AAHgAAD/wAAB4AAH/wAAAeAAH/gAAAHgAP/gAAAB4AP/AAAAAeAf/AAAAAHgf+AAAAAB4/+AAAAAAe/8AAAAAAH/8AAAAAAB/4AAAAAAAf4AAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAA/AB/+AAAA/8B//wAAA//gf/+AAAf/8PgPgAAH4fngB8AAD4B/wAPgAA8AP8AB4AAeAB+AAeAAHgAfgADwAB4ADwAA8AAcAA8AAPAAHAAPAADwAB4ADwAA8AAeAB+AAPAAHgAfgAHgAB8AP8AB4AAPgH/AA+AAD8H54AfAAAf/8fgPwAAD/+D//4AAAf/Af/8AAAB/AD/+AAAAAAAP+AAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAf/wAAAAAAf/+AAAAAAP//4AAwAAH//+AAeAAD+APwAHgAA+AA+AB4AAfAAHgAOAAHgAB4ADwAB4AAPAA8AAeAADwAPAAHgAA8ADwAB4AAPAA8AAeAADwAPAAHgAA8AHgAB8AAeAB4AAPgAHgA+AAD8ADwA/AAAfwA8A/gAAD/wef/wAAAf////4AAAB////4AAAAH///wAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AB4AAAAAfgA/AAAAAH4APwAAAAB+AD4AAAAAPAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DRAcHBwcHBwcHBwcDQ=="), 56+(scale<<8)+(1<<16));
  return this;
};

//Two Rings
Graphics.prototype.setFontBloggerSansLight42 = function() {
  // Actual height 28 (31 - 4)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAHwAAAAAHwAAAAAHwAAAAADgAAAAAAAAAAAAAwAAAAAHwAAAAA/wAAAAH+AAAAA/wAAAAH+AAAAA/wAAAAH+AAAAA/wAAAAD+AAAAADwAAAAACAAAAAAAAAAAAAAAAAAAAAAP8AAAAD//wAAAP//8AAA////AAB////gAB4AAPgADwAADwADgAAAwADAAAAwADAAAAwADAAAAwADgAAAwADwAADwAB8AAPgAB////gAA////AAAP//8AAAD//wAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAMAAAQAAYAAAwAAYAAAwAA4AAAwAAwAAAwAB////wAD////wAD////wAD////wAAAAAAwAAAAAAwAAAAAAwAAAAAAwAAAAAAQAAAAAAQAAAAAAAAAAAAAAAAAAAAAAB8AADwAB+AAHwAD8AAPwADgAAfwADAAA7wADAABzwADAABzwADAAHjwADAAPDwADAAeDwADgA8DwAD4H4DwAB//wDwAB//gDwAA/+ADwAAP8ADwAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAfgAB8AAfwAD8AABwADgAABwADAAAAwADADAAwADADAAwADADAAwADADAAwADAHAAwADgHgBwADwfgBwAB//4DgAB/8//gAA/4//AAAfwf+AAAAAP8AAAAABgAAAAAAAAAAAAAAAAAAADwAAAAAPwAAAAAfwAAAAA9wAAAADxwAAAAHhwAAAAeBwAAAA8BwAAADwBwAAAHgBwAAAfABwAAA8ABwAAB////wAD////wAD////wAD////wAAAABwAAAAABwAAAAABwAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAD//AfgAD//AHwAD//ABwADwHAAwADwHAAwADwGAAwADwGAAwADwGAAwADwHAAwADwHABwADwHABwADwDgDgADwD//gADwB//AADgB/+AAAAAf8AAAAADAAAAAAAAAAAAAAAAAAAAAAAAAA//gAAAH//8AAAP//+AAAf///AAA/DAfgAB4DAHwABwHABwADgGAAwADgGAAwADAGAAwADAHAAwADAHAAwADAHgBwADgH8fgAD4D//gAD8D//AAAAA/+AAAAAf4AAAAAAAAAAAAAAAAAAAAAAAD8AAAAAD+AAAAAD8AAAAADwAAAwADwAADwADwAAPwADwAA/gADwAD8AADwAPwAADwA/AAADwD8AAADwPwAAADw/AAAADz4AAAAD/gAAAAD+AAAAAD4AAAAADgAAAAAAAAAAAAAAAAAAAAAADgAAAHgP8AAAf4f/AAA/8//gAB////gAD8/wDwADgHgBwADAHAAwADADAAwADADAAwADADAAwADAHAAwADgHgBwAB8/wDwAB////gAA/8//gAAf4f/AAAHgP8AAAAADgAAAAAAAAAAAAAAAAAD8AAAAAP/AHgAA//gPwAB//wDwAB/f4AwADwB4AwADgA4AwADAAYAwADAAYAwADAAYAwADAAYBwADgA4DwADwAwHgAB+Aw/gAB////AAA///+AAAf//4AAAD//gAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMADgAAAeAHwAAA/AHwAAA/AHwAAAeAHwAAAAABAAAAAAAAAA'),
    46,
    atob("CQ0VFBQVFhUVFRUVCg=="),
    42|65536
  );
};

// Three rings
Graphics.prototype.setFontBloggerSansLight38 = function() {
  // Actual height 25 (28 - 4)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAwAAAAAeAAAAAPgAAAAD4AAAAAcAAAAAAAAAAAAYAAAAA+AAAAB/AAAAD+AAAAH8AAAAP4AAAAP4AAAAfwAAAA/gAAAAPAAAAACAAAAAAAAAAAAAAAAAAAA/4AAAB//wAAB///AAA///8AAfgA/AAPAAB4ADAAAGAAwAABgAMAAAYADAAAGAA4AABgAPAAB4AB+AD8AAP//+AAB///AAAH//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAACAAGAAAgABgAAYAAwAAGAAcAABgAH///4AD///+AA////gAP///4AAAAAGAAAAABgAAAAAYAAAAACAAAAAAgAAAAAAAAAAAAAAAAADgAHwAB4AD8AA+AA4AAfgAMAAG4ADAADOAAwABjgAMAA44ADAAcOAAwAeDgAOAPA4AB8/gOAAf/wDgAD/4A4AAf4AOAAB4ADgAAAAAAAAAAAAAAAAAAAAHwAH4AD8AA+AA8AABgAMAAAYADAGAGAAwBgBgAMAYAYADAGAGAAwDgBgAOA4AYAD5/AOAAf+8PAAH/n/wAA/x/4AABgP8AAAAA8AAAAAAAAAAABgAAAAA8AAAAA/AAAAAdwAAAAecAAAAPHAAAAHBwAAAHgcAAADgHAAADwBwAAB4AcAAA8AHAAA////gAP///4AD///+AAAABwAAAAAcAAAAAHAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAHwAD/8B+AA//ADgAOAwAYADgMAGAA4DABgAOAwAYADgMAGAA4DABgAOA4A4ADgOAOAA4B4PAAOAf/wADgD/4AAAAf8AAAAB4AAAAAAAAAAAAAAAAA+AAAAD//AAAD//8AAB///gAA/2f8AAfBgHAAHAwA4ADgMAGAAwDABgAMAwAYADAMAGAAwDgDgAMA8B4ADwP/8AA+B//AAHgP/AAAAA/AAAAAAAAAAAAAAAAAAAAAA/AAAAAPwAAAADwAACAA4AADgAOAAD4ADgAD8AA4AD8AAOAD8AADgD8AAA4D8AAAOD8AAADj4AAAA74AAAAP4AAAAD4AAAAA4AAAAAAAAAAAAAAAAAAAAHwAAB8H/AAA/z/4AAf+//AAH/+B4ADgeAOAAwDgBgAMAwAYADAMAGAAwDABgAMA4AYADgeAOAAf/4PgAH/v/wAA/z/8AAHwP8AAAAB8AAAAAAAAAAAAAAAAfgAAAAf+A+AAP/wPgAH/8AYADwHgGAA4A4BgAMAOAYADABgGAAwAYBgAMAGA4ADgDgeAA8AwPAAH+N/wAA///4AAH//4AAAf/8AAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgBwAAB8A+AAAfAPgAAHgB4AAAwAMAAAAAAAAA=='),
    46,
    atob("CAwTEhITFBMTExMTCQ=="),
    38|65536
  );
};

Graphics.prototype.setFontRoboto20 = function(scale) {
  // Actual height 21 (20 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAH/zA/+YAAAAAAAHwAAwAAHwAA+AAAAAAAAAAAQACDAAYbADP4B/8A/zAGYZADH4A/+A/7AHYYADCAAAAAAAQAeHgH4eBzgwMMHnhw88GGBw4wHj+AcPgAAAAAAAAAAB4AA/gAGMAAwhwGMcAfuABzgABzgAc+AOMYBhBAAMYAB/AAHwAAAAAHwD5+A/8YGPDAw8YGPzA/HYD4fAADwAB/AAOYAABAAAAHwAA4AAAAAAAAAAH/gD//B8A+cAA7AADAAAAAAAYAAbwAHHgHwf/4A/8AAAAEAABiAAGwAA8AA/AAH+AAGwAByAAEAAAAAAAMAABgAAMAABgAH/wA/+AAMAABgAAMAABgAAAAAAAIAAfAADwAAAABgAAMAABgAAMAABgAAAAAAAAAAAAADAAAYAAAAAAAAADgAB8AB+AA+AA+AA/AAHAAAgAAAAAAB8AB/8Af/wHAHAwAYGADAwAYHAHAf/wB/8AAAAAAAAAAABgAAcAADAAAYAAH//A//4AAAAAAAAAAAAAAAAAAAAABwDAeA4HAPAwHYGBzAwcYHHDAfwYB8DAAAYAAAAAAABgOAcBwHADAwwYGGDAwwYHPHAf/wB58AAAAAAAAADAAB4AAfAAPYAHjAB4YA8DAH//A//4AAYAADAAAAAAAAAEMA/xwH+HAxgYGMDAxgYGODAw/4GD+AAHAAAAAAAAAf8AP/wD2HA5wYGMDAxgYGOHAA/wAD8AAAAAAAAAAAGAAAwAAGADAwB4GB+Aw+AGfAA/gAHwAAwAAAAAAADAB5+Af/wHPDAwwYGGDAwwYHPHAfvwB58AAAAAAAAAAAB+AAf4AHDjAwMYGBjAwM4HDOAf/gB/4AAAAAAAAAAAAYDADAYAAAAAAAAAAYDAfAYHwAAAABAAAcAADgAA+AAGwAB3AAMYABjgAYMAAAAAAAAAAAAAAABmAAMwABmAAMwABmAAMwABmAAMwAAiAAAAAAAAAYMADjgAMYAB3AAGwAA2AADgAAcAABAAAAAAAAAMAADgAA4AAGBzAweYGHAA/wAD8AAEAAAAwAB/4A/PwOAGDgAYYPxmH/Mw4ZmMDMxgZmM+Mx/5mHDAYAIDgDAPBwAf8AAMAAAAAAAYAAfAAPwAP4AH+AH4wA8GAH4wAP2AAPwAAfwAAfAAAYAAAAAAAAAAA//4H//AwwYGGDAwwYGGDAwwYH/HAf/wB58AAAAADAAH/AD/+AcBwHADAwAYGADAwAYGADA4A4DweAODgAAAAAAAAAAAAAAH//A//4GADAwAYGADAwAYGADAYAwD4+AP/gAfwAAAAAAAAAAAH//A//4GDDAwYYGDDAwYYGDDAwYYGCDAgAYAAAAAAAH//A//4GDAAwYAGDAAwYAGDAAwYAGAAAAAAAAAAH/AD/8AcBwHAHAwAYGADAwYYGDDA4YYDz/AOfwAAAAAAAAAAA//4H//A//4ADAAAYAADAAAYAADAAAYAADAA//4H//AAAAAAAAAAAAAAA//4H//AAAAAAAAABAAAeAAB4AADAAAYAADAAAYAAHA//wH/8AAAAAAAAAAAAAAA//4H//AAcAAPAAD4AA/wAOPADg8A4B4GAHAgAYAAAAAAAH//A//4AADAAAYAADAAAYAADAAAYAADAAAAAAAA//4H//A+AAB+AAD8AAD8AAH4AAPAAH4AH4AD8AD8AA+AAH//A//4AAAAAAAH//A//4H//AeAAB8AADwAAPgAAeAAA8AADwH//A//4AAAAAAAAAAAH/AB/8AeDwHAHAwAYGADAwAYGADA4A4DweAP/gA/4AAAAAAAAAAAH//A//4GBgAwMAGBgAwMAGBgAwcAH/AAfwAA8AAAAAA/4AP/gDgOA4A4GADAwAYGADAwAYHAHgeD+B/8wD+GAAAAAAAAAAA//4H//AwYAGDAAwYAGDgAweAHH8Afz4B8HAAAIAAYAPDwD8OA5w4GGDAwwYGHDAwYYHDnAePwBw8AAAAGAAAwAAGAAAwAAGAAA//4H//AwAAGAAAwAAGAAAwAAAAAAAAAH/4A//wAAPAAAYAADAAAYAADAAAYAAPA//wH/8AAAAAAAAgAAHAAA/AAB/AAD+AAD+AAD4AAfAAfwAfwAfwAH4AA4AAEAAA+AAH/AAH/gAD/AAD4AD+AH+AH8AA+AAH+AAD+AAD/AAD4AH/AP/AH+AA8AAAAAAAAAGADA4A4HweAPPgA/wAB8AAfwAPvgDweA8B4GADAAAIGAAA4AAHwAAPgAAfAAA/4AH/AD4AB8AA+AAHgAAwAAAAAAAAAGADAwB4GAfAwPYGDzAx4YGeDA/AYHwDA4AYGADAAAAAAAA///3//+wAA2AAGAAAGAAA+AAD8AAD8AAD4AAH4AAHgAAMAAAAwAA2AAG///3//+AAAAAAAAAAAOAAHwAD4AA8AAD8AADwAAGAAAAAAABgAAMAABgAAMAABgAAMAABgAAMAABgAAAEAAAwAADAAAIAAAAAAAAAAEeABn4Ad3ADMYAZjADMYAZmAB/4AP/AAAAAAAA//4H//ABgwAYDADAYAYDADg4AP+AA/gABwAAAAAAAAA/gAP+ADg4AYDADAYAYDADAYAOOABxwAAAAAEAAH8AB/wAcHADAYAYDADAYAcDA//4H//AAAAAAAAAAAAH8AB/wAdnADMYAZjADMYAZjAB84AHmAAMAAMAABgAB//gf/8HMAAxgAGIAAAAAAH8IB/zAcHMDAZgYDMDAZgcHcD//Af/wAAAAAAAAAAH//A//4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAGf/Az/4AAAAAAAAAAMz//mf/4AAAAAAAAAAH//A//4ABwAAeAAH4ABzwAcPACAYAABAAAAAAAA//4H//AAAAAAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/ABgAAYAADAAAYAADgAAP/AA/4AAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAAH8AB/wAcHADAYAYDADAYAYDADx4AP+AA/gAAAAAAAAf/8D//gYDADAYAYDADAYAcHAB/wAH8AAEAAAAAAEAAH8AB/wAcHADAYAYDADAYAYDAD//gf/8AAAAAAAAAAAf/AD/4AcAADAAAYAACAAAAEAB5wAfnADMYAZjADGYAYzADn4AOeAAAAAAAADAAAYAAf/wD//ADAYAYDAAAAAAAAD/gAf/AAA4AADAAAYAADAAAwAf/AD/4AAAAAAAAYAAD4AAP4AAP4AAPAAH4AH4AD8AAcAAAAAAQAADwAAf4AAf4AAPAAP4AP4ADwAAfgAA/gAA/AAD4AH+AD+AAeAAAAAAAAACAYAcHADzwAH8AAfAAH8ADx4AcHACAIAcAMD4BgP4MAP/AAPwAP4AP4AD4AAcAAAAAAAAADAYAYHADD4AY7ADOYAfjADwYAcDADAYAAAAADAAA4AH//B/v8cABzAACAAAH//w//+AAAAAAACAACcAAx/n+H//AA4AAHAAAAAAAAAAAAAOAADgAAYAADAAAcAABgAAGAAAwAAGAADwAAcAAAAA"), 32, atob("BQUHDQwPDQQHBwkMBAYGCQwMDAwMDAwMDAwFBAsMCwoTDg0ODgwMDg8GDA0LEg8ODQ4NDA0ODRMNDQ0GCQYJCQYLDAsMCwcMDAUFCwUSDAwMDAcLBwwKEAoKCgcFBw4A"), 21+(scale<<8)+(1<<16));
  return this;
};

function assignPalettes() {
  palbg = new Uint16Array([g.toColor(g.theme.bg)]);
  for (let i = 0; i < settings.rings.length; i++) {
    let ring = settings.rings[i];
    if (ring.type == 'Full' && ring.color == 'Blk/Wht') {
      // BLK/WHT is the outside in light mode, so all of it gets filled in.
      // Using the dark theme stops it from being a one-color circle.
      pals[i].pal1 = new Uint16Array([g.theme.bg, g.toColor(ring.gy), g.toColor(ring.fg), g.toColor("#00f")]);
      pals[i].pal2 = new Uint16Array([g.theme.bg, g.toColor(ring.fg), g.toColor(ring.gy), g.toColor("#00f")]);
    } else if (g.theme.dark) {
      // palette for 0-49%
      pals[i].pal1 = new Uint16Array([g.theme.bg, g.toColor(ring.gy), g.toColor(ring.fg), g.toColor("#00f")]);
      // palette for 50-100%
      pals[i].pal2 = new Uint16Array([g.theme.bg, g.toColor(ring.fg), g.toColor(ring.gy), g.toColor("#00f")]);
    } else {
      // palette for 0-49%
      pals[i].pal1 = new Uint16Array([g.theme.bg, g.theme.fg, g.toColor(ring.fg), g.toColor("#00f")]);
      // palette for 50-100%
      pals[i].pal2 = new Uint16Array([g.theme.bg, g.toColor(ring.fg), g.theme.fg, g.toColor("#00f")]);
      if (ring.type !== 'Full') pals[i].pal1 = pals[i].pal2;  // In light mode, we only want the full circle's filled portion to be black
    }
  }
}

function rotate_points(end, max) {
  const midH = h/2;
  const midW = w/2;
  const off = 5;
  const points = [midW-off,0, midW+off,0, midW+off,midH, midW-off,midH];
  var rotate = (2 * Math.PI) / (max / end);
  var rotated_arr = [];
  for (let i = 0; i < points.length; i += 2) {
    let x = points[i];
    let y = points[i + 1];
    x -= midW;
    y -= midH;
    let x_new = x * Math.cos(rotate) - y * Math.sin(rotate);
    let y_new = x * Math.sin(rotate) + y * Math.cos(rotate);
    x = x_new + midW;
    y = y_new + midH;
    rotated_arr.push(x);
    rotated_arr.push(y);
  }
  return rotated_arr;
}

function setSmallFont20() {
  g.setFontRoboto20();
}

function setLargeFont() {
  switch (innerMostRing) {
    case 3:
      g.setFontBloggerSansLight38();
      break;
    case 2:
      g.setFontBloggerSansLight42();
      break;
    default:
      g.setFontBloggerSansLight46(1);
      break;
    }
  }

function setSmallFont() {
  let size = 16;
  if (infoMode == "ID_HRM" ) {
    g.setFont('Vector', size);
    return;
  }
  switch (innerMostRing) {
  case 2:
    size = 13;
    break;
  case 3:
    size = 12;
    break;
  }
  g.setFont('Vector', size);
}

function getSteps() {
  try {
    return Bangle.getHealthStatus("day").steps;
  } catch (e) {
    if (WIDGETS.wpedom !== undefined)
      return WIDGETS.wpedom.getSteps();
    else
      return 0;
  }
}

/////////////// sunrise / sunset /////////////////////////////

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.rings = settings.rings || [{}, {}, {}];

  settings.rings[0].gy = settings.rings[0].gy||'#020';
  settings.rings[0].fg = settings.rings[0].fg||'#0f0';
  settings.rings[0].type = settings.rings[0].type||'Full';
  settings.rings[0].ring = settings.rings[0].ring||'Steps';
  settings.rings[0].step_target = settings.rings[0].step_target||10000;

  settings.rings[1].gy = settings.rings[1].gy||'#020';
  settings.rings[1].fg = settings.rings[1].fg||'#0f0';
  settings.rings[1].type = settings.rings[1].type||'None';
  settings.rings[1].ring = settings.rings[1].ring||'Minutes';
  settings.rings[1].step_target = settings.rings[1].step_target||10000;

  settings.rings[2].gy = settings.rings[2].gy||'#020';
  settings.rings[2].fg = settings.rings[2].fg||'#0f0';
  settings.rings[2].type = settings.rings[2].type||'None';
  settings.rings[2].ring = settings.rings[2].ring||'Hours';
  settings.rings[2].step_target = settings.rings[2].step_target||10000;

  for (let i = 0; i < settings.rings.length; i++) {
    // Needed in case the user swaps themes
    if (settings.rings[i].color == 'Blk/Wht') {
      settings.rings[i].gy = g.theme.dark ? '#222' : '#888';
      settings.rings[i].fg = g.theme.fg;
    }
  }

  getInnerOuterMostRing();
  settings.color = settings.color||'Outer';
  settings.fg = settings.fg||'#0f0';
  switch (settings.color) {
    case 'Outer':
      if (outerMostRing == 0) break;
      settings.fg = settings.rings[outerMostRing - 1].fg;
      break;
    case 'Inner':
      if (innerMostRing == 0) break;
      settings.fg = settings.rings[innerMostRing - 1].fg;
      break;
  }

  settings.idle_check = (settings.idle_check === undefined ? true : settings.idle_check);
  settings.batt_hours = (settings.batt_hours === undefined ? false : settings.batt_hours);
  settings.hr_12 = (global_settings["12hour"] === undefined ? false : global_settings["12hour"]);
  settings.idxInfo = settings.idxInfo||0;
  assignPalettes();
}

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{};
  location.lat = location.lat||51.5072;
  location.lon = location.lon||0.1276;
  location.location = location.location||"London";
}

function extractTime(d){
  var hh = d.getHours(), mm = d.getMinutes();
  if (settings.hr_12) {
    hh = hh % 12;
    if (hh == 0) hh = 12;
  }
  return(("0"+hh).substr(-2) + ":" + ("0"+mm).substr(-2));
}

var sunRise = "00:00";
var sunSet = "00:00";
var drawCount = 0;
var night; // In terms of minutes
var sunStart;  // In terms of ms
var sunEnd;  // In terms of minutes
var sunFull;  // In terms of ms
var isDaytime = true;

function getMinutesFromDate(date) {
  return (60 * date.getHours()) + date.getMinutes();
}

function updateSunRiseSunSet(now, lat, lon, sunLeftCalcs){
  // get today's sunlight times for lat/lon
  var times = SunCalc.getTimes(now, lat, lon);
  var dateCopy = new Date(now.getTime());

  // format sunrise time from the Date object
  sunRise = extractTime(times.sunrise);
  sunSet = extractTime(times.sunset);
  if (!sunLeftCalcs) return;

  let sunLeft = times.sunset - dateCopy;
  if (sunLeft <  0) {  // If it's already night
    dateCopy.setDate(dateCopy.getDate() + 1);
    let timesTmrw = SunCalc.getTimes(dateCopy, lat, lon);
    isDaytime = false;
    sunStart = times.sunset;
    sunFull = timesTmrw.sunrise - sunStart;
    sunEnd = getMinutesFromDate(timesTmrw.sunrise);
    night = getMinutesFromDate(timesTmrw.sunriseEnd);
  }
  else {
    sunLeft = dateCopy - times.sunrise;
    if (sunLeft <  0) {  // If it's not morning yet.
      dateCopy.setDate(dateCopy.getDate() - 1);
      let timesYest = SunCalc.getTimes(dateCopy, lat, lon);
      isDaytime = false;
      sunStart = timesYest.sunset;
      sunFull = times.sunrise - sunStart;
      sunEnd = getMinutesFromDate(times.sunrise);
      night = getMinutesFromDate(times.sunriseEnd);
    }
    else {  // We're in the middle of the day
      isDaytime = true;
      sunStart = times.sunriseEnd;
      sunFull = times.sunsetStart - sunStart;
      sunEnd = getMinutesFromDate(times.sunsetStart);
      night = getMinutesFromDate(times.sunset);
    }
  }
}


function batteryString(){
  let stringToInsert;
  if (settings.batt_hours) {
    var batt_usage = require("power_usage").get().hrsLeft;
    let rounded;
    if (batt_usage > 24) {
      var days = Math.floor(batt_usage/24);
      var hours = Math.round((batt_usage/24 - days) * 24);
      stringToInsert = '\n' + days + ((days < 2) ? 'd' : 'ds') + ' ' + hours + ((hours < 2) ? 'h' : 'hs');
    }
    else if (batt_usage > 9) {
      rounded = Math.round(200000/E.getPowerUsage().total * 10) / 10;
    }
    else {
      rounded = Math.round(200000/E.getPowerUsage().total * 100) / 100;
    }
    if (batt_usage < 24) {
      stringToInsert = '\n' + rounded + ' ' + ((batt_usage < 2) ? 'h' : 'hs');
    }
  }
  else{
    stringToInsert = ' ' + E.getBattery() + '%';
  }
  return 'BATTERY' + stringToInsert;
}

const infoData = {
  ID_DATE:  { calc: () => {var d = (new Date()).toString().split(" "); return d[2] + ' ' + d[1] + ' ' + d[3];} },
  ID_DAY:   { calc: () => {var d = require("locale").dow(new Date()).toLowerCase(); return d[0].toUpperCase() + d.substring(1);} },
  ID_SR:    { calc: () => 'SUNRISE ' + sunRise },
  ID_SS:    { calc: () => 'SUNSET ' + sunSet },
  ID_STEP:  { calc: () => {var steps = getSteps(); prevStepDisplayed = steps; return 'STEPS ' + steps;}},
  ID_BATT:  { calc: batteryString},
  ID_HRM:   { calc: () => hrmCurrent }
};

const infoList = Object.keys(infoData).sort();

function nextInfo(idx) {
  if (idx > -1) {
    if (idx === infoList.length - 1) idx = 0;
    else idx += 1;
  }
  return idx;
}

function prevInfo(idx) {
  if (idx > -1) {
    if (idx === 0) idx = infoList.length - 1;
    else idx -= 1;
  }
  return idx;
}

function getInfoDims() {
  var line  = infoLineDefault;
  var width = infoWidthDefault;
  var height = infoHeightDefault;
  switch (innerMostRing) {
    case 2:
      width -= 10;
      height -= 2;
      line -= 7;
      break;
    case 3:
      width -= 17;
      height -= 3;
      line -= 10;
      break;
  }
  if (infoMode == "ID_HRM") {
    width = 30;
    height = infoHeightDefault;
  }
  return[line, width, height];
}

function clearInfo() {
  var dims = getInfoDims();
  var line = dims[0];
  var width = dims[1];
  var height = dims[2];
  g.setColor(g.theme.bg);
  g.fillRect((w/2) - width, line - height, (w/2) + width, line + height);
}

function drawInfo() {
  clearInfo();
  g.setColor(g.theme.fg);
  setSmallFont();
  g.setFontAlign(0,0);
  var dims = getInfoDims();
  var line = dims[0];
  var height = dims[2];
  if (infoMode == "ID_HRM") {
    g.setColor('#f00'); // red
    drawHeartIcon(line, height);
  } else {
    g.drawString((infoData[infoMode].calc().toUpperCase()), w/2, line);
  }
}

function drawHeartIcon(line, height) {
  g.drawImage(hrmImg, (w/2) - height - 20, line - height);
}

function drawHrm() {
  if (idle) return; // dont draw while prompting
  var d = new Date();
  clearInfo();
  g.setColor(d.getSeconds()&1 ? '#f00' : g.theme.bg);
  var dims = getInfoDims();
  var line = dims[0];
  var height = dims[2];
  drawHeartIcon(line, height);
  setSmallFont();
  g.setFontAlign(-1,0); // left
  g.setColor(hrmConfidence >= 50 ? g.theme.fg : '#f00');
  g.drawString(hrmCurrent, (w/2) + 10, line);
}

function drawHour(date) {
  // Run setLargeFont before running this function
  var hh = date.getHours();
  if (settings.hr_12) {
    hh = hh % 12;
    if (hh == 0) hh = 12;
  }
  hh = hh.toString().padStart(2, '0');
  if (settings.color == 'Fullest') {
    settings.fg = settings.rings[getFullestRing()].fg;
  }
  g.setColor(settings.fg);
  g.setFontAlign(1,0);  // right aligned
  g.drawString(hh, (w/2) - 1, h/2);
}

function draw(updateSeconds) {
  if (!idle) {
    if (updateSeconds) {
      let date  = new Date();
      drawAllRings(date, 'Seconds');
      if (settings.color == 'Fullest') {
        let fgNew = settings.rings[getFullestRing()].fg;
        if (settings.fg != fgNew) {
          setLargeFont();
          drawHour(date);
        }
      }
    }
    else {
      drawClock();
    }
  }
  else
    drawIdle();
  queueDraw();
}

function getGaugeImage(date, ringType, step_target) {
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ring_fill;
  var invertRing = false;
  var ring_max = 100;
  switch (ringType) {
    case 'Hours':
      ring_fill = ((hh % 12) * 60) + mm;
      ring_max = 12 * 60;
      break;
    case 'Minutes':
      ring_fill = mm;
      ring_max = 60;
      break;
    case 'Seconds':
      ring_fill = date.getSeconds();
      ring_max = 60;
      break;
    case 'Day':
      ring_fill = (hh * 60) + mm;
      ring_max = 1440;
      break;
    case 'Steps':
      ring_max = 100;
      ring_fill = getSteps();
      ring_max = step_target;
      break;
    case 'Battery':
      ring_fill = E.getBattery();
      break;
    case 'Sun':
      var dayMin = getMinutesFromDate(date);
      if (dayMin >= sunEnd && dayMin <= night) ring_fill = ring_max;
      else {
        ring_fill = ring_max * (date - sunStart) / sunFull;
        if (ring_fill > ring_max) {  // If we're now past a sunrise of sunset
          updateSunRiseSunSet(date, location.lat, location.lon, true);
          ring_fill = ring_max * (date - sunStart) / sunFull;
        }
      }
      invertRing = !isDaytime;
      break;
  }
  var start = 0;
  var end = Math.round(ring_fill);
  if ((end - start) > ring_max) end = ring_max;  // Capping end var so the ring doesn't need to update if already full.
  if (invertRing) {
    start = ring_max - end;
    end = ring_max;
  }
  log_debug("Start: "+ start + "  end: " +end);
  return [start, end, ring_max];
}

function drawIfChanged(start, end, ring_max, idx, type) {
  if (end === prevRing[idx].end && start === prevRing[idx].start && ring_max === prevRing[idx].max) return;
  switch (type) {
  case 'Full':
      drawRing(start, end, ring_max, idx);
    break;
  case 'Semi':
      drawSemi(start, end, ring_max, idx);
    break;
  case 'C':
      drawC(end, ring_max, idx);
    break;
  }
  prevRing[idx].start = start;
  prevRing[idx].end = end;
  prevRing[idx].max = ring_max;
  log_debug("Redrew ring #" + idx);
}

function drawAllRings(date, drawOnlyThisType) {
  for (let i = 0; i < settings.rings.length; i++) {
    let ring = settings.rings[i];
    if (ring.type == "None") continue;
    if (drawOnlyThisType != null && ring.ring != drawOnlyThisType) continue;
    var result = getGaugeImage(date, ring.ring, ring.step_target);
    drawIfChanged(result[0], result[1], result[2], i, ring.type);
  }
}

function drawClock() {
  var date = new Date();
  var mm = date.getMinutes();
  mm = mm.toString().padStart(2, '0');

  g.reset();
  g.setColor(g.theme.bg);
  getInnerOuterMostRing();
  let edge = ringEdge + (innerMostRing * ringIterOffset);
  g.fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick); // Clears the text within the circle
  drawAllRings(date, null);
  setLargeFont();

  drawHour(date);

  g.setColor(g.theme.fg);
  g.setFontAlign(-1,0); // left aligned
  g.drawString(mm, (w/2) + 1, h/2);

  drawInfo();

  // recalc sunrise / sunset every hour
  if (drawCount % 60 == 0) {
    let recalcSunLeft = (settings.ring == 'Sun');
    updateSunRiseSunSet(date, location.lat, location.lon, recalcSunLeft);
  }
  drawCount++;
}

function checkRedrawSteps(steps) {
  var redrawText = false;
  var redrawRings = false;
  if (infoMode == "ID_STEP" && (minStepToUpdate <= (steps - prevStepDisplayed))) {
    redrawText = true;
  }
  for (let i = 0; i < settings.rings.length; i++) {
    let ring = settings.rings[i];
    if(ring.type == "None" || ring.ring != 'Steps') continue;
    let percentChanged = 100 * ((steps - prevRing[i].end) / ring.step_target);
    if(percentChanged >= minStepPctUpdateRings) {
      redrawRings = true;
      break;
    }
  }
  return [redrawText, redrawRings];
}

function drawSteps() {
  clearInfo();
  var dims = getInfoDims();
  setSmallFont();
  g.setFontAlign(0,0);
  g.setColor(g.theme.fg);
  g.drawString((infoData[infoMode].calc().toUpperCase()), w/2, dims[0]);
}

/////////////////   GAUGE images /////////////////////////////////////

var hrmCurrent = "--";
var hrmConfidence = 0;

function resetHrm() {
  hrmCurrent = "--";
  hrmConfidence = 0;
  if (infoMode == "ID_HRM") {
    clearInfo();
    g.setColor('#f00'); // red
    var dims = getInfoDims();
    drawHeartIcon(dims[0], dims[2]);
  }
}

Bangle.on('HRM', function(hrm) {
  hrmCurrent = hrm.bpm;
  hrmConfidence = hrm.confidence;
  log_debug("HRM=" + hrm.bpm + " (" + hrm.confidence + ")");
  if (infoMode == "ID_HRM" ) drawHrm();
});


/////////////////   GAUGE images /////////////////////////////////////

function addPoint(loc, max) {
  var angle = ((2*Math.PI)/max) * loc;
  var x = hyp * Math.sin(angle);
  var y = hyp * Math.cos(angle + Math.PI);
  x += rad;
  y += rad;
  return [Math.round(x),Math.round(y)];
}

function polyArray(start, end, max) {
  const eighth = max / 8;
  if (start == end) return []; // No array to draw if the points are the same.
  let startOrigin = start;
  let endOrigin = end;
  start %= max;
  end %= max;
  if(start == 0 && startOrigin != 0) start = max;
  if(end == 0 && endOrigin != 0) end = max;
  if (start > end) end += max;
  var array = [g.getHeight()/2, g.getHeight()/2];
  var pt = addPoint(start, max);
  array.push(pt[0], pt[1]);

  for (let i = start + eighth; i < end; i += eighth) {
    pt = addPoint(i, max);
    array.push(pt[0], pt[1]);
  }
  pt = addPoint(end, max);
  array.push(pt[0], pt[1]);
  log_debug("Poly Arr: " + array);
  return array;
}

function drawRing(start, end, max, idx) {
  // Create persistent `buf` inside the function scope
  if (!drawRing._buf) {
    drawRing._buf = Graphics.createArrayBuffer(w, h, 2, { msb: true });
  }
  const buf = drawRing._buf;
  let img = { width: w, height: h, transparent: 0,
              bpp: 2, palette: pals[idx].pal1, buffer: buf.buffer };
  let edge = ringEdge + (idx * ringIterOffset);
  buf.clear();
  buf.setColor(1).fillEllipse(edge,edge,w-edge,h-edge);
  buf.setColor(0).fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick);
  img.palette = pals[idx].pal2;
  g.drawImage(img, 0, 0);  // Draws a filled-in circle
  if((end - start) >= max) return;  // No need to add the unfilled circle
  buf.clear();
  buf.setColor(1).fillEllipse(edge,edge,w-edge,h-edge);
  buf.setColor(0).fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick);
  buf.setColor(0).fillPoly(polyArray(start, end, max)); // Masks the filled-in part of the segment over the unfilled part
  img.palette = pals[idx].pal1;
  g.drawImage(img, 0, 0);  // Draws the unfilled-in segment
  return;
}

function drawSemi(start, end, max, idx) {
  // Create persistent `buf` inside the function scope
  var fullCircle = (end - start) >= max;
  if (!drawSemi._buf) {
    drawSemi._buf = Graphics.createArrayBuffer(w, h, 2, { msb: true });
  }
  const buf = drawSemi._buf;
  let img = { width: w, height: h, transparent: 0,
              bpp: 2, palette: pals[idx].pal2, buffer: buf.buffer };
  let edge = ringEdge + (idx * ringIterOffset);
  buf.clear();
  buf.setColor(1).fillEllipse(edge,edge,w-edge,h-edge);
  buf.setColor(0).fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick);
  if (fullCircle)
    img.palette = pals[idx].pal2;
  else
    img.palette = palbg;
  g.drawImage(img, 0, 0);  // Draws a filled-in circle with the bg color, clearing it
  if(end == start) return; //If the ring should be completely empty
  if(fullCircle) return;  // No need to add the unfilled circle
  buf.clear();
  buf.setColor(1).fillEllipse(edge,edge,w-edge,h-edge);
  buf.setColor(0).fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick);
  buf.setColor(0).fillPoly(polyArray(end, start, max)); // Masks the filled-in part of the segment over the unfilled part
  img.palette = pals[idx].pal2;
  g.drawImage(img, 0, 0);  // Draws the unfilled-in segment
  return;
}

function drawC(end, max, idx) {
  // Create persistent `buf` inside the function scope
  if (!drawC._buf) {
    drawC._buf = Graphics.createArrayBuffer(w, h, 2, { msb: true });
  }
  const buf = drawC._buf;
  let img = { width: w, height: h, transparent: 0,
              bpp: 2, palette: pals[idx].pal2, buffer: buf.buffer };
  let edge = ringEdge + (idx * ringIterOffset);
  buf.clear();
  buf.setColor(1).fillEllipse(edge,edge,w-edge,h-edge);
  buf.setColor(0).fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick);
  img.palette = palbg;
  g.drawImage(img, 0, 0);  // Draws a filled-in circle with the bg color, clearing it
  buf.clear();
  buf.setColor(1).fillEllipse(edge,edge,w-edge,h-edge);
  buf.setColor(0).fillEllipse(edge+ringThick,edge+ringThick,w-edge-ringThick,h-edge-ringThick);
  if (end > max) end = max;
  var vertices = rotate_points(end, max);
  buf.setColor(0).fillPoly(vertices);
  img.palette = pals[idx].pal2;
  g.drawImage(img, 0, 0);  // Draws the unfilled-in segment  
  return;
}


/////////////////   IDLE TIMER /////////////////////////////////////

function drawIdle() {
  let mins = Math.round((getTime() - lastStep) / 60);
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);
  g.setColor(g.theme.fg);
  setSmallFont20();
  g.setFontAlign(0, 0);
  g.drawString('Last step was', w/2, (h/3));
  g.drawString(mins + ' minutes ago', w/2, 20+(h/3));
  dismissBtn.draw();
}

///////////////   BUTTON CLASS ///////////////////////////////////////////

// simple on screen button class
function BUTTON(name,x,y,w,h,c,f,tx) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = c;
  this.callback = f;
  this.text = tx;
}

// if pressed the callback
BUTTON.prototype.check = function(x,y) {
  //console.log(this.name + ":check() x=" + x + " y=" + y +"\n");

  if (x>= this.x && x<= (this.x + this.w) && y>= this.y && y<= (this.y + this.h)) {
    log_debug(this.name + ":callback\n");
    this.callback();
    return true;
  }
  return false;
};

BUTTON.prototype.draw = function() {
  g.setColor(this.color);
  g.fillRect(this.x, this.y, this.x + this.w, this.y + this.h);
  g.setColor("#000"); // the icons and boxes are drawn black
  setSmallFont20();
  g.setFontAlign(0, 0);
  g.drawString(this.text, (this.x + this.w/2), (this.y + this.h/2));
  g.drawRect(this.x, this.y, (this.x + this.w), (this.y + this.h));
};

function redrawWholeFace() {
  // Reset the prevRings to force all rings to update
  prevRing = Array(3).fill().map(() => ({ start: null, end: null, max: null }));
  g.clear();
  draw(false);
}

function dismissPrompt() {
  idle = false;
  warned = false;
  lastStep = getTime();
  Bangle.buzz(100);
  redrawWholeFace();
}

function resetIdle() {
  if (idle == false) return;
   // redraw if we had been idle
  dismissPrompt();
  idle = false;
}

var dismissBtn = new BUTTON("big",0, 3*h/4 ,w, h/4, "#0ff", dismissPrompt, "Dismiss");

Bangle.on('touch', function(button, xy) {
  var x = xy.x;
  var y = xy.y;
  // adjust for outside the dimension of the screen
  // http://forum.espruino.com/conversations/371867/#comment16406025
  if (y > h) y = h;
  if (y < 0) y = 0;
  if (x > w) x = w;
  if (x < 0) x = 0;

  if (idle && dismissBtn.check(x, y)) return;
});

// if we get a step then we are not idle
Bangle.on('step', s => {
  lastStep = getTime();
  resetIdle();
  warned = 0;
  if (drawingSteps) return;
  var steps = getSteps();
  var ret = checkRedrawSteps(steps);
  if (!ret[0] && !ret[1]) return;
  drawingSteps = true;
  if (ret[0]) drawSteps();
  if (ret[1]) drawAllRings(new Date(), 'Steps');
  drawingSteps = false;
});

function checkIdle() {
  log_debug("checkIdle()");
  if (!settings.idle_check) {
    resetIdle();
    warned = false;
    return;
  }

  let hour = (new Date()).getHours();
  let active = (hour >= 9 && hour < 21);
  //let active = true;
  let dur = getTime() - lastStep;

  if (active && dur > IDLE_MINUTES * 60) {
    drawIdle();
    if (warned++ < 3) {
      buzzer(warned);
      log_debug("checkIdle: warned=" + warned);
      Bangle.setLocked(false);
    }
    idle = true;
  } else {
    resetIdle();
    warned = 0;
  }
}

// timeout for multi-buzzer
var buzzTimeout;

// n buzzes
function buzzer(n) {
  log_debug("buzzer n=" + n);

  if (n-- < 1) return;
  Bangle.buzz(250);

  if (buzzTimeout) clearTimeout(buzzTimeout);
  buzzTimeout = setTimeout(function() {
    buzzTimeout = undefined;
    buzzer(n);
  }, 500);
}

function getDelayMs(prevDelayMs, ring_setting, now) {
  // Much of the logic here is for slowing or speeding the delay on the seconds setting.
  // returns [ms before next update, if only the ring should be updated]
  const sec_batt = [20, 50];
  const sec_delay = [10000, 2000, 1000];
  const deadband = 5;
  if (ring_setting.some(ring => ring.ring === 'Seconds')) {
    const nearNextMinute = (now % 60000) >= (60000 - prevDelayMs);
    if (nearNextMinute) {
      let batt = E.getBattery();
      for (let i = 0; i < sec_batt.length; i++) {
        if (batt <= sec_batt[i])
          return [sec_delay[i], false];
      }
      // Check for coming out of the above states w/ deadband
      for (let i = 0; i < sec_batt.length; i++) {
        if (prevDelayMs == sec_delay[i] && batt >= (sec_batt[i] + deadband))
          return [sec_delay[i + 1], false];
      }
      return [sec_delay[sec_delay.length - 1], false];
    }
    else {
      return [prevDelayMs, true];
    }
  }
  else
    return [60000, false];
}

///////////////////////////////////////////////////////////////////////////////

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute or every sec_update ms
function queueDraw() {
  let now = Date.now();
  var nextUpdateRet = getDelayMs(nextUpdateMs, settings.rings, now);
  nextUpdateMs = nextUpdateRet[0];
  let delay = nextUpdateMs - (now % nextUpdateMs);
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    checkIdle();
    draw(nextUpdateRet[1]);
  }, delay);
}

function getInnerOuterMostRing() {
  // Outputs 1 through 3
  let innerMost = 0;
  let outerMost = 0;
  for (let i = 0; i < settings.rings.length; i++) {
    let j = settings.rings.length - 1 - i;
    if (outerMost === 0 && settings.rings[i].type !== "None") {
      outerMost = i + 1;
    }
    if (innerMost === 0 && settings.rings[j].type !== "None") {
      innerMost = j + 1;
    }
    if (outerMost !== 0 && innerMost !== 0) {
      break;
    }
  }
  innerMostRing = innerMost;
  outerMostRing = outerMost;
}

function getFullestRing() {
  // Outputs 0 through 2
  let largestPercent = 0;
  let fullestRing = 0;
  for (let i = 0; i < settings.rings.length; i++) {
    if (settings.rings[i].type !== "None") {
      let percent = (prevRing[i].end - prevRing[i].start) / prevRing[i].max;
      if (largestPercent < percent) {
        largestPercent = percent;
        fullestRing = i;
      }
    }
  }
  return fullestRing;
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(false); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clockupdown", btn=> {
  clearInfo(); // Used to clear infobox in case we're going to the HRM
  if (btn<0) settings.idxInfo = prevInfo(settings.idxInfo);
  if (btn>0) settings.idxInfo = nextInfo(settings.idxInfo);
  // power HRM on/off accordingly
  infoMode = infoList[settings.idxInfo];
  Bangle.setHRMPower(infoMode == "ID_HRM" ? 1 : 0);
  resetHrm();
  log_debug("idxInfo=" + settings.idxInfo);
  draw(false);
  storage.write(SETTINGS_FILE, settings);  // Retains idxInfo when leaving the face
});

loadSettings();
loadLocation();
var infoMode = infoList[settings.idxInfo];
updateSunRiseSunSet(new Date(), location.lat, location.lon, true);
nextUpdateMs = getDelayMs(1000, settings.rings, Date.now())[0];

Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();
redrawWholeFace();
