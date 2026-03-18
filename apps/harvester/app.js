const widget_utils = require('widget_utils');
const buzz = require('buzz');
var settings;

// #region XXX: Ensure these are kept in sync between settings.js and app.js
const storage = require('Storage');
function readSettings() {
  return storage.readJSON(SETTINGS_FILE, 1) || {};
}
function writeSettings(s) {
  storage.write(SETTINGS_FILE, s);
}
function loadSettings() {
  return normalizeSettings(readSettings());
}
function saveSettings(s) {
  writeSettings(denormalizeSettings(s, pendingTimeCat));
}

function ym(date) {
  return date.toLocalISOString().substring(0, 7);
}
function logCurFilenameBase() {
  return `harvester-${ym(new Date())}`;
}

/** @returns Sorted list of disjoint filenames for historical logs, most current last */
function logCurFilenames() {
  return storage.list(new RegExp(logCurFilenameBase() + `.*\.csv`), { sf: true }).sort();
}

function logHeader() {
  var cats = settings.fruitful.slice(1).concat(
    settings.decentering.slice(1).reverse()
  ).map(c=>c.title);
  // TODO: Include targets? Probably requires triggering changeovers more often
  return 'Date,' + cats.join(',') + "\n";
}

function logStartNew(prevList) {
  var nextSuffix = '';
  if (prevList.length > 0) {
    let last = at(prevList, -1);
    let m = last.match(/_([0-9A-Z])\./), suffix = m ? m[1] : '0';
    nextSuffix = '_' + (parseInt(suffix, 36) + 1).toString(36);
  }
  let sf = storage.open((logCurFilenameBase() + nextSuffix + '.csv'), 'w');
  sf.write(logHeader());
  return sf;
}
// #endregion
// #region XXX: Ensure these are kept in sync between settings.js, loader-settings.js, and app.js
const SETTINGS_FILE = "harvester.json";
function getDefaultSettings() {
  var id1 = Math.round(Date.now()), id2 = id1 + 1; // XXX: Use proper UUIDs, probably with TS
  return {
    fruitful: [
      {},
      {
        color: 'Green', fg: '#0f0', gy: '#020',
        title: 'Work',
        target_min: 480, sec_today: 0, id: id1,
      },
    ],
    hour_color: 'Green',
    hour_fg: '#0f0',
    cur_mode: 0,
    last_reset: null,
    decentering: [
      {},
      {
        title: 'Social Media', sec_today: 0, id: id2,
        fg: '#f00', gy: '#200', color: 'Red',
      }
    ],
    fallow_denominator: 3,
    fallow_buffer: 0,
  };
}
function normalizeCat(cat, i, _arr) {
  if (0 === i) return cat; // XXX: Skip sentinels
  // TODO: Normalize or guess at next colors?
  cat.fg = cat.fg || g.theme.fg;
  cat.gy = cat.gy || '#222';
  cat.title = cat.title || '??';
  cat.sec_today = 0 | cat.sec_today;
  if (cat.target_min) cat.target_min = 0 | cat.target_min;
  if (!cat.id) {
    // TODO: Use proper UUID, probably via TS library
    if (!normalizeCat._seq) {
      normalizeCat._seq = 0;
    }
    cat.id = Math.round(Date.now()) + normalizeCat._seq++;
  }
  return cat;
}
function normalizeSettings(s) {
  var def = getDefaultSettings();
  if (s.fruitful) {
    s.fruitful = s.fruitful.map(normalizeCat);
  } else {
    s.fruitful = def.fruitful;
  }
  if (s.decentering) {
    s.decentering = s.decentering.map(normalizeCat);
  } else {
    s.decentering = def.decentering;
  }
  if (s.total_sec_by_cat) {
    for (let i = 1; i < s.fruitful.length; i++) {
      s.fruitful[i].sec_today = s.total_sec_by_cat[i];
    }
    for (let i = 1; i < s.decentering.length; i++) {
      s.decentering[i].sec_today = s.total_sec_by_cat[s.total_sec_by_cat.length - i];
    }
    s.fallow_buffer = s.total_sec_by_cat[0];
  }

  s.hour_color = s.hour_color || def.hour_color;
  s.hour_fg = s.hour_fg || def.hour_fg;
  s.fallow_denominator = s.fallow_denominator || def.fallow_denominator;
  s.cur_mode = s.cur_mode || def.cur_mode;
  s.fallow_buffer = s.fallow_buffer || def.fallow_buffer;
  return s;
}
function denormalizeSettings(s, pendingTimeCat) {
  delete s.hr_12; // TODO: Allow setting this independently
  if (pendingTimeCat) {
    for (let i = 1; i < s.fruitful.length; i++) {
      s.fruitful[i].sec_today = pendingTimeCat[i];
    }
    for (let i = 1; i < s.decentering.length; i++) {
      s.decentering[i].sec_today = pendingTimeCat[pendingTimeCat.length - i];
    }
    s.fallow_buffer = pendingTimeCat[0];
  }
  if (s.total_sec_by_cat) {
    delete s.total_sec_by_cat;
  }
  return s;
}

function ym(date) {
  return date.toLocalISOString().substring(0, 7);
}
function logCurFilenameBase() {
  return `harvester-${ym(new Date())}`;
}

/** @returns Sorted list of disjoint filenames for historical logs, most current last */
function logCurFilenames() {
  return storage.list(new RegExp(logCurFilenameBase() + `.*\.csv`), { sf: true }).sort();
}
// #endregion

function reloadFromWeb() {
  setTimeout(() => {
    // Best-effort attempt to match pendingTimeCat by "ID" (creation TS)
    let prev = {};
    for (let i = 1; i < settings.fruitful.length; i++) {
      let id = settings.fruitful[i].id;
      if (id) prev[id] = at(pendingTimeCat, i);
    }
    for (let i = 1; i < settings.decentering.length; i++) {
      let id = settings.decentering[i].id;
      if (id) prev[id] = at(pendingTimeCat, -i);
    }
    loadRuntimeSettings();
    for (let i = 1; i < settings.fruitful.length; i++) {
      let id = settings.fruitful[i].id;
      if (id) setAt(pendingTimeCat, i, 0 | prev[id]);
    }
    for (let i = 1; i < settings.decentering.length; i++) {
      let id = settings.decentering[i].id;
      if (id) setAt(pendingTimeCat, -i, 0 | prev[id]);
    }
    clearDrawingCache();
    drawFace();
  }, 10);
  return true;
}

const global_settings = storage.readJSON("setting.json", true) || {};
const H = g.getHeight();
const W = g.getWidth();

const FIRST_DECENTER_IDX = -1, FALLOW_IDX = 0, FIRST_FRUITFUL_IDX = 1;

var totalMin;
var palCat, modeCat, pendingTimeCat;
// FCat arrays are shorter than others but have synchronized indexing as far as possible
var targetMinFCat, startFCat, endFCat;

const CLK_Y = H / 2 - 12;
const CLK_HALF_W = 112 / 2, CLK_HALF_H = 46 / 2, CLK_BG_Y = H / 2 - 17;

const CM_Y = (3 * H / 4) - 19;
const CM_W = 53;
const CM_H = 34;
const CM_SUB_W = 30, CM_SUB_H = 20;

const CI_Y = 34, CI_W = 44, CI_X = W / 2 - CI_W / 2, CI_H = 14;

const ringEdge = 2;
const ringIterOffset = 10;
const ringThick = 6;
const nextUpdateMs = 60000;
const radiusOuterRing = Math.min((W / 2 - ringEdge), (H / 2 - ringEdge));

var prevDrawnMode, prevDrawnTime, prevDrawnSegment = [];

const HR_RESET = 3; // Reset (and eventually save) totals at a time few will be awake

const BANGLEJS2 = process.env.HWVERSION == 2;

var DEBUGGING = false;
function log_debug(o) {
  if (DEBUGGING) print(o);
}
function curMs() { return Math.round(Date.now()); }
function measureEffectDuration(f) {
  var s = curMs();
  f();
  return curMs() - s;
}

const MIN = 60;

function at(arr, i) {
  if (i < 0) i += arr.length;
  return arr[i];
}
function setAt(arr, i, v) {
  if (i < 0) i += arr.length;
  return arr[i] = v;
}

function getMin(i) {
  return Math.floor(at(pendingTimeCat, i) / MIN);
}
var lastBuzzCheck = 0;
function addFruitful(i, sec) {
  if (i < FIRST_FRUITFUL_IDX) throw new Error("Can't track fruitful time with i=" + i);
  pendingTimeCat[FALLOW_IDX] += Math.ceil(sec / settings.fallow_denominator);
  const result = pendingTimeCat[i] += sec;
  const targetMin = targetMinFCat[i], secThreshold = targetMin * MIN;
  const secCheckWindow = Math.round((new Date().valueOf() - lastBuzzCheck) / 1000);
  if (result >= secThreshold && result < secThreshold + secCheckWindow) {
    log_debug('Reached target for ' + modeCat[i] + ' (' + targetMin + ' min)');
    drawCurSubMode('Done!');
    // TODO: Improve
    buzz.pattern('=');
  }
  lastBuzzCheck = new Date().valueOf();
  return result;
}
function useRecenter(sec) {
  /* sec=60, buf=120; used=60
     sec=60, buf=30; used=30
     sec=60, buf=0; used=0
   */
  var fallow_used_sec = sec;
  if (sec > 0) fallow_used_sec = E.clip(pendingTimeCat[FALLOW_IDX], 0, sec);
  pendingTimeCat[FALLOW_IDX] -= fallow_used_sec;
  return sec - fallow_used_sec;
}
function useDecenter(i, sec) {
  if (i > FIRST_DECENTER_IDX) throw new Error("can't treat " + i + " as decentering");
  var excess_sec = useRecenter(sec);
  var remaining = pendingTimeCat[FALLOW_IDX];
  let newTotal = at(pendingTimeCat, i) + excess_sec;
  let secCheckWindow = Math.round((new Date().valueOf() - lastBuzzCheck) / 1000);
  if (0 === remaining) {
    log_debug(`${sec} - ${remaining} = ${excess_sec} (vs ${secCheckWindow}) => ${newTotal}`);
    if (excess_sec > 0 && excess_sec < secCheckWindow) {
      drawCurSubMode('<0min');
      buzz.pattern('==  ==');
    } else if (newTotal % (5 * MIN) < secCheckWindow) {
      drawCurSubMode('-5m!');
      buzz.pattern('= = = = =');
    }
  } else {
    // TODO: Allow configuring times
    var earlyWarning = [
      {threshold: 5 * MIN, pattern: ':  :'},
      {threshold: 1 * MIN, pattern: ';  ;'},
    ];
    for (let warn of earlyWarning) {
      if (remaining <= warn.threshold && remaining > warn.threshold - secCheckWindow) {
        log_debug(`${remaining} just dropped below ${warn.threshold} (by < ${secCheckWindow})`);
        drawCurSubMode(`${warn.threshold / MIN}min`);
        buzz.pattern(warn.pattern);
        break;
      }
    }
  }
  lastBuzzCheck = new Date().valueOf();
  return setAt(pendingTimeCat, i, newTotal);
}

/** Generically picks the right method to use for the mode class. Accepts even
 *  negative time spent.
 */
function spendTime(mode, sec) {
  if (mode <= FIRST_DECENTER_IDX) {
    useDecenter(mode, sec);
  } else if (mode >= FIRST_FRUITFUL_IDX) {
    addFruitful(mode, sec);
  } else {
    useRecenter(sec);
  }
}

/** For correcting human error in switching modes later than one should have.
 *  Does not include additional fallow accumulations/usage.
 *  @returns 2-tuple with the amount to be added to current and the amount to be
 *           subtracted from previous.
 */
function lateStartAdjustments(totalSecByCat, curMode, prevMode, secDesired) {
  let secAvailable = Math.min(at(totalSecByCat, prevMode), secDesired);
  if (FALLOW_IDX === curMode && prevMode >= FIRST_FRUITFUL_IDX) {
    // Subtract fruitful time not spent (plus additional fallow time not accumulated)
  } else if (curMode >= FIRST_FRUITFUL_IDX && prevMode >= FIRST_FRUITFUL_IDX) {
    // Subtract fruitful time spent in other category
  } else if (curMode >= FIRST_FRUITFUL_IDX && FALLOW_IDX === prevMode) {
    // (Will re-accumulate additional fallow time)
    secAvailable = secDesired; // No bound currently possible
  } else if (curMode <= FIRST_DECENTER_IDX && prevMode >= FIRST_FRUITFUL_IDX) {
    // Subtract fruitful time and use up fallow time
    return [secDesired, secAvailable];
  } else if (curMode <= FIRST_DECENTER_IDX && FALLOW_IDX === prevMode) {
    // Leave as much fallow time as possible in place, adding only the difference
    secAvailable = secDesired - secAvailable;
    return [secAvailable, 0];
  } else {
    // Other possibilities are technically sane but should be rare and aren't worth testing (yet?)
    return [0, 0];
  }
  // Normally this is all that's needed
  return [secAvailable, secAvailable];
}

// https://www.1001fonts.com/rounded-fonts.html?page=3
Graphics.prototype.setFontBloggerSansLight46 = function (scale) {
  // Actual height 46 (45 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAA/AAAAAAAAPwAAAAAAAD4AAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH/gAAAAAAP/wAAAAAAf/gAAAAAAf/AAAAAAA//AAAAAAB/+AAAAAAD/8AAAAAAH/4AAAAAAH/wAAAAAAP/gAAAAAAf/gAAAAAA//AAAAAAB/+AAAAAAA/8AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///8AAAAP////4AAAP/////AAAH/////4AAD+AAAB/AAA8AAAAHwAAeAAAAA+AAHgAAAAHgADwAAAAB4AA8AAAAAPAAPAAAAADwADwAAAAA8AA8AAAAAPAAPAAAAADwAB4AAAAB4AAeAAAAAeAAHwAAAAPgAA/AAAAPwAAH/////4AAA/////8AAAH////+AAAAf///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAPAAAAAAAAHwAAAAAAAB4AAAAAAAA+AAAAAAAAfAAAAAAAAHgAAAAAAAD4AAAAAAAB8AAAAAAAAeAAAAAAAAPgAAAAAAADwAAAAAAAB//////4AAf//////AAH//////gAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAD4AAHAAAAD+AAD4AAAB/gAA8AAAB/4AAfAAAA/+AAHgAAAf3gAB4AAAPx4AA8AAAH4eAAPAAAD4HgADwAAB8B4AA8AAA+AeAAPAAAfAHgADwAAPgB4AA8AAHwAeAAHgAD4AHgAB4AD8AB4AAfAB+AAeAAD8B/AAHgAAf//gAB4AAH//wAAeAAAf/wAAHgAAB/wAAA4AAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AADgAAAAPAAB4AAAADwAAeAAAAA+AAHgAAAAHgAB4ABgAB4AAeAA8AAeAAHgA/AADwAB4AfwAA8AAeAP8AAPAAHgH/AADwAB4H7wAA8AAeD48AAPAAHh8PAAHgAB5+BwAB4AAe/AeAA+AAH/AHwAfAAB/gA/AfgAAfwAH//wAAHwAA//4AAA4AAH/8AAAAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAD+AAAAAAAD/gAAAAAAH/4AAAAAAH/+AAAAAAP/ngAAAAAP/h4AAAAAf/AeAAAAAf/AHgAAAA/+AB4AAAA/+AAeAAAB/8AAHgAAA/8AAB4AAAP4AAAeAAAB4AAAHgAAAAAAAB4AAAAAAAAeAAAAAAP///4AAAAH////AAAAA////gAAAAP///4AAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAD4AA8AAD///gAPAAB///4AD4AAf//+AAeAAH+APAAHgAB4AHgAA4AAeAB4AAOAAHgAcAADwAB4AHAAA8AAeADwAAPAAHgAcAADwAB4AHAAA8AAeAB4AAeAAHgAeAAHgAB4AHwAD4AAeAA+AB8AAHgAP4B+AAB4AB///gAAOAAP//gAABAAA//wAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAB///4AAAAD////wAAAD////+AAAB/////4AAA/gPgB/AAAfgDwAHwAAPgA8AA+AADwAeAAHgAB4AHgAB4AAeAB4AAfAAHgAeAADwABwAHgAA8AAcAB4AAPAAHAAeAAHwAB4AHgAB4AAeAB8AAeAAHgAPAAPgAB4AD8APwAAOAAfwP4AADgAD//8AAAAAAf/+AAAAAAB/+AAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAB4AAAAAAAAeAAAAAAAAHgAAAAAAAB4AAAAA4AAeAAAAB/AAHgAAAB/wAB4AAAB/4AAeAAAD/4AAHgAAD/wAAB4AAH/wAAAeAAH/gAAAHgAP/gAAAB4AP/AAAAAeAf/AAAAAHgf+AAAAAB4/+AAAAAAe/8AAAAAAH/8AAAAAAB/4AAAAAAAf4AAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAA/AB/+AAAA/8B//wAAA//gf/+AAAf/8PgPgAAH4fngB8AAD4B/wAPgAA8AP8AB4AAeAB+AAeAAHgAfgADwAB4ADwAA8AAcAA8AAPAAHAAPAADwAB4ADwAA8AAeAB+AAPAAHgAfgAHgAB8AP8AB4AAPgH/AA+AAD8H54AfAAAf/8fgPwAAD/+D//4AAAf/Af/8AAAB/AD/+AAAAAAAP+AAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAf/wAAAAAAf/+AAAAAAP//4AAwAAH//+AAeAAD+APwAHgAA+AA+AB4AAfAAHgAOAAHgAB4ADwAB4AAPAA8AAeAADwAPAAHgAA8ADwAB4AAPAA8AAeAADwAPAAHgAA8AHgAB8AAeAB4AAPgAHgA+AAD8ADwA/AAAfwA8A/gAAD/wef/wAAAf////4AAAB////4AAAAH///wAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AB4AAAAAfgA/AAAAAH4APwAAAAB+AD4AAAAAPAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DRAcHBwcHBwcHBwcDQ=="), 56 + (scale << 8) + (1 << 16));
  return this;
};

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
function autoGray(category) {
  if (g.theme.dark || category.color == 'Blk/Wht') {
    // TODO: Recheck this comment
    // BLK/WHT is the outside in light mode, so all of it gets filled in.
    // Using the dark theme stops it from being a one-color circle.
    return g.toColor(category.gy || category);
  } else {
    return g.theme.fg;
  }
}
function updateDerivedRingVars() {
  totalMin = 0;
  var fixedPosLen = settings.fruitful.length;
  var displayedLen = 1 + settings.fruitful.length + settings.decentering.length - 2;
  startFCat = new Uint16Array(fixedPosLen);
  endFCat = new Uint16Array(fixedPosLen);
  targetMinFCat = new Uint16Array(fixedPosLen);
  palCat = new Array(displayedLen);
  modeCat = new Array(displayedLen);
  pendingTimeCat = new Uint16Array(displayedLen);

  palCat[FALLOW_IDX] = palette(autoGray('#220'), '#860');
  // TODO: Draw out a nice circle and arrows properly
  modeCat[FALLOW_IDX] = '» × «';
  pendingTimeCat[FALLOW_IDX] = settings.fallow_buffer;
  for (let i = FIRST_FRUITFUL_IDX; i < settings.fruitful.length; i++) {
    let fruitful = settings.fruitful[i];
    startFCat[i] = totalMin;
    targetMinFCat[i] = fruitful.target_min;
    totalMin += fruitful.target_min;
    endFCat[i] = totalMin;
    //log_debug('Setting palette for ' + fruitful.title);
    palCat[i] = palette(autoGray(fruitful), g.toColor(fruitful.fg));
    modeCat[i] = fruitful.title;
    setAt(pendingTimeCat, i, fruitful.sec_today);
  }
  for (let i = -FIRST_DECENTER_IDX; i < settings.decentering.length; i++) {
    let decentering = settings.decentering[i];
    setAt(palCat, -i, palette(autoGray(decentering), g.toColor(decentering.fg)));
    setAt(modeCat, -i, decentering.title);
    setAt(pendingTimeCat, -i, decentering.sec_today);
  }
}

function loadRuntimeSettings() {
  settings = loadSettings();

  if (settings.DEBUGGING) DEBUGGING = true;

  settings.hr_12 = (global_settings["12hour"] === undefined ? false : global_settings["12hour"]);

  settings.last_reset = settings.last_reset || ymd(new Date());
  updateDerivedRingVars();
  setInterval(updateTotals, settings.fallow_denominator * 1000);
}

//var drawCount = 0;

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
  "jit";
  let result = {};
  if (invertRing) {
    result.end = totalMin - start;
    result.mid = result.end - amtMin;
    result.start = result.end - targetMin;
  } else {
    result.start = start;
    result.mid = start + amtMin;
    result.end = start + targetMin;
  }

  //log_debug(result);
  return result;
}

function drawIfChanged(gaugeSpans, idxCat, idxRing) {
  "jit";
  var j = idxRing > 0 ? idxCat + 16 : idxCat; // Treat original/overflow separately
  var prevSpans = prevDrawnSegment[j];
  var endpointsMatch = prevSpans && prevSpans.start == gaugeSpans.start &&
                       prevSpans.end == gaugeSpans.end;
  if (endpointsMatch && prevSpans.mid == gaugeSpans.mid) return false;
  prevDrawnSegment[j] = gaugeSpans;
  var pal = at(palCat, idxCat);
  if (idxCat <= FIRST_DECENTER_IDX) pal = palette(pal[2], pal[1]);
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
  "jit";
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
  for (let i = FIRST_FRUITFUL_IDX; i < settings.fruitful.length; i++) {
    let targetMin = targetMinFCat[i];
    let fruitful = getMin(i), overwork = Math.max(fruitful - targetMin, 0);
    if (drawIfChanged(getGaugeSpans(startFCat[i], fruitful - overwork, targetMin), i, 0)) {
      anyChanged = true;
    }
    if (0 === overwork) continue;
    if (drawIfChanged(getGaugeSpans(start, overwork, overwork + 5), i, 1)) {
      anyChanged = true;
    }
    start += overwork + 5;
  }

  start = 0;
  for (let i = -FIRST_DECENTER_IDX; i < settings.decentering.length; i++) {
    let decenter = getMin(-i);
    if (0 === decenter) continue;
    if (drawIfChanged(getGaugeSpans(start, decenter, decenter + 5, true), -i, 1)) {
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

var subModeDrawnAt;
function clearCurSubMode() {
  g.reset().setColor(g.theme.bg);
  var y = CM_Y + CM_H / 2 + 1;
  g.fillRect((W / 2) - CM_SUB_W, y, (W / 2) + CM_SUB_W, y + CM_SUB_H);
}
function drawCurSubMode(text) {
  subModeDrawnAt = Date.now();
  clearCurSubMode();
  g.setFont('Vector', 18).setColor(g.theme.fg).setFontAlign(0, 0);
  g.drawString(text, W / 2, CM_Y + CM_H - 3);
}

function drawCurMode() {
  var i = settings.cur_mode;
  if (prevDrawnMode !== i || subModeDrawnAt && subModeDrawnAt < Date.now() + (MIN * 1000)) {
    subModeDrawnAt = null;
    clearCurSubMode();
  }
  if (prevDrawnMode === i) return;
  prevDrawnMode = i;
  var text = at(modeCat, i), bg = at(palCat, i)[2];
  g.reset().setColor(bg);
  g.fillRect((W / 2) - CM_W, CM_Y - CM_H/2, (W / 2) + CM_W, CM_Y + CM_H/2);

  text = g.findFont(text, {w: CM_W * 2, h: CM_H }).text;
  g.setColor(g.theme.fg).setFontAlign(0, 0).drawString(text, W / 2, CM_Y);
}

var inMenu = false, curClockInfo;
function drawFace() {
  if (inMenu) return;
  var date = new Date();

  let msTime = measureEffectDuration(() => drawTime(date));
  let msSegments = measureEffectDuration(() => drawAllSegments());
  let msCurMode = measureEffectDuration(() => drawCurMode());
  let msClockInfo = measureEffectDuration(() => {
    if (curClockInfo) curClockInfo.redraw();
  });
  //drawCount++;
  var overallMs = curMs() - Math.round(date.valueOf());
  log_debug(`${overallMs}ms for drawing` +
            ` (mode: ${msCurMode}, segments: ${msSegments}, time: ${msTime}, CI: ${msClockInfo})`);
  // Expensive if you aren't resetting the watch all the time
  if (DEBUGGING) saveSettings(settings);
}

function addPoint(arr, qty, radius, scaleMax) {
  var angle = ((2 * Math.PI) / scaleMax) * qty;
  var x = W / 2 + radius * Math.sin(angle);
  var y = H / 2 + radius * Math.cos(angle + Math.PI);
  arr.push(Math.round(x), Math.round(y));
}

function polyArray(start, end, radius, scaleMax) {
  const subsegment = scaleMax / 30;
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
  lastCIMid = null;
}

function redrawWholeFace() {
  inMenu = false;
  clearDrawingCache();
  g.clear();
  buttons.forEach(b => b.draw());
  if (curClockInfo) curClockInfo.redraw();
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
    var x_dist = this.corner == 'bl' || this.corner == 'tl' ? W - x : x;
    var y_dist = this.corner == 'tr' || this.corner == 'tl' ? H - y : y;
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
  prevSpentMode = settings.cur_mode;
  if (prevSpentMode >= FIRST_FRUITFUL_IDX) lastBuzzCheck = new Date().valueOf();
  updateTotals();
  settings.cur_mode = newMode;
  E.showMenu();
  saveSettings(settings);
  restoreCachedFace();
}

function fixLateStart(sec) {
  const curMode = settings.cur_mode;
  var amts = lateStartAdjustments(pendingTimeCat, curMode, prevSpentMode, sec);
  const curTotalBefore = at(pendingTimeCat, curMode);
  const prevTotalBefore = at(pendingTimeCat, prevSpentMode);
  const fallowTotalBefore = at(pendingTimeCat, FALLOW_IDX);
  spendTime(curMode, amts[0]);
  spendTime(prevSpentMode, -amts[1]);
  const curDiff = at(pendingTimeCat, curMode) - curTotalBefore;
  const prevDiff = at(pendingTimeCat, prevSpentMode) - prevTotalBefore;
  const fallowDiff = at(pendingTimeCat, FALLOW_IDX) - fallowTotalBefore;
  // var mm = Math.floor(amts[0] / MIN), ss = amts[0] % MIN;
  // var msgTime = ss != 0 ? `${mm} min and ${ss} sec` : `${mm} min`;
  // var msg = `Added ${msgTime} to ${modeCat[curMode]} from ${modeCat[prevSpentMode]}`;
  //E.showMenu();
  log_debug(`${curDiff}s to ${at(modeCat, curMode)}`
            + ` from ${prevDiff}s in ${at(modeCat, prevSpentMode)}`
            + (fallowDiff != 0 ? ` and ${fallowDiff}s fallow` : ''));
  //E.showPrompt(msg, {title: 'Moved Start Earlier', buttons: {OK:true}}).then(restoreCachedFace);
  E.showMenu();
  restoreCachedFace();
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
  var menu = { "": { title: '-- Fruitful --', back: restoreCachedFace } };
  for (let i = FIRST_FRUITFUL_IDX; i < settings.fruitful.length; i++) {
    let newMode = i, title = modeCat[newMode];
    menu[title] = () => setCurMode(newMode);
  }
  if (settings.cur_mode >= FIRST_FRUITFUL_IDX && prevSpentMode != undefined) {
    menu['(Fix start...)'] = () => pickLateStartAmt(() => E.showMenu(menu));
  }
  saveMenuFaceCache();
  inMenu = true;
  E.showMenu(menu);
}

function pickRecenter() {
  saveMenuFaceCache();
  if (settings.cur_mode === FALLOW_IDX && prevSpentMode != undefined) {
    pickLateStartAmt(restoreCachedFace);
  } else {
    setCurMode(FALLOW_IDX);
  }
}

function pickDecenter() {
  var menu = { "": { title: '-- Decentering --', remove: () => { inMenu = false; } } };
  for (let i = -FIRST_DECENTER_IDX; i < settings.decentering.length; i++) {
    let newMode = -i, title = at(modeCat, newMode);
    menu[title] = () => setCurMode(newMode);
  }
  if (settings.cur_mode <= FIRST_DECENTER_IDX && prevSpentMode != undefined) {
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

/** Logs current totals to CSV format, assuming most current file has the same
 *  set of categories (which should be maintained by settings and the web interface).
 */
function logWriteCurTotals() {
  var candidates = logCurFilenames(), sf;
  if (candidates.length === 0) {
    sf = logStartNew(candidates);
  } else {
    sf = storage.open(at(candidates, -1), 'a');
  }
  sf.write(settings.last_reset + ',' + pendingTimeCat.slice(FIRST_FRUITFUL_IDX).join(',') + "\n");
}

function resetTotals() {
  const now = new Date();
  g.setColor(g.theme.bg).fillCircle(W / 2, H / 2, radiusOuterRing - ringIterOffset);
  clearDrawingCache();
  logWriteCurTotals();
  pendingTimeCat.fill(0);
  settings.cur_mode = FALLOW_IDX;
  totals_updated_at = now;
  settings.last_reset = ymd(now);
  saveSettings(settings);
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
    spendTime(settings.cur_mode, update_sec);
  }
}

// schedule a draw for the next minute or every sec_update ms
function queueDraw() {
  let now = Date.now();
  let delay = nextUpdateMs - (now % nextUpdateMs);
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
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

Bangle.setUI({
  mode: 'clock',
  btn: (btn) => {
    // TODO: Handle eventual B3 appropriately
    if (BANGLEJS2 || btn === 2) {
      updateTotals();
      saveSettings(settings);  // Retains data when leaving the face
      Bangle.showLauncher();
    }
  },
});

loadRuntimeSettings();

Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();
E.showMenu(); // Dumb hack to reduce first-time flickering
redrawWholeFace();

var clockInfo = require("clock_info");
function eligibleClockInfoItems() {
  var raw = clockInfo.load(), ret = [];
  for (let i = 0; i < raw.length; i++) {
    let items = raw[i].items.filter(itm => itm.hasRange);
    if (items.length > 0) {
      raw[i].items = items;
      ret.push(raw[i]);
    }
  }
  return ret;
}

var lastCIMid/* , lastCIName */;
function drawGaugeClockInfo (itm, info, options) {
  //var newItem = itm.name != lastCIName;
  //lastCIName = itm.name;
  g.reset();
  // TODO: Improve L&F
  if (options.focus) { g.setColor(autoGray('#222')); } else { g.setColor(g.theme.bg); }
  g.fillRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1);
  var midx = options.x+options.w/2;
  var disp = g.findFont(itm.name, {w: options.w, h: options.h, wrap: true, trim: true});
  g.setColor(g.theme.fg).setFontAlign(0,-1).drawString(disp.text, midx, CI_Y + 1);
  // TODO: Optimize redraws
  const maxSpan = info.max - info.min;
  var maxNormalizer = maxSpan / (totalMin / 4);
  var normalValue = Math.round((info.v - info.min) / maxNormalizer);
  // Make the gauge span 1/4 circle centered across the top
  var spans = getGaugeSpans(Math.round(-0.125 * totalMin), normalValue, Math.round(totalMin / 4));
  if (lastCIMid == spans.mid) return;
  lastCIMid = spans.mid;
  log_debug(spans);
  // TODO: Set up palette options properly
  drawSegment(spans.start, spans.mid, spans.end, palette('#020', '#0f0'), 2);
}

var clockInfoItems = eligibleClockInfoItems();
curClockInfo = clockInfo.addInteractive(clockInfoItems, {
  x: CI_X, y: CI_Y, w: CI_W, h: CI_H, // For automatic tap detection
  draw: drawGaugeClockInfo
});
