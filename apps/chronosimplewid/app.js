Bangle.loadWidgets();


const storage = require('Storage');
let settingsChronowid;

const screenWidth = g.getWidth();
const screenHeight = g.getHeight();
const screenHalfWidth = parseInt(screenWidth/2);
const screenHalfHeight = parseInt(screenHeight/2);


function updateSettings() {
  var now = new Date();
  const goal = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
    now.getHours() + settingsChronowid.hours, now.getMinutes() + settingsChronowid.minutes, now.getSeconds() + settingsChronowid.seconds);
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

  g.setColor(g.theme.fg);
  g.setFont("Vector", 26).setFontAlign(0,-1);

  g.setFontAlign(0, 0, 0);
  g.drawString("T-" + settingsChronowid.minutes + " min.", screenHalfWidth, screenHalfHeight);

  if(settingsChronowid.started){
    g.setColor("#ff0000");
    g.setFont("Vector", 20).setFontAlign(0,-1);
    g.drawString("[started]", screenHalfWidth, screenHalfHeight+20);
  }
}


Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.2);
  var right = g.getWidth() - left;
  var upper = parseInt(g.getHeight() * 0.2);
  var lower = g.getHeight() - upper;

  var isLeft = e.x < left;
  var isRight = e.x > right;
  var isUpper = e.y < upper;
  var isLower = e.y > lower;

  if(isRight){
    print("right");
    settingsChronowid.minutes += 1;
  } else if(isLeft){
    print("left");
    settingsChronowid.minutes -= 1;
  } else if(isUpper){
    print("upper");
    settingsChronowid.minutes += 5;
  } else if(isLower){
    print("lower");
    settingsChronowid.minutes -= 5;
  } else {
    print("else");
    settingsChronowid.started = !settingsChronowid.started;
  }

  settingsChronowid.minutes = Math.max(0, settingsChronowid.minutes);
  updateSettings();
  draw();
});

g.reset();
draw();