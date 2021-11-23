let w = g.getWidth();
let h = g.getHeight();
let tTotal = Date.now();
let tStart = tTotal;
let tCurrent = tTotal;
let running = false;
let timeY = 2*h/5;
let displayInterval;
let redrawButtons = true;
const iconScale = g.getWidth() / 178; // scale up/down based on Bangle 2 size

// 24 pixel images, scale to watch
// 1 bit optimal, image string, no E.toArrayBuffer()
const pause_img = atob("GBiBAf////////////////wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP////////////////w==");
const play_img = atob("GBjBAP//AAAAAAAAAAAIAAAOAAAPgAAP4AAP+AAP/AAP/wAP/8AP//AP//gP//gP//AP/8AP/wAP/AAP+AAP4AAPgAAOAAAIAAAAAAAAAAA=");
const reset_img = atob("GBiBAf////////////AAD+AAB+f/5+f/5+f/5+cA5+cA5+cA5+cA5+cA5+cA5+cA5+cA5+f/5+f/5+f/5+AAB/AAD////////////w==");

function log_debug(o) {
  //console.log(o);
}

function timeToText(t) {
  let hrs = Math.floor(t/3600000);
  let mins = Math.floor(t/60000)%60;
  let secs = Math.floor(t/1000)%60;
  let tnth = Math.floor(t/100)%10;
  let text;

  if (hrs === 0) 
    text = ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2) + "." + tnth;
  else
    text = ("0"+hrs) + ":" + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);

  //log_debug(text);
  return text;
}

function drawButtons() {
  log_debug("drawButtons()");
  if (!running && tCurrent == tTotal) {
    bigPlayPauseBtn.draw();
  } else if (!running && tCurrent != tTotal) {
    resetBtn.draw();
    smallPlayPauseBtn.draw();
  } else {
    bigPlayPauseBtn.draw();
  }
  
  redrawButtons = false;
}

function drawTime() {
  log_debug("drawTime()");
  let Tt = tCurrent-tTotal;
  let Ttxt = timeToText(Tt);

  // total time
  g.setFont("Vector",38);  // check
  g.setFontAlign(0,0);
  g.clearRect(0, timeY - 21, w, timeY + 21);
  g.setColor(g.theme.fg); 
  g.drawString(Ttxt, w/2, timeY);
}

function draw() {
  let last = tCurrent;
  if (running) tCurrent = Date.now();
  g.setColor(g.theme.fg);
  if (redrawButtons) drawButtons();
  drawTime();
}

function startTimer() {
  log_debug("startTimer()");
  draw();
  displayInterval = setInterval(draw, 100);
}

function stopTimer() {
  log_debug("stopTimer()");
  if (displayInterval) {
    clearInterval(displayInterval);
    displayInterval = undefined;
  }
}

// BTN stop start
function stopStart() {
  log_debug("stopStart()");

  if (running)
    stopTimer();

  running = !running;
  Bangle.buzz();

  if (running)
    tStart = Date.now() + tStart- tCurrent;  
  tTotal = Date.now() + tTotal - tCurrent;
  tCurrent = Date.now();

  setButtonImages();
  redrawButtons = true;
  if (running) {
    startTimer();
  } else {
    draw();
  }
}

function setButtonImages() {
  if (running) {
    bigPlayPauseBtn.setImage(pause_img);
    smallPlayPauseBtn.setImage(pause_img);
    resetBtn.setImage(reset_img);
  } else {
    bigPlayPauseBtn.setImage(play_img);
    smallPlayPauseBtn.setImage(play_img);
    resetBtn.setImage(reset_img);
  }
}

// lap or reset
function lapReset() {
  log_debug("lapReset()");
  if (!running && tStart != tCurrent) {
    redrawButtons = true;
    Bangle.buzz();
    tStart = tCurrent = tTotal = Date.now();
    g.clearRect(0,24,w,h);
    draw();
  }
}

// simple on screen button class
function BUTTON(name,x,y,w,h,c,f,i) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = c;
  this.callback = f;
  this.img = i;
}

BUTTON.prototype.setImage = function(i) {
  this.img = i;
}

// if pressed the callback
BUTTON.prototype.check = function(x,y) {
  //console.log(this.name + ":check() x=" + x + " y=" + y +"\n");
  
  if (x>= this.x && x<= (this.x + this.w) && y>= this.y && y<= (this.y + this.h)) {
    log_debug(this.name + ":callback\n");
    this.callback();
    return true;
  }
  return false;
};

BUTTON.prototype.draw = function() {
  g.setColor(this.color);
  g.fillRect(this.x, this.y, this.x + this.w, this.y + this.h);
  g.setColor("#000"); // the icons and boxes are drawn black
  if (this.img != undefined) {
    let iw = iconScale * 24;  // the images were loaded as 24 pixels, we will scale
    let ix = this.x + ((this.w - iw) /2);
    let iy = this.y + ((this.h - iw) /2);
    log_debug("g.drawImage(" + ix + "," + iy + "{scale: " + iconScale + "})");
    g.drawImage(this.img, ix, iy, {scale: iconScale}); 
  }
  g.drawRect(this.x, this.y, this.x + this.w, this.y + this.h);
};


var bigPlayPauseBtn = new BUTTON("big",0, 3*h/4 ,w, h/4, "#0ff", stopStart, play_img);
var smallPlayPauseBtn = new BUTTON("small",w/2, 3*h/4 ,w/2, h/4, "#0ff", stopStart, play_img);
var resetBtn = new BUTTON("rst",0, 3*h/4, w/2, h/4, "#ff0", lapReset, pause_img);

bigPlayPauseBtn.setImage(play_img);
smallPlayPauseBtn.setImage(play_img);
resetBtn.setImage(pause_img);


Bangle.on('touch', function(button, xy) {
  // not running, and reset
  if (!running && tCurrent == tTotal && bigPlayPauseBtn.check(xy.x, xy.y)) return;

  // paused and hit play
  if (!running && tCurrent != tTotal && smallPlayPauseBtn.check(xy.x, xy.y)) return;

  // paused and press reset
  if (!running && tCurrent != tTotal && resetBtn.check(xy.x, xy.y)) return;

  // must be running
  if (running && bigPlayPauseBtn.check(xy.x, xy.y)) return;
});

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Clear the screen once, at startup
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
// above not working, hence using next 2 lines
g.setColor("#000");
g.fillRect(0,0,w,h);

Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
Bangle.setUI("clock"); // Show launcher when button pressed
