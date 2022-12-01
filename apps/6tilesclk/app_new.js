var ClockFace = require("ClockFace");

var tileRect = [
  { x: 1, y: 100, w: 55, h: 35, x2: 56, y2: 135},
  { x: 60, y: 100, w: 55, h: 35, x2: 115, y2: 135},
  { x: 119, y: 100, w: 55, h: 35, x2: 174, y2: 135},
  { x: 1, y: 139, w: 55, h: 35, x2: 56, y2: 174},
  { x: 60, y: 139, w: 55, h: 35, x2: 115, y2: 174},
  { x: 119, y: 139, w: 55, h: 35, x2: 174, y2: 174}
];

/*** get functions ***/
// define function to get a fields value
function getValue(field, time) {
  switch(field) {
    case "hour": {
      return ((clock.leading0 ? "0" : " ") + (clock.is12Hour ?
        require("locale").time(time).split(":")[0] : time.getHours()
      )).substr(-2) + ":";
    }
    case "date": { // short local date
      return require("locale").date(time, 1);
    }
    case "dow": { // first 2 letters of the day of the week
      //return require("locale").dow(time, 1).substr(0, 2);
      return require("date_utils").dows(0, 1)[time.getDay()];
    }
    case "woy": { // week of the year
      var yf = new Date(time.getFullYear(), 0, 1);
      var dpy = Math.ceil((time - yf) / 86400000);
      var woy = (" " + Math.ceil((dpy + (yf.getDay() - 11) % 7 + 3) / 7)).slice(-2);
      return (clock.woy || (/*LANG*/"Week").substr(0, 1)) + woy;
    }
    case "steps": { // steps of the day
      return Bangle.getHealthStatus("day").steps;
    }
    default: return "";
  }
}

/*** draw functions ***/
function drawFrame() {
  g.reset().setColor(clock.lineColor);
  g.drawRect(-1, 25, 176, 43);
  g.drawRect(-1, 98, 176, 137);
  g.drawRect(58, 98, 117, 176);
}
function drawDate(time) {
  var values = clock.dateLine.map(s => getValue(s, time));
  g.reset().clearRect(1, 27, 174, 41).setFont12x20().getModified(true);
  var w0 = (g.setFontAlign(-1).drawString(values[0], 1, 36).getModified(true) || {}).x2 || 0;
  var w2 = (g.setFontAlign(1).drawString(values[2], 176, 36).getModified(true) || {}).x1 || 175;
  g.setFontAlign(0, 0).drawString(values[1], (w0 + w2) / 2 + 1.4, 36);
}
function drawHour(time) {
  g.reset().clearRect(2, 46, 99, 95).setFont("Vector:66").setFontAlign(1);
  g.drawString(getValue("hour", time), 100, 75);
  if (clock.is12Hour) g.setFont6x15().setFontAlign().drawString(require("locale").meridian(time), 88, 54);
}
function drawMinute(time) {
  g.reset().clearRect(100, 46, 173, 95).setFont("Vector:66").setFontAlign(1);
  g.drawString(("0" + time.getMinutes()).substr(-2), 182, 75);
}
function drawTile(tile) {
  var rect = tileRect[tile];
  var center = {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2
  };
  g.reset().clearRect(rect).setFont12x20();
  g.setFontAlign().drawString("t" + tile, center.x, center.y);
}

var clock = new ClockFace({
  draw: function(time, changed) {
    g.setColor(1, 0, 1).fillRect(Bangle.appRect);
    drawFrame();
    [0,1,2,3,4,5].forEach(tile => drawTile(tile));
    this.update(time, changed);
  },
  update: function(time, changed) {
    if (changed.d) {
      drawDate(time);
    }
    if (changed.h) {
      drawHour(time);
    }
    if (changed.m) {
      drawMinute(time);
    }
  },
  settingsFile: "6tilesclk.settings.json"
});

clock.start();