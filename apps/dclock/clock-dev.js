var locale = require("locale");
/* jshint esversion: 6 */
const big = g.getWidth()>200;
const timeFontSize = big?4:3;
const dateFontSize = big?3:2;
const smallFontSize = big?2:1;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = 50;
const yposDate = big?85:75;
const yposTst = big?115:95;
const yposDml = big?170:130;
const yposDayMonth = big?195:140;
const yposGMT = big?220:150;

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

function getUTCTime(d) {
  return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d)});
}

function drawSimpleClock() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");
  var dutc = getUTCTime(d);

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].split(":");
  var hours = time[0],
    minutes = time[1],
    seconds = time[2];

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

  // Time
  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, yposTime, true);
  g.setFont(font, smallFontSize);
  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // Date String
  g.setFont(font, dateFontSize);
  g.drawString(`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`, xyCenter, yposDate, true);

  // Timestamp
  var tst = Math.round(d.getTime());
  g.setFont(font, smallFontSize);
  g.drawString(`tst:${tst}`, xyCenter, yposTst, true);

  //Days in month
  var dom = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();

  //Days since full moon
  var knownnew = new Date(2020,2,24,9,28,0);

  // Get millisecond difference and divide down to cycles
  var cycles = (d.getTime()-knownnew.getTime())/1000/60/60/24/29.53;

  // Multiply decimal component back into days since new moon
  var sincenew = (cycles % 1)*29.53;

  // Draw days in month and sime since new moon
  g.setFont(font, smallFontSize);
  g.drawString(`md:${dom} l:${sincenew.toFixed(2)}`, xyCenter, yposDml, true);

  // draw Month name, Day of the week and beats
  var beats = Math.floor((((dutc[0] + 1) % 24) + dutc[1] / 60 + dutc[2] / 3600) * 1000 / 24);
  g.setFont(font, smallFontSize);
  g.drawString(`m:${locale.month(d,true)} d:${locale.dow(d,true)} @${beats}`, xyCenter, yposDayMonth, true);

  // draw gmt
  var gmt = da[5];
  g.setFont(font, smallFontSize);
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

// refesh every 100 milliseconds
setInterval(drawSimpleClock, 100);

// draw now
drawSimpleClock();
