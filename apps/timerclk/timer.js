var timerclk = require("timerclk.lib.js");
const height = g.getHeight(), width = g.getWidth();

var all = require("Storage").readJSON("timerclk.timer.json") || [];
var settings = require('Storage').readJSON("timerclk.json", true) || {};
settings = Object.assign({
  "font":"Vector",
  "fontSize":40,
  "indexFont":"6x8",
  "indexFontSize":3,
  "buttonHeight":40,
  "vibrate":4,
}, settings = settings.timer||{});
var defaultElement = {time:300000, start:null, timeAdd:0};

var current = 0;
var editIndex = 0;
var drawInterval;
var drawIntervalTimeout;
var buttons;
var dragBorderHrsMins=0, dragBorderMinsSecs=0;

function update() {
  if (drawInterval) clearInterval(drawInterval);
  if (drawIntervalTimeout) clearTimeout(drawIntervalTimeout);
  if (all[current].start) {
    drawIntervalTimeout = setTimeout(() => {drawInterval = setInterval(draw, 1000); draw();}, 1000 - (timerclk.getTime(all[current]) % 1000));
  } else {
    drawInterval = null;
    drawIntervalTimeout = null;
  }
  draw();
  drawButtons();
}
function play() {
  if (all[current].start) { // running
    all[current].timeAdd = Date.now() - all[current].start;
    all[current].start = null;
    update();
  } else { // paused
    all[current].start = Date.now() - all[current].timeAdd;
    all[current].timeAdd = 0;
    update();
  }
  require("Storage").write("timerclk.timer.json",JSON.stringify(all));
  timerclkCheckTimers();
}
function reset() {
  all[current].start = null;
  all[current].timeAdd = 0;
  update();
  require("Storage").write("timerclk.timer.json",JSON.stringify(all));
  timerclkCheckTimers();
}
function remove() {
  all.splice(current, 1);
  if (current == all.length) current--;
  if (all.length == 0) {
    all.push(defaultElement.clone());
    current++;
  }
  update();
  require("Storage").write("timerclk.timer.json",JSON.stringify(all));
  timerclkCheckTimers();
}

function edit(position, change) {
  if (position == 1) all[current].time += change*1000;
  else if (position == 2) all[current].time += change*60000;
  else if (position == 3) all[current].time += change*3600000;
  require("Storage").write("timerclk.timer.json",JSON.stringify(all));
  timerclkCheckTimers();
}

var buttonsRunning = {
  reset: {pos:[0, height-settings.buttonHeight, width/2, height], callback: reset, img: timerclk.reset_img, col:"#f50"},
  play: {pos:[width/2, height-settings.buttonHeight, width, height], callback: play, img: timerclk.play_img, col:"#0ff"},
};
var buttonsNormal = {
  reset: {pos:[0, height-settings.buttonHeight, width/2, height], callback: remove, img: timerclk.remove_img, col:buttonsRunning.reset.col},
  play: {pos:[width/2, height-settings.buttonHeight, width, height], callback: play, img: timerclk.play_img, col:buttonsRunning.play.col},
};
buttons = buttonsNormal;


function drawButtons() {
  if (all[current].start || all[current].timeAdd) {
    buttons = buttonsRunning;
    if (all[current].start) {
      buttons.play.img = timerclk.pause_img;
    } else {
      buttons.play.img = timerclk.play_img;
    }
  } else {
    buttons = buttonsNormal;
  }
  for (var button of buttons) {
    g.setColor(button.col);
    g.fillRect(button.pos[0], button.pos[1], button.pos[2], button.pos[3]);
    g.setColor("#000");
    // scale 24px images
    let iw = settings.buttonHeight-10;
    var scale = iw/24;
    let ix = button.pos[0] + ((button.pos[2]-button.pos[0] - iw) /2);
    let iy = button.pos[1] + ((button.pos[3]-button.pos[1] - iw) /2);
    g.drawImage(button.img, ix, iy, {scale: scale});
  }
}

function draw() {
  var x = g.getWidth()/2;
  var y = g.getHeight()/2;
  g.reset();
  
  var time = all[current].time - timerclk.getTime(all[current]);
  g.clearRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2-settings.buttonHeight);
  g.setFontAlign(0,0).setFont(settings.indexFont, settings.indexFontSize);
  g.drawString(current+1, x, Bangle.appRect.y + (g.stringMetrics("0").height/2));
  g.setFontAlign(0,0).setFont(settings.font, settings.fontSize);
  var timeStr = timerclk.formatTime(time, false, false, true);
  g.drawString(timeStr,x,y);
  
  var start = (width-g.stringMetrics(timeStr).width)/2;
  timeStr = timeStr.split(":");
  var markerPosChange = g.stringMetrics("__").width/2;
  if (editIndex == 3) x = start + g.stringMetrics(timeStr[0]).width - markerPosChange;
  else if (editIndex == 2) x = start + g.stringMetrics(timeStr[0]+":"+timeStr[1]).width - markerPosChange;
  else if (editIndex == 1) x = start + g.stringMetrics(timeStr[0]+":"+timeStr[1]+":"+timeStr[2]).width - markerPosChange;
  else x = 0;
  if (x) g.drawString("__", x, y);
  dragBorderHrsMins = start+g.stringMetrics(timeStr[0]).width+g.stringMetrics(":").width/2;
  dragBorderMinsSecs = start+g.stringMetrics(timeStr[0]+":"+timeStr[1]).width+g.stringMetrics(":").width/2;
}

if (all.length == 0) {
  all.push(defaultElement.clone());
}
timerclk.registerControls(this);
Bangle.loadWidgets();
Bangle.drawWidgets();
update();
