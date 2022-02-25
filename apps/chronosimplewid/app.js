Bangle.loadWidgets();


const storage = require('Storage');
let settingsChronowid;

const screenWidth = g.getWidth();
const screenHeight = g.getHeight();
const cx = parseInt(screenWidth/2);
const cy = parseInt(screenHeight/2);


function updateSettings() {
  var now = new Date();
  const goal = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
    now.getHours(), now.getMinutes() + settingsChronowid.minutes, now.getSeconds());
  settingsChronowid.goal = goal.getTime();
  storage.writeJSON('chronosimplewid.json', settingsChronowid);
  if (WIDGETS["chronowid"]) WIDGETS["chronowid"].reload();
}


function resetSettings() {
  settingsChronowid = {
    hours : 0,
    minutes : 0,
    seconds : 0,
    started : false,
    counter : 0,
    goal : 0,
  };
  updateSettings();
}


settingsChronowid = storage.readJSON('chronosimplewid.json',1);
if (!settingsChronowid) resetSettings();


setWatch(_=>load(), BTN1);
function draw(){
  g.clear(1);
  Bangle.drawWidgets();

  g.setFontAlign(0, 0, 0);
  g.setFont("Vector", 32).setFontAlign(0,-1);
  var text = settingsChronowid.minutes + " min.";
  var rectWidth = parseInt(g.stringWidth(text) / 2);

  if(settingsChronowid.started){
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
    settingsChronowid.minutes += 1;
    Bangle.buzz(40, 0.3);
  } else if(isLeft){
    settingsChronowid.minutes -= 1;
    Bangle.buzz(40, 0.3);
  } else if(isUpper){
    settingsChronowid.minutes += 5;
    Bangle.buzz(40, 0.3);
  } else if(isLower){
    settingsChronowid.minutes -= 5;
    Bangle.buzz(40, 0.3);
  } else {
    settingsChronowid.started = !settingsChronowid.started;
    Bangle.buzz(120, 0.6);
  }

  if(settingsChronowid.minutes <= 0){
    settingsChronowid.minutes = 0;
    settingsChronowid.started = false;
  }

  updateSettings();
  draw();
});

g.reset();
draw();