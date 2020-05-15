const REFRESH_RATE = 1000;

let interval;
let lastMoonPhase;
let lastMinutes;

const moonR = 12;
const moonX = 215;
const moonY = 50;

const settings = require("Storage").readJSON("largeclock.json", 1);
const BTN1app = settings.BTN1 || "";
const BTN3app = settings.BTN3 || "";

function drawMoon(d) {
  const BLACK = 0,
    MOON = 0x41f,
    MC = 29.5305882,
    NM = 694039.09;

  var moon = {
    // reset
    0: () => {
      g.setColor(BLACK).fillRect(
        moonX - moonR,
        moonY - moonR,
        moonX + moonR,
        moonY + moonR
      );
    },
    // new moon
    1: () => {
      moon[0]();
      g.setColor(MOON).drawCircle(moonX, moonY, moonR);
    },
    // 1/4 ascending
    2: () => {
      moon[3]();
      g.setColor(BLACK).fillEllipse(
        moonX - moonR / 2,
        moonY - moonR,
        moonX + moonR / 2,
        moonY + moonR
      );
    },
    // 1/2 ascending
    3: () => {
      moon[0]();
      g.setColor(MOON)
        .fillCircle(moonX, moonY, moonR)
        .setColor(BLACK)
        .fillRect(moonX, moonY - moonR, moonX + moonR + moonR, moonY + moonR);
    },
    // 3/4 ascending
    4: () => {
      moon[3]();
      g.setColor(MOON).fillEllipse(
        moonX - moonR / 2,
        moonY - moonR,
        moonX + moonR / 2,
        moonY + moonR
      );
    },
    // Full moon
    5: () => {
      moon[0]();
      g.setColor(MOON).fillCircle(moonX, moonY, moonR);
    },
    // 3/4 descending
    6: () => {
      moon[7]();
      g.setColor(MOON).fillEllipse(
        moonX - moonR / 2,
        moonY - moonR,
        moonX + moonR / 2,
        moonY + moonR
      );
    },
    // 1/2 descending
    7: () => {
      moon[0]();
      g.setColor(MOON)
        .fillCircle(moonX, moonY, moonR)
        .setColor(BLACK)
        .fillRect(moonX - moonR, moonY - moonR, moonX, moonY + moonR);
    },
    // 1/4 descending
    8: () => {
      moon[7]();
      g.setColor(BLACK).fillEllipse(
        moonX - moonR / 2,
        moonY - moonR,
        moonX + moonR / 2,
        moonY + moonR
      );
    }
  };

  function moonPhase(d) {
    var tmp,
      month = d.getMonth(),
      year = d.getFullYear(),
      day = d.getDate();
    if (month < 3) {
      year--;
      month += 12;
    }
    tmp = (365.25 * year + 30.6 * ++month + day - NM) / MC;
    return Math.round((tmp - (tmp | 0)) * 7 + 1);
  }

  const currentMoonPhase = moonPhase(d);
  if (currentMoonPhase != lastMoonPhase) {
    moon[currentMoonPhase]();
    lastMoonPhase = currentMoonPhase;
  }
}

function drawTime(d) {
  const da = d.toString().split(" ");
  const time = da[4].substr(0, 5).split(":");
  const dow = da[0];
  const month = da[1];
  const day = da[2];
  const year = da[3];
  const hours = time[0];
  const minutes = time[1];
  const seconds = d.getSeconds();
  if (minutes != lastMinutes) {
    g.clearRect(0, 24, moonX - moonR - 10, 239);
    g.setColor(1, 1, 1);
    g.setFontAlign(-1, -1);
    g.setFont("Vector", 100);
    g.drawString(hours, 50, 24, true);
    g.setColor(1, 50, 1);
    g.drawString(minutes, 50, 135, true);
    g.setFont("Vector", 20);
    g.setRotation(3);
    g.drawString(`${dow} ${day} ${month}`, 50, 15, true);
    g.drawString(year, 75, 205, true);
    lastMinutes = minutes;
  }
  g.setRotation(0);
  g.setFont("Vector", 20);
  g.setColor(1, 1, 1);
  g.setFontAlign(0, -1);
  g.clearRect(200, 210, 240, 240);
  g.drawString(seconds, 215, 215);
}

function drawClockFace() {
  const d = new Date();
  drawTime(d);
  drawMoon(d);
}

Bangle.on("lcdPower", function(on) {
  if (on) {
    g.clear();
    Bangle.drawWidgets();
    drawClockFace();
    interval = setInterval(drawClockFace, REFRESH_RATE);
  } else {
    clearInterval(interval);
    lastMinutes = undefined;
    lastMoonPhase = undefined;
  }
});

Bangle.setLCDMode();

// Show launcher when middle button pressed
clearWatch();
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
if (BTN1app) setWatch(
  function() {
    load(BTN1app);
  },
  BTN1,
  { repeat: false, edge: "rising" }
);
if (BTN3app) setWatch(
  function() {
    load(BTN3app);
  },
  BTN3,
  { repeat: false, edge: "rising" }
);

g.clear();
clearInterval();
drawClockFace();
interval = setInterval(drawClockFace, REFRESH_RATE);

Bangle.loadWidgets();
Bangle.drawWidgets();
