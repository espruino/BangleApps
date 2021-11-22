const locale = require("locale");
const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];

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
  const year = now.getFullYear();

  const month2 = locale.month(now, 3);
  const day2 = locale.dow(now, 3);

  g.setFontAlign(1, 0).setFont("Vector", 90 * scale);
  g.drawString(hour, center.x + 32 * scale, center.y - 31 * scale);
  g.drawString(minutes, center.x + 32 * scale, center.y + 46 * scale);

  g.fillRect(center.x + 30 * scale, center.y - 72 * scale, center.x + 32 * scale, center.y + 74 * scale);

  g.setFontAlign(-1, 0).setFont("Vector", 16 * scale);
  g.drawString(year, center.x + 40 * scale, center.y - 62 * scale);
  g.drawString(month, center.x + 40 * scale, center.y - 44 * scale);
  g.drawString(day, center.x + 40 * scale, center.y - 26 * scale);
  g.drawString(month2, center.x + 40 * scale, center.y + 48 * scale);
  g.drawString(day2, center.x + 40 * scale, center.y + 66 * scale);
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