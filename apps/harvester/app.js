const storage = require('Storage');
const widget_utils = require('widget_utils');
var settings;
const SETTINGS_FILE = "harvester.json";
const global_settings = storage.readJSON("setting.json", true) || {};
const H = g.getHeight();
const W = g.getWidth();
const rad = H / 2;
const hyp = Math.sqrt(Math.pow(rad, 2) + Math.pow(rad, 2));

// TODO: Update count to adapt to variable number of segments
// TODO: Split for better memory efficiency?
var pals = Array(3).fill().map(() => (
  {
    pal1: null, // palette for 0-49%
    pal2: null  // palette for 50-100%
  }));

let palbg;
const infoLineDefault = (3 * H / 4) - 10;
const infoWidthDefault = 40;
const infoHeightDefault = 12;
const ringEdge = 4;
const ringIterOffset = 10;
const ringThick = 6;
const nextUpdateMs = 60000;
// TODO: Add back in some sort of previous state record to avoid needless redraws
//const { getDefaultSettings, color_options, fg_code, gy_code, fg_code_font } = require('./modules/set-def');

const resetHour = 3; // Reset (and eventually save) totals at a time few will be awake

function log_debug(o) {
  print(o);
}

function getFruitfulMin(i) {
  return Math.floor(settings.total_sec_by_cat[i] / 60);
}
function getDecenterMin(i) {
  if (i >= -1) { log_debug("can't treat " + i + " as decentering"); return; }
  return Math.floor(settings.total_sec_by_cat[settings.total_sec_by_cat.length + i] / 60);
}
function addFruitful(i, sec) {
  // TODO: Remove once confident in correctness
  if (0 != sec % settings.fallow_denominator) {
    log_debug('Invalid call to addFruitful: uneven fallow accumulation; i=' +
              i + '; sec=' + sec + '; denom=' + settings.fallow_denominator);
    return;
  }
  settings.fallow_buffer_sec += sec / settings.fallow_denominator;
  return settings.total_sec_by_cat[i] += sec;
}
function useRecenter(sec) {
  /* sec=60, buf=120; used=60
     sec=60, buf=30; used=30
     sec=60, buf=0; used=0
   */
  var fallow_used_sec = E.clip(settings.fallow_buffer_sec, 0, sec);
  settings.fallow_buffer_sec -= fallow_used_sec;
  return sec - fallow_used_sec;
}
function useDecenter(i, sec) {
  if (i >= -1) { log_debug("can't treat " + i + " as decentering"); return; }
  var excess_sec = useRecenter(sec);
  return settings.total_sec_by_cat[settings.total_sec_by_cat.length + i] += sec;
}

// https://www.1001fonts.com/rounded-fonts.html?page=3
// TODO: Remove one/two-ring fns
//one ring
Graphics.prototype.setFontBloggerSansLight46 = function (scale) {
  // Actual height 46 (45 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAA/AAAAAAAAPwAAAAAAAD4AAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH/gAAAAAAP/wAAAAAAf/gAAAAAAf/AAAAAAA//AAAAAAB/+AAAAAAD/8AAAAAAH/4AAAAAAH/wAAAAAAP/gAAAAAAf/gAAAAAA//AAAAAAB/+AAAAAAA/8AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///8AAAAP////4AAAP/////AAAH/////4AAD+AAAB/AAA8AAAAHwAAeAAAAA+AAHgAAAAHgADwAAAAB4AA8AAAAAPAAPAAAAADwADwAAAAA8AA8AAAAAPAAPAAAAADwAB4AAAAB4AAeAAAAAeAAHwAAAAPgAA/AAAAPwAAH/////4AAA/////8AAAH////+AAAAf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAPAAAAAAAAHwAAAAAAAB4AAAAAAAA+AAAAAAAAfAAAAAAAAHgAAAAAAAD4AAAAAAAB8AAAAAAAAeAAAAAAAAPgAAAAAAADwAAAAAAAB//////4AAf//////AAH//////gAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAD4AAHAAAAD+AAD4AAAB/gAA8AAAB/4AAfAAAA/+AAHgAAAf3gAB4AAAPx4AA8AAAH4eAAPAAAD4HgADwAAB8B4AA8AAA+AeAAPAAAfAHgADwAAPgB4AA8AAHwAeAAHgAD4AHgAB4AD8AB4AAfAB+AAeAAD8B/AAHgAAf//gAB4AAH//wAAeAAAf/wAAHgAAB/wAAA4AAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AADgAAAAPAAB4AAAADwAAeAAAAA+AAHgAAAAHgAB4ABgAB4AAeAA8AAeAAHgA/AADwAB4AfwAA8AAeAP8AAPAAHgH/AADwAB4H7wAA8AAeD48AAPAAHh8PAAHgAB5+BwAB4AAe/AeAA+AAH/AHwAfAAB/gA/AfgAAfwAH//wAAHwAA//4AAA4AAH/8AAAAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAD+AAAAAAAD/gAAAAAAH/4AAAAAAH/+AAAAAAP/ngAAAAAP/h4AAAAAf/AeAAAAAf/AHgAAAA/+AB4AAAA/+AAeAAAB/8AAHgAAA/8AAB4AAAP4AAAeAAAB4AAAHgAAAAAAAB4AAAAAAAAeAAAAAAP///4AAAAH////AAAAA////gAAAAP///4AAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAD4AA8AAD///gAPAAB///4AD4AAf//+AAeAAH+APAAHgAB4AHgAA4AAeAB4AAOAAHgAcAADwAB4AHAAA8AAeADwAAPAAHgAcAADwAB4AHAAA8AAeAB4AAeAAHgAeAAHgAB4AHwAD4AAeAA+AB8AAHgAP4B+AAB4AB///gAAOAAP//gAABAAA//wAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAB///4AAAAD////wAAAD////+AAAB/////4AAA/gPgB/AAAfgDwAHwAAPgA8AA+AADwAeAAHgAB4AHgAB4AAeAB4AAfAAHgAeAADwABwAHgAA8AAcAB4AAPAAHAAeAAHwAB4AHgAB4AAeAB8AAeAAHgAPAAPgAB4AD8APwAAOAAfwP4AADgAD//8AAAAAAf/+AAAAAAB/+AAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAAB4AAAAA4AAeAAAAB/AAHgAAAB/wAB4AAAB/4AAeAAAD/4AAHgAAD/wAAB4AAH/wAAAeAAH/gAAAHgAP/gAAAB4AP/AAAAAeAf/AAAAAHgf+AAAAAB4/+AAAAAAe/8AAAAAAH/8AAAAAAB/4AAAAAAAf4AAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAA/AB/+AAAA/8B//wAAA//gf/+AAAf/8PgPgAAH4fngB8AAD4B/wAPgAA8AP8AB4AAeAB+AAeAAHgAfgADwAB4ADwAA8AAcAA8AAPAAHAAPAADwAB4ADwAA8AAeAB+AAPAAHgAfgAHgAB8AP8AB4AAPgH/AA+AAD8H54AfAAAf/8fgPwAAD/+D//4AAAf/Af/8AAAB/AD/+AAAAAAAP+AAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAf/wAAAAAAf/+AAAAAAP//4AAwAAH//+AAeAAD+APwAHgAA+AA+AB4AAfAAHgAOAAHgAB4ADwAB4AAPAA8AAeAADwAPAAHgAA8ADwAB4AAPAA8AAeAADwAPAAHgAA8AHgAB8AAeAB4AAPgAHgA+AAD8ADwA/AAAfwA8A/gAAD/wef/wAAAf////4AAAB////4AAAAH///wAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AB4AAAAAfgA/AAAAAH4APwAAAAB+AD4AAAAAPAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DRAcHBwcHBwcHBwcDQ=="), 56 + (scale << 8) + (1 << 16));
  return this;
};

//Two Rings
Graphics.prototype.setFontBloggerSansLight42 = function () {
  // Actual height 28 (31 - 4)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAHwAAAAAHwAAAAAHwAAAAADgAAAAAAAAAAAAAwAAAAAHwAAAAA/wAAAAH+AAAAA/wAAAAH+AAAAA/wAAAAH+AAAAA/wAAAAD+AAAAADwAAAAACAAAAAAAAAAAAAAAAAAAAAAP8AAAAD//wAAAP//8AAA////AAB////gAB4AAPgADwAADwADgAAAwADAAAAwADAAAAwADAAAAwADgAAAwADwAADwAB8AAPgAB////gAA////AAAP//8AAAD//wAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAMAAAQAAYAAAwAAYAAAwAA4AAAwAAwAAAwAB////wAD////wAD////wAD////wAAAAAAwAAAAAAwAAAAAAwAAAAAAwAAAAAAQAAAAAAQAAAAAAAAAAAAAAAAAAAAAAB8AADwAB+AAHwAD8AAPwADgAAfwADAAA7wADAABzwADAABzwADAAHjwADAAPDwADAAeDwADgA8DwAD4H4DwAB//wDwAB//gDwAA/+ADwAAP8ADwAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAfgAB8AAfwAD8AABwADgAABwADAAAAwADADAAwADADAAwADADAAwADADAAwADAHAAwADgHgBwADwfgBwAB//4DgAB/8//gAA/4//AAAfwf+AAAAAP8AAAAABgAAAAAAAAAAAAAAAAAAADwAAAAAPwAAAAAfwAAAAA9wAAAADxwAAAAHhwAAAAeBwAAAA8BwAAADwBwAAAHgBwAAAfABwAAA8ABwAAB////wAD////wAD////wAD////wAAAABwAAAAABwAAAAABwAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAD//AfgAD//AHwAD//ABwADwHAAwADwHAAwADwGAAwADwGAAwADwGAAwADwHAAwADwHABwADwHABwADwDgDgADwD//gADwB//AADgB/+AAAAAf8AAAAADAAAAAAAAAAAAAAAAAAAAAAAAAA//gAAAH//8AAAP//+AAAf///AAA/DAfgAB4DAHwABwHABwADgGAAwADgGAAwADAGAAwADAHAAwADAHAAwADAHgBwADgH8fgAD4D//gAD8D//AAAAA/+AAAAAf4AAAAAAAAAAAAAAAAAAAAAAAD8AAAAAD+AAAAAD8AAAAADwAAAwADwAADwADwAAPwADwAA/gADwAD8AADwAPwAADwA/AAADwD8AAADwPwAAADw/AAAADz4AAAAD/gAAAAD+AAAAAD4AAAAADgAAAAAAAAAAAAAAAAAAAAAADgAAAHgP8AAAf4f/AAA/8//gAB////gAD8/wDwADgHgBwADAHAAwADADAAwADADAAwADADAAwADAHAAwADgHgBwAB8/wDwAB////gAA/8//gAAf4f/AAAHgP8AAAAADgAAAAAAAAAAAAAAAAAD8AAAAAP/AHgAA//gPwAB//wDwAB/f4AwADwB4AwADgA4AwADAAYAwADAAYAwADAAYAwADAAYBwADgA4DwADwAwHgAB+Aw/gAB////AAA///+AAAf//4AAAD//gAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMADgAAAeAHwAAA/AHwAAA/AHwAAAeAHwAAAAABAAAAAAAAAA'),
    46,
    atob("CQ0VFBQVFhUVFRUVCg=="),
    42 | 65536
  );
};

// Three rings
Graphics.prototype.setFontBloggerSansLight38 = function () {
  // Actual height 25 (28 - 4)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAwAAAAAeAAAAAPgAAAAD4AAAAAcAAAAAAAAAAAAYAAAAA+AAAAB/AAAAD+AAAAH8AAAAP4AAAAP4AAAAfwAAAA/gAAAAPAAAAACAAAAAAAAAAAAAAAAAAAA/4AAAB//wAAB///AAA///8AAfgA/AAPAAB4ADAAAGAAwAABgAMAAAYADAAAGAA4AABgAPAAB4AB+AD8AAP//+AAB///AAAH//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAACAAGAAAgABgAAYAAwAAGAAcAABgAH///4AD///+AA////gAP///4AAAAAGAAAAABgAAAAAYAAAAACAAAAAAgAAAAAAAAAAAAAAAAADgAHwAB4AD8AA+AA4AAfgAMAAG4ADAADOAAwABjgAMAA44ADAAcOAAwAeDgAOAPA4AB8/gOAAf/wDgAD/4A4AAf4AOAAB4ADgAAAAAAAAAAAAAAAAAAAAHwAH4AD8AA+AA8AABgAMAAAYADAGAGAAwBgBgAMAYAYADAGAGAAwDgBgAOA4AYAD5/AOAAf+8PAAH/n/wAA/x/4AABgP8AAAAA8AAAAAAAAAAABgAAAAA8AAAAA/AAAAAdwAAAAecAAAAPHAAAAHBwAAAHgcAAADgHAAADwBwAAB4AcAAA8AHAAA////gAP///4AD///+AAAABwAAAAAcAAAAAHAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAHwAD/8B+AA//ADgAOAwAYADgMAGAA4DABgAOAwAYADgMAGAA4DABgAOA4A4ADgOAOAA4B4PAAOAf/wADgD/4AAAAf8AAAAB4AAAAAAAAAAAAAAAAA+AAAAD//AAAD//8AAB///gAA/2f8AAfBgHAAHAwA4ADgMAGAAwDABgAMAwAYADAMAGAAwDgDgAMA8B4ADwP/8AA+B//AAHgP/AAAAA/AAAAAAAAAAAAAAAAAAAAAA/AAAAAPwAAAADwAACAA4AADgAOAAD4ADgAD8AA4AD8AAOAD8AADgD8AAA4D8AAAOD8AAADj4AAAA74AAAAP4AAAAD4AAAAA4AAAAAAAAAAAAAAAAAAAAHwAAB8H/AAA/z/4AAf+//AAH/+B4ADgeAOAAwDgBgAMAwAYADAMAGAAwDABgAMA4AYADgeAOAAf/4PgAH/v/wAA/z/8AAHwP8AAAAB8AAAAAAAAAAAAAAAAfgAAAAf+A+AAP/wPgAH/8AYADwHgGAA4A4BgAMAOAYADABgGAAwAYBgAMAGA4ADgDgeAA8AwPAAH+N/wAA///4AAH//4AAAf/8AAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgBwAAB8A+AAAfAPgAAHgB4AAAwAMAAAAAAAAA=='),
    46,
    atob("CAwTEhITFBMTExMTCQ=="),
    38 | 65536
  );
};

Graphics.prototype.setFontRoboto20 = function (scale) {
  // Actual height 21 (20 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAH/zA/+YAAAAAAAHwAAwAAHwAA+AAAAAAAAAAAQACDAAYbADP4B/8A/zAGYZADH4A/+A/7AHYYADCAAAAAAAQAeHgH4eBzgwMMHnhw88GGBw4wHj+AcPgAAAAAAAAAAB4AA/gAGMAAwhwGMcAfuABzgABzgAc+AOMYBhBAAMYAB/AAHwAAAAAHwD5+A/8YGPDAw8YGPzA/HYD4fAADwAB/AAOYAABAAAAHwAA4AAAAAAAAAAH/gD//B8A+cAA7AADAAAAAAAYAAbwAHHgHwf/4A/8AAAAEAABiAAGwAA8AA/AAH+AAGwAByAAEAAAAAAAMAABgAAMAABgAH/wA/+AAMAABgAAMAABgAAAAAAAIAAfAADwAAAABgAAMAABgAAMAABgAAAAAAAAAAAAADAAAYAAAAAAAAADgAB8AB+AA+AA+AA/AAHAAAgAAAAAAB8AB/8Af/wHAHAwAYGADAwAYHAHAf/wB/8AAAAAAAAAAABgAAcAADAAAYAAH//A//4AAAAAAAAAAAAAAAAAAAAABwDAeA4HAPAwHYGBzAwcYHHDAfwYB8DAAAYAAAAAAABgOAcBwHADAwwYGGDAwwYHPHAf/wB58AAAAAAAAADAAB4AAfAAPYAHjAB4YA8DAH//A//4AAYAADAAAAAAAAAEMA/xwH+HAxgYGMDAxgYGODAw/4GD+AAHAAAAAAAAAf8AP/wD2HA5wYGMDAxgYGOHAA/wAD8AAAAAAAAAAAGAAAwAAGADAwB4GB+Aw+AGfAA/gAHwAAwAAAAAAADAB5+Af/wHPDAwwYGGDAwwYHPHAfvwB58AAAAAAAAAAAB+AAf4AHDjAwMYGBjAwM4HDOAf/gB/4AAAAAAAAAAAAYDADAYAAAAAAAAAAYDAfAYHwAAAABAAAcAADgAA+AAGwAB3AAMYABjgAYMAAAAAAAAAAAAAAABmAAMwABmAAMwABmAAMwABmAAMwAAiAAAAAAAAAYMADjgAMYAB3AAGwAA2AADgAAcAABAAAAAAAAAMAADgAA4AAGBzAweYGHAA/wAD8AAEAAAAwAB/4A/PwOAGDgAYYPxmH/Mw4ZmMDMxgZmM+Mx/5mHDAYAIDgDAPBwAf8AAMAAAAAAAYAAfAAPwAP4AH+AH4wA8GAH4wAP2AAPwAAfwAAfAAAYAAAAAAAAAAA//4H//AwwYGGDAwwYGGDAwwYH/HAf/wB58AAAAADAAH/AD/+AcBwHADAwAYGADAwAYGADA4A4DweAODgAAAAAAAAAAAAAAH//A//4GADAwAYGADAwAYGADAYAwD4+AP/gAfwAAAAAAAAAAAH//A//4GDDAwYYGDDAwYYGDDAwYYGCDAgAYAAAAAAAH//A//4GDAAwYAGDAAwYAGDAAwYAGAAAAAAAAAAH/AD/8AcBwHAHAwAYGADAwYYGDDA4YYDz/AOfwAAAAAAAAAAA//4H//A//4ADAAAYAADAAAYAADAAAYAADAA//4H//AAAAAAAAAAAAAAA//4H//AAAAAAAAABAAAeAAB4AADAAAYAADAAAYAAHA//wH/8AAAAAAAAAAAAAAA//4H//AAcAAPAAD4AA/wAOPADg8A4B4GAHAgAYAAAAAAAH//A//4AADAAAYAADAAAYAADAAAYAADAAAAAAAA//4H//A+AAB+AAD8AAD8AAH4AAPAAH4AH4AD8AD8AA+AAH//A//4AAAAAAAH//A//4H//AeAAB8AADwAAPgAAeAAA8AADwH//A//4AAAAAAAAAAAH/AB/8AeDwHAHAwAYGADAwAYGADA4A4DweAP/gA/4AAAAAAAAAAAH//A//4GBgAwMAGBgAwMAGBgAwcAH/AAfwAA8AAAAAA/4AP/gDgOA4A4GADAwAYGADAwAYHAHgeD+B/8wD+GAAAAAAAAAAA//4H//AwYAGDAAwYAGDgAweAHH8Afz4B8HAAAIAAYAPDwD8OA5w4GGDAwwYGHDAwYYHDnAePwBw8AAAAGAAAwAAGAAAwAAGAAA//4H//AwAAGAAAwAAGAAAwAAAAAAAAAH/4A//wAAPAAAYAADAAAYAADAAAYAAPA//wH/8AAAAAAAAgAAHAAA/AAB/AAD+AAD+AAD4AAfAAfwAfwAfwAH4AA4AAEAAA+AAH/AAH/gAD/AAD4AD+AH+AH8AA+AAH+AAD+AAD/AAD4AH/AP/AH+AA8AAAAAAAAAGADA4A4HweAPPgA/wAB8AAfwAPvgDweA8B4GADAAAIGAAA4AAHwAAPgAAfAAA/4AH/AD4AB8AA+AAHgAAwAAAAAAAAAGADAwB4GAfAwPYGDzAx4YGeDA/AYHwDA4AYGADAAAAAAAA///3//+wAA2AAGAAAGAAA+AAD8AAD8AAD4AAH4AAHgAAMAAAAwAA2AAG///3//+AAAAAAAAAAAOAAHwAD4AA8AAD8AADwAAGAAAAAAABgAAMAABgAAMAABgAAMAABgAAMAABgAAAEAAAwAADAAAIAAAAAAAAAAEeABn4Ad3ADMYAZjADMYAZmAB/4AP/AAAAAAAA//4H//ABgwAYDADAYAYDADg4AP+AA/gABwAAAAAAAAA/gAP+ADg4AYDADAYAYDADAYAOOABxwAAAAAEAAH8AB/wAcHADAYAYDADAYAcDA//4H//AAAAAAAAAAAAH8AB/wAdnADMYAZjADMYAZjAB84AHmAAMAAMAABgAB//gf/8HMAAxgAGIAAAAAAH8IB/zAcHMDAZgYDMDAZgcHcD//Af/wAAAAAAAAAAH//A//4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAGf/Az/4AAAAAAAAAAMz//mf/4AAAAAAAAAAH//A//4ABwAAeAAH4ABzwAcPACAYAABAAAAAAAA//4H//AAAAAAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/ABgAAYAADAAAYAADgAAP/AA/4AAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAAH8AB/wAcHADAYAYDADAYAYDADx4AP+AA/gAAAAAAAAf/8D//gYDADAYAYDADAYAcHAB/wAH8AAEAAAAAAEAAH8AB/wAcHADAYAYDADAYAYDAD//gf/8AAAAAAAAAAAf/AD/4AcAADAAAYAACAAAAEAB5wAfnADMYAZjADGYAYzADn4AOeAAAAAAAADAAAYAAf/wD//ADAYAYDAAAAAAAAD/gAf/AAA4AADAAAYAADAAAwAf/AD/4AAAAAAAAYAAD4AAP4AAP4AAPAAH4AH4AD8AAcAAAAAAQAADwAAf4AAf4AAPAAP4AP4ADwAAfgAA/gAA/AAD4AH+AD+AAeAAAAAAAAACAYAcHADzwAH8AAfAAH8ADx4AcHACAIAcAMD4BgP4MAP/AAPwAP4AP4AD4AAcAAAAAAAAADAYAYHADD4AY7ADOYAfjADwYAcDADAYAAAAADAAA4AH//B/v8cABzAACAAAH//w//+AAAAAAACAACcAAx/n+H//AA4AAHAAAAAAAAAAAAAOAADgAAYAADAAAcAABgAAGAAAwAAGAADwAAcAAAAA"), 32, atob("BQUHDQwPDQQHBwkMBAYGCQwMDAwMDAwMDAwFBAsMCwoTDg0ODgwMDg8GDA0LEg8ODQ4NDA0ODRMNDQ0GCQYJCQYLDAsMCwcMDAUFCwUSDAwMDAcLBwwKEAoKCgcFBw4A"), 21 + (scale << 8) + (1 << 16));
  return this;
};

// TODO: Finish fixing this for different settings structure?
function palette(a, b) {
  log_debug('Pal: ' + a + ', ' + b);
  return new Uint16Array([g.theme.bg, a, b, g.toColor("#00f")]);
}
function assignPalettes() {
  palbg = new Uint16Array([g.toColor(g.theme.bg)]);
  for (let i = 0; i < settings.fruitful.length; i++) {
    let fruitful = settings.fruitful[i];
    log_debug('Setting palette for ' + fruitful.title);
    if (fruitful.color == 'Blk/Wht') {
      // BLK/WHT is the outside in light mode, so all of it gets filled in.
      // Using the dark theme stops it from being a one-color circle.
      pals[i].pal1 = palette(g.toColor(fruitful.gy), g.toColor(fruitful.fg));
      pals[i].pal2 = palette(g.toColor(fruitful.fg), g.toColor(fruitful.gy));
    } else if (g.theme.dark) {
      // palette for 0-49%
      pals[i].pal1 = palette(g.toColor(fruitful.gy), g.toColor(fruitful.fg));
      // palette for 50-100%
      pals[i].pal2 = palette(g.toColor(fruitful.fg), g.toColor(fruitful.gy));
    } else {
      // palette for 0-49%
      pals[i].pal1 = palette(g.theme.fg, g.toColor(fruitful.fg));
      // palette for 50-100%
      pals[i].pal2 = palette(g.toColor(fruitful.fg), g.theme.fg);
    }
  }
}

function rotate_points(end, max) {
  const midH = H / 2;
  const midW = W / 2;
  const off = 5;
  const points = [midW - off, 0, midW + off, 0, midW + off, midH, midW - off, midH];
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

function setSmallFont() {
  g.setFontRoboto20();
}

function setLargeFont() {
  g.setFontBloggerSansLight38();
}

function setTinyFont() {
  g.setFont('Vector', 12);
}

function ymd(date) {
  return date.toLocalISOString().substring(0, 10);
}

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
  settings.fruitful = settings.fruitful ||
    [{ title: "Work", target_min: 480, fg: '#0f0', gy: '#020', color: 'Green' }];
  settings.hour_color = settings.hour_color || 'Magenta';
  settings.hour_fg = settings.hour_fg || '#f8f';
  // TODO: Allow actually changing this
  settings.fallow_denominator = 3;
  settings.hr_12 = (global_settings["12hour"] === undefined ? false : global_settings["12hour"]);
  // Converts from JSON or supplies size
  settings.total_sec_by_cat = new Uint16Array(settings.total_sec_by_cat || 15);
  settings.fallow_buffer_sec = settings.fallow_buffer_sec || 0.0;
  settings.cur_mode = settings.cur_mode || -1;
  settings.last_reset = settings.last_reset || ymd(new Date());
  assignPalettes();
}

var drawCount = 0;

// TODO: Rework these (?) for different purpose of captioning mode
function getInfoDims() {
  var line = infoLineDefault;
  var width = infoWidthDefault;
  var height = infoHeightDefault;
  return [line, width, height];
}

function drawHour(date) {
  var hh = date.getHours();
  if (settings.hr_12) {
    hh = hh % 12;
    if (hh == 0) hh = 12;
  }
  hh = hh.toString().padStart(2, '0');
  setLargeFont();
  g.setColor(settings.hour_fg);
  g.setFontAlign(1, 0);  // right aligned
  g.drawString(hh, (W / 2) - 1, H / 2);
}

/// NOTE: Needs font size set properly beforehand
function drawMin(date) {
  var mm = date.getMinutes().toString().padStart(2, '0');
  g.setColor(g.theme.fg);
  g.setFontAlign(-1, 0); // left aligned
  g.drawString(mm, (W / 2) + 1, H / 2);
}

function draw() {
  drawClock();
  queueDraw();
}

// TODO: Finish reworking (?) for stacking gauge segments etc
function getGaugeImage(start, totalMin, amtMin, targetMin, invertRing) {
  // Cap end var so the ring doesn't need to update if already full
  let ringFill = Math.min(targetMin, amtMin) / totalMin;
  let end = start + Math.round(ringFill);
  if (invertRing) {
    start = totalMin - end;
    end = totalMin;
  }
  log_debug("Start: " + start + "  end: " + end);
  return [start, end];
}

function drawIfChanged(start, end, totalMin, idxRing) {
  //if (end === prevRing[idx].end && start === prevRing[idx].start && totalMin === prevRing[idx].max) return;
  drawSegment(start, end, totalMin, idxRing);
  //prevRing[idx].start = start;
  //prevRing[idx].end = end;
  //prevRing[idx].max = totalMin;
  log_debug("Redrew part of ring #" + idxRing);
}

// TODO: Rewrite to focus on drawing all segments of two or three rings
function drawAllSegments(date, drawOnlyThisTitle) {
  for (let i = 0; i < settings.fruitful.length; i++) {
    let fruitful = settings.fruitful[i];
    if (drawOnlyThisTitle != null && fruitful.title != drawOnlyThisTitle) continue;
    var result = getGaugeImage(date, fruitful.ring, fruitful.step_target);
    drawIfChanged(result[0], result[1], result[2], 0);
  }
}

function drawCurMode() {
  var text, bg;
  if (-1 == settings.cur_mode) {
    text = '-> * <-';
    bg = '#80f';
  } else if (settings.cur_mode < -1) {
    text = '<- ->';
    bg = '#f00';
  } else {
    f = settings.fruitful[settings.cur_mode];
    text = f.title;
    bg = f.fg;
  }
  var dims = getInfoDims();
  var line = dims[0];
  var width = dims[1];
  var height = dims[2];
  g.setColor(bg);
  g.fillRect((W / 2) - width, line - height - 2, (W / 2) + width, line + height - 2);

  g.setColor(g.theme.fg);
  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString(text, W / 2, line);
}

function drawClock() {
  var date = new Date();

  // TODO: Reduce affected area
  g.clear(true);

  buttons.forEach(b => b.draw());
  drawCurMode();

  // TODO: Disable once totals are clear
  var dims = getInfoDims();
  var yStride = dims[2] + 5;
  g.setColor(g.theme.fg);
  setSmallFont();

  g.setFontAlign(-1, -1);
  for (let i = 0; i < settings.fruitful.length; i++) {
    let f = settings.fruitful[i], totalMin = getFruitfulMin(i);
    g.drawString(f.title + ': ' + totalMin, ringEdge, i * yStride + ringEdge);
  }
  g.setFontAlign(1, 1);
  g.drawString(Math.floor(settings.fallow_buffer_sec / 60), W - 20, H - 20);
  g.setFontAlign(-1, 1);
  g.drawString(getDecenterMin(-2), 20, H - 20);

  // TODO: Reenable once totals are clear
  //drawAllSegments(date, null);

  drawHour(date);
  drawMin(date);

  //drawInfo();
  drawCount++;
}

function addPoint(loc, max) {
  var angle = ((2 * Math.PI) / max) * loc;
  var x = hyp * Math.sin(angle);
  var y = hyp * Math.cos(angle + Math.PI);
  x += rad;
  y += rad;
  return [Math.round(x), Math.round(y)];
}

function polyArray(start, end, max) {
  const eighth = max / 8;
  if (start == end) return []; // No array to draw if the points are the same.
  let startOrigin = start;
  let endOrigin = end;
  start %= max;
  end %= max;
  if (start == 0 && startOrigin != 0) start = max;
  if (end == 0 && endOrigin != 0) end = max;
  if (start > end) end += max;
  var array = [g.getHeight() / 2, g.getHeight() / 2];
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
  const buf = drawRing._buf;
  let img = {
    width: W, height: H, transparent: 0,
    bpp: 2, palette: pals[idx].pal1, buffer: buf.buffer
  };
  let edge = ringEdge + (idx * ringIterOffset);
  buf.clear();
  buf.setColor(1).fillEllipse(edge, edge, W - edge, H - edge);
  buf.setColor(0).fillEllipse(edge + ringThick, edge + ringThick, W - edge - ringThick, H - edge - ringThick);
  img.palette = pals[idx].pal2;
  g.drawImage(img, 0, 0);  // Draws a filled-in circle
  if ((end - start) >= max) return;  // No need to add the unfilled circle
  buf.clear();
  buf.setColor(1).fillEllipse(edge, edge, W - edge, H - edge);
  buf.setColor(0).fillEllipse(edge + ringThick, edge + ringThick, W - edge - ringThick, H - edge - ringThick);
  buf.setColor(0).fillPoly(polyArray(start, end, max)); // Masks the filled-in part of the segment over the unfilled part
  img.palette = pals[idx].pal1;
  g.drawImage(img, 0, 0);  // Draws the unfilled-in segment
  return;
}
// Create persistent `buf` inside the function scope
drawRing._buf = Graphics.createArrayBuffer(W, H, 2, { msb: true });

// TODO: Adapt??
function drawSemi(start, end, max, idx) {
  // Create persistent `buf` inside the function scope
  var fullCircle = (end - start) >= max;
  if (!drawSemi._buf) {
    drawSemi._buf = Graphics.createArrayBuffer(W, H, 2, { msb: true });
  }
  const buf = drawSemi._buf;
  let img = {
    width: W, height: H, transparent: 0,
    bpp: 2, palette: pals[idx].pal2, buffer: buf.buffer
  };
  let edge = ringEdge + (idx * ringIterOffset);
  buf.clear();
  buf.setColor(1).fillEllipse(edge, edge, W - edge, H - edge);
  buf.setColor(0).fillEllipse(edge + ringThick, edge + ringThick, W - edge - ringThick, H - edge - ringThick);
  if (fullCircle)
    img.palette = pals[idx].pal2;
  else
    img.palette = palbg;
  g.drawImage(img, 0, 0);  // Draws a filled-in circle with the bg color, clearing it
  if (end == start) return; //If the ring should be completely empty
  if (fullCircle) return;  // No need to add the unfilled circle
  buf.clear();
  buf.setColor(1).fillEllipse(edge, edge, W - edge, H - edge);
  buf.setColor(0).fillEllipse(edge + ringThick, edge + ringThick, W - edge - ringThick, H - edge - ringThick);
  buf.setColor(0).fillPoly(polyArray(end, start, max)); // Masks the filled-in part of the segment over the unfilled part
  img.palette = pals[idx].pal2;
  g.drawImage(img, 0, 0);  // Draws the unfilled-in segment
  return;
}

function drawC(end, max, idx) {
  // Create persistent `buf` inside the function scope
  if (!drawC._buf) {
    drawC._buf = Graphics.createArrayBuffer(W, H, 2, { msb: true });
  }
  const buf = drawC._buf;
  let img = {
    width: W, height: H, transparent: 0,
    bpp: 2, palette: pals[idx].pal2, buffer: buf.buffer
  };
  let edge = ringEdge + (idx * ringIterOffset);
  buf.clear();
  buf.setColor(1).fillEllipse(edge, edge, W - edge, H - edge);
  buf.setColor(0).fillEllipse(edge + ringThick, edge + ringThick, W - edge - ringThick, H - edge - ringThick);
  img.palette = palbg;
  g.drawImage(img, 0, 0);  // Draws a filled-in circle with the bg color, clearing it
  buf.clear();
  buf.setColor(1).fillEllipse(edge, edge, W - edge, H - edge);
  buf.setColor(0).fillEllipse(edge + ringThick, edge + ringThick, W - edge - ringThick, H - edge - ringThick);
  if (end > max) end = max;
  var vertices = rotate_points(end, max);
  buf.setColor(0).fillPoly(vertices);
  img.palette = pals[idx].pal2;
  g.drawImage(img, 0, 0);  // Draws the unfilled-in segment  
  return;
}

///////////////   BUTTON CLASS ///////////////////////////////////////////

// simple on screen button class
function Button(name, corner, size, color, callback) {
  this.name = name;
  this.corner = corner;
  this.size = size;
  this.color = color;
  this.callback = callback;
}

// if pressed, fire the callback
Button.prototype.check = function (x, y) {
  //log_debug(this.name + ":check() x=" + x + " y=" + y);

  x_dist = this.corner == 'bl' || this.corner == 'tl' ? W - x : x;
  y_dist = this.corner == 'tr' || this.corner == 'tl' ? H - y : y;
  if (y_dist + x_dist >= H + W - 2 * this.size) {
    //log_debug(this.name + " callback\n");
    this.callback();
    return true;
  }
  return false;
};

Button.prototype.draw = function () {
  g.setColor(this.color);
  // TODO: Improve appearance (curves? outlines?)
  switch (this.corner) {
    case 'tl':
      g.fillPoly([0, 0, 0, this.size, this.size, 0]); break;
    case 'bl':
      g.fillPoly([0, H, 0, H - this.size, this.size, H]); break;
    case 'tr':
      g.fillPoly([W, 0, W - this.size, 0, W, this.size]); break;
    case 'br':
      g.fillPoly([W, H, W - this.size, H, W, H - this.size]); break;
  }
};

function redrawWholeFace() {
  // TODO: Reset any previous data to force a full redraw
  g.clear();
  draw();
}

var inMenu = false;
Bangle.on('touch', function (button, xy) {
  if (inMenu) return;
  var x = xy.x;
  var y = xy.y;
  // adjust for outside the dimension of the screen
  // http://forum.espruino.com/conversations/371867/#comment16406025
  if (y > H) y = H;
  if (y < 0) y = 0;
  if (x > W) x = W;
  if (x < 0) x = 0;

  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].check(x, y)) return;
  }
});

function setCurMode(newMode) {
  //log_debug('Setting cur_mode to ' + newMode);
  settings.cur_mode = newMode;
  E.showMenu();
  storage.write(SETTINGS_FILE, settings);
  redrawWholeFace();
}

function pickFruitful() {
  var menu = { "": { title: '-- Fruitful --', remove: () => { inMenu = false; } } };
  for (let i = 0; i < settings.fruitful.length; i++) {
    let f = settings.fruitful[i], newMode = i;
    menu[f.title] = () => setCurMode(newMode);
  }
  inMenu = true;
  E.showMenu(menu);
}

// TODO: Add menu to select decentering subcategory
var buttons = [new Button('fruitful', 'tr', 40, '#0f0', pickFruitful),
               new Button('recenter', 'br', 40, '#80f', () => setCurMode(-1)),
               new Button('decenter', 'bl', 40, '#f00', () => setCurMode(-2))];
buttons.forEach(b => b.draw());

///////////////////////////////////////////////////////////////////////////////

// timeout used to update every minute
var drawTimeout;
var totals_updated_at;

function resetTotals() {
  const now = new Date();
  // TODO: Save to historical file before clearing
  settings.fallow_buffer_sec = 0;
  settings.total_sec_by_cat.fill(0);
  settings.cur_mode = -1;
  totals_updated_at = now;
  settings.last_reset = ymd(now);
}

function updateTotals() {
  const now = new Date();
  var ymdNow = ymd(now), hrNow = now.getHours();
  if (ymdNow != settings.last_reset && resetHour == hrNow) {
    resetTotals();
  } else {
    if (!totals_updated_at) totals_updated_at = now;
    let update_sec = Math.round((now.getTime() - totals_updated_at.getTime()) / 1000);
    totals_updated_at = now;
    if (-1 == settings.cur_mode) {
      useRecenter(update_sec);
    } else if (settings.cur_mode >= 0) {
      addFruitful(settings.cur_mode, update_sec);
    } else {
      useDecenter(settings.cur_mode, update_sec);
    }
  }
}

// schedule a draw for the next minute or every sec_update ms
function queueDraw() {
  let now = Date.now();
  let delay = nextUpdateMs - (now % nextUpdateMs);
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    updateTotals();
    draw();
  }, delay);
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clockupdown", btn => {
  draw();
  storage.write(SETTINGS_FILE, settings);  // Retains idxInfo when leaving the face
});

loadSettings();

Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();
E.showMenu(); // Dumb hack to try to reduce first-time flickering
redrawWholeFace();
