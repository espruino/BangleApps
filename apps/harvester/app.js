const storage = require('Storage');
const widget_utils = require('widget_utils');
const buzz = require('buzz');
var settings;
const SETTINGS_FILE = "harvester.json";
const global_settings = storage.readJSON("setting.json", true) || {};
const H = g.getHeight();
const W = g.getWidth();

const FALLOW_IDX = -1;

// TODO: Remove
const DECENTER_IDX = -2;

var palCat, totalMin, startCat, endCat;

const CM_Y = (3 * H / 4) - 10;
const CM_W = 40;
const CM_H = 12;
const ringEdge = 2;
const ringIterOffset = 10;
const ringThick = 6;
const nextUpdateMs = 60000;
const halfWidthInscribed = W / 2 - ringEdge;
const halfHeightInscribed = H / 2 - ringEdge;
const radiusOuterRing = Math.min(halfWidthInscribed, halfHeightInscribed);
// TODO: Add back in some sort of previous state record to avoid needless redraws
//const { getDefaultSettings, color_options, fg_code, gy_code, fg_code_font } = require('./modules/set-def');

const resetHour = 3; // Reset (and eventually save) totals at a time few will be awake

function log_debug(o) {
  print(o);
}

function getFruitfulMin(i) {
  return Math.floor(settings.total_sec_by_cat[i] / 60);
}
function getFallowMin() {
  return Math.floor(settings.fallow_buffer_sec / 60);
}
function getFallowUsedMin() {
  return Math.floor(settings.fallow_used_sec / 60);
}
function getDecenterMin(i) {
  if (i >= FALLOW_IDX) { log_debug("can't treat " + i + " as decentering"); return; }
  return Math.floor(settings.total_sec_by_cat[settings.total_sec_by_cat.length + i] / 60);
}
function addFruitful(i, sec) {
  if (result >= targetMin * MIN && result < (targetMin + 1) * MIN) {
    // TODO: Improve
    buzz.pattern('=-;,:.');
  }
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
  if (i >= FALLOW_IDX) { log_debug("can't treat " + i + " as decentering"); return; }
  var excess_sec = useRecenter(sec), remaining = settings.fallow_buffer_sec;
  let newTotal = settings.total_sec_by_cat[settings.total_sec_by_cat.length + i] + excess_sec;
  // Assumes it will only be called every minute
  // TODO: Allow configuring times
  if (remaining <= 5 * MIN && remaining > 4 * MIN) {
    buzz.pattern(':  :');
  } else if (remaining <= 1 * MIN && remaining > 0) {
    buzz.pattern(';  ;');
  } else if (0 == remaining && excess_sec < 1 * MIN) {
    buzz.pattern('==  ==');
  } else if (0 == remaining && 0 == (newTotal % (5 * MIN))) {
    buzz.pattern('= = = = =');
  }
  return settings.total_sec_by_cat[settings.total_sec_by_cat.length + i] = newTotal;
}

// https://www.1001fonts.com/rounded-fonts.html?page=3

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

function palette(dim, bright) {
  log_debug('Pal: ' + dim + ', ' + bright);
  return new Uint16Array([g.theme.bg, dim, bright, g.theme.fg]);
}
function updateDerivedRingVars() {
  totalMin = 0;
  startCat = new Uint16Array(settings.fruitful.length);
  endCat = new Uint16Array(settings.fruitful.length);
  palCat = new Array(settings.fruitful.length + 1); // TODO: Decentering categories
  for (let i = 0; i < settings.fruitful.length; i++) {
    let fruitful = settings.fruitful[i];
    startCat[i] = totalMin;
    totalMin += fruitful.target_min;
    endCat[i] = totalMin;
    log_debug('Setting palette for ' + fruitful.title);
    if (fruitful.color == 'Blk/Wht') {
      // BLK/WHT is the outside in light mode, so all of it gets filled in.
      // Using the dark theme stops it from being a one-color circle.
      palCat[i] = palette(g.toColor(fruitful.gy), g.toColor(fruitful.fg));
    } else if (g.theme.dark) {
      palCat[i] = palette(g.toColor(fruitful.gy), g.toColor(fruitful.fg));
    } else {
      palCat[i] = palette(g.theme.fg, g.toColor(fruitful.fg));
    }
  }
  // TODO: Set palettes for decentering, with theming
  palCat[palCat.length + DECENTER_IDX + 1] = palette(g.toColor('#f00'), g.toColor('#200'));
}

function setSmallFont() {
  g.setFontRoboto20();
}

function setLargeFont() {
  g.setFontBloggerSansLight38();
}

function ymd(date) {
  return date.toLocalISOString().substring(0, 10);
}

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
  settings.fruitful = settings.fruitful ||
    [{ title: "Work", target_min: 480, fg: '#0f0', gy: '#020', color: 'Green' }];
  settings.hour_color = settings.hour_color || 'Pink';
  settings.hour_fg = settings.hour_fg || '#f8f';
  // TODO: Allow actually changing this
  settings.fallow_denominator = 3;
  settings.hr_12 = (global_settings["12hour"] === undefined ? false : global_settings["12hour"]);
  // Converts from JSON or supplies size
  settings.total_sec_by_cat = new Uint16Array(settings.total_sec_by_cat || 15);
  settings.fallow_buffer_sec = settings.fallow_buffer_sec || 0;
  settings.fallow_used_sec = settings.fallow_used_sec || 0;
  settings.cur_mode = settings.cur_mode || FALLOW_IDX;
  settings.last_reset = settings.last_reset || ymd(new Date());
  updateDerivedRingVars();
}

var drawCount = 0;

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
function getGaugeImage(start, amtMin, targetMin, invertRing) {
  // Cap end var so the ring doesn't need to update if already full
  let ringFill = Math.round(Math.min(targetMin, amtMin)), mid;
  let ringGray = Math.round(targetMin), end;
  if (invertRing) {
    start = totalMin - ringGray - ringFill;
    mid = totalMin - ringFill;
    end = totalMin;
  } else {
    mid = start + ringFill;
    end = start + ringGray;
  }
  
  log_debug("Start: " + start + " endFill: " + mid + " grayFill: " + end);
  return [start, mid, end];
}

function drawIfChanged(start, endFill, endGray, idxCat, idxRing) {
  // TODO: Actually optimize away redraws
  //if (end === prevRing[idx].end && start === prevRing[idx].start && totalMin === prevRing[idx].max) return;
  var pal;
  if (FALLOW_IDX == idxCat) {
    pal = palette(g.toColor('#202'), g.toColor('#80f'));
  } else if (idxCat < 0) {
    pal = palCat[palCat.length + idxCat + 1];
  } else {
    pal = palCat[idxCat];
  }
  drawSegment(start, endFill, endGray, pal, idxRing);
  //prevRing[idx].start = start;
  //prevRing[idx].end = end;
  //prevRing[idx].max = totalMin;
  log_debug("Redrew part #" + idxCat + " in ring #" + idxRing);
  return true;
}

function drawAllSegments() {
  var result, anyChanged = false;
  for (let i = 0; i < settings.fruitful.length; i++) {
    let fruitful = settings.fruitful[i];
    //if (drawOnlyThisTitle != null && fruitful.title != drawOnlyThisTitle) continue;
    result = getGaugeImage(startCat[i], getFruitfulMin(i), fruitful.target_min, false);
    if (drawIfChanged(result[0], result[1], result[2], i, 0)) anyChanged = true;
  }

  result = getGaugeImage(0, getDecenterMin(DECENTER_IDX), Math.round(totalMin / 4), true);
  if (drawIfChanged(result[0], result[1], result[2], DECENTER_IDX, 1)) anyChanged = true;

  var fallowScale = Math.round(totalMin / 4);
  var fallowAmt = getFallowMin() * settings.fallow_denominator;
  result = getGaugeImage(fallowScale * 1.5, fallowAmt, fallowScale, false);
  if (drawIfChanged(result[0], result[1], result[2], FALLOW_IDX, 1)) anyChanged = true;

  if (anyChanged) { // Draw trimming circles
    g.setColor(g.theme.bg);
    for (let iRing = 0; iRing < 2; iRing++) {
      let radiusBase = radiusOuterRing - ringIterOffset * iRing;
      g.drawCircle(W / 2, H / 2, radiusBase + 1);
      //g.drawCircle(W / 2, H / 2, radiusBase);
      g.drawCircle(W / 2, H / 2, radiusBase - ringThick);
      g.drawCircle(W / 2, H / 2, radiusBase - ringThick - 1);
    }
  }
}

function drawCurMode() {
  var text, bg;
  if (FALLOW_IDX == settings.cur_mode) {
    text = '-> * <-';
    bg = '#80f';
  } else if (settings.cur_mode < FALLOW_IDX) {
    text = '<- ->';
    bg = '#f00';
  } else {
    f = settings.fruitful[settings.cur_mode];
    text = f.title;
    bg = f.fg;
  }
  g.setColor(bg);
  g.fillRect((W / 2) - CM_W, CM_Y - CM_H - 2, (W / 2) + CM_W, CM_Y + CM_H - 2);

  g.setColor(g.theme.fg);
  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString(text, W / 2, CM_Y);
}

function drawClock() {
  var date = new Date();

  // TODO: Reduce affected area
  g.clear(true);

  buttons.forEach(b => b.draw());
  drawCurMode();

  // TODO: Disable once totals are clear
  /* g.setColor(g.theme.fg);
  setSmallFont(); */

  /* g.setFontAlign(-1, -1);
  for (let i = 0; i < settings.fruitful.length; i++) {
    let f = settings.fruitful[i], totalMin = getFruitfulMin(i);
    g.drawString(f.title + ': ' + totalMin, ringEdge, i * yStride + ringEdge);
  } */
  /* g.setFontAlign(1, 1);
  g.drawString(Math.floor(settings.fallow_buffer_sec / 60), W - 20, H - 20); */
  /* g.setFontAlign(-1, 1);
  g.drawString(getDecenterMin(DECENTER_IDX), 20, H - 20); */

  // TODO: Reenable once totals are clear
  drawAllSegments();

  drawHour(date);
  drawMin(date);

  //drawInfo();
  drawCount++;
}

function addPoint(arr, qty, radius, scaleMax) {
  var angle = ((2 * Math.PI) / scaleMax) * qty;
  var x = W/2 + radius * Math.sin(angle);
  var y = H/2 + radius * Math.cos(angle + Math.PI);
  arr.push(Math.round(x), Math.round(y));
}

function polyArray(start, end, radius, scaleMax) {
  const subsegment = scaleMax / 32;
  if (start == end) return []; // No array to draw if the points are the same.
  let startOrigin = start;
  let endOrigin = end;
  start %= scaleMax;
  end %= scaleMax;
  if (start == 0 && startOrigin != 0) start = scaleMax;
  if (end == 0 && endOrigin != 0) end = scaleMax;
  if (start > end) end += scaleMax;
  var array = [];
  for (let i = start; i < end; i += subsegment) {
    addPoint(array, i, radius, scaleMax);
  }
  addPoint(array, end, radius, scaleMax);
  // Inner side
  for (let i = end; i > start; i -= subsegment) {
    addPoint(array, i, radius - ringThick, scaleMax);
  }
  addPoint(array, start, radius - ringThick, scaleMax);
  //log_debug("Poly Arr: " + array);
  return array;
}

function drawSegment(start, endFill, endGray, palette, idxRing) {
  // Create persistent `buf` inside the function scope
  if (!drawSegment._buf) {
    drawSegment._buf = Graphics.createArrayBuffer(W, H, 2, {});
  }
  const buf = drawSegment._buf;
  let img = {
    width: W, height: H, transparent: 0, bpp: 2, palette: palette, buffer: buf.buffer
  };
  let radius = radiusOuterRing - (idxRing * ringIterOffset);
  buf.clear();
  buf.setColor(2).fillPolyAA(polyArray(start, endFill, radius, totalMin));
  //if (endFill >= endGray) return;  // No need to add the unfilled arc
  buf.setColor(1).fillPolyAA(polyArray(endFill, endGray, radius, totalMin));
  g.drawImage(img, 0, 0);
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
               new Button('recenter', 'br', 40, '#80f', () => setCurMode(FALLOW_IDX)),
               new Button('decenter', 'bl', 40, '#f00', () => setCurMode(DECENTER_IDX))];
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
  settings.cur_mode = FALLOW_IDX;
  totals_updated_at = now;
  settings.last_reset = ymd(now);
}

function updateTotals() {
  const now = new Date();
  var ymdNow = ymd(now), hrNow = now.getHours();
  if (ymdNow != settings.last_reset && resetHour >= hrNow) {
    resetTotals();
  } else {
    if (!totals_updated_at) totals_updated_at = now;
    let update_sec = Math.round((now.getTime() - totals_updated_at.getTime()) / 1000);
    totals_updated_at = now;
    if (FALLOW_IDX == settings.cur_mode) {
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
