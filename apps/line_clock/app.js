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

const SETTINGS_FILE = "line_clock.setting.json";

let initialSettings = {
  showLock: true,
  showMinute: true,
  showSteps: true,
  showStepsK: true,
  showBattery: true,
  batteryWarn: true,
  showHrm: true,
  liveHrm: false,
  liveHrmInterval: 2,
  hrDecade: 40,
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || initialSettings;
for (const key in saved_settings) {
  initialSettings[key] = saved_settings[key];
}

let screens = ["clock"];
if (initialSettings.showSteps) screens.push("steps");
if (initialSettings.showBattery) screens.push("battery");
if (initialSettings.showHrm) screens.push("hrm");
let currentScreenIdx = 0;

let gWidth  = g.getWidth(),  gCenterX = gWidth/2;
let gHeight = g.getHeight(), gCenterY = gHeight/2;

let currentTime = new Date();
let currentHour = currentTime.getHours();
let currentMinute = currentTime.getMinutes();

let drawTimeout;

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
  points.map(function(point) {
    return {
      x: point.x * Math.cos(ang) - point.y * Math.sin(ang),
      y: point.x * Math.sin(ang) + point.y * Math.cos(ang)
    };
  }).forEach(function(point) {
    rotatedPoints.push(point.x + gCenterX - (rad * Math.sin(hAng)));
    rotatedPoints.push(point.y + gCenterY + (rad * Math.cos(hAng)));
  });
  return rotatedPoints;
}

/**
 * Draws a hand on the canvas.
 *
 * @function drawHand
 *
 * @returns {void}
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
 * Retrieves the hour coordinates for a given small flag.
 * @param {boolean} small - Determines if the flag is small.
 * @returns {Array} - An array of hour coordinates.
 */
function getHourCoordinates(small) {
  const dist = small ? (hourSLength - hourLength) : 0;
  const halfWidth = hourWidth / 2;
  const gh = gHeight + lineOffset;
  return [{
    x: -halfWidth,
    y: -gh - dist
  }, {
    x: halfWidth,
    y: -gh - dist
  }, {
    x: halfWidth,
    y: -gh + hourLength
  }, {
    x: -halfWidth,
    y: -gh + hourLength
  }];
}

/**
 * Assign the given time to the hour dot on the clock face.
 *
 * @param {number} a - The time value to assign to the hour dot.
 * @return {void}
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
 * Convert an hour into a number and display it on the clock face.
 *
 * @param {number} a - The hour to be converted (between 0 and 360 degrees).
 */
function hourNumber(a, suffix) {
  const h = gHeight + lineOffset;
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -h + hourLength + hourOffset
    }], a, radius
  );
  let str = String(a / 30);
  if (suffix) str += suffix;
  g.drawString(str, rotatedPoints[0], rotatedPoints[1]);
}

/**
 * Draws a number on the display.
 *
 * @param {number} n - The number to be drawn.
 * @return {void}
 */
function drawNumber(n, color, label) {
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
  g.setColor(g.theme.fg);
  
  let str = String(n);
  let fontSize = numberSize;
  if (str.length > 2) fontSize -= (str.length - 2) * 4;
  g.setFont("Vector:"+fontSize);
  
  g.drawString(str, rotatedPoints[0], rotatedPoints[1] - (label ? 6 : 0));
  if (label) {
    g.setFont("Vector:12");
    g.setColor(color || 0xF800);
    g.drawString(label, rotatedPoints[0], rotatedPoints[1] + 8);
  }
}

const hourPoints = getHourCoordinates(false);
const hourSPoints = getHourCoordinates(true);

/**
 * Draws an hour on a clock face.
 *
 * @param {number} h - The hour to be drawn on the clock face.
 * @return {undefined}
 */
function drawHour(h, suffix) {
  while (h <= 0) h += 12;
  while (h > 12) h -= 12;
  g.setColor(g.theme.fg);
  g.setFont("Vector:32");
  const a = h * 30;
  g.fillPolyAA(rotatePoints(hourPoints, a, radius));
  g.fillPolyAA(rotatePoints(hourSPoints, a + 15, radius));
  hourNumber(a, suffix);
  hourDot(a + 5);
  hourDot(a + 10);
  hourDot(a + 20);
  hourDot(a + 25);
}

function drawMetricTick(tickStr, a, spacingAngle) {
  g.setColor(g.theme.fg);
  g.setFont("Vector:32");
  
  g.fillPolyAA(rotatePoints(hourPoints, a, radius));
  g.fillPolyAA(rotatePoints(hourSPoints, a + (spacingAngle / 2), radius));
  
  const hOff = gHeight + lineOffset;
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -hOff + hourLength + hourOffset
    }], a, radius
  );
  g.drawString(tickStr, rotatedPoints[0], rotatedPoints[1]);
  
  let interval = spacingAngle / 6;
  hourDot(a + interval);
  hourDot(a + interval * 2);
  hourDot(a + interval * 4);
  hourDot(a + interval * 5);
}

function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function lockListenerBw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  draw();
}
Bangle.on('lock', lockListenerBw);

let hrmPowerTimeout;

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
        Bangle.setHRMPower(1, "line_clock");
        hrmPowerTimeout = undefined;
      }, 500);
    } else if (oldScreen === "hrm" && newScreen !== "hrm") {
      Bangle.setHRMPower(0, "line_clock");
    }
  }

  draw();
}

Bangle.on('swipe', function(directionLR, directionUD) {
  if (directionLR === 0) return; // Ignore up/down swipes
  changeScreen(directionLR === -1 ? 1 : -1);
});

Bangle.on('touch', function(button, xy) {
  changeScreen(1);
});

let liveBpm = 0;
let lastHrmDraw = 0;
Bangle.on('HRM', function(hrm) {
  if (screens[currentScreenIdx] === "hrm" && initialSettings.liveHrm) {
    if (hrm.confidence > 50) {
      liveBpm = hrm.bpm;
      let now = Date.now();
      if (now - lastHrmDraw >= initialSettings.liveHrmInterval * 1000) {
        lastHrmDraw = now;
        draw();
      }
    }
  }
});



Bangle.setUI({
  mode : "clock",
  // TODO implement https://www.espruino.com/Bangle.js+Fast+Load
  // remove : function() {
  //   Bangle.removeListener('lock', lockListenerBw);
  //   if (drawTimeout) clearTimeout(drawTimeout);
  //   drawTimeout = undefined;
  // }
});

/**
 * Draws a clock on the canvas using the current time.
 *
 * @return {undefined}
 */
function draw() {
  queueDraw();

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
    if (currentHour > 12) {
      currentHour -= 12;
    }
    currentMinute = currentTime.getMinutes();

    hourAngle = getHourHandAngle();

    drawHour(currentHour);
    drawHour(currentHour-1);
    drawHour(currentHour+1);

    drawHand(0xF800);

    if(initialSettings.showMinute){
      drawNumber(currentMinute, 0xF800);
    }
  } else if (screen === "steps") {
    let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("day") : null;
    let steps = health ? health.steps : 0;
    
    // Smooth angle based on exact steps, without bounds
    hourAngle = (steps / 12000) * 360;

    let currentTick = Math.floor(steps / 1000);
    let suffix = initialSettings.showStepsK ? "k" : "";

    if (currentTick - 1 >= 0) drawMetricTick(String(currentTick - 1) + suffix, (currentTick - 1) * 30, 30);
    drawMetricTick(String(currentTick) + suffix, currentTick * 30, 30);
    drawMetricTick(String(currentTick + 1) + suffix, (currentTick + 1) * 30, 30);

    drawHand(0x07E0); // Green for steps

    // Draw the hundreds digit in the center circle (0-9)
    let hundreds = Math.floor((steps % 1000) / 100);
    drawNumber(hundreds, 0x07E0);
  } else if (screen === "battery") {
    let battery = E.getBattery();
    
    let color = 0xFFE0; // Static Yellow
    if (initialSettings.batteryWarn) {
      let r5, g6;
      if (battery <= 50) {
        r5 = 31;
        g6 = Math.round((battery / 50) * 63);
      } else {
        r5 = Math.round((1 - ((battery - 50) / 50)) * 31);
        g6 = 63;
      }
      color = (r5 << 11) | (g6 << 5);
    }
    
    // Scale 0-100 to 0-360 degrees
    hourAngle = (battery / 100) * 360;

    let currentTick = Math.floor(battery / 10);
    
    // 10 segments -> 36 degrees per segment
    for (let i = currentTick - 1; i <= currentTick + 1; i++) {
        if (i >= 0 && i <= 10) {
            drawMetricTick(String(i * 10) + "%", i * 36, 36);
        }
    }

    drawHand(color);

    // Exact battery percentage in center
    drawNumber(battery, color);
  } else if (screen === "hrm") {
    let health = typeof Bangle.getHealthStatus === 'function' ? Bangle.getHealthStatus("last") : null;
    let bpm = initialSettings.liveHrm && liveBpm > 0 ? liveBpm : (health ? (health.bpm || 0) : 0);
    
    let maxHr = 220 - initialSettings.hrDecade;
    
    // Scale 40 to 240
    if (bpm < 40) bpm = 40;
    if (bpm > 240) bpm = 240;
    
    // Calculate Zone and Color
    let zone = "REST";
    let color = 0x07E0; // Green
    
    let z1 = maxHr * 0.5;
    let z2 = maxHr * 0.6;
    let z3 = maxHr * 0.7;
    let z4 = maxHr * 0.8;
    let z5 = maxHr * 0.9;

    if (bpm < z1) {
      zone = "REST";
      color = 0x07E0; // Green
    } else if (bpm < z2) {
      zone = "Z1";
      color = 0x07FF; // Cyan
    } else if (bpm < z3) {
      zone = "Z2";
      color = 0xFFE0; // Yellow
    } else if (bpm < z4) {
      zone = "Z3";
      color = 0xFD20; // Orange
    } else if (bpm < z5) {
      zone = "Z4";
      color = 0xFA80; // Dark Orange / Light Red
    } else {
      zone = "Z5";
      color = 0xF800; // Red
    }

    // 40-240 mapped to 210-510 degrees (7 o'clock to 5 o'clock)
    hourAngle = 210 + ((bpm - 40) / 200) * 300;

    let currentTick = Math.floor((bpm - 40) / 10);
    
    // 20 segments -> 15 degrees per segment
    for (let i = currentTick - 1; i <= currentTick + 1; i++) {
        if (i >= 0 && i <= 20) {
            drawMetricTick(String(40 + i * 10), 210 + i * 15, 15);
        }
    }

    drawHand(color);
    
    // Zone replaces the digital BPM in the center
    drawNumber(zone, color);
  }
}

draw();
