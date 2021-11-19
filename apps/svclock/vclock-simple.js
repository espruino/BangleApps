const locale = require("locale");

var timeFontSize;
var dateFontSize;
var gmtFontSize;
var font = "Vector";

var xyCenter = g.getWidth() / 2;
var yposTime;
var yposDate;
var yposYear;
var yposGMT;

if (g.getWidth() > 200) {
    timeFontSize = 65;
    dateFontSize = 20;
    gmtFontSize = 10;

    yposTime = 75;
    yposDate = 130;
    yposYear = 175;
    yposGMT = 220;
} else {
    timeFontSize = 48;
    dateFontSize = 15;
    gmtFontSize = 10;

    yposTime = 55;
    yposDate = 95;
    yposYear = 128;
    yposGMT = 161;
}
// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  g.clear();
  Bangle.drawWidgets();

  // get date
  var d = new Date();

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // drawTime
  var hours;
  if (is12Hour) {
    hours = ("0" + d.getHours()%12).slice(-2);
  } else {
    hours = ("0" + d.getHours()).slice(-2);
  }
  var minutes = ("0" + d.getMinutes()).slice(-2);

  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, true);

  if (is12Hour) {
    g.setFont(font, gmtFontSize);
    g.drawString(locale.meridian(d), xyCenter + 102, yposTime + 10, true);
  }

  // draw Day, name of month, Date
  g.setFont(font, dateFontSize);
  g.drawString([locale.dow(d,1), locale.month(d,1), d.getDate()].join(" "), xyCenter, yposDate, true);

  // draw year
  g.setFont(font, dateFontSize);
  g.drawString(d.getFullYear(), xyCenter, yposYear, true);

  // draw gmt
  g.setFont(font, gmtFontSize);
  g.drawString(d.toString().match(/GMT[+-]\d+/), xyCenter, yposGMT, true);

  queueDraw();
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when button pressed
Bangle.setUI("clock");
// clean app screen
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// draw now
draw();
