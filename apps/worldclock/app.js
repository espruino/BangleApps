/* jshint esversion: 6 */
const timeFontSize = 6;
const dateFontSize = 3;
const gmtFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const xcol1=10;
const xcol2=g.getWidth()-xcol1;
const yposTime = 75;
const yposDate = 130;
//const yposYear = 175;
//const yposGMT = 220;
const yposWorld=170;


var offsets = require("Storage").readJSON("worldclock.settings.json");

// Check settings for what type our clock should be
//var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
var secondInterval = undefined;

function doublenum(x) {
  return x<10? "0"+x : ""+x;
}

function offset(dt,offset) {
  return new Date(dt.getTime() + (offset*60*60*1000));
}

function drawSimpleClock() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0], minutes = time[1];

  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, true);

  // draw Day, name of month, Date
  var date = [da[0], da[1], da[2]].join(" ");
  g.setFont(font, dateFontSize);

  g.drawString(date, xyCenter, yposDate, true);

  // draw year
  //g.setFont(font, dateFontSize);
  //g.drawString(d.getFullYear(), xyCenter, yposYear, true);

  // draw gmt
  //console.log(d.getTimezoneOffset());//offset to GMT in minutes
  var gmt = new Date(d.getTime()+(d.getTimezoneOffset()*60*1000));
  //gmt is now UTC+0
  
  for (var i=0; i<offsets.length; i++) {
    g.setFont(font, gmtFontSize);
    dx=offset(gmt,offsets[i][1]);
    hours=doublenum(dx.getHours());
    minutes=doublenum(dx.getMinutes());
    g.setFontAlign(-1, 0);
    g.drawString(offsets[i][0],xcol1,yposWorld+i*15, true);
    g.setFontAlign(1, 0);
    g.drawString(`${hours}:${minutes}`, xcol2, yposWorld+i*15, true);
    //g.drawString(gmt, xyCenter, yposWorld, true);
  }
}

// clean app screen
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// refesh every 15 sec when screen is on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(drawSimpleClock, 15E3);
    drawSimpleClock(); // draw immediately
  }
});

// draw now and every 15 sec until display goes off
drawSimpleClock();
if (Bangle.isLCDOn()) {
  secondInterval = setInterval(drawSimpleClock, 15E3);
}

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

