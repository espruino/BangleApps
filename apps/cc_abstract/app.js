// ----- const -----

const defaultSettings = {
  loadWidgets: false
};

const settings = Object.assign(defaultSettings, require('Storage').readJSON('cc_abstract.json', 1) || {});

const center = {
  "x": g.getWidth()/2,
  "y": g.getHeight()/2
};

// ----- global vars -----

let drawTimeout;
let queueMillis = 1000;
let unlock = true;
let lastBatteryStates = [E.getBattery()];


// ----- functions -----

function updateState() {
  updateBatteryStates();

  if (Bangle.isLCDOn()) {
    if (!Bangle.isLocked()) {
      queueMillis = 1000;
      unlock = true;
    }
    else {
      queueMillis = 60000;
      unlock = false;
    }
    draw();
  }
  else {
    if (drawTimeout)
      clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
}

function updateBatteryStates() {
  lastBatteryStates.push(E.getBattery());
  if (lastBatteryStates.length > 5)
    lastBatteryStates.shift();  // remove 1st item
}

function draw() {
  clearScreen();
  drawTicks();
  drawHands();
  queueDraw();
}

function clearScreen() {
  g.setBgColor(0, 0, 0);
  g.clear();
}

function drawTicks() {  // draws the scale once the app is startet
  for (let i = 1; i <= 12; i++) {
    const phi = 30 * i * (Math.PI / 180);
    const r = 80;
    const x = center.x + r * Math.cos(phi);
    const y = center.y + r * Math.sin(phi);

    g.setColor(1, 1, 1);
    g.fillCircle(x, y, 2);
  }
}

function drawHands() {
  const date = new Date();
  const batteryState = calcAvgBatteryState();
 
  setColorByBatteryState(batteryState);
  drawHourHand(date.getHours(), date.getMinutes());

  setColorByBatteryState(batteryState);
  drawMinuteHand(date.getMinutes());

  if (unlock) {
    setColorByBatteryState(batteryState);
    drawSecondHand(date.getSeconds());
  }
}

function setColorByBatteryState(batteryState) {
  if (batteryState <= 20)
    g.setColor(1, 0, 0);
  else if (batteryState <= 40)
    g.setColor(1, 1, 0);
  else
    g.setColor(0, 1, 1);
}

function drawHourHand(hours, minutes) {
  const hand_len = 40;
  const hand_thickness = 14;
  const border_thickness = 3;
  const hour_angle = 30 * (hours + minutes/60) * (Math.PI / 180) - Math.PI/2;
  const hourPolygon = calcOval(center.x, center.y, hour_angle, hand_len, hand_thickness/2);

  // g.drawPoly(hourPolygon, true);
  g.fillPoly(hourPolygon);
  if (!unlock) {
    const innerPolygon = calcOval(center.x, center.y, hour_angle, hand_len, hand_thickness/2 - border_thickness);
    g.setColor(0, 0, 0);
    g.fillPoly(innerPolygon);
  }
}

function drawMinuteHand(minutes) {
  const hand_dist = 60;
  const hand_len = 12;
  const hand_thickness = 6;
  const minute_angle = 6 * minutes * (Math.PI / 180) - Math.PI/2;
  const x0 = center.x + hand_dist * Math.cos(minute_angle);
  const y0 = center.y + hand_dist * Math.sin(minute_angle);
  const minutePolygon = calcOval(x0, y0, minute_angle, hand_len, hand_thickness/2);

  g.fillPoly(minutePolygon);
}

function drawSecondHand(seconds) {
  const hand_radius = 6;
  const r = 80;
  const second_angle = 6 * seconds * (Math.PI / 180) - Math.PI/2;
  const x = center.x + r * Math.cos(second_angle);
  const y = center.y + r * Math.sin(second_angle);

  g.fillCircle(x, y, hand_radius);
}

function calcOval(x0, y0, phi0, len, r) {
  //  * 2 * * 3 *
  // *  A     B  *
  //  * 1 * * 4 *
  //
  // A: (x0, y0)
  // dist(A, B): len
  // dist(A, 1): r
  // atan2(A, B): phi 

  var polygon = [];

  const n = 4;
  const dphi = Math.PI / n;  // pi=180°

  // half circle around A
  for (let i = 0; i <= n; i += 1) {
    const phi = phi0 + Math.PI/2 + i * dphi;
    polygon.push(x0 + r * Math.cos(phi));
    polygon.push(y0 + r * Math.sin(phi));
  }

  // half circle around B
  const x1 = x0 + len * Math.cos(phi0);
  const y1 = y0 + len * Math.sin(phi0);

  for (let i = 0; i <= n; i += 1) {
    const phi = phi0 - Math.PI/2 + i * dphi;
    polygon.push(x1 + r * Math.cos(phi));
    polygon.push(y1 + r * Math.sin(phi));
  }

  return polygon;
}

function calcAvgBatteryState() {
  const n = lastBatteryStates.length;
  if (n == 0)
    return 100;

  let sum = lastBatteryStates.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / n);
}

function queueDraw() {
  if (drawTimeout) 
    clearTimeout(drawTimeout);

  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, queueMillis - (Date.now() % queueMillis));
}


//// main running sequence ////

// Show launcher when middle button pressed, and widgets that we're clock
Bangle.setUI({
  mode: "clock",
  remove: function() {
    Bangle.removeListener('lcdPower', updateState);
    Bangle.removeListener('lock', updateState);
    Bangle.removeListener('charging', draw);

    // We clear drawTimout after removing all listeners, because they can add one again
    if (drawTimeout)
      clearTimeout(drawTimeout);

    drawTimeout = undefined;
    require("widget_utils").show();
  }
});

// Load widgets if needed, and make them show swipeable
if (settings.loadWidgets) {
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
} 
else if (global.WIDGETS) {
  require("widget_utils").hide();
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', updateState);
Bangle.on('lock', updateState);
Bangle.on('charging', draw); // Immediately redraw when charger (dis)connected

updateState();
drawTicks();
draw();
