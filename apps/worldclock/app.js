/* jshint esversion: 6 */

// Font for primary time and date
const primaryTimeFontSize = 6;
const primaryDateFontSize = 3;

// Font for single secondary time
const secondaryTimeFontSize = 4;
const secondaryTimeZoneFontSize = 2;

// Font / columns for multiple secondary times
const secondaryRowColFontSize = 2;
const xcol1 = 10;
const xcol2 = g.getWidth() - xcol1;

const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = 75;
const yposDate = 130;
const yposWorld = 170;

const OFFSET_TIME_ZONE = 0;
const OFFSET_HOURS = 1;

var offsets = require("Storage").readJSON("worldclock.settings.json") || [];

// TESTING CODE
// Used to test offset array values during development.
// Uncomment to override secondary offsets value

// const mockOffsets = {
//   zeroOffsets: [],
//   oneOffset: [["UTC", 0]],
//   twoOffsets: [
//     ["Tokyo", 9],
//     ["UTC", 0],
//   ],
//   fourOffsets: [
//     ["Tokyo", 9],
//     ["UTC", 0],
//     ["Denver", -7],
//     ["Miami", -5],
//   ],
//   fiveOffsets: [
//     ["Tokyo", 9],
//     ["UTC", 0],
//     ["Denver", -7],
//     ["Chicago", -6],
//     ["Miami", -5],
//   ],
// };

// Uncomment one at a time to test various offsets array scenarios
// offsets = mockOffsets.zeroOffsets; // should render nothing below primary time
// offsets = mockOffsets.oneOffset; // should render larger in two rows
// offsets = mockOffsets.twoOffsets; // should render two in columns
// offsets = mockOffsets.fourOffsets; // should render in columns
// offsets = mockOffsets.fiveOffsets; // should render first four in columns

// END TESTING CODE

// Check settings for what type our clock should be
//var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
var secondInterval;

function doublenum(x) {
  return x < 10 ? "0" + x : "" + x;
}

function getCurrentTimeFromOffset(dt, offset) {
  return new Date(dt.getTime() + offset * 60 * 60 * 1000);
}

function drawSimpleClock() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");

  // default draw styles
  g.reset();

  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];

  g.setFont(font, primaryTimeFontSize);
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, true);

  // draw Day, name of month, Date
  var date = [da[0], da[1], da[2]].join(" ");
  g.setFont(font, primaryDateFontSize);

  g.drawString(date, xyCenter, yposDate, true);

  // set gmt to UTC+0
  var gmt = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);

  // Loop through offset(s) and render
  offsets.forEach((offset, index) => {
    dx = getCurrentTimeFromOffset(gmt, offset[OFFSET_HOURS]);
    hours = doublenum(dx.getHours());
    minutes = doublenum(dx.getMinutes());

    if (offsets.length === 1) {
      // For a single secondary timezone, draw it bigger and drop time zone to second line
      const xOffset = 30;
      g.setFont(font, secondaryTimeFontSize);
      g.drawString(`${hours}:${minutes}`, xyCenter, yposTime + 100, true);
      g.setFont(font, secondaryTimeZoneFontSize);
      g.drawString(offset[OFFSET_TIME_ZONE], xyCenter, yposTime + 130, true);

      // draw Day, name of month, Date
      g.setFont(font, secondaryTimeZoneFontSize);
      g.drawString(date, xyCenter, yposDate, true);
    } else if (index < 4) {
      // For > 1 extra timezones, render as columns / rows
      g.setFont(font, secondaryRowColFontSize);
      g.setFontAlign(-1, 0);
      g.drawString(
        offset[OFFSET_TIME_ZONE],
        xcol1,
        yposWorld + index * 15,
        true
      );
      g.setFontAlign(1, 0);
      g.drawString(`${hours}:${minutes}`, xcol2, yposWorld + index * 15, true);
    }
  });
}

// clean app screen
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// refesh every 15 sec when screen is on
Bangle.on("lcdPower", (on) => {
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(drawSimpleClock, 15e3);
    drawSimpleClock(); // draw immediately
  }
});

// draw now and every 15 sec until display goes off
drawSimpleClock();
if (Bangle.isLCDOn()) {
  secondInterval = setInterval(drawSimpleClock, 15e3);
}

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
