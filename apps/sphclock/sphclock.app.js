// timeout used to update every minute
var drawTimeout;

const INIT = 0;
const TIMER = 1;
const CHARGE_CHANGE = 2;
const LOCK_CHANGE = 3;
const CALENDAR = 4;

require("sphclock.fonts.js");

// schedule a draw for the next minute
let queueDraw = function () {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw(TIMER);
  }, 60000 - (Date.now() % 60000));
};

let draw = function (condition) {
  var date = new Date();

  g.reset();

  if (condition == INIT || condition == undefined) {
    require("sphclock.background.js").drawBackground();
    require("sphclock.clock.js").drawClockBackground(53);
    require("sphclock.agenda.js").drawCalendar(date);
    require("sphclock.weather.js").drawWeather();
  }

  if (condition == INIT || condition == TIMER || condition == LOCK_CHANGE) {
    require("sphclock.clock.js").drawClock(date, 53);
    require("sphclock.lock.js").drawLocked();
  }
  if (condition == INIT || condition == TIMER || condition == CHARGE_CHANGE)
    require("sphclock.bateria.js").drawBattery(158, 7);

  queueDraw();
};

// Clear the screen once, at startup
g.clear();

// draw immediately at first, queue update
draw(INIT);

function touched_date() {}

Bangle.on("charging", function () {
  draw(CHARGE_CHANGE);
});

Bangle.on("lock", function () {
  draw(LOCK_CHANGE);
});

Bangle.on("touch", function (button, xy) {
  // Touch on date
  if (xy.x < 88 && xy.y < 53) {
    Bangle.buzz(100, 0.1).then(() => load("sphcalendar.app.js"));
  }

  // Touch on weather
  if (xy.x > 88 && xy.y < 53) {
    Bangle.buzz(100, 0.1).then(() => load("sphweather.app.js"));
  }

  // Touch on alarm
  if (xy.y > 53 && xy.y < 121) {
    Bangle.buzz(100, 0.1).then(() => load("alarm.app.js"));
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
