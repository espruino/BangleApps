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
let currentScreenIdx = 0;

// Screen dimensions and center coordinates
let gWidth  = g.getWidth(),  gCenterX = gWidth/2;
let gHeight = g.getHeight(), gCenterY = gHeight/2;

let currentTime = new Date();
let currentHour = currentTime.getHours();
let currentMinute = currentTime.getMinutes();

let drawTimeout;

/**
 * Returns an image object for the lock icon.
 * @returns {Object} Image object suitable for g.drawImage
 */
function imgLock() {
  return {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("A8AH4A5wDDAYGBgYP/w//D/8Pnw+fD58Pnw//D/8P/w="))
  };
}



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

let hourAngle = getHourHandAngle();

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The degrees to be converted to radians.
 * @return {number} - The equivalent value in radians.
 */
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Rotates an array of points around a given angle and radius.
 *
 * @param {Array} points - The array of points to be rotated.
 * @param {number} angle - The angle in degrees to rotate the points.
 * @param {number} rad - The radius to offset the rotation.
 * @returns {Array} - The array of rotated points.
 */
function rotatePoints(points, angle, rad) {
  const ang = degreesToRadians(angle);
  const hAng = degreesToRadians(hourAngle);
  const rotatedPoints = [];
  const cosAng = Math.cos(ang), sinAng = Math.sin(ang);
  const dx = rad * Math.sin(hAng), dy = rad * Math.cos(hAng);
  for (let i = 0; i < points.length; i++) {
    let px = points[i].x;
    let py = points[i].y;
    rotatedPoints.push(px * cosAng - py * sinAng + gCenterX - dx);
    rotatedPoints.push(px * sinAng + py * cosAng + gCenterY + dy);
  }
  return rotatedPoints;
}

/**
 * Draws the main central hand (needle) on the canvas.
 *
 * @param {number} [color] - The 16-bit color value for the hand.
 */
function drawHand(color) {
  g.setColor(color || 0xF800);
  const halfWidth = handWidth / 2;

  const points = [{
    x: -halfWidth,
    y: -gHeight
  }, {
    x: halfWidth,
    y: -gHeight
  }, {
    x: halfWidth,
    y: gHeight
  }, {
    x: -halfWidth,
    y: gHeight
  }];

  g.fillPolyAA(rotatePoints(points, hourAngle, 0));
}

/**
 * Retrieves the polygon coordinates for a tick mark.
 * 
 * @param {boolean} small - If true, returns coordinates for a shorter tick mark.
 * @param {boolean} superSmall - If true, returns coordinates for a very fine, short tick mark.
 * @returns {Array} Array of {x, y} coordinates for the polygon.
 */
function getHourCoordinates(small, superSmall) {
  let dist = small ? (hourSLength - hourLength) : 0;
  let hWidth = hourWidth / 2;
  
  if (superSmall) {
    dist = (10 - hourLength); // super short length
    hWidth = 2 / 2; // extremely fine width
  }

  const gh = gHeight + lineOffset;
  return [{
    x: -hWidth,
    y: -gh - dist
  }, {
    x: hWidth,
    y: -gh - dist
  }, {
    x: hWidth,
    y: -gh + hourLength
  }, {
    x: -hWidth,
    y: -gh + hourLength
  }];
}

const hourPoints = getHourCoordinates(false, false);
const hourSPoints = getHourCoordinates(true, false);
const hourSSPoints = getHourCoordinates(false, true);

/**
 * Draws a small decorative dot at a specific angle.
 *
 * @param {number} a - The angle in degrees where the dot should be drawn.
 */
function hourDot(a) {
  const h = gHeight + lineOffset;
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -h + hourLength - (hourRadius / 2)
    }], a, radius
  );
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
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -h + hourLength + hourOffset
    }], a, radius
  );
  let str = label !== undefined ? String(label) : String(a / 30);
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
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -h + hourLength + numberOffset
    }], hourAngle, radius
  );
  g.setColor(color || 0xF800);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], numberSize+ halfWidth);
  g.setColor(g.theme.bg);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], numberSize - halfWidth);
  
  let str = String(n);
  let fontSize = numberSize;
  // Do not count the thin colon as a full character for width calculations
  let effectiveLength = str.startsWith(":") ? str.length - 1 : str.length;
  if (effectiveLength > 2) fontSize -= (effectiveLength - 2) * 4;
  g.setFont("Vector:"+fontSize);
  
  g.setColor(textColor || g.theme.fg);
  g.drawString(str, rotatedPoints[0], rotatedPoints[1] - (label || iconFunc ? 6 : 0));
  if (label) {
    g.setFont("Vector:12");
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
  
  // Read global 12/24 hour system setting
  let sysSettings = storage.readJSON('setting.json', 1) || {};
  let is24h = sysSettings["12hour"] === false || sysSettings["12hour"] === undefined; // Usually defaults to 24h if missing

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
  g.setFont("Vector:32");
  
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
 * @param {number|function} colorValOrFn - The color, or a function(frac) returning a color for the sub-ticks.
 * @param {number} subIntervals - Number of sub-intervals between main ticks.
 * @param {boolean} isLast - If true, do not draw sub-ticks (because this is the max boundary).
 * @param {number} [labelSize=16] - Optional font size for the label.
 */
function drawMetricTick(tickStr, a, spacingAngle, colorValOrFn, subIntervals, isLast, labelSize) {
  subIntervals = subIntervals || 10;
  
  function getColor(frac) {
    if (typeof colorValOrFn === 'function') return colorValOrFn(frac);
    return colorValOrFn !== undefined ? colorValOrFn : g.theme.fg;
  }

  g.setFont("Vector:" + (labelSize || 32));
  
  g.setColor(getColor(0));
  g.fillPolyAA(rotatePoints(hourPoints, a, radius));
  
  const hOff = gHeight + lineOffset;
  
  if (tickStr) {
    let fSize = labelSize || 32;
    // Adjust yOffset so the top edge of the text remains at a constant distance from the tick
    // Base offset was hourLength + hourOffset = 40 + 32 = 72
    let yOffset = 72 - (32 - fSize) / 2;
    let rotatedStrPos = rotatePoints([{x: 0, y: -hOff + yOffset}], a, radius);
    g.setFontAlign(0, 0);
    g.setFont("Vector:" + fSize);
    g.setColor(g.theme.fg);
    g.drawString(tickStr, rotatedStrPos[0], rotatedStrPos[1]);
  }
  
  if (isLast) return;

  let intervalStep = spacingAngle / subIntervals;
  for (let i = 1; i < subIntervals; i++) {
    let frac = i / subIntervals;
    g.setColor(getColor(frac));
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
  if (!Bangle.isLCDOn()) return; // Don't schedule a timeout if LCD is off
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

/**
 * Triggers a redraw when the watch is locked/unlocked to immediately update the lock icon.
 */
function lockListenerBw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  if (Bangle.isLCDOn()) draw();
}
Bangle.on('lock', lockListenerBw);

let hrmPowerTimeout;

/**
 * Changes the currently displayed dashboard screen.
 * Handles powering the HRM sensor on/off when entering/leaving the HRM screen.
 * 
 * @param {number} dir - Direction to switch (1 for forward, -1 for backward).
 */
function changeScreen(dir) {
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

  if (Bangle.isLCDOn()) draw();
}

/**
 * Handles swipe gestures on the touchscreen.
 * Horizontal swipes navigate between dashboards.
 * Vertical swipes reset the distance baseline on the distance dashboard.
 *
 * @param {number} directionLR - Left/Right swipe direction (-1 or 1).
 * @param {number} directionUD - Up/Down swipe direction (-1 or 1).
 */
function onSwipe(directionLR, directionUD) {
  if (directionUD !== 0) {
    if (screens[currentScreenIdx] === "distance") {
      let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("day") : null;
      distanceBaselineSteps = health ? health.steps : 0;
      if (Bangle.isLCDOn()) draw();
    }
    return;
  }
  if (directionLR !== 0) {
    changeScreen(directionLR === -1 ? 1 : -1);
  }
}
Bangle.on('swipe', onSwipe);

let distanceBaselineSteps = 0;

/**
 * Handles tap gestures on the touchscreen to advance to the next dashboard.
 *
 * @param {number} button - The button index.
 * @param {Object} xy - The x and y coordinates of the touch.
 */
function onTouch(button, xy) {
  changeScreen(1);
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

/**
 * Handles charging state changes, switching to the battery dashboard when plugged in.
 * @param {boolean} charging - True if the watch is now charging.
 */
function onCharge(charging) {
  if (charging) {
    let batteryIdx = screens.indexOf("battery");
    if (batteryIdx !== -1 && currentScreenIdx !== batteryIdx) {
      if (initialSettings.liveHrm && screens[currentScreenIdx] === "hrm") {
        Bangle.setHRMPower(0, "line_dash");
      }
      currentScreenIdx = batteryIdx;
    }
  } else {
    currentScreenIdx = screens.indexOf("clock");
  }
  if (Bangle.isLCDOn()) draw();
}
Bangle.on('charging', onCharge);

// Register the app UI mode and cleanup function for when the app is exited
Bangle.setUI({
  mode : "clock",
  remove : function() {
    Bangle.removeListener('lock', lockListenerBw);
    Bangle.removeListener('swipe', onSwipe);
    Bangle.removeListener('touch', onTouch);
    Bangle.removeListener('HRM', onHRM);
    Bangle.removeListener('charging', onCharge);
    Bangle.setHRMPower(0, "line_dash");
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    if (hrmPowerTimeout) clearTimeout(hrmPowerTimeout);
    hrmPowerTimeout = undefined;
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
 * @param {function|number} opt.getTickColor - Color (or function returning a color) for the tick marks.
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
      let tickColor = typeof opt.getTickColor === 'function' ? function(frac) { return opt.getTickColor(i, frac); } : opt.getTickColor;
      drawMetricTick(
        opt.getTickLabel(i), 
        startAngle + i * opt.tickSpacing, 
        opt.tickSpacing, 
        tickColor,
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
  if (!Bangle.isLCDOn()) return; // Extra check, do not render if screen is off

  g.clear();
  g.setFontAlign(0, 0);

  g.setColor(g.theme.bg);
  g.fillRect(0, 0, gWidth, gHeight);

  if(initialSettings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock(), gWidth-16, 2);
  }

  let screen = screens[currentScreenIdx];

  if (screen === "clock") {
    currentTime = new Date();
    currentHour = currentTime.getHours();
    currentMinute = currentTime.getMinutes();

    hourAngle = getHourHandAngle();

    drawHour(currentHour);
    drawHour(currentHour-1);
    drawHour(currentHour+1);

    drawHand(0xF800);

    if(initialSettings.showMinute){
      let minStr = currentMinute < 10 ? "0" + currentMinute : currentMinute;
      drawNumber(":" + minStr, 0xF800);
    }
  } else if (screen === "steps") {
    let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("day") : null;
    let steps = health ? health.steps : 0;
    
    hourAngle = 210 + (steps / 12000) * 360;

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
    let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("day") : null;
    let steps = health ? health.steps : 0;
    let tripSteps = Math.max(0, steps - distanceBaselineSteps);
    let distanceM = tripSteps * initialSettings.strideLength;
    
    let isImperial = initialSettings.distanceUnit === "mi";
    let unitScale = isImperial ? 1609.34 : 1000;
    let unitSuffix = isImperial ? "mi" : "km";
    let distanceUnits = distanceM / unitScale;
    
    hourAngle = 210 + (distanceUnits / 12) * 360;

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
  } else if (screen === "battery") {
    let battery = E.getBattery();
    
    let isCharging = Bangle.isCharging();
    
    let r5, g6;
    if (battery <= 50) {
      r5 = 31;
      g6 = Math.round((battery / 50) * 63);
    } else {
      r5 = Math.round((1 - ((battery - 50) / 50)) * 31);
      g6 = 63;
    }
    let color = (r5 << 11) | (g6 << 5);
    
    hourAngle = 270 + (battery / 100) * 180;

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
      getTickColor: color,
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

    hourAngle = 210 + ((bpm - 40) / 200) * 300;
    
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
  }
}

draw();
