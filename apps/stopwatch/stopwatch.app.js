{
const CONFIGFILE = "stopwatch.json";

const now = Date.now();
const config = Object.assign({
    state: {
        total: now,
        start: now,
        current: now,
        running: false,
    }
}, require("Storage").readJSON(CONFIGFILE,1) || {});

let w = g.getWidth();
let h = g.getHeight();
let tTotal = config.state.total;
let tStart = config.state.start;
let tCurrent = config.state.current;
let running = config.state.running;
let timeY = 2*h/5;
let displayInterval;
let redrawButtons = true;
const iconScale = g.getWidth() / 178; // scale up/down based on Bangle 2 size
const origTheme = g.theme;

// 24 pixel images, scale to watch
// 1 bit optimal, image string, no E.toArrayBuffer()
const pause_img = atob("GBiBAf////////////////wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP/wYP////////////////w==");
const play_img = atob("GBjBAP//AAAAAAAAAAAIAAAOAAAPgAAP4AAP+AAP/AAP/wAP/8AP//AP//gP//gP//AP/8AP/wAP/AAP+AAP4AAPgAAOAAAIAAAAAAAAAAA=");
const reset_img = atob("GBiBAf////////////AAD+AAB+f/5+f/5+f/5+cA5+cA5+cA5+cA5+cA5+cA5+cA5+cA5+f/5+f/5+f/5+AAB/AAD////////////w==");

const saveState = function() {
    config.state.total = tTotal;
    config.state.start = tStart;
    config.state.current = tCurrent;
    config.state.running = running;
    require("Storage").writeJSON(CONFIGFILE, config);
};

const log_debug = function(o) {
  //console.log(o);
};

const timeToText = function(t) {
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
};

const drawButtons = function() {
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
};

const drawTime = function() {
  log_debug("drawTime()");
  let Tt = tCurrent-tTotal;
  let Ttxt = timeToText(Tt);

  // total time
  g.setFont("Vector",38);  // check
  g.setFontAlign(0,0);
  g.clearRect(0, timeY - 21, w, timeY + 21);
  g.setColor(g.theme.fg); 
  g.drawString(Ttxt, w/2, timeY);
};

const draw = function() {
  //let last = tCurrent;
  if (running) tCurrent = Date.now();
  g.setColor(g.theme.fg);
  if (redrawButtons) drawButtons();
  drawTime();
};

const startTimer = function() {
  log_debug("startTimer()");
  draw();
  displayInterval = setInterval(draw, 100);
};

const stopTimer = function() {
  log_debug("stopTimer()");
  if (displayInterval) {
    clearInterval(displayInterval);
    displayInterval = undefined;
  }
};

// BTN stop start
const stopStart = function() {
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
  saveState();
};

const setButtonImages = function() {
  if (running) {
    bigPlayPauseBtn.setImage(pause_img);
    smallPlayPauseBtn.setImage(pause_img);
    resetBtn.setImage(reset_img);
  } else {
    bigPlayPauseBtn.setImage(play_img);
    smallPlayPauseBtn.setImage(play_img);
    resetBtn.setImage(reset_img);
  }
};

// lap or reset
const lapReset = function() {
  log_debug("lapReset()");
  if (!running && tStart != tCurrent) {
    redrawButtons = true;
    Bangle.buzz();
    tStart = tCurrent = tTotal = Date.now();
    g.clearRect(0,24,w,h);
    draw();
  }
  saveState();
};

// simple on screen button class
const BUTTON = function(name,x,y,w,h,c,f,i) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = c;
  this.callback = f;
  this.img = i;
};

BUTTON.prototype.setImage = function(i) {
  this.img = i;
};

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


const bigPlayPauseBtn = new BUTTON("big",0, 3*h/4 ,w, h/4, "#0ff", stopStart, play_img);
const smallPlayPauseBtn = new BUTTON("small",w/2, 3*h/4 ,w/2, h/4, "#0ff", stopStart, play_img);
const resetBtn = new BUTTON("rst",0, 3*h/4, w/2, h/4, "#ff0", lapReset, pause_img);

bigPlayPauseBtn.setImage(play_img);
smallPlayPauseBtn.setImage(play_img);
resetBtn.setImage(pause_img);

Bangle.setUI({mode:"custom", btn:() => load(), touch: (button,xy) => {
    let x = xy.x;
    let y = xy.y;

    // adjust for outside the dimension of the screen
    // http://forum.espruino.com/conversations/371867/#comment16406025
    if (y > h) y = h;
    if (y < 0) y = 0;
    if (x > w) x = w;
    if (x < 0) x = 0;

    // not running, and reset
    if (!running && tCurrent == tTotal && bigPlayPauseBtn.check(x, y)) return;

    // paused and hit play
    if (!running && tCurrent != tTotal && smallPlayPauseBtn.check(x, y)) return;

    // paused and press reset
    if (!running && tCurrent != tTotal && resetBtn.check(x, y)) return;

    // must be running
    if (running && bigPlayPauseBtn.check(x, y)) return;
  }, remove: () => {
  if (displayInterval) {
    clearInterval(displayInterval);
    displayInterval = undefined;
  }
  Bangle.removeListener('lcdPower',onLCDPower);
  g.setTheme(origTheme);
}});

// Stop updates when LCD is off, restart when on
const onLCDPower = (on) => {
  if (on) {
    draw(); // draw immediately, queue redraw
  }
};
Bangle.on('lcdPower',onLCDPower);

// Clear the screen once, at startup
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
// above not working, hence using next 2 lines
g.setColor("#000");
g.fillRect(0,0,w,h);

Bangle.loadWidgets();
Bangle.drawWidgets();
setButtonImages();
if (running) {
    startTimer();
} else {
    draw();
}
}
