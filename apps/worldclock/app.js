const big = g.getWidth()>200;
// Font for primary time and date
const primaryTimeFontSize = big?6:5;
const primaryDateFontSize = big?3:2;

// Font for single secondary time
const secondaryTimeFontSize = 4;
const secondaryTimeZoneFontSize = 2;

// Font / columns for multiple secondary times
const secondaryRowColFontSize = 2;
const xcol1 = 10;
const xcol2 = g.getWidth() - xcol1;

const font = "6x8";

/* TODO: we could totally use 'Layout' here and
avoid a whole bunch of hard-coded offsets */


const xyCenter = g.getWidth() / 2;
const yposTime = big ? 75 : 60;
const yposTime2 = yposTime + (big ? 100 : 60);
const yposDate = big ? 130 : 90;
const yposWorld = big ? 170 : 120;

const OFFSET_TIME_ZONE = 0;
const OFFSET_HOURS = 1;

var offsets = require("Storage").readJSON("worldclock.settings.json") || [];

// TESTING CODE
// Used to test offset array values during development.
// Uncomment to override secondary offsets value
/*
const mockOffsets = {
 zeroOffsets: [],
 oneOffset: [["UTC", 0]],
 twoOffsets: [
   ["Tokyo", 9],
   ["UTC", 0],
 ],
 fourOffsets: [
   ["Tokyo", 9],
   ["UTC", 0],
   ["Denver", -7],
   ["Miami", -5],
 ],
 fiveOffsets: [
   ["Tokyo", 9],
   ["UTC", 0],
   ["Denver", -7],
   ["Chicago", -6],
   ["Miami", -5],
   ],
};*/

// Uncomment one at a time to test various offsets array scenarios
//offsets = mockOffsets.zeroOffsets; // should render nothing below primary time
//offsets = mockOffsets.oneOffset; // should render larger in two rows
//offsets = mockOffsets.twoOffsets; // should render two in columns
//offsets = mockOffsets.fourOffsets; // should render in columns
//offsets = mockOffsets.fiveOffsets; // should render first four in columns

// END TESTING CODE

// Check settings for what type our clock should be
//var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

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

function getCurrentTimeFromOffset(dt, offset) {
  return new Date(dt.getTime() + offset * 60 * 60 * 1000);
}

function draw() {
  // get date
  var d = new Date();

  // default draw styles
  g.reset();

  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = require("locale").time(d, 1);
  g.setFont(font, primaryTimeFontSize);

  const fontHeight = g.getFontHeight();
  g.clearRect(0, yposTime - fontHeight / 2, g.getWidth(), yposTime + fontHeight / 2);
  g.drawString(`${time}`, xyCenter, yposTime, true);
  var month = require("locale").month(d, 1);
  var dayweek = require("locale").dow(d, 1)
  var day = d.getDate();
  var date = [dayweek, month, day].join(" ");
  g.setFont(font, primaryDateFontSize);
  g.drawString(date, xyCenter, yposDate, true);

  // set gmt to UTC+0
  var gmt = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);

  // Loop through offset(s) and render
  offsets.forEach((offset, index) => {
    const dx = getCurrentTimeFromOffset(gmt, offset[OFFSET_HOURS]);
    var time = require("locale").time(dx, 1);

    if (offsets.length === 1) {
      // For a single secondary timezone, draw it bigger and drop time zone to second line
      g.setFont(font, secondaryTimeFontSize);
      g.drawString(time, xyCenter, yposTime2, true);
      g.setFont(font, secondaryTimeZoneFontSize);
      g.drawString(offset[OFFSET_TIME_ZONE], xyCenter, yposTime2 + 30, true);

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
      g.drawString(time, xcol2, yposWorld + index * 15, true);
    }
  });

  queueDraw();
}

// clean app screen
g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// draw now
draw();
