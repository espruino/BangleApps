const is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
const locale = require("locale");
var settings = require('Storage').readJSON("vectorclock.json", true) || {};
var dowcol = settings.dowcol || g.theme.fg;
var timecol = settings.timecol || g.theme.fg;
var datecol = settings.datecol || g.theme.fg;
var chimetype = settings.chimetype;

function padNum(n, l) {
  return ("0".repeat(l)+n).substr(-l);
}

var rects = {};
var rectsToClear = {};
var commands = [];
var showSeconds = !Bangle.isLocked();

function pushCommand(command) {
  var hash = E.CRC32(E.toJS(arguments));
  if (!delete rectsToClear[hash]) {
    commands.push({hash: hash, command: Function.apply.bind(command, null, arguments.slice(1))});
  }
}

function executeCommands() {
  "ram";
  for (let hash in rectsToClear) delete rects[hash];
  for (let r of rectsToClear) if (r) g.clearRect(r.x1, r.y1, r.x2, r.y2);
  for (let c of commands) rects[c.hash] = c.command();
  rectsToClear = Object.assign({}, rects);
  commands = [];
}

function drawVectorText(text, size, x, y, alignX, alignY, color) {
  g.setFont("Vector", size).setColor(color).setFontAlign(alignX, alignY).drawString(text, x, y);
  var m = g.stringMetrics(text);
  return {
    x1: x - m.width * (alignX / 2 + 0.5),
    y1: y - m.height * (alignY / 2 + 0.5),
    x2: x - m.width * (alignX / 2 - 0.5),
    y2: y - m.height * (alignY / 2 - 0.5)
  };
}

function draw() {
  g.reset();

  let d = new Date();
  let hours = is12Hour ? ((d.getHours() + 11) % 12) + 1 : d.getHours();
  let timeText = `${hours}:${padNum(d.getMinutes(), 2)}`;
  let meridian = is12Hour ? ((d.getHours() < 12) ? "AM" : "PM") : "";
  let secondsText = padNum(d.getSeconds(), 2);
  let dowText = locale.dow(d);
  let dateText = locale.date(d, true);
  let width = g.getWidth() - 2;

  g.setFont("Vector", 256);
  let timeFontSize = width / ((g.stringWidth(timeText) / 256) + (Math.max(g.stringWidth(meridian), g.stringWidth(secondsText)) / 512 * 9 / 10));
  let dowFontSize = width / (g.stringWidth(dowText) / 256);
  let dateFontSize = width / (g.stringWidth(dateText) / 256);

  let timeHeight = g.setFont("Vector", timeFontSize).getFontHeight() * 9 / 10;
  let dowHeight = g.setFont("Vector", dowFontSize).getFontHeight();
  let dateHeight = g.setFont("Vector", dateFontSize).getFontHeight();

  let remainingHeight = g.getHeight() - 24 - timeHeight - dowHeight - dateHeight;
  let spacer = remainingHeight / 4;

  let x = 2;
  let y = 24 + spacer;

  pushCommand(drawVectorText, timeText, timeFontSize, x, y, -1, -1, timecol);
  pushCommand(drawVectorText, meridian, timeFontSize*9/20, x + width, y, 1, -1, timecol);
  if (showSeconds) pushCommand(drawVectorText, secondsText, timeFontSize*9/20, x + width, y + timeHeight, 1, 1, timecol);
  y += timeHeight + spacer;

  pushCommand(drawVectorText, dowText, dowFontSize, x + width/2, y, 0, -1, dowcol);
  y += dowHeight + spacer;

  pushCommand(drawVectorText, dateText, dateFontSize, x + width/2, y, 0, -1, datecol);

  executeCommands();

  if (process.env.HWVERSION==2) Bangle.drawWidgets();
}

var timeout;

function tick() {
  draw();
  var period = showSeconds ? 1000 : 60 * 1000;
  timeout = setTimeout(tick, period - getTime() * 1000 % period);
}

// ====================================== Vibration (taken from "Vibrate Clock")
// vibrate 0..9
function vibrateDigitBuzz(num) {
  if (num==0) return Bangle.buzz(500);
  return new Promise(function f(resolve){
    if (num--<=0) return resolve();
    Bangle.buzz(100).then(()=>{
      setTimeout(()=>f(resolve), 200);
    });
  });
}
function vibrateDigitBeep(num) {
  if (num==0) return Bangle.beep(500);
  return new Promise(function f(resolve){
    if (num--<=0) return resolve();
    Bangle.beep(100).then(()=>{
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
    if ("buzz"==chimetype)
      vibrateDigitBuzz(digit).then(()=>{
        setTimeout(()=>f(resolve),500);});
    if ("beep"==chimetype)
      vibrateDigitBeep(digit).then(()=>{
        setTimeout(()=>f(resolve),500);});
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


Bangle.on('lcdPower', function(on) {
  if (timeout) clearTimeout(timeout);
  timeout = null;
  if (on) tick();
});

Bangle.on('lock', function(locked) {
  if (timeout) clearTimeout(timeout);
  timeout = null;
  showSeconds = !locked;
  tick();
});

if ("buzz"==chimetype || "beep"==chimetype)
  Bangle.on("swipe",function(direction){
    if (0==direction) vibrateTime();});  // 0 = swipe up/down

g.clear();
tick();
Bangle.setUI("clock"); // Show launcher when middle button is pressed
Bangle.loadWidgets();
Bangle.drawWidgets();
