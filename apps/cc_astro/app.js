// ----- const -----

const center = {
  "x": g.getWidth()/2,
  "y": g.getHeight()/2
};

const parameters = {
  "earthOrbitRadius": 80,
  "venusOrbitRadius": 60,
  "mercuryOrbitRadius": 40,
  "earthRadius": 6,
  "venusRadius": 6,
  "mercuryRadius": 4,
  "sunRadius": 12,
  "maxSunRadius": 115
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
  drawBackground();
  drawHands();
  queueDraw();
}

function drawBackground() {
  clearScreen();
  drawSun();
}

function clearScreen() {
  g.setBgColor(0, 0, 0);
  g.clear();
}

function drawSun() {
  const batteryState = calcAvgBatteryState();

  if (batteryState <= 25)
    g.setColor(1, 0, 0);  // red sun, if battery low
  else
    g.setColor(1, 1, 0);

  let r = parameters.sunRadius;
  if (batteryState <= 20) {
    const relSize = (20 - batteryState) / 20;
    const dr = parameters.maxSunRadius - parameters.sunRadius;
    r = parameters.sunRadius + relSize * dr;
  }

  g.fillCircle(center.x, center.y, r);
}

function drawHands() {
  const date = new Date();

  drawHourHand(date.getHours(), date.getMinutes());
  drawMinuteHand(date.getMinutes());

  if (unlock) {
    drawSecondHand(date.getSeconds());
  }
}

function drawHourHand(hours, minutes) {
  const r = parameters.earthOrbitRadius;
  const phi = 30 * (hours + minutes/60) * (Math.PI / 180) - Math.PI/2;
  const x = center.x + r * Math.cos(phi);
  const y = center.y + r * Math.sin(phi);

  g.setColor(1, 1, 1);
  g.drawCircle(center.x, center.y, r);

  g.setColor(0, 1, 1);
  g.fillCircle(x, y, parameters.earthRadius);
}

function drawMinuteHand(minutes) {
  const r = parameters.venusOrbitRadius;
  const phi = 6 * minutes * (Math.PI / 180) - Math.PI/2;
  const x = center.x + r * Math.cos(phi);
  const y = center.y + r * Math.sin(phi);

  g.setColor(1, 1, 1);
  g.drawCircle(center.x, center.y, r);

  g.setColor(1, 1, 1);
  g.fillCircle(x, y, parameters.venusRadius);
}

function drawSecondHand(seconds) {
  const r = parameters.mercuryOrbitRadius;
  const phi = 6 * seconds * (Math.PI / 180) - Math.PI/2;
  const x = center.x + r * Math.cos(phi);
  const y = center.y + r * Math.sin(phi);

  g.setColor(1, 1, 1);
  g.drawCircle(center.x, center.y, r);

  g.setColor(1, 0, 1);
  g.fillCircle(x, y, parameters.mercuryRadius);
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

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', updateState);
Bangle.on('lock', updateState);
Bangle.on('charging', draw); // Immediately redraw when charger (dis)connected

updateState();
draw();
