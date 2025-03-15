// ----- const -----

const defaultSettings = {
  loadWidgets    : false,
  textAboveHands : false,
  shortHrHand    : false,
  show24HourMode : false
};

const settings = Object.assign(defaultSettings, require('Storage').readJSON('cc_clock24.json', 1) || {});

const center = {
  "x": g.getWidth()/2,
  "y": g.getHeight()/2
};

const hourNumberPositions = (function() {
  let positions = [];

  for (let hour = 1; hour <= 12; hour += 1) {
    let phi = 30 * (hour - 3) * (Math.PI / 180);
    let x = center.x + 2 + Math.cos(phi) * (center.x - 10);
    let y = center.y + 2 + Math.sin(phi) * (center.x - 10);

    // fix positions, which are not on a circle
    if      (hour ==  3){ x -= 10; }
    else if (hour ==  6){ y -= 10; }
    else if (hour ==  9){ x += 10; }
    else if (hour == 12){ y += 10; }
    else if (hour == 10){ x +=  3; }

    positions.push([hour, x, y]);
  }
  return positions;
})();


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

function drawTicks() {  // draws the scale once the app is startet
  // clear screen
  g.setBgColor(0, 0, 0);
  g.clear();

  // draw ticks
  for (let i = 1; i <= 60; i++){
    const phi = 6 * i * (Math.PI / 180);
    let thickness = 2;
    if (i % 5 == 0) 
      thickness = 5;

    g.fillPoly(calcHandPolygon(300, thickness, phi), true);
    g.setColor(0, 0, 0);
    g.fillRect(10, 10, 2 * center.x - 10, 2 * center.x - 10);
    g.setColor(1, 1, 1);
  }
}

function calcHandPolygon(len, thickness, phi) {
  const x = center.x + Math.cos(phi) * len/2,
        y = center.y + Math.sin(phi) * len/2,
        d = {
          "d": 3,
          "x": thickness/2 * Math.cos(phi + Math.PI/2),
          "y": thickness/2 * Math.sin(phi + Math.PI/2)
        },
        polygon = [
          center.x - d.x,
          center.y - d.y,
          center.x + d.x,
          center.y + d.y,
          x + d.x,
          y + d.y,
          x - d.x, 
          y - d.y
        ];
  return polygon;
}


// ----- draw ----

function draw() {
  // draw black rectangle in the middle to clear screen from scale and hands
  g.setColor(0, 0, 0);
  g.fillRect(10, 10, 2 * center.x - 10, 2 * center.x - 10);

  g.setFontAlign(0, 0);
  drawNumbers();

  const date = new Date();
  if (settings.textAboveHands) {
    drawHands(date); 
    drawText(date);
  }
  else {
    drawText(date); 
    drawHands(date);
  }
  queueDraw();
}


function drawNumbers() {
  g.setFont("Vector", 20);

  const batteryState = calcAvgBatteryState();
  if (batteryState < 20)
    g.setColor(1, 0, 0);  // draw in red, if battery is low 
  else if (batteryState < 40)
    g.setColor(1, 1, 0);
  else
    g.setColor(1, 1, 1);

  g.setBgColor(0, 0, 0);
  for(let i = 0; i < 12; i++) {
    let hour = hourNumberPositions[i][0];
    if (settings.show24HourMode)
      hour *= 2;

    g.drawString(hour, hourNumberPositions[i][1], hourNumberPositions[i][2], true);
  }
}

function calcAvgBatteryState() {
  const n = lastBatteryStates.length;
  if (n == 0)
    return 100;

  let sum = lastBatteryStates.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / n);
}

function drawHands(date) {
  let m = date.getMinutes(),
      h = date.getHours(), 
      s = date.getSeconds();

  g.setColor(1, 1, 1);

  let numHoursForHourHand = settings.show24HourMode? 24 : 12;

  if (h > numHoursForHourHand)
    h = h - numHoursForHourHand;


  const hour_angle   = 2 * Math.PI / numHoursForHourHand * (h + m/60) - Math.PI/2,
        minute_angle = 2 * Math.PI / 60 * m - Math.PI/2,
        second_angle = 2 * Math.PI / 60 * s - Math.PI/2;

  const hourPolygon = calcHandPolygon(settings.shortHrHand ? 88 : 100, 5, hour_angle);
  g.fillPoly(hourPolygon, true);

  const minutePolygon = calcHandPolygon(150, 5, minute_angle);
  g.fillPoly(minutePolygon, true);

  if (unlock) {
    const secondPolygon = calcHandPolygon(150, 2, second_angle);
    g.fillPoly(secondPolygon, true);
  }
  g.fillCircle(center.x, center.y, 4);
}

function drawText(date) {
  if (!unlock)
    return;

  g.setBgColor(0, 0, 0);
  g.setColor(1, 1, 1);

  const today = new Date();
  const dateStr = formatDate(today);
  g.setFont("Vector", 16);
  g.drawString(dateStr, center.x + 5, center.y - 30, true);

  const batteryStr = calcAvgBatteryState() + "%";

  if (Bangle.isCharging())
    g.setBgColor(1, 0, 0);

  g.setFont("Vector", 24);
  g.drawString(batteryStr, center.x, center.y + 30, true);
}

function formatDate(date) {
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const month_names = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const day = date.getDate();
  const month_name = month_names[date.getMonth()];
  const weekday = weekdays[date.getDay()];

  return weekday + " " + day + ". " + month_name;
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
