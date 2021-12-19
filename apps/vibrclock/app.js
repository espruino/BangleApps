// Simple clock from https://www.espruino.com/Bangle.js+Clock
// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
// position on screen
const big = g.getWidth()>200;
const X = big?160:135, Y = big?140:100;

function draw() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  if (is12Hour) {
    if (h == 0) h = 12;
    else if (h>12) h -= 12;
  }
  var time = (" "+h).substr(-2) + ":" + ("0"+m).substr(-2);
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",4);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, X, Y, true /*clear background*/);
  // draw the seconds (2x size 7 segment)
  g.setFont("7x11Numeric7Seg",2);
  g.drawString(("0"+d.getSeconds()).substr(-2), X+35, Y, true /*clear background*/);
  // draw the date, in a normal font
  g.setFont("6x8", big?3:2);
  g.setFontAlign(0,1); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, Y+35, true /*clear background*/);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  }
});

// Show launcher when button pressed
Bangle.setUI("clockupdown", btn=>{
  if (btn==0) vibrateTime();
});
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// ====================================== Vibration
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
