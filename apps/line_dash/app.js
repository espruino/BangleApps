/**
 * Line Dash - A swipeable analog dashboard for Bangle.js 2
 * 
 * Based on the minimalist design of Line Clock, this app extends the concept
 * into a suite of interactive gauges for steps, distance, battery, and heart rate.
 * 
 * @author pagnotta (Line Dash modifications)
 * @author Paul Spenke (original Line-Clock face)
 * @license MIT
 */

// --- Global Rendering Constants ---
const handWidth = 6;
const hourRadius = 4;
const hourWidth = 8;
const hourLength = 40;
const hourSLength = 20;
const radius = 220;
const lineOffset = 115;
const hourOffset = 32;
const numberOffset = 85;
const numberSize = 22;

const storage = require('Storage');
const locale = require('locale');

const SETTINGS_FILE = "line_dash.setting.json";

let initialSettings = {
  showLock: true,
  showMinute: true,
  distanceUnit: "km",
  showDistance: true,
  strideLength: 0.8,
  showSteps: true,
  showBattery: true,
  showHrm: true,
  showBaro: true,
  baroCalib: 1,
  baroRefQnh: 1013.25,
  liveHrm: false,
  liveHrmInterval: 2,
  hrDecade: 40,
};

// Load saved settings from storage, merging them with initial defaults
let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || initialSettings;
for (const key in saved_settings) {
  initialSettings[key] = saved_settings[key];
}

// Initialize active dashboard screens based on user settings
let screens = ["clock"];
if (initialSettings.showSteps) screens.push("steps");
if (initialSettings.showDistance) screens.push("distance");
if (initialSettings.showHrm) screens.push("hrm");
if (initialSettings.showBattery) screens.push("battery");
if (initialSettings.showBaro) screens.push("baro");
let currentScreenIdx = 0;

// Screen dimensions and center coordinates
let gWidth  = g.getWidth(),  gCenterX = gWidth/2;
let gHeight = g.getHeight(), gCenterY = gHeight/2;

let currentTime = new Date();
let currentHour = currentTime.getHours();
let currentMinute = currentTime.getMinutes();

let drawTimeout;

// Read the global 12/24 hour system setting once at startup (defaults to 24h if missing)
const is24h = (storage.readJSON('setting.json', 1) || {})["12hour"] !== true;

// Lock icon image, created once to avoid re-allocating on every draw
const imgLock = {
  width : 16, height : 16, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("A8AH4A5wDDAYGBgYP/w//D/8Pnw+fD58Pnw//D/8P/w="))
};



/**
 * Retrieves the angle of the hour hand for the current time.
 *
 * @returns {number} The angle of the hour hand in degrees.
 */
function getHourHandAngle() {
  let hourHandAngle = 30 * currentHour;
  hourHandAngle += 0.5 * currentMinute;
  return hourHandAngle;
}

const DEG2RAD = Math.PI / 180;

let hourAngle = 0;
// Rotation center shifted by `radius` along the current hand angle.
// Cached here so rotatePoints does not recompute sin/cos of hourAngle on every call.
let rotCX = gCenterX, rotCY = gCenterY;

/**
 * Sets the global hand angle and caches the shifted rotation center for it.
 *
 * @param {number} angle - The hand angle in degrees.
 */
function setHourAngle(angle) {
  hourAngle = angle;
  const r = angle * DEG2RAD;
  rotCX = gCenterX - radius * Math.sin(r);
  rotCY = gCenterY + radius * Math.cos(r);
}
setHourAngle(getHourHandAngle());

/**
 * Rotates a flat array of points ([x0,y0, x1,y1, ...]) around a given angle.
 *
 * @param {Array} points - Flat array of x,y coordinate pairs to be rotated.
 * @param {number} angle - The angle in degrees to rotate the points.
 * @param {number} rad - If nonzero, rotate around the cached hand-shifted center.
 * @returns {Array} - Flat array of rotated x,y coordinate pairs.
 */
function rotatePoints(points, angle, rad) {
  "ram";
  const ang = angle * DEG2RAD;
  const cosAng = Math.cos(ang), sinAng = Math.sin(ang);
  const cx = rad ? rotCX : gCenterX, cy = rad ? rotCY : gCenterY;
  const rotatedPoints = new Array(points.length);
  for (let i = 0; i < points.length; i += 2) {
    const px = points[i], py = points[i + 1];
    rotatedPoints[i] = px * cosAng - py * sinAng + cx;
    rotatedPoints[i + 1] = px * sinAng + py * cosAng + cy;
  }
  return rotatedPoints;
}

// Hand polygon, precomputed as a flat point array
const handPoints = [
  -handWidth / 2, -gHeight,
  handWidth / 2, -gHeight,
  handWidth / 2, gHeight,
  -handWidth / 2, gHeight
];

/**
 * Draws the main central hand (needle) on the canvas.
 *
 * @param {number} [color] - The 16-bit color value for the hand.
 */
function drawHand(color) {
  g.setColor(color || 0xF800);
  g.fillPolyAA(rotatePoints(handPoints, hourAngle, 0));
}

/**
 * Retrieves the flat polygon coordinates for a tick mark.
 *
 * @param {boolean} small - If true, returns coordinates for a shorter tick mark.
 * @returns {Array} Flat array of x,y coordinates for the polygon.
 */
function getHourCoordinates(small) {
  const dist = small ? (hourSLength - hourLength) : 0;
  const hWidth = hourWidth / 2;
  const gh = gHeight + lineOffset;
  return [
    -hWidth, -gh - dist,
    hWidth, -gh - dist,
    hWidth, -gh + hourLength,
    -hWidth, -gh + hourLength
  ];
}

const hourPoints = getHourCoordinates(false);
const hourSPoints = getHourCoordinates(true);
// Super-small sub-tick polygon (2px wide, 10px long), precomputed as a flat point array
const hourSSPoints = [
  -1, -(gHeight + lineOffset) + hourLength - 10,
  1, -(gHeight + lineOffset) + hourLength - 10,
  1, -(gHeight + lineOffset) + hourLength,
  -1, -(gHeight + lineOffset) + hourLength
];

/**
 * Draws a small decorative dot at a specific angle.
 *
 * @param {number} a - The angle in degrees where the dot should be drawn.
 */
function hourDot(a) {
  const h = gHeight + lineOffset;
  const rotatedPoints = rotatePoints([0, -h + hourLength - (hourRadius / 2)], a, radius);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], hourRadius);
}

/**
 * Draws an hour number at a specific angle around the clock face.
 *
 * @param {number} a - The angle in degrees.
 * @param {string} [label] - Optional explicit label to draw. If omitted, derives the hour from the angle.
 */
function hourNumber(a, label) {
  const h = gHeight + lineOffset;
  const rotatedPoints = rotatePoints([0, -h + hourLength + hourOffset], a, radius);
  let str = label !== undefined ? String(label) : String(a / 30);
  g.setFont("Vector", 32);
  g.drawString(str, rotatedPoints[0], rotatedPoints[1]);
}

/**
 * Draws a sharp polygon lightning bolt.
 * @param {number} x - Center X coordinate.
 * @param {number} y - Center Y coordinate.
 * @param {number} color - Color of the lightning bolt.
 */
function drawLightning(x, y, color) {
  g.setColor(color);
  g.fillPoly([
    x + 2, y - 6,
    x - 4, y + 1,
    x - 1, y + 1,
    x - 3, y + 8,
    x + 4, y - 1,
    x + 1, y - 1
  ]);
}

/**
 * Returns the battery zone color for a charge percentage. The zones use the
 * display's native 3-bit colors, so they render crisply without dithering:
 * red reserve below 15%, yellow warning band up to 30%, green above.
 *
 * @param {number} pct - Battery charge in percent.
 * @returns {number} 16-bit zone color.
 */
function batteryZoneColor(pct) {
  if (pct < 15) return 0xF800;
  if (pct <= 30) return 0xFFE0;
  return 0x07E0;
}

/**
 * Tick color callback for the battery gauge: colors the dial by the fixed
 * zones, like the reserve markings on a fuel gauge.
 *
 * @param {number} tickIdx - Main tick index (one per 10%).
 * @param {number} frac - Sub-tick position between this tick and the next.
 * @returns {number} 16-bit zone color.
 */
function batteryTickColor(tickIdx, frac) {
  return batteryZoneColor((tickIdx + frac) * 10);
}

/**
 * Draws the large central value in the middle of the gauge.
 *
 * @param {string|number} n - The value to display.
 * @param {number} [color] - The 16-bit color for the central circle outline.
 * @param {string} [label] - Optional smaller subtitle text to display below the value.
 * @param {function} [iconFunc] - Optional function returning an image object to draw below the value.
 * @param {number} [textColor] - Optional 16-bit color for the text and icon. Defaults to theme foreground.
 */
function drawNumber(n, color, label, iconFunc, textColor) {
  const h = gHeight + lineOffset;
  const halfWidth = handWidth / 2;
  const rotatedPoints = rotatePoints([0, -h + hourLength + numberOffset], hourAngle, radius);
  g.setColor(color || 0xF800);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], numberSize + halfWidth);
  g.setColor(g.theme.bg);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], numberSize - halfWidth);

  let str = String(n);
  let fontSize = numberSize;
  // Do not count the thin colon as a full character for width calculations
  let effectiveLength = str.startsWith(":") ? str.length - 1 : str.length;
  if (effectiveLength > 2) fontSize -= (effectiveLength - 2) * 4;
  g.setFont("Vector", fontSize);
  
  g.setColor(textColor || g.theme.fg);
  // The Vector font advance includes trailing spacing after the last glyph,
  // which shifts the visible text left of center; nudge it back right
  g.drawString(str, rotatedPoints[0] + Math.round(fontSize * 0.09), rotatedPoints[1] - (label || iconFunc ? 6 : 0));
  if (label) {
    g.setFont("Vector", 12);
    g.drawString(label, rotatedPoints[0], rotatedPoints[1] + 8);
  } else if (iconFunc) {
    iconFunc(rotatedPoints[0], rotatedPoints[1] + 11, textColor || g.theme.fg);
  }
}


/**
 * Renders an hour tick, its number, and the decorative dots next to it.
 *
 * @param {number} rawH - The hour (0-23) to be drawn.
 */
function drawHour(rawH) {
  let displayH = rawH;

  if (!is24h) {
    while (displayH <= 0) displayH += 12;
    while (displayH > 12) displayH -= 12;
  } else {
    while (displayH < 0) displayH += 24;
    while (displayH >= 24) displayH -= 24;
  }

  let angleH = rawH;
  while (angleH <= 0) angleH += 12;
  while (angleH > 12) angleH -= 12;
  let a = angleH * 30;

  g.setColor(g.theme.fg);

  g.fillPolyAA(rotatePoints(hourPoints, a, radius));
  g.fillPolyAA(rotatePoints(hourSPoints, a + 15, radius));
  hourNumber(a, String(displayH));
  hourDot(a + 5);
  hourDot(a + 10);
  hourDot(a + 20);
  hourDot(a + 25);
}

/**
 * Renders a labeled tick mark and its decorative sub-ticks for a dashboard gauge.
 *
 * @param {string} tickStr - The label for the tick (e.g. "10k" or "50%").
 * @param {number} a - The angle in degrees where the tick should be drawn.
 * @param {number} spacingAngle - The angle span between this tick and the next, used to position sub-ticks.
 * @param {number|function} colorValOrFn - The color, or a function(tickIdx, frac) returning a color.
 * @param {number} tickIdx - The tick index, passed through to a color function.
 * @param {number} subIntervals - Number of sub-intervals between main ticks.
 * @param {boolean} isLast - If true, do not draw sub-ticks (because this is the max boundary).
 * @param {number} [labelSize=32] - Optional font size for the label.
 */
function drawMetricTick(tickStr, a, spacingAngle, colorValOrFn, tickIdx, subIntervals, isLast, labelSize) {
  "ram";
  subIntervals = subIntervals || 10;
  const colorIsFn = typeof colorValOrFn === 'function';
  const flatColor = colorIsFn ? 0 : (colorValOrFn !== undefined ? colorValOrFn : g.theme.fg);

  g.setColor(colorIsFn ? colorValOrFn(tickIdx, 0) : flatColor);
  g.fillPolyAA(rotatePoints(hourPoints, a, radius));

  const hOff = gHeight + lineOffset;

  if (tickStr) {
    let fSize = labelSize || 32;
    // Adjust yOffset so the top edge of the text remains at a constant distance from the tick
    // Base offset was hourLength + hourOffset = 40 + 32 = 72
    let yOffset = 72 - (32 - fSize) / 2;
    let rotatedStrPos = rotatePoints([0, -hOff + yOffset], a, radius);
    g.setFontAlign(0, 0);
    g.setFont("Vector", fSize);
    g.setColor(g.theme.fg);
    g.drawString(tickStr, rotatedStrPos[0], rotatedStrPos[1]);
  }

  if (isLast) return;

  if (!colorIsFn) g.setColor(flatColor);
  let intervalStep = spacingAngle / subIntervals;
  for (let i = 1; i < subIntervals; i++) {
    if (colorIsFn) g.setColor(colorValOrFn(tickIdx, i / subIntervals));
    // Draw medium tick at exactly half if it's an even split, else super small tick
    if (i === subIntervals / 2) {
      g.fillPolyAA(rotatePoints(hourSPoints, a + i * intervalStep, radius));
    } else {
      g.fillPolyAA(rotatePoints(hourSSPoints, a + i * intervalStep, radius));
    }
  }
}

/**
 * Schedules the next automatic redraw.
 * The timeout aligns with the start of the next minute.
 */
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  // Don't schedule a timeout if the LCD is off - unless the watch is
  // charging: the transflective display stays readable with the backlight
  // out, and the battery dashboard must keep updating on the charger
  if (!Bangle.isLCDOn() && !Bangle.isCharging()) return;
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

/**
 * Powers the barometer continuously only while the baro screen is shown AND
 * the watch is unlocked. Keeping it measuring on a locked screen drained the
 * battery overnight; while locked, draw() falls back to one cheap one-shot
 * reading per minute instead.
 */
function updateBaroPower() {
  if (typeof Bangle.setBarometerPower !== 'function') return;
  Bangle.setBarometerPower(screens[currentScreenIdx] === "baro" && !Bangle.isLocked() ? 1 : 0, "line_dash");
}

// State captured by draw(), used to skip redundant redraws: when the charge
// handler wakes/unlocks the watch, the resulting lock/lcdPower events would
// otherwise each repaint a screen that was just drawn.
let lastDrawMs = 0;
let lastDrawnLocked = false;

/**
 * Triggers a redraw when the watch is locked/unlocked to immediately update the lock icon.
 * Also switches the barometer between continuous and once-a-minute mode.
 */
function lockListenerBw() {
  updateBaroPower();
  // Only repaint if the lock state actually differs from what is on screen;
  // re-arm the minute tick either way so the loop never dies here
  if (Bangle.isLCDOn() && Bangle.isLocked() !== lastDrawnLocked) draw();
  else queueDraw();
}
Bangle.on('lock', lockListenerBw);

/**
 * Redraws when the LCD is powered back on, so the display is not stale.
 * @param {boolean} on - True if the LCD was just turned on.
 */
function lcdListener(on) {
  if (!on) return;
  // A screen drawn moments ago cannot be stale; skip the duplicate repaint
  // (happens when the charge handler wakes the LCD right after drawing),
  // but keep the minute tick armed in that case
  if (Date.now() - lastDrawMs > 500) draw();
  else queueDraw();
}
Bangle.on('lcdPower', lcdListener);

let hrmPowerTimeout;

/**
 * Changes the currently displayed dashboard screen.
 * Handles powering the HRM sensor on/off when entering/leaving the HRM screen.
 * 
 * @param {number} dir - Direction to switch (1 for forward, -1 for backward).
 */
function changeScreen(dir) {
  // Leaving the screen dismisses a visible date overlay or reset confirmation
  if (infoOverlayTimeout) {
    clearTimeout(infoOverlayTimeout);
    infoOverlayTimeout = undefined;
  }
  if (resetConfirmTimeout) {
    clearTimeout(resetConfirmTimeout);
    resetConfirmTimeout = undefined;
  }
  let oldScreen = screens[currentScreenIdx];
  if (dir === 1) { // Forward
    currentScreenIdx = (currentScreenIdx + 1) % screens.length;
  } else if (dir === -1) { // Backward
    currentScreenIdx = (currentScreenIdx - 1 + screens.length) % screens.length;
  }
  let newScreen = screens[currentScreenIdx];

  if (initialSettings.liveHrm) {
    if (hrmPowerTimeout) {
      clearTimeout(hrmPowerTimeout);
      hrmPowerTimeout = undefined;
    }

    if (oldScreen !== "hrm" && newScreen === "hrm") {
      hrmPowerTimeout = setTimeout(() => {
        Bangle.setHRMPower(1, "line_dash");
        hrmPowerTimeout = undefined;
      }, 500);
    } else if (oldScreen === "hrm" && newScreen !== "hrm") {
      Bangle.setHRMPower(0, "line_dash");
    }
  }

  // The barometer starts quickly and cheaply, so no debounce is needed
  updateBaroPower();

  if (Bangle.isLCDOn()) draw();
}

const STATE_FILE = "line_dash.state.json";

/**
 * Returns a key identifying the current day, used to expire trips at midnight.
 * @returns {string} Key like "2026-6-5".
 */
function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

// Trip state for the distance screen. A trip is a step-count baseline taken
// when the trip is started; the view toggles between day total and trip
// distance without touching the baseline. Persisted so it survives app
// reloads; a trip is only valid on the day it was started.
let tripDay = "";
let tripBaselineSteps = 0;
let showTripView = false;

// Baro sub-view: false = pressure dial, true = altimeter. Persisted like the
// trip view so it survives app reloads.
let showAltView = false;

let savedState = storage.readJSON(STATE_FILE, 1) || {};
if (savedState.day === todayKey()) {
  tripDay = savedState.day;
  tripBaselineSteps = savedState.baseline || 0;
  showTripView = !!savedState.view;
}
showAltView = !!savedState.altView;

// Resume on the screen that was active when the app was last unloaded
// (e.g. when a message fast-loaded over the clock). Falls back to the
// clock if that screen has been disabled in the settings since.
let savedScreenIdx = screens.indexOf(savedState.screen);
if (savedScreenIdx >= 0) currentScreenIdx = savedScreenIdx;
if (initialSettings.liveHrm && screens[currentScreenIdx] === "hrm") {
  Bangle.setHRMPower(1, "line_dash");
}
updateBaroPower();

/**
 * Persists the app state (trip counter and active screen). Only called from
 * user gestures, app unload and the (at most once-daily) midnight expiry,
 * so flash wear is not a concern.
 */
function saveState() {
  storage.writeJSON(STATE_FILE, {
    day: tripDay,
    baseline: tripBaselineSteps,
    view: showTripView,
    altView: showAltView,
    screen: screens[currentScreenIdx]
  });
}

/**
 * Returns today's step count from the health tracking, or 0 if unavailable.
 * @returns {number} Steps taken today.
 */
function getDaySteps() {
  let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("day") : null;
  return health ? health.steps : 0;
}

// While set, the trip-reset confirmation popup is showing on the distance screen
const RESET_CONFIRM_MS = 3000;
let resetConfirmTimeout;

const INFO_OVERLAY_MS = 4000;
let infoOverlayTimeout;

// Gap in pixels between the parts of a two-part pill line. The Vector font's
// space glyph is a full character wide, which looks too spaced out.
const PILL_PART_GAP = 6;

/**
 * Draws a centered rounded pill with a small line of text above a large one.
 * The pill has a colored border and a background fill, so the text stays
 * readable even when the hand runs through the center.
 *
 * @param {string} smallStr - The small upper line (e.g. weekday or "TRIP").
 * @param {string|Array} bigStr - The large lower line (e.g. "RESET?"), or two
 *   parts (e.g. ["05", "JUL"]) drawn with a narrow fixed gap between them.
 * @param {number} borderColor - 16-bit color of the pill border.
 */
function drawOverlayPill(smallStr, bigStr, borderColor) {
  const isPair = Array.isArray(bigStr);
  g.setFont("Vector", 16);
  const wSmall = g.stringWidth(smallStr);
  g.setFont("Vector", 28);
  let w0, wBig;
  if (isPair) {
    w0 = g.stringWidth(bigStr[0]);
    wBig = w0 + PILL_PART_GAP + g.stringWidth(bigStr[1]);
  } else {
    wBig = g.stringWidth(bigStr);
  }
  const halfW = Math.max(wSmall, wBig) / 2 + 14;
  const halfH = 33;

  g.setColor(borderColor);
  g.fillRect({x: gCenterX - halfW, y: gCenterY - halfH, x2: gCenterX + halfW, y2: gCenterY + halfH, r: 10});
  g.setColor(g.theme.bg);
  g.fillRect({x: gCenterX - halfW + 2, y: gCenterY - halfH + 2, x2: gCenterX + halfW - 2, y2: gCenterY + halfH - 2, r: 8});

  g.setFontAlign(0, 0);
  g.setColor(g.theme.fg);
  g.setFont("Vector", 16);
  g.drawString(smallStr, gCenterX, gCenterY - 16);
  g.setFont("Vector", 28);
  if (isPair) {
    const xLeft = gCenterX - wBig / 2;
    g.setFontAlign(-1, 0);
    g.drawString(bigStr[0], xLeft, gCenterY + 10);
    g.drawString(bigStr[1], xLeft + w0 + PILL_PART_GAP, gCenterY + 10);
    g.setFontAlign(0, 0);
  } else {
    g.drawString(bigStr, gCenterX, gCenterY + 10);
  }
}

/**
 * Draws the temporary date overlay (weekday + day/month) in the center of the clock face.
 * Uses the locale module so weekday and month follow the system language.
 */
function drawDateOverlay() {
  const d = new Date();
  const day = d.getDate();
  drawOverlayPill(
    locale.dow(d, 0).toUpperCase(),
    [(day < 10 ? "0" : "") + day, locale.month(d, 1).toUpperCase()],
    0xF800
  );
}

/**
 * Returns the altitude in meters derived from the raw pressure and the
 * sea-level reference entered at calibration (international barometric formula).
 * @returns {number} Altitude in meters (unrounded).
 */
function getBaroAltitude() {
  return 44330 * (1 - Math.pow(baroRawPressure / baroRefQnh, 0.190295));
}

/**
 * Draws the temporary overlay on the barometer screen: the exact sea-level
 * reading on the pressure dial, or the exact altitude on the altimeter view.
 */
function drawBaroOverlay() {
  if (showAltView) {
    drawOverlayPill("ALTITUDE", baroRawPressure > 0 ? Math.round(getBaroAltitude()) + "m" : "--", 0xFFE0);
  } else {
    drawOverlayPill("hPa", baroPressure > 0 ? baroPressure.toFixed(1) : "--", 0xFFE0);
  }
}

/**
 * Arms the auto-hide timeout for an info overlay.
 */
function armInfoOverlay() {
  infoOverlayTimeout = setTimeout(function() {
    infoOverlayTimeout = undefined;
    if (Bangle.isLCDOn()) draw();
  }, INFO_OVERLAY_MS);
}

/**
 * Shows the info overlay of the current screen (date on the clock, exact
 * reading on the barometer views) for a few seconds, or hides it early if it
 * is already visible.
 */
function showInfoOverlay() {
  if (infoOverlayTimeout) {
    clearTimeout(infoOverlayTimeout);
    infoOverlayTimeout = undefined;
  } else {
    armInfoOverlay();
  }
  if (Bangle.isLCDOn()) draw();
}

/**
 * Handles swipe gestures on the touchscreen.
 * Horizontal swipes navigate between dashboards.
 * Vertical swipes navigate between the sub-views of a dashboard: on the
 * distance screen, swipe up enters the trip view (starting a trip if none is
 * running) and swipe down returns to the day total; on the barometer, swipe
 * up shows the altimeter and swipe down the pressure dial.
 *
 * @param {number} directionLR - Left/Right swipe direction (-1 or 1).
 * @param {number} directionUD - Up/Down swipe direction (-1 for up, 1 for down).
 */
function onSwipe(directionLR, directionUD) {
  if (directionUD !== 0) {
    if (screens[currentScreenIdx] === "baro") {
      let wantAlt = directionUD === -1;
      if (wantAlt !== showAltView) {
        showAltView = wantAlt;
        // A visible overlay belongs to the view we are leaving
        if (infoOverlayTimeout) {
          clearTimeout(infoOverlayTimeout);
          infoOverlayTimeout = undefined;
        }
        saveState();
        if (Bangle.isLCDOn()) draw();
      }
    } else if (screens[currentScreenIdx] === "distance") {
      if (directionUD === -1) { // Swipe up
        if (tripDay !== todayKey()) {
          // No active trip: start one and show it (nothing to lose, no confirmation)
          tripBaselineSteps = getDaySteps();
          tripDay = todayKey();
          showTripView = true;
          saveState();
          if (Bangle.isLCDOn()) draw();
        } else if (!showTripView) {
          // Active trip: just switch to the trip view
          showTripView = true;
          saveState();
          if (Bangle.isLCDOn()) draw();
        }
      } else { // Swipe down
        if (resetConfirmTimeout) {
          // Dismiss the pending reset confirmation, stay in the trip view
          clearTimeout(resetConfirmTimeout);
          resetConfirmTimeout = undefined;
          if (Bangle.isLCDOn()) draw();
        } else if (showTripView) {
          // Back to the day total; the trip keeps running
          showTripView = false;
          saveState();
          if (Bangle.isLCDOn()) draw();
        }
      }
    }
    return;
  }
  if (directionLR !== 0) {
    changeScreen(directionLR === -1 ? 1 : -1);
  }
}
Bangle.on('swipe', onSwipe);

/**
 * Handles tap gestures on the touchscreen: shows the info overlay of the
 * current dashboard (date on the clock, exact pressure or altitude on the
 * barometer views) and drives the trip reset confirmation on the distance
 * screen.
 *
 * @param {number} button - The button index.
 * @param {Object} xy - The x and y coordinates of the touch.
 */
function onTouch(button, xy) {
  if (screens[currentScreenIdx] === "clock" || screens[currentScreenIdx] === "baro") {
    showInfoOverlay();
  } else if (screens[currentScreenIdx] === "distance" && showTripView) {
    if (resetConfirmTimeout) {
      // Second tap while the popup is showing: reset confirmed
      clearTimeout(resetConfirmTimeout);
      resetConfirmTimeout = undefined;
      tripBaselineSteps = getDaySteps();
      saveState();
    } else {
      // Tap in the trip view: ask for confirmation before resetting
      resetConfirmTimeout = setTimeout(function() {
        resetConfirmTimeout = undefined;
        if (Bangle.isLCDOn()) draw();
      }, RESET_CONFIRM_MS);
    }
    if (Bangle.isLCDOn()) draw();
  }
}
Bangle.on('touch', onTouch);

let liveBpm = 0;
let lastHrmDraw = 0;

/**
 * Processes incoming Heart Rate Monitor events.
 * Only updates the display if live HRM is enabled, confidence is high, and the interval has elapsed.
 *
 * @param {Object} hrm - The HRM event object containing bpm and confidence.
 */
function onHRM(hrm) {
  if (screens[currentScreenIdx] === "hrm" && initialSettings.liveHrm) {
    if (hrm.confidence > 50) {
      liveBpm = hrm.bpm;
      let now = Date.now();
      if (now - lastHrmDraw >= initialSettings.liveHrmInterval * 1000) {
        lastHrmDraw = now;
        if (Bangle.isLCDOn()) draw();
      }
    }
  }
}
Bangle.on('HRM', onHRM);

let baroPressure = 0;
let baroRawPressure = 0;
let lastBaroDraw = 0;
// Sea-level calibration factor (QNH / raw reading), set via the settings menu.
// Constant per location, so it corrects altitude and sensor offset in one go.
const baroCalib = initialSettings.baroCalib || 1;
// Sea-level pressure entered at calibration time, used as the altimeter
// reference. Altitude drifts ~8m per hPa of weather change since then.
const baroRefQnh = initialSettings.baroRefQnh || 1013.25;

/**
 * Processes incoming barometer events while the barometer screen is active.
 * Redraws are throttled to one per 2 seconds.
 *
 * @param {Object} e - The pressure event containing pressure (hPa).
 */
function onPressure(e) {
  if (screens[currentScreenIdx] === "baro" && e.pressure) {
    baroRawPressure = e.pressure;
    baroPressure = e.pressure * baroCalib;
    let now = Date.now();
    if (now - lastBaroDraw >= 2000) {
      lastBaroDraw = now;
      if (Bangle.isLCDOn()) draw();
    }
  }
}
Bangle.on('pressure', onPressure);

// Timestamp of the last one-shot reading taken while locked. The threshold
// stays just below the minute tick so no tick is skipped due to timer jitter.
let lastBaroPoll = 0;
const LOCKED_BARO_POLL_MS = 55000;

/**
 * Takes a single barometer reading while the watch is locked (the continuous
 * sensor is off then). Piggybacks on the once-a-minute redraw, so the locked
 * baro screen costs no more than the locked clock face.
 */
function pollBaroWhileLocked() {
  if (typeof Bangle.getPressure !== 'function') return;
  let now = Date.now();
  if (now - lastBaroPoll < LOCKED_BARO_POLL_MS) return;
  lastBaroPoll = now;
  Bangle.getPressure().then(d => {
    if (d && d.pressure) {
      baroRawPressure = d.pressure;
      baroPressure = d.pressure * baroCalib;
      if (Bangle.isLCDOn()) draw();
    }
  }).catch(() => {});
}

/**
 * Handles charging state changes, switching to the battery dashboard when plugged in.
 * @param {boolean} charging - True if the watch is now charging.
 */
function onCharge(charging) {
  // Cancel a pending HRM power-on so it cannot fire after we leave the HRM screen
  if (hrmPowerTimeout) {
    clearTimeout(hrmPowerTimeout);
    hrmPowerTimeout = undefined;
  }
  let oldScreen = screens[currentScreenIdx];
  if (charging) {
    let batteryIdx = screens.indexOf("battery");
    if (batteryIdx !== -1) currentScreenIdx = batteryIdx;
  } else {
    currentScreenIdx = screens.indexOf("clock");
  }
  if (initialSettings.liveHrm && oldScreen === "hrm" && screens[currentScreenIdx] !== "hrm") {
    Bangle.setHRMPower(0, "line_dash");
  }
  updateBaroPower();
  draw(); // draw() itself skips rendering when the display is off and not charging
  // Wake the backlight only after the battery dashboard is fully drawn, so
  // the light reveals the finished screen. It dims again after the normal
  // system backlight timeout; the watch stays locked.
  if (charging && typeof Bangle.setLCDPower === 'function') Bangle.setLCDPower(1);
}
Bangle.on('charging', onCharge);

// Register the app UI mode and cleanup function for when the app is exited
Bangle.setUI({
  mode : "clock",
  remove : function() {
    saveState();
    Bangle.removeListener('lock', lockListenerBw);
    Bangle.removeListener('lcdPower', lcdListener);
    Bangle.removeListener('swipe', onSwipe);
    Bangle.removeListener('touch', onTouch);
    Bangle.removeListener('HRM', onHRM);
    Bangle.removeListener('pressure', onPressure);
    Bangle.removeListener('charging', onCharge);
    Bangle.setHRMPower(0, "line_dash");
    if (typeof Bangle.setBarometerPower === 'function') Bangle.setBarometerPower(0, "line_dash");
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    if (hrmPowerTimeout) clearTimeout(hrmPowerTimeout);
    hrmPowerTimeout = undefined;
    if (infoOverlayTimeout) clearTimeout(infoOverlayTimeout);
    infoOverlayTimeout = undefined;
    if (resetConfirmTimeout) clearTimeout(resetConfirmTimeout);
    resetConfirmTimeout = undefined;
  }
});

/**
 * Draws a generic interactive gauge on the dashboard.
 * 
 * @param {Object} opt - Configuration object for the gauge.
 * @param {number} opt.currentTick - The central tick index currently being pointed at.
 * @param {number} opt.minTick - Minimum valid tick index (e.g. 0 for battery).
 * @param {number} opt.maxTick - Maximum valid tick index (e.g. 10 for battery).
 * @param {number} opt.tickRange - Number of ticks to draw left and right of the current tick.
 * @param {number} opt.tickSpacing - The angle in degrees between each tick.
 * @param {number} [opt.startAngle=210] - The starting angle in degrees for the 0th tick.
 * @param {number} [opt.subIntervals=10] - Number of subdivisions between main ticks.
 * @param {function} opt.getTickLabel - Function returning the label string for a given tick index.
 * @param {function|number} opt.getTickColor - Color, or a function(tickIdx, frac) returning a color for the tick marks.
 * @param {number} opt.handColor - The color of the main needle pointer.
 * @param {string|number} opt.centerText - The text displayed inside the central circle.
 * @param {number} [opt.centerColor] - Optional specific color for the central circle.
 * @param {number} [opt.centerTextColor] - Optional specific color for the central text.
 * @param {function} [opt.centerIcon] - Function returning an icon to display below the text.
 * @param {number} [opt.tickLabelSize] - Optional font size for the tick labels.
 */
function drawDashboardGauge(opt) {
  let startAngle = opt.startAngle !== undefined ? opt.startAngle : 210;
  for (let i = opt.currentTick - opt.tickRange; i <= opt.currentTick + opt.tickRange; i++) {
    if (i >= opt.minTick && i <= opt.maxTick) {
      drawMetricTick(
        opt.getTickLabel(i),
        startAngle + i * opt.tickSpacing,
        opt.tickSpacing,
        opt.getTickColor,
        i,
        opt.subIntervals || 10,
        i === opt.maxTick,
        opt.tickLabelSize
      );
    }
  }
  drawHand(opt.handColor);
  drawNumber(opt.centerText, opt.centerColor || opt.handColor, undefined, opt.centerIcon, opt.centerTextColor);
}

/**
 * Main render loop. Clears the screen and draws the currently active dashboard screen.
 */
function draw() {
  queueDraw();
  // Do not render if the screen is off - except on the charger, where the
  // transflective display stays readable and must show fresh values
  if (!Bangle.isLCDOn() && !Bangle.isCharging()) return;

  lastDrawMs = Date.now();
  lastDrawnLocked = Bangle.isLocked();

  g.setBgColor(g.theme.bg);
  g.clear();
  g.setFontAlign(0, 0);

  if(initialSettings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock, gWidth-16, 2);
  }

  let screen = screens[currentScreenIdx];

  if (screen === "clock") {
    currentTime = new Date();
    currentHour = currentTime.getHours();
    currentMinute = currentTime.getMinutes();

    setHourAngle(getHourHandAngle());

    drawHour(currentHour);
    drawHour(currentHour-1);
    drawHour(currentHour+1);

    drawHand(0xF800);

    if(initialSettings.showMinute){
      let minStr = currentMinute < 10 ? "0" + currentMinute : currentMinute;
      drawNumber(":" + minStr, 0xF800);
    }

    if (infoOverlayTimeout) drawDateOverlay();
  } else if (screen === "steps") {
    let steps = getDaySteps();

    setHourAngle(210 + (steps / 12000) * 360);

    drawDashboardGauge({
      currentTick: Math.floor(steps / 1000),
      minTick: 0,
      maxTick: Infinity,
      tickRange: 1,
      tickSpacing: 30,
      getTickLabel: i => i + "k",
      getTickColor: 0x07E0,
      handColor: 0x07E0,
      centerText: "." + Math.floor((steps % 1000) / 100)
    });
  } else if (screen === "distance") {
    let steps = getDaySteps();

    // A trip expires at midnight: the daily step counter it is based on has reset
    if (tripDay && tripDay !== todayKey()) {
      tripDay = "";
      tripBaselineSteps = 0;
      showTripView = false;
      saveState();
    }

    let shownSteps = showTripView ? Math.max(0, steps - tripBaselineSteps) : steps;
    let distanceM = shownSteps * initialSettings.strideLength;
    
    let isImperial = initialSettings.distanceUnit === "mi";
    let unitScale = isImperial ? 1609.34 : 1000;
    let unitSuffix = isImperial ? "mi" : "km";
    let distanceUnits = distanceM / unitScale;
    
    setHourAngle(210 + (distanceUnits / 12) * 360);

    drawDashboardGauge({
      currentTick: Math.floor(distanceUnits),
      minTick: 0,
      maxTick: Infinity,
      tickRange: 1,
      tickSpacing: 30,
      getTickLabel: i => i + unitSuffix,
      getTickColor: 0x07FF,
      handColor: 0x07FF,
      centerText: "." + Math.floor((distanceUnits % 1) * 10)
    });

    if (showTripView) {
      g.setFontAlign(0, 0);
      g.setFont("Vector", 20);
      g.setColor(0x07FF);
      g.drawString("TRIP", gCenterX, 12);
    }

    if (resetConfirmTimeout) drawOverlayPill("TRIP", "RESET?", 0x07FF);
  } else if (screen === "battery") {
    let battery = E.getBattery();

    let isCharging = Bangle.isCharging();

    let color = batteryZoneColor(battery);

    setHourAngle(270 + (battery / 100) * 180);

    drawDashboardGauge({
      currentTick: Math.floor(battery / 10),
      minTick: 0,
      maxTick: 10,
      tickRange: 5,
      startAngle: 270,
      tickSpacing: 18,
      subIntervals: 5,
      tickLabelSize: 28,
      getTickLabel: i => (i * 10) + "%",
      // Fixed fuel-gauge zones on the dial; hand and circle take the current one
      getTickColor: batteryTickColor,
      handColor: color,
      centerText: battery,
      centerTextColor: isCharging ? 0x07E0 : undefined,
      centerIcon: isCharging ? drawLightning : undefined
    });
  } else if (screen === "hrm") {
    let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("last") : null;
    let bpm = initialSettings.liveHrm && liveBpm > 0 ? liveBpm : (health ? (health.bpm || 0) : 0);
    
    let maxHr = 220 - initialSettings.hrDecade;
    if (bpm < 40) bpm = 40;
    if (bpm > 240) bpm = 240;
    
    let z1 = maxHr * 0.5, z2 = maxHr * 0.6, z3 = maxHr * 0.7, z4 = maxHr * 0.8, z5 = maxHr * 0.9;
    
    let zone = "REST", color = 0x07E0;
    if (bpm < z1)      { zone = "REST"; color = 0x07E0; }
    else if (bpm < z2) { zone = "Z1"; color = 0x07FF; }
    else if (bpm < z3) { zone = "Z2"; color = 0xFFE0; }
    else if (bpm < z4) { zone = "Z3"; color = 0xFD20; }
    else if (bpm < z5) { zone = "Z4"; color = 0xFA80; }
    else               { zone = "Z5"; color = 0xF800; }

    setHourAngle(210 + ((bpm - 40) / 200) * 300);
    
    drawDashboardGauge({
      currentTick: Math.floor((bpm - 40) / 10),
      minTick: 0,
      maxTick: 20,
      tickRange: 3,
      tickSpacing: 15,
      subIntervals: 4,
      getTickLabel: i => String(40 + i * 10),
      getTickColor: function(i, frac) {
        let exactBpm = 40 + i * 10 + frac * 10;
        if (exactBpm < z1) return 0x07E0;
        if (exactBpm < z2) return 0x07FF;
        if (exactBpm < z3) return 0xFFE0;
        if (exactBpm < z4) return 0xFD20;
        if (exactBpm < z5) return 0xFA80;
        return 0xF800;
      },
      handColor: color,
      centerText: zone
    });
  } else if (screen === "baro") {
    // While locked, refresh the reading once a minute instead of continuously
    if (Bangle.isLocked()) pollBaroWhileLocked();

    if (showAltView) {
      // Altimeter sub-view, laid out like an aircraft altimeter: 0 sits at
      // 12 o'clock and one full revolution of the dial covers 100m (ticks
      // every 10m, subticks every meter, wrapping like the real instrument).
      // The circle shows the hundreds of meters.
      let hasReading = baroRawPressure > 0;
      let alt = hasReading ? Math.max(0, getBaroAltitude()) : 0;

      setHourAngle((alt / 100) * 360);

      drawDashboardGauge({
        currentTick: Math.floor(alt / 10),
        minTick: -Infinity,
        maxTick: Infinity,
        tickRange: 1,
        startAngle: 0,
        tickSpacing: 36,
        subIntervals: 10,
        getTickLabel: i => String(((i % 10) + 10) % 10 * 10),
        getTickColor: 0xFFE0,
        handColor: 0xFFE0,
        centerText: hasReading ? String(Math.floor(alt / 100)) : "--"
      });

      g.setFontAlign(0, 0);
      g.setFont("Vector", 20);
      g.setColor(0xFFE0);
      g.drawString("ALT", gCenterX, 12);
    } else {
      // Sea-level air pressure typically ranges 950-1050 hPa; clamp to the scale
      let p = baroPressure;
      let hasReading = p > 0;
      if (!hasReading) p = 1000;
      if (p < 950) p = 950;
      if (p > 1050) p = 1050;

      setHourAngle(210 + ((p - 950) / 100) * 300);

      // The dial gives the hundreds; the circle shows the last two digits,
      // truncated like the steps/distance decimals
      let v = Math.floor(p) % 100;
      let centerText = !hasReading ? "--" : (v < 10 ? "0" + v : String(v));

      drawDashboardGauge({
        currentTick: Math.floor((p - 950) / 10),
        minTick: 0,
        maxTick: 10,
        tickRange: 1,
        tickSpacing: 30,
        subIntervals: 10,
        tickLabelSize: 24,
        getTickLabel: i => String(950 + i * 10),
        getTickColor: 0xFFE0,
        handColor: 0xFFE0,
        centerText: centerText
      });
    }

    if (infoOverlayTimeout) drawBaroOverlay();
  }
}

draw();
