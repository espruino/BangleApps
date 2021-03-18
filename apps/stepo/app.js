var pal4color = new Uint16Array([0x0000,0xFFFF,0x7BEF,0xAFE5],0,2);   // b,w,grey,greenyellow
var pal4red = new Uint16Array([0x0000,0xFFFF,0xF800,0xAFE5],0,2);   // b,w,red,greenyellow
var buf = Graphics.createArrayBuffer(120,120,2,{msb:true});
var intervalRefSec;

function flip(x,y) {
 g.drawImage({width:120,height:120,bpp:2,buffer:buf.buffer, palette:pal4color}, x, y);
 buf.clear();
}

function flip_red(x,y) {
 g.drawImage({width:120,height:120,bpp:2,buffer:buf.buffer, palette:pal4red}, x, y);
 buf.clear();
}

function radians(a) {
  return a*Math.PI/180;
}

function drawSteps() {
  var i = 0;
  var cx = 60;
  var cy = 60;
  var r = 56;
  var steps = getSteps();
  var percent = steps / 10000;

  if (percent > 1) percent = 1;
  
  var startrot = 0 - 180;
  var midrot = -180 - (360 * percent);
  var endrot = -360  - 180;
  
  buf.setColor(3);   // green-yellow

  // draw guauge
  for (i = startrot; i > midrot; i -= 4) {
    x = cx + r * Math.sin(radians(i));
    y = cy + r * Math.cos(radians(i));
    buf.fillCircle(x,y,4);
  }

  buf.setColor(2); // grey

  // draw remainder of guage in grey
  for (i = midrot; i > endrot; i -= 4) {
    x = cx + r * Math.sin(radians(i));
    y = cy + r * Math.cos(radians(i));
    buf.fillCircle(x,y,4);
  }

  // draw steps
  buf.setColor(1); // white
  buf.setFont("Vector", 24);
  buf.setFontAlign(0,0);
  buf.drawString(steps, cx, cy);

  // change the remaining color to RED if battery is below 25%
  if (E.getBattery() > 25) 
    flip(60,115);
  else
    flip_red(60,115);
}

function draw() {
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0,5);

  g.clearRect(0, 30, 239, 99);
  g.setColor(1,1,1);
  g.setFontAlign(0, -1);
  g.setFont("Vector", 80);
  g.drawString(time, 120, 30, true);

  drawSteps();
}

function getSteps() {
  if (stepsWidget() !== undefined)
    return stepsWidget().getSteps();
  return "-";
}
    
function startTimer() {
  draw();
  intervalRefSec = setInterval(draw, 15000);
}

function stopTimer() {
  if(intervalRefSec) { intervalRefSec = clearInterval(intervalRefSec); }
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on)
    startTimer();
  else
    stopTimer();
});

let firstPress = 0;
var pressTimer;

// start a timer and buzz whenn held long enough
function firstPressed() {
  firstPress = getTime();
  pressTimer = setInterval(longPressCheck, 1500);
}

// if you release too soon there is no buzz as timer is cleared
function thenReleased() {
  var dur = getTime() - firstPress;
  if (pressTimer) {
    clearInterval(pressTimer);
    pressTimer = undefined;
  }
  if ( dur >= 1.5 ) Bangle.showLauncher();
}

// when you feel the buzzer you know you have done a long press
function longPressCheck() {
  Bangle.buzz();
  if (pressTimer) {
    clearInterval(pressTimer);
    pressTimer = undefined;
  }
}

// make BTN require a long press (1.5 seconds) to switch to launcher
setWatch(firstPressed, BTN2,{repeat:true,edge:"rising"});
setWatch(thenReleased, BTN2,{repeat:true,edge:"falling"});

g.reset();
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
startTimer();
