/* jshint esversion: 6 */
const big = g.getWidth()>200;
const timeFontSize = big?6:5;
const dateFontSize = big?3:2;
const gmtFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = xyCenter*0.6;
const yposDate = xyCenter*1.1;
const yposYear = xyCenter*1.4;
const yposGMT = xyCenter*1.9;

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

function drawSimpleClock() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  var meridian = "";
  if (is12Hour) {
    hours = parseInt(hours,10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours>12) hours -= 12;
    }
    hours = (" "+hours).substr(-2);
  }

  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, true);
  g.setFont(font, gmtFontSize);
  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // draw Day, name of month, Date
  var date = [da[0], da[1], da[2]].join(" ");
  g.setFont(font, dateFontSize);

  g.drawString(date, xyCenter, yposDate, true);

  // draw year
  g.setFont(font, dateFontSize);
  g.drawString(d.getFullYear(), xyCenter, yposYear, true);

  // draw gmt
  var gmt = da[5];
  g.setFont(font, gmtFontSize);
  g.drawString(gmt, xyCenter, yposGMT, true);
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on) drawSimpleClock();
});

// clean app screen
g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();

// refesh every 15 sec
setInterval(drawSimpleClock, 15E3);

// draw now
drawSimpleClock();
