const is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
const locale = require("locale");

function padNum(n, l) {
  return ("0".repeat(l)+n).substr(-l);
}

var rects = {};
var rectsToClear = {};
var commands = [];
var showSeconds = true;

function pushCommand(command) {
  let hash = E.CRC32(E.toJS(arguments));
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

function drawVectorText(text, size, x, y, alignX, alignY) {
  g.setFont("Vector", size).setFontAlign(alignX, alignY).drawString(text, x, y);
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

  g.setFont("Vector", 256);
  let timeFontSize = g.getWidth() / ((g.stringWidth(timeText) / 256) + (Math.max(g.stringWidth(meridian), g.stringWidth(secondsText)) / 512 * 9 / 10));
  let dowFontSize = g.getWidth() / (g.stringWidth(dowText) / 256);
  let dateFontSize = g.getWidth() / (g.stringWidth(dateText) / 256);
  
  let timeHeight = g.setFont("Vector", timeFontSize).getFontHeight() * 9 / 10;
  let dowHeight = g.setFont("Vector", dowFontSize).getFontHeight();
  let dateHeight = g.setFont("Vector", dateFontSize).getFontHeight();
  
  let remainingHeight = g.getHeight() - 24 - timeHeight - dowHeight - dateHeight;
  let spacer = remainingHeight / 4;
  
  let y = 24 + spacer;
  
  pushCommand(drawVectorText, timeText, timeFontSize, 2, y, -1, -1);
  pushCommand(drawVectorText, meridian, timeFontSize*9/20, g.getWidth(), y, 1, -1);
  if (showSeconds) pushCommand(drawVectorText, secondsText, timeFontSize*9/20, g.getWidth(), y + timeHeight, 1, 1);
  y += timeHeight + spacer;
  
  pushCommand(drawVectorText, dowText, dowFontSize, g.getWidth()/2, y, 0, -1);
  y += dowHeight + spacer;
  
  pushCommand(drawVectorText, dateText, dateFontSize, g.getWidth()/2, y, 0, -1);
  
  executeCommands();
}

var timeout;

function tick() {
  draw();
  var period = showSeconds ? 1000 : 60 * 1000;
  timeout = setTimeout(tick, period - getTime() * 1000 % period);
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

g.clear();
tick();
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
Bangle.setUI("clock");
