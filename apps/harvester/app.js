const storage = require('Storage');
const widget_utils = require('widget_utils');
const buzz = require('buzz');
var settings;
const SETTINGS_FILE = "harvester.json";
const global_settings = storage.readJSON("setting.json", true) || {};
const H = g.getHeight();
const W = g.getWidth();

const FALLOW_IDX = 0;

// TODO: Remove
const DECENTER_IDX = -1;

// TODO: Distinguish startCat + endCat from others with different indexing, or make them consistent
var totalMin;
var palCat, modeCat, targetMinCat, startCat, endCat;

const CLK_Y = H / 2 - 10;
const CLK_HALF_W = 112 / 2, CLK_HALF_H = 48 / 2, CLK_BG_Y = H / 2 - 17;

const CM_Y = (3 * H / 4) - 20;
const CM_W = 54;
const CM_H = 12;
const ringEdge = 2;
const ringIterOffset = 10;
const ringThick = 6;
const nextUpdateMs = 60000;
const radiusOuterRing = Math.min((W / 2 - ringEdge), (H / 2 - ringEdge));

var prevDrawnMode, prevDrawnTime, prevDrawnSegment = [];

//const { getDefaultSettings, color_options, fg_code, gy_code, fg_code_font } = require('./modules/set-def');

const HR_RESET = 3; // Reset (and eventually save) totals at a time few will be awake

const DEBUGGING = true; // TODO:
function log_debug(o) {
  if (DEBUGGING) print(o);
}

const MIN = 60;

function at(arr, i) {
  if (i < 0) i += arr.length;
  return arr[i];
}

function getMin(i) {
  if (i < 0) i += settings.total_sec_by_cat.length;
  return Math.floor(settings.total_sec_by_cat[i] / MIN);
}
function addFruitful(i, sec) {
  if (i <= FALLOW_IDX) throw new Error("Can't track fruitful time with i=" + i);
  settings.total_sec_by_cat[FALLOW_IDX] += sec / settings.fallow_denominator;
  const result = settings.total_sec_by_cat[i] += sec;
  const targetMin = targetMinCat[i - 1]; // XXX
  if (result >= targetMin * MIN && result < (targetMin + 1) * MIN) {
    log_debug('Reached target for ' + modeCat[i] + ' (' + targetMin + ' min)');
    // TODO: Improve
    buzz.pattern('=-;,:.');
  }
  return result;
}
function useRecenter(sec) {
  /* sec=60, buf=120; used=60
     sec=60, buf=30; used=30
     sec=60, buf=0; used=0
   */
  var fallow_used_sec = E.clip(settings.total_sec_by_cat[FALLOW_IDX], 0, sec);
  settings.total_sec_by_cat[FALLOW_IDX] -= fallow_used_sec;
  return sec - fallow_used_sec;
}
function useDecenter(i, sec) {
  if (i >= FALLOW_IDX) throw new Error("can't treat " + i + " as decentering");
  var excess_sec = useRecenter(sec);
  var remaining = settings.total_sec_by_cat[FALLOW_IDX];
  const j = settings.total_sec_by_cat.length + i;
  let newTotal = settings.total_sec_by_cat[j] + excess_sec;
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
  return settings.total_sec_by_cat[j] = newTotal;
}

/** Generically picks the right method to use for the mode class. Accepts even
 *  negative time spent.
 */
function spendTime(mode, sec) {
  if (mode < FALLOW_IDX) {
    useDecenter(mode, sec);
  } else if (FALLOW_IDX == mode) {
    useRecenter(mode, sec);
  } else {
    addFruitful(mode, sec);
  }
}

/** For correcting human error in switching modes later than one should have.
 *  Does not include additional fallow accumulations/usage.
 *  @returns 2-tuple with the amount to be added to current and the amount to be
 *           subtracted from previous.
 */
function lateStartAdjustments(totalSecByCat, curMode, prevMode, secDesired) {
  let amt = Math.min(at(totalSecByCat, prevMode), secDesired);
  if (FALLOW_IDX == curMode && prevMode > FALLOW_IDX) {
    // Subtract fruitful time not spent (plus additional fallow time not accumulated)
    // TODO: Test
    return [-amt, amt];
  } else if (curMode > FALLOW_IDX && prevMode > FALLOW_IDX) {
    // Subtract fruitful time spent in other category
    // TODO: Test
    return [amt, amt];
  } else if (curMode > FALLOW_IDX && FALLOW_IDX == prevMode) {
    // (Will re-accumulate additional fallow time)
    // TODO: Test
    amt = secDesired; // No bound currently possible
    return [amt, -amt];
  } else if (curMode < FALLOW_IDX && prevMode > FALLOW_IDX) {
    // Subtract fruitful time and use up fallow time
    // TODO: Test
    return [amt, amt];
  } else if (curMode < FALLOW_IDX && FALLOW_IDX == prevMode) {
    // Use up as much fallow time as possible
    // TODO: Test
    return [amt, 0];
  } else if (curMode < FALLOW_IDX && prevMode < FALLOW_IDX) {
    // Subtract divergent time spent in other category
    // TODO: Test
    return [amt, amt];
  }
  // Other possibilities are technically sane but should be rare and aren't worth testing
  return [0, 0];
}

// https://www.1001fonts.com/rounded-fonts.html?page=3
Graphics.prototype.setFontBloggerSansLight46 = function (scale) {
  // Actual height 46 (45 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAA/AAAAAAAAPwAAAAAAAD4AAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH/gAAAAAAP/wAAAAAAf/gAAAAAAf/AAAAAAA//AAAAAAB/+AAAAAAD/8AAAAAAH/4AAAAAAH/wAAAAAAP/gAAAAAAf/gAAAAAA//AAAAAAB/+AAAAAAA/8AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///8AAAAP////4AAAP/////AAAH/////4AAD+AAAB/AAA8AAAAHwAAeAAAAA+AAHgAAAAHgADwAAAAB4AA8AAAAAPAAPAAAAADwADwAAAAA8AA8AAAAAPAAPAAAAADwAB4AAAAB4AAeAAAAAeAAHwAAAAPgAA/AAAAPwAAH/////4AAA/////8AAAH////+AAAAf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAPAAAAAAAAHwAAAAAAAB4AAAAAAAA+AAAAAAAAfAAAAAAAAHgAAAAAAAD4AAAAAAAB8AAAAAAAAeAAAAAAAAPgAAAAAAADwAAAAAAAB//////4AAf//////AAH//////gAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAD4AAHAAAAD+AAD4AAAB/gAA8AAAB/4AAfAAAA/+AAHgAAAf3gAB4AAAPx4AA8AAAH4eAAPAAAD4HgADwAAB8B4AA8AAA+AeAAPAAAfAHgADwAAPgB4AA8AAHwAeAAHgAD4AHgAB4AD8AB4AAfAB+AAeAAD8B/AAHgAAf//gAB4AAH//wAAeAAAf/wAAHgAAB/wAAA4AAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AADgAAAAPAAB4AAAADwAAeAAAAA+AAHgAAAAHgAB4ABgAB4AAeAA8AAeAAHgA/AADwAB4AfwAA8AAeAP8AAPAAHgH/AADwAB4H7wAA8AAeD48AAPAAHh8PAAHgAB5+BwAB4AAe/AeAA+AAH/AHwAfAAB/gA/AfgAAfwAH//wAAHwAA//4AAA4AAH/8AAAAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAD+AAAAAAAD/gAAAAAAH/4AAAAAAH/+AAAAAAP/ngAAAAAP/h4AAAAAf/AeAAAAAf/AHgAAAA/+AB4AAAA/+AAeAAAB/8AAHgAAA/8AAB4AAAP4AAAeAAAB4AAAHgAAAAAAAB4AAAAAAAAeAAAAAAP///4AAAAH////AAAAA////gAAAAP///4AAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAD4AA8AAD///gAPAAB///4AD4AAf//+AAeAAH+APAAHgAB4AHgAA4AAeAB4AAOAAHgAcAADwAB4AHAAA8AAeADwAAPAAHgAcAADwAB4AHAAA8AAeAB4AAeAAHgAeAAHgAB4AHwAD4AAeAA+AB8AAHgAP4B+AAB4AB///gAAOAAP//gAABAAA//wAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAB///4AAAAD////wAAAD////+AAAB/////4AAA/gPgB/AAAfgDwAHwAAPgA8AA+AADwAeAAHgAB4AHgAB4AAeAB4AAfAAHgAeAADwABwAHgAA8AAcAB4AAPAAHAAeAAHwAB4AHgAB4AAeAB8AAeAAHgAPAAPgAB4AD8APwAAOAAfwP4AADgAD//8AAAAAAf/+AAAAAAB/+AAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAAB4AAAAA4AAeAAAAB/AAHgAAAB/wAB4AAAB/4AAeAAAD/4AAHgAAD/wAAB4AAH/wAAAeAAH/gAAAHgAP/gAAAB4AP/AAAAAeAf/AAAAAHgf+AAAAAB4/+AAAAAAe/8AAAAAAH/8AAAAAAB/4AAAAAAAf4AAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAA/AB/+AAAA/8B//wAAA//gf/+AAAf/8PgPgAAH4fngB8AAD4B/wAPgAA8AP8AB4AAeAB+AAeAAHgAfgADwAB4ADwAA8AAcAA8AAPAAHAAPAADwAB4ADwAA8AAeAB+AAPAAHgAfgAHgAB8AP8AB4AAPgH/AA+AAD8H54AfAAAf/8fgPwAAD/+D//4AAAf/Af/8AAAB/AD/+AAAAAAAP+AAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAf/wAAAAAAf/+AAAAAAP//4AAwAAH//+AAeAAD+APwAHgAA+AA+AB4AAfAAHgAOAAHgAB4ADwAB4AAPAA8AAeAADwAPAAHgAA8ADwAB4AAPAA8AAeAADwAPAAHgAA8AHgAB8AAeAB4AAPgAHgA+AAD8ADwA/AAAfwA8A/gAAD/wef/wAAAf////4AAAB////4AAAAH///wAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AB4AAAAAfgA/AAAAAH4APwAAAAB+AD4AAAAAPAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DRAcHBwcHBwcHBwcDQ=="), 56 + (scale << 8) + (1 << 16));
  return this;
};

Graphics.prototype.setFontRoboto20 = function (scale) {
  // Actual height 21 (20 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAH/zA/+YAAAAAAAHwAAwAAHwAA+AAAAAAAAAAAQACDAAYbADP4B/8A/zAGYZADH4A/+A/7AHYYADCAAAAAAAQAeHgH4eBzgwMMHnhw88GGBw4wHj+AcPgAAAAAAAAAAB4AA/gAGMAAwhwGMcAfuABzgABzgAc+AOMYBhBAAMYAB/AAHwAAAAAHwD5+A/8YGPDAw8YGPzA/HYD4fAADwAB/AAOYAABAAAAHwAA4AAAAAAAAAAH/gD//B8A+cAA7AADAAAAAAAYAAbwAHHgHwf/4A/8AAAAEAABiAAGwAA8AA/AAH+AAGwAByAAEAAAAAAAMAABgAAMAABgAH/wA/+AAMAABgAAMAABgAAAAAAAIAAfAADwAAAABgAAMAABgAAMAABgAAAAAAAAAAAAADAAAYAAAAAAAAADgAB8AB+AA+AA+AA/AAHAAAgAAAAAAB8AB/8Af/wHAHAwAYGADAwAYHAHAf/wB/8AAAAAAAAAAABgAAcAADAAAYAAH//A//4AAAAAAAAAAAAAAAAAAAAABwDAeA4HAPAwHYGBzAwcYHHDAfwYB8DAAAYAAAAAAABgOAcBwHADAwwYGGDAwwYHPHAf/wB58AAAAAAAAADAAB4AAfAAPYAHjAB4YA8DAH//A//4AAYAADAAAAAAAAAEMA/xwH+HAxgYGMDAxgYGODAw/4GD+AAHAAAAAAAAAf8AP/wD2HA5wYGMDAxgYGOHAA/wAD8AAAAAAAAAAAGAAAwAAGADAwB4GB+Aw+AGfAA/gAHwAAwAAAAAAADAB5+Af/wHPDAwwYGGDAwwYHPHAfvwB58AAAAAAAAAAAB+AAf4AHDjAwMYGBjAwM4HDOAf/gB/4AAAAAAAAAAAAYDADAYAAAAAAAAAAYDAfAYHwAAAABAAAcAADgAA+AAGwAB3AAMYABjgAYMAAAAAAAAAAAAAAABmAAMwABmAAMwABmAAMwABmAAMwAAiAAAAAAAAAYMADjgAMYAB3AAGwAA2AADgAAcAABAAAAAAAAAMAADgAA4AAGBzAweYGHAA/wAD8AAEAAAAwAB/4A/PwOAGDgAYYPxmH/Mw4ZmMDMxgZmM+Mx/5mHDAYAIDgDAPBwAf8AAMAAAAAAAYAAfAAPwAP4AH+AH4wA8GAH4wAP2AAPwAAfwAAfAAAYAAAAAAAAAAA//4H//AwwYGGDAwwYGGDAwwYH/HAf/wB58AAAAADAAH/AD/+AcBwHADAwAYGADAwAYGADA4A4DweAODgAAAAAAAAAAAAAAH//A//4GADAwAYGADAwAYGADAYAwD4+AP/gAfwAAAAAAAAAAAH//A//4GDDAwYYGDDAwYYGDDAwYYGCDAgAYAAAAAAAH//A//4GDAAwYAGDAAwYAGDAAwYAGAAAAAAAAAAH/AD/8AcBwHAHAwAYGADAwYYGDDA4YYDz/AOfwAAAAAAAAAAA//4H//A//4ADAAAYAADAAAYAADAAAYAADAA//4H//AAAAAAAAAAAAAAA//4H//AAAAAAAAABAAAeAAB4AADAAAYAADAAAYAAHA//wH/8AAAAAAAAAAAAAAA//4H//AAcAAPAAD4AA/wAOPADg8A4B4GAHAgAYAAAAAAAH//A//4AADAAAYAADAAAYAADAAAYAADAAAAAAAA//4H//A+AAB+AAD8AAD8AAH4AAPAAH4AH4AD8AD8AA+AAH//A//4AAAAAAAH//A//4H//AeAAB8AADwAAPgAAeAAA8AADwH//A//4AAAAAAAAAAAH/AB/8AeDwHAHAwAYGADAwAYGADA4A4DweAP/gA/4AAAAAAAAAAAH//A//4GBgAwMAGBgAwMAGBgAwcAH/AAfwAA8AAAAAA/4AP/gDgOA4A4GADAwAYGADAwAYHAHgeD+B/8wD+GAAAAAAAAAAA//4H//AwYAGDAAwYAGDgAweAHH8Afz4B8HAAAIAAYAPDwD8OA5w4GGDAwwYGHDAwYYHDnAePwBw8AAAAGAAAwAAGAAAwAAGAAA//4H//AwAAGAAAwAAGAAAwAAAAAAAAAH/4A//wAAPAAAYAADAAAYAADAAAYAAPA//wH/8AAAAAAAAgAAHAAA/AAB/AAD+AAD+AAD4AAfAAfwAfwAfwAH4AA4AAEAAA+AAH/AAH/gAD/AAD4AD+AH+AH8AA+AAH+AAD+AAD/AAD4AH/AP/AH+AA8AAAAAAAAAGADA4A4HweAPPgA/wAB8AAfwAPvgDweA8B4GADAAAIGAAA4AAHwAAPgAAfAAA/4AH/AD4AB8AA+AAHgAAwAAAAAAAAAGADAwB4GAfAwPYGDzAx4YGeDA/AYHwDA4AYGADAAAAAAAA///3//+wAA2AAGAAAGAAA+AAD8AAD8AAD4AAH4AAHgAAMAAAAwAA2AAG///3//+AAAAAAAAAAAOAAHwAD4AA8AAD8AADwAAGAAAAAAABgAAMAABgAAMAABgAAMAABgAAMAABgAAAEAAAwAADAAAIAAAAAAAAAAEeABn4Ad3ADMYAZjADMYAZmAB/4AP/AAAAAAAA//4H//ABgwAYDADAYAYDADg4AP+AA/gABwAAAAAAAAA/gAP+ADg4AYDADAYAYDADAYAOOABxwAAAAAEAAH8AB/wAcHADAYAYDADAYAcDA//4H//AAAAAAAAAAAAH8AB/wAdnADMYAZjADMYAZjAB84AHmAAMAAMAABgAB//gf/8HMAAxgAGIAAAAAAH8IB/zAcHMDAZgYDMDAZgcHcD//Af/wAAAAAAAAAAH//A//4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAGf/Az/4AAAAAAAAAAMz//mf/4AAAAAAAAAAH//A//4ABwAAeAAH4ABzwAcPACAYAABAAAAAAAA//4H//AAAAAAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/ABgAAYAADAAAYAADgAAP/AA/4AAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAAH8AB/wAcHADAYAYDADAYAYDADx4AP+AA/gAAAAAAAAf/8D//gYDADAYAYDADAYAcHAB/wAH8AAEAAAAAAEAAH8AB/wAcHADAYAYDADAYAYDAD//gf/8AAAAAAAAAAAf/AD/4AcAADAAAYAACAAAAEAB5wAfnADMYAZjADGYAYzADn4AOeAAAAAAAADAAAYAAf/wD//ADAYAYDAAAAAAAAD/gAf/AAA4AADAAAYAADAAAwAf/AD/4AAAAAAAAYAAD4AAP4AAP4AAPAAH4AH4AD8AAcAAAAAAQAADwAAf4AAf4AAPAAP4AP4ADwAAfgAA/gAA/AAD4AH+AD+AAeAAAAAAAAACAYAcHADzwAH8AAfAAH8ADx4AcHACAIAcAMD4BgP4MAP/AAPwAP4AP4AD4AAcAAAAAAAAADAYAYHADD4AY7ADOYAfjADwYAcDADAYAAAAADAAA4AH//B/v8cABzAACAAAH//w//+AAAAAAACAACcAAx/n+H//AA4AAHAAAAAAAAAAAAAOAADgAAYAADAAAcAABgAAGAAAwAAGAADwAAcAAAAA"), 32, atob("BQUHDQwPDQQHBwkMBAYGCQwMDAwMDAwMDAwFBAsMCwoTDg0ODgwMDg8GDA0LEg8ODQ4NDA0ODRMNDQ0GCQYJCQYLDAsMCwcMDAUFCwUSDAwMDAcLBwwKEAoKCgcFBw4A"), 21 + (scale << 8) + (1 << 16));
  return this;
};

function setSmallFont() {
  g.setFont('Vector', 18);
}

function setLargeFont() {
  g.setFontBloggerSansLight46();
}

function ymd(date) {
  return date.toLocalISOString().substring(0, 10);
}

function palette(dim, bright) {
  //log_debug('Pal: ' + dim + ', ' + bright);
  return new Uint16Array([g.theme.bg, g.toColor(dim), g.toColor(bright), g.theme.fg]);
}
function autoGray(fruitful) {
  if (g.theme.dark || fruitful.color == 'Blk/Wht') {
    // TODO: Recheck this comment
    // BLK/WHT is the outside in light mode, so all of it gets filled in.
    // Using the dark theme stops it from being a one-color circle.
    return g.toColor(fruitful.gy || fruitful);
  } else {
    return g.theme.fg;
  }
}
function updateDerivedRingVars() {
  totalMin = 0;
  var fixedPosLen = settings.fruitful.length;
  var displayedLen = settings.fruitful.length + 1 + settings.decentering.length;
  startCat = new Uint16Array(fixedPosLen);
  endCat = new Uint16Array(fixedPosLen);
  targetMinCat = new Uint16Array(fixedPosLen);
  palCat = new Array(displayedLen);
  modeCat = new Array(displayedLen);

  palCat[FALLOW_IDX] = palette(autoGray('#220'), '#860');
  // TODO: Draw out a nice circle and arrows properly
  modeCat[FALLOW_IDX] = '» × «';
  for (let i = 0; i < settings.fruitful.length; i++) {
    let fruitful = settings.fruitful[i];
    startCat[i] = totalMin;
    targetMinCat[i] = fruitful.target_min;
    totalMin += fruitful.target_min;
    endCat[i] = totalMin;
    //log_debug('Setting palette for ' + fruitful.title);
    palCat[i + 1] = palette(autoGray(fruitful), g.toColor(fruitful.fg));
    modeCat[i + 1] = fruitful.title;
  }
  for (let j = 0; j < settings.decentering.length; j++) {
    let i = displayedLen + DECENTER_IDX - j, decentering = settings.decentering[j];
    palCat[i] = palette(autoGray(decentering), g.toColor(decentering.fg));
    modeCat[i] = decentering.title;
  }
}

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
  settings.fruitful = settings.fruitful ||
    [{ title: "Work", target_min: 480, fg: '#0f0', gy: '#020', color: 'Green' }];
  settings.decentering = settings.decentering ||
    [{ title: "Social Media", fg: '#f00', gy: '#200', color: 'Red' }];
  settings.hour_color = settings.hour_color || 'Light Green';
  settings.hour_fg = settings.hour_fg || '#8f8';
  // TODO: Allow actually changing this
  settings.fallow_denominator = 3;
  settings.hr_12 = (global_settings["12hour"] === undefined ? false : global_settings["12hour"]);
  // Converts from JSON or supplies size
  settings.total_sec_by_cat = new Uint16Array(settings.total_sec_by_cat || 16);
  //settings.fallow_used_sec = settings.fallow_used_sec || 0;
  settings.cur_mode = settings.cur_mode || FALLOW_IDX;
  settings.last_reset = settings.last_reset || ymd(new Date());
  updateDerivedRingVars();
}

var drawCount = 0;

function drawTime(date) {
  var hh = date.getHours();
  if (settings.hr_12) {
    hh = hh % 12;
    if (hh == 0) hh = 12;
  }
  hh = hh.toString().padStart(2, '0');
  var mm = date.getMinutes().toString().padStart(2, '0');
  if (prevDrawnTime == hh + mm) return;
  prevDrawnTime = hh + mm;

  setLargeFont();
  const wHalfS = W / 2;
  g.clearRect(wHalfS - CLK_HALF_W, CLK_BG_Y - CLK_HALF_H,
              wHalfS + CLK_HALF_W, CLK_BG_Y + CLK_HALF_H);
  g.setColor(settings.hour_fg).setFontAlign(1, 0);  // right aligned
  g.drawString(hh, wHalfS - 1, CLK_Y);

  g.setColor(g.theme.fg).setFontAlign(-1, 0);       // left aligned
  g.drawString(mm, wHalfS + 1, CLK_Y);
}

function draw() {
  drawFace();
  queueDraw();
}

function getGaugeSpans(start, amtMin, targetMin, invertRing) {
  let result = {};
  if (invertRing) {
    result.end = totalMin;
    result.mid = result.end - amtMin;
    result.start = result.mid - 5; // TODO: Tweak visual buffer
  } else {
    result.start = start;
    // Cap end var so the ring doesn't need to update if already full
    result.mid = start + amtMin;
    result.end = start + targetMin;
  }

  //log_debug(result);
  return result;
}

function drawIfChanged(gaugeSpans, idxCat, idxRing) {
  var i = idxCat < FALLOW_IDX ? idxCat + palCat.length : idxCat;
  var j = idxRing > 0 ? idxCat + 16 : idxCat; // Treat original/overflow separately
  var prevSpans = prevDrawnSegment[j];
  var endpointsMatch = prevSpans && prevSpans.start == gaugeSpans.start &&
                       prevSpans.end == gaugeSpans.end;
  if (endpointsMatch && prevSpans.mid == gaugeSpans.mid) return false;
  prevDrawnSegment[j] = gaugeSpans;
  var pal = palCat[i];
  if (idxCat < FALLOW_IDX) pal = palette(pal[2], pal[1]);
  if (endpointsMatch && prevSpans.mid < gaugeSpans.mid) {
    // Cheat by only drawing the progressed amount
    log_debug("Redrew advanced subsection of part #" + idxCat + " in ring #" + idxRing +
              ' from ' + prevSpans.mid + ' to ' + gaugeSpans.mid);
    drawSegment(prevSpans.mid, gaugeSpans.mid, gaugeSpans.mid, pal, idxRing);
  } else {
    log_debug("Redrew part #" + idxCat + " in ring #" + idxRing);
    drawSegment(gaugeSpans.start, gaugeSpans.mid, gaugeSpans.end, pal, idxRing);
  }
  return true;
}

function drawTrimmingCircles() {
  log_debug('Trimming circle edges');
  g.setColor(g.theme.bg);
  for (let iRing = 0; iRing < 2; iRing++) {
    let radiusBase = radiusOuterRing - ringIterOffset * iRing;
    g.drawCircle(W / 2, H / 2, radiusBase + 1);
    //g.drawCircle(W / 2, H / 2, radiusBase);
    g.drawCircle(W / 2, H / 2, radiusBase - ringThick);
    g.drawCircle(W / 2, H / 2, radiusBase - ringThick - 1);
  }
}

function drawAllSegments() {
  var anyChanged = false, start = 0;
  for (let i = 0; i < settings.fruitful.length; i++) {
    let targetMin = targetMinCat[i];
    let fruitful = getMin(i + 1), overwork = Math.max(fruitful - targetMin, 0);
    if (drawIfChanged(getGaugeSpans(startCat[i], fruitful - overwork, targetMin), i + 1, 0)) {
      anyChanged = true;
    }
    if (0 == overwork) continue;
    if (drawIfChanged(getGaugeSpans(start, overwork, overwork + 5), i + 1, 1)) {
      anyChanged = true;
    }
    start += overwork + 5;
  }

  start = 0;
  for (let j = 0; j < settings.decentering.length; j++) {
    let i = DECENTER_IDX - j; decenter = getMin(i);
    if (0 == decenter) continue;
    if (drawIfChanged(getGaugeSpans(start, decenter, decenter + 5, true), i, 1)) {
      anyChanged = true;
    }
    start += decenter + 5;
  }

  var fallowScale = Math.round(totalMin / 4);
  var fallowAmt = getMin(FALLOW_IDX) * settings.fallow_denominator;
  if (drawIfChanged(getGaugeSpans(fallowScale * 1.5, fallowAmt, fallowScale), FALLOW_IDX, 1)) {
    anyChanged = true;
  }

  if (anyChanged) drawTrimmingCircles();
}

function drawCurMode() {
  var i = settings.cur_mode;
  if (prevDrawnMode == i) return;
  prevDrawnMode = i;
  if (i < FALLOW_IDX) i += modeCat.length;
  var text = modeCat[i], bg = palCat[i][2];
  g.reset().setColor(bg);
  g.fillRect((W / 2) - CM_W, CM_Y - CM_H - 2, (W / 2) + CM_W, CM_Y + CM_H - 2);

    setSmallFont();
  g.setColor(g.theme.fg).setFontAlign(0, 0).drawString(text, W / 2, CM_Y);
}

var inMenu = false;
function drawFace() {
  if (inMenu) return;
  var date = new Date();

  drawCurMode();
  var modeDone = new Date();

  drawTime(date);
  var timeDone = new Date();

  drawAllSegments();
  var segmentsDone = new Date();

  drawCount++;
  var overallMs = Math.round((new Date()).valueOf() - date.valueOf());
  var modeMs = Math.round(modeDone.valueOf() - date.valueOf());
  var segmentsMs = Math.round(segmentsDone.valueOf() - timeDone.valueOf());
  var timeMs = Math.round(timeDone.valueOf() - modeDone.valueOf());
  log_debug(overallMs + 'ms for drawing (mode: ' + modeMs + ', segments: ' + segmentsMs + ', time: ' + timeMs + ')');
  if (DEBUGGING) storage.write(SETTINGS_FILE, settings);
}

function addPoint(arr, qty, radius, scaleMax) {
  var angle = ((2 * Math.PI) / scaleMax) * qty;
  var x = W / 2 + radius * Math.sin(angle);
  var y = H / 2 + radius * Math.cos(angle + Math.PI);
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
  buf.setColor(2).fillPoly(polyArray(start, endFill, radius, totalMin));
  //if (endFill >= endGray) return;  // No need to add the unfilled arc
  buf.setColor(1).fillPoly(polyArray(endFill, endGray, radius, totalMin));
  g.drawImage(img, 0, 0);
  return;
}

function clearDrawingCache() {
  prevDrawnMode = null;
  prevDrawnTime = null;
  prevDrawnSegment.fill(null);
}

function redrawWholeFace() {
  inMenu = false;
  clearDrawingCache();
  g.clear();
  buttons.forEach(b => b.draw());
  draw();
}

var cachedFace = null;
function saveMenuFaceCache() {
  cachedFace = g.asImage('string');
}
function restoreCachedFace() {
  if (cachedFace) {
    inMenu = false;
    g.drawImage(cachedFace);
    cachedFace = null;
    drawFace();
  } else {
    redrawWholeFace();
  }
}

class Button {
  constructor(name, corner, size, color, callback) {
    this.name = name;
    this.corner = corner;
    this.size = size;
    this.color = color;
    this.callback = callback;
  }
  // if pressed, fire the callback
  check(x, y) {
    //log_debug(this.name + ":check() x=" + x + " y=" + y);
    x_dist = this.corner == 'bl' || this.corner == 'tl' ? W - x : x;
    y_dist = this.corner == 'tr' || this.corner == 'tl' ? H - y : y;
    if (y_dist + x_dist >= H + W - 2 * this.size) {
      //log_debug(this.name + " callback\n");
      this.callback();
      return true;
    }
    return false;
  }
  draw() {
    g.setColor(this.color);
    // TODO: Improve appearance (curves? corner frames?)
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
  }
}

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

var prevSpentMode; // TODO: Reunify with prevDrawnMode? Probably not
function setCurMode(newMode) {
  //log_debug('Setting cur_mode to ' + newMode);
  updateTotals();
  prevSpentMode = settings.cur_mode;
  settings.cur_mode = newMode;
  E.showMenu();
  storage.write(SETTINGS_FILE, settings);
  restoreCachedFace();
}

function fixLateStart(sec) {
  const totalSecByCat = settings.total_sec_by_cat;
  const curMode = settings.cur_mode;
  var amts = lateStartAdjustments(totalSecByCat, curMode, prevSpentMode, sec);
  spendTime(curMode, amts[0]);
  spendTime(prevSpentMode, -amts[1]);
  var mm = Math.floor(amts[0] / MIN), ss = amts[0] % MIN;
  var msgTime = ss != 0 ? `${mm} min and ${ss} sec` : `${mm} min`;
  var msg = `Added ${msgTime} to ${modeCat[curMode]} from ${modeCat[prevSpentMode]}`;
  //E.showMenu();
  E.showPrompt(msg, {title: 'Moved Start Earlier', buttons: {OK:true}}).then(restoreCachedFace);
}

function pickLateStartAmt(back) {
  let submenu = [ { title: 'By 1 min', onchange: () => fixLateStart(MIN)} ];
  submenu[""] = { title: 'Move start earlier', back: back };
  // TODO: Limit to actual possibilities?
  let arrMinOptions = [];
  for (let i = 2; i < 10; i++) arrMinOptions.push(i);
  for (let i = 10; i <= 60; i+= 5) arrMinOptions.push(i);
  for (let j = 0; j < arrMinOptions.length; j++) {
    let secsDesired = arrMinOptions[j] * MIN;
    submenu.push({ title: 'By ' + arrMinOptions[j] + ' mins',
                    onchange: () => fixLateStart(secsDesired)});
  }
  E.showMenu(submenu);
  inMenu = true;
}

function pickFruitful() {
  var menu = { "": { title: '-- Fruitful --', back: restoreCachedFace /* remove: () => { inMenu = false; } */ } };
  for (let i = 0; i < settings.fruitful.length; i++) {
    let newMode = i + 1, title = modeCat[newMode];
    menu[title] = () => setCurMode(newMode);
  }
  if (settings.cur_mode > FALLOW_IDX && prevSpentMode != undefined) {
    menu['(Fix start...)'] = () => pickLateStartAmt(() => E.showMenu(menu));
  }
  saveMenuFaceCache();
  inMenu = true;
  E.showMenu(menu);
}

function pickRecenter() {
  saveMenuFaceCache();
  if (settings.cur_mode == FALLOW_IDX && prevSpentMode != undefined) {
    pickLateStartAmt(restoreCachedFace);
  } else {
    setCurMode(FALLOW_IDX);
  }
}

function pickDecenter() {
  var menu = { "": { title: '-- Decentering --', remove: () => { inMenu = false; } } };
  for (let i = 0; i < settings.decentering.length; i++) {
    let newMode = DECENTER_IDX - i, title = modeCat[modeCat.length + newMode];
    menu[title] = () => setCurMode(newMode);
  }
  if (settings.cur_mode < FALLOW_IDX && prevSpentMode != undefined) {
    menu['(Fix start...)'] = () => pickLateStartAmt(() => E.showMenu(menu));
  }
  saveMenuFaceCache();
  inMenu = true;
  E.showMenu(menu);
}

var buttons = [new Button('fruitful', 'tr', 40, '#0f0', pickFruitful),
               new Button('recenter', 'br', 40, '#860', pickRecenter),
               new Button('decenter', 'bl', 40, '#f00', pickDecenter)];

// timeout used to update every minute
var drawTimeout;
var totals_updated_at;

function resetTotals() {
  const now = new Date();
  g.setColor(g.theme.bg).fillCircle(W / 2, H / 2, radiusOuterRing - ringIterOffset);
  clearDrawingCache();
  // TODO: Save to historical file before clearing
  settings.total_sec_by_cat.fill(0);
  settings.cur_mode = FALLOW_IDX;
  totals_updated_at = now;
  settings.last_reset = ymd(now);
}

function updateTotals() {
  const now = new Date();
  var ymdNow = ymd(now), hrNow = now.getHours();
  if (ymdNow != settings.last_reset && HR_RESET <= hrNow) {
    resetTotals();
  } else {
    if (!totals_updated_at) totals_updated_at = now;
    let update_sec = Math.round((now.getTime() - totals_updated_at.getTime()) / 1000);
    totals_updated_at = now;
    if (FALLOW_IDX == settings.cur_mode) {
      useRecenter(update_sec);
    } else if (settings.cur_mode > FALLOW_IDX) {
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
    updateTotals();
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clockupdown", btn => {
  updateTotals();
  log_debug('clockupdown');
  redrawWholeFace();
  storage.write(SETTINGS_FILE, settings);  // Retains data when leaving the face
});

loadSettings();

Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();
E.showMenu(); // Dumb hack to reduce first-time flickering
redrawWholeFace();
