const locale = require("locale");
const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];
const CFG = require('Storage').readJSON("ffcniftya.json", 1) || {showWeekNum: true};

/* Clock *********************************************/
const scale = g.getWidth() / 176;

const widget = 24;

const viewport = {
  width: g.getWidth(),
  height: g.getHeight(),
}

const center = {
  x: viewport.width / 2,
  y: Math.round(((viewport.height - widget) / 2) + widget),
}

function ISO8601_week_no(date) { //copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
    var tdt = new Date(date.valueOf());
    var dayn = (date.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function d02(value) {
  return ('0' + value).substr(-2);
}

function draw() {
  g.reset();
  g.clearRect(0, widget, viewport.width, viewport.height);
  const now = new Date();

  const hour = d02(now.getHours() - (is12Hour && now.getHours() > 12 ? 12 : 0));
  const minutes = d02(now.getMinutes());
  const day = d02(now.getDate());
  const month = d02(now.getMonth() + 1);
  const year = now.getFullYear(now);
  const weekNum = d02(ISO8601_week_no(now));
  const monthName = locale.month(now, 3);
  const dayName = locale.dow(now, 3);

  const centerTimeScaleX = center.x + 32 * scale;
  g.setFontAlign(1, 0).setFont("Vector", 90 * scale);
  g.drawString(hour, centerTimeScaleX, center.y - 31 * scale);
  g.drawString(minutes, centerTimeScaleX, center.y + 46 * scale);

  g.fillRect(center.x + 30 * scale, center.y - 72 * scale, center.x + 32 * scale, center.y + 74 * scale);

  const centerDatesScaleX = center.x + 40 * scale;
  g.setFontAlign(-1, 0).setFont("Vector", 16 * scale);
  g.drawString(year, centerDatesScaleX, center.y - 62 * scale);
  g.drawString(month, centerDatesScaleX, center.y - 44 * scale);
  g.drawString(day, centerDatesScaleX, center.y - 26 * scale);
  if (CFG.showWeekNum) g.drawString(d02(ISO8601_week_no(now)), centerDatesScaleX, center.y + 15 * scale);
  g.drawString(monthName, centerDatesScaleX, center.y + 48 * scale);
  g.drawString(dayName, centerDatesScaleX, center.y + 66 * scale);
}


/* Minute Ticker *************************************/

let tickTimer;

function clearTickTimer() {
  if (tickTimer) {
    clearTimeout(tickTimer);
    tickTimer = undefined;
  }
}

function queueNextTick() {
  clearTickTimer();
  tickTimer = setTimeout(tick, 60000 - (Date.now() % 60000));
  // tickTimer = setTimeout(tick, 3000);
}

function tick() {
  draw();
  queueNextTick();
}

/* Init **********************************************/

// Clear the screen once, at startup
g.clear();
// Start ticking
tick();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', (on) => {
  if (on) {
    tick(); // Start ticking
  } else {
    clearTickTimer(); // stop ticking
  }
});

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
Bangle.setUI("clock");