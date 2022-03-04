/*
 * TIMER WIDGET
 *
 * This is a fork of the Chrono Widget, but implements a
 * simpler UI which to be able to set a timer faster with
 * less interaction. Additionally, it exposes some functions
 * that can be used by other apps or clocks to easily
 * implement a timer. It is used e.g. by lcars or notanalog.
 *
 * Creator: David Peer
 * Date: 02/2022
 */

Bangle.loadWidgets();


const storage = require('Storage');
let settings;

const screenWidth = g.getWidth();
const screenHeight = g.getHeight();
const cx = parseInt(screenWidth/2);
const cy = parseInt(screenHeight/2)-12;


function updateSettings() {
  var now = new Date();
  const goal = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
    now.getHours(), now.getMinutes() + settings.minutes, now.getSeconds());
  settings.goal = goal.getTime();
  storage.writeJSON('widtmr.json', settings);
  if (WIDGETS["widtmr"]) WIDGETS["widtmr"].reload();
}


function resetSettings() {
  settings = {
    hours : 0,
    minutes : 0,
    seconds : 0,
    started : false,
    counter : 0,
    goal : 0,
  };
  updateSettings();
}


settings = storage.readJSON('widtmr.json',1);
if (!settings) resetSettings();


setWatch(_=>load(), BTN1);
function draw(){
  g.clear(1);
  Bangle.drawWidgets();

  g.setFontAlign(0, 0, 0);
  g.setFont("Vector", 32).setFontAlign(0,-1);

  print(require("alarm").createTimer());

  var text = settings.minutes + " min.";
  var rectWidth = parseInt(g.stringWidth(text) / 2);

  if(settings.started){
    g.setColor("#ff0000");
  } else {
    g.setColor(g.theme.fg);
  }
  g.fillRect(cx-rectWidth-5, cy-5, cx+rectWidth, cy+30);

  g.setColor(g.theme.bg);
  g.drawString(text, cx, cy);
}

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.25);
  var right = g.getWidth() - left;
  var upper = parseInt(g.getHeight() * 0.25);
  var lower = g.getHeight() - upper;

  var isLeft = e.x < left;
  var isRight = e.x > right;
  var isUpper = e.y < upper;
  var isLower = e.y > lower;

  if(isRight){
    settings.minutes += 1;
    Bangle.buzz(40, 0.3);
  } else if(isLeft){
    settings.minutes -= 1;
    Bangle.buzz(40, 0.3);
  } else if(isUpper){
    settings.minutes += 5;
    Bangle.buzz(40, 0.3);
  } else if(isLower){
    settings.minutes -= 5;
    Bangle.buzz(40, 0.3);
  } else {
    settings.started = !settings.started;
    Bangle.buzz(120, 0.6);
  }

  if(settings.minutes <= 0){
    settings.minutes = 0;
    settings.started = false;
  }

  updateSettings();
  draw();
});

g.reset();
draw();