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
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || initialSettings;
for (const key in saved_settings) {
  initialSettings[key] = saved_settings[key];
}

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
function drawHand() {
  g.setColor(0xF800);
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
function hourNumber(a) {
  const h = gHeight + lineOffset;
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -h + hourLength + hourOffset
    }], a, radius
  );
  g.drawString(String(a / 30), rotatedPoints[0], rotatedPoints[1]);
}

/**
 * Draws a number on the display.
 *
 * @param {number} n - The number to be drawn.
 * @return {void}
 */
function drawNumber(n) {
  const h = gHeight + lineOffset;
  const halfWidth = handWidth / 2;
  const rotatedPoints = rotatePoints(
    [{
      x: 0,
      y: -h + hourLength + numberOffset
    }], hourAngle, radius
  );
  g.setColor(0xF800);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], numberSize+ halfWidth);
  g.setColor(g.theme.bg);
  g.fillCircle(rotatedPoints[0], rotatedPoints[1], numberSize - halfWidth);
  g.setColor(g.theme.fg);
  g.setFont("Vector:"+numberSize);
  g.drawString(String(n), rotatedPoints[0], rotatedPoints[1]);
}

const hourPoints = getHourCoordinates(false);
const hourSPoints = getHourCoordinates(true);

/**
 * Draws an hour on a clock face.
 *
 * @param {number} h - The hour to be drawn on the clock face.
 * @return {undefined}
 */
function drawHour(h) {
  if (h === 0) { h= 12; }
  if (h === 13) { h= 1; }
  g.setColor(g.theme.fg);
  g.setFont("Vector:32");
  const a = h * 30;
  g.fillPolyAA(rotatePoints(hourPoints, a, radius));
  g.fillPolyAA(rotatePoints(hourSPoints, a + 15, radius));
  hourNumber(a);
  hourDot(a + 5);
  hourDot(a + 10);
  hourDot(a + 20);
  hourDot(a + 25);
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
  currentTime = new Date();
  currentHour = currentTime.getHours();
  if (currentHour > 12) {
    currentHour -= 12;
  }
  currentMinute = currentTime.getMinutes();

  hourAngle = getHourHandAngle();

  g.clear();
  g.setFontAlign(0, 0);

  g.setColor(g.theme.bg);
  g.fillRect(0, 0, gWidth, gHeight);

  if(initialSettings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock(), gWidth-16, 2);
  }

  drawHour(currentHour);
  drawHour(currentHour-1);
  drawHour(currentHour+1);


  drawHand();

  if(initialSettings.showMinute){
    drawNumber(currentMinute);
  }
}

draw();
