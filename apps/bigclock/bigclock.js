const REFRESH_RATE = 10000;

let interval;

function drawMoon(d) {
  const BLACK = 0,
    MOON = 0x41f,
    MC = 29.5305882,
    NM = 694039.09;
  var r = 12,
    mx = 215,
    my = 50;

  var moon = {
    // reset
    0: () => {
      g.reset()
        .setColor(BLACK)
        .fillRect(mx - r, my - r, mx + r, my + r);
    },
    // new moon
    1: () => {
      moon[0]();
      g.setColor(MOON).drawCircle(mx, my, r);
    },
    // 1/4 ascending
    2: () => {
      moon[3]();
      g.setColor(BLACK).fillEllipse(mx - r / 2, my - r, mx + r / 2, my + r);
    },
    // 1/2 ascending
    3: () => {
      moon[0]();
      g.setColor(MOON)
        .fillCircle(mx, my, r)
        .setColor(BLACK)
        .fillRect(mx, my - r, mx + r + r, my + r);
    },
    // 3/4 ascending
    4: () => {
      moon[7]();
      g.setColor(MOON).fillEllipse(mx - r / 2, my - r, mx + r / 2, my + r);
    },
    // Full moon
    5: () => {
      moon[0]();
      g.setColor(MOON).fillCircle(mx, my, r);
    },
    // 3/4 descending
    6: () => {
      moon[3]();
      g.setColor(MOON).fillEllipse(mx - r / 2, my - r, mx + r / 2, my + r);
    },
    // 1/2 descending
    7: () => {
      moon[0]();
      g.setColor(MOON)
        .fillCircle(mx, my, r)
        .setColor(BLACK)
        .fillRect(mx - r, my - r, mx, my + r);
    },
    // 1/4 descending
    8: () => {
      moon[7]();
      g.setColor(BLACK).fillEllipse(mx - r / 2, my - r, mx + r / 2, my + r);
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

  moon[moonPhase(d)]();
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
  g.clearRect(0, 24, 239, 239);
  g.setColor(1, 1, 1);
  g.setFont("Vector", 100);
  g.drawString(hours, 50, 24, true);
  g.setColor(1, 50, 1);
  g.drawString(minutes, 50, 135, true);
  g.setFont("Vector", 20);
  g.setRotation(3);
  g.drawString(`${dow} ${day} ${month}`, 50, 20, true);
  g.drawString(year, 85, 205, true);
  g.setRotation(0);
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
  }
});

Bangle.setLCDMode();

// Show launcher when middle button pressed
clearWatch();
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
setWatch(
  function() {
    load("calendar.app.js");
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
