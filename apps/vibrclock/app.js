/* jshint esversion: 6 */
const timeFontSize = 6;
const dateFontSize = 3;
const gmtFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = 75;
const yposDate = 130;
const yposYear = 175;

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
var d, da, time, hours, minutes, meridian = "";

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
Bangle.loadWidgets();
Bangle.drawWidgets();

// refesh every 15 sec
setInterval(drawSimpleClock, 15E3);

// draw now
drawSimpleClock();

// vibrate 0..9
function vibrateDigit(num) {
  if (num==0) return Bangle.buzz(500);
  return new Promise(function f(resolve){
    if (num--<=0) return resolve();
    Bangle.buzz(100).then(()=>{
      setTimeout(()=>f(resolve), 200);
    });
  });
}
// vibrate multiple digits (num must be a string)
function vibrateNumber(num) {
  return new Promise(function f(resolve){
    if (!num.length) return resolve();
    var digit = num[0];
    num = num.substr(1);
    vibrateDigit(digit).then(()=>{
      setTimeout(()=>f(resolve),500);
    });
  });
}

var vibrateBusy;
function vibrateTime() {
  if (vibrateBusy) return;
  vibrateBusy = true;

  var d = new Date();
  var hours = d.getHours(), minutes = d.getMinutes();
  if (is12Hour) {
    if (hours == 0) hours = 12;
    else if (hours>12) hours -= 12;
  }

  vibrateNumber(hours.toString()).
    then(() => new Promise(resolve=>setTimeout(resolve,500))).
    then(() => vibrateNumber(minutes.toString())).
    then(() => vibrateBusy=false);
}



// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
// when BTN1 pressed, vibrate
setWatch(vibrateTime, BTN1, {repeat:true,edge:"rising"});
