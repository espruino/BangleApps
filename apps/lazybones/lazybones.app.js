Graphics.prototype.setFontRoboto = function(scale) {
  // Actual height 21 (20 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAH/zA/+YAAAAAAAHwAAwAAHwAA+AAAAAAAAAAAQACDAAYbADP4B/8A/zAGYZADH4A/+A/7AHYYADCAAAAAAAQAeHgH4eBzgwMMHnhw88GGBw4wHj+AcPgAAAAAAAAAAB4AA/gAGMAAwhwGMcAfuABzgABzgAc+AOMYBhBAAMYAB/AAHwAAAAAHwD5+A/8YGPDAw8YGPzA/HYD4fAADwAB/AAOYAABAAAAHwAA4AAAAAAAAAAH/gD//B8A+cAA7AADAAAAAAAYAAbwAHHgHwf/4A/8AAAAEAABiAAGwAA8AA/AAH+AAGwAByAAEAAAAAAAMAABgAAMAABgAH/wA/+AAMAABgAAMAABgAAAAAAAIAAfAADwAAAABgAAMAABgAAMAABgAAAAAAAAAAAAADAAAYAAAAAAAAADgAB8AB+AA+AA+AA/AAHAAAgAAAAAAB8AB/8Af/wHAHAwAYGADAwAYHAHAf/wB/8AAAAAAAAAAABgAAcAADAAAYAAH//A//4AAAAAAAAAAAAAAAAAAAAABwDAeA4HAPAwHYGBzAwcYHHDAfwYB8DAAAYAAAAAAABgOAcBwHADAwwYGGDAwwYHPHAf/wB58AAAAAAAAADAAB4AAfAAPYAHjAB4YA8DAH//A//4AAYAADAAAAAAAAAEMA/xwH+HAxgYGMDAxgYGODAw/4GD+AAHAAAAAAAAAf8AP/wD2HA5wYGMDAxgYGOHAA/wAD8AAAAAAAAAAAGAAAwAAGADAwB4GB+Aw+AGfAA/gAHwAAwAAAAAAADAB5+Af/wHPDAwwYGGDAwwYHPHAfvwB58AAAAAAAAAAAB+AAf4AHDjAwMYGBjAwM4HDOAf/gB/4AAAAAAAAAAAAYDADAYAAAAAAAAAAYDAfAYHwAAAABAAAcAADgAA+AAGwAB3AAMYABjgAYMAAAAAAAAAAAAAAABmAAMwABmAAMwABmAAMwABmAAMwAAiAAAAAAAAAYMADjgAMYAB3AAGwAA2AADgAAcAABAAAAAAAAAMAADgAA4AAGBzAweYGHAA/wAD8AAEAAAAwAB/4A/PwOAGDgAYYPxmH/Mw4ZmMDMxgZmM+Mx/5mHDAYAIDgDAPBwAf8AAMAAAAAAAYAAfAAPwAP4AH+AH4wA8GAH4wAP2AAPwAAfwAAfAAAYAAAAAAAAAAA//4H//AwwYGGDAwwYGGDAwwYH/HAf/wB58AAAAADAAH/AD/+AcBwHADAwAYGADAwAYGADA4A4DweAODgAAAAAAAAAAAAAAH//A//4GADAwAYGADAwAYGADAYAwD4+AP/gAfwAAAAAAAAAAAH//A//4GDDAwYYGDDAwYYGDDAwYYGCDAgAYAAAAAAAH//A//4GDAAwYAGDAAwYAGDAAwYAGAAAAAAAAAAH/AD/8AcBwHAHAwAYGADAwYYGDDA4YYDz/AOfwAAAAAAAAAAA//4H//A//4ADAAAYAADAAAYAADAAAYAADAA//4H//AAAAAAAAAAAAAAA//4H//AAAAAAAAABAAAeAAB4AADAAAYAADAAAYAAHA//wH/8AAAAAAAAAAAAAAA//4H//AAcAAPAAD4AA/wAOPADg8A4B4GAHAgAYAAAAAAAH//A//4AADAAAYAADAAAYAADAAAYAADAAAAAAAA//4H//A+AAB+AAD8AAD8AAH4AAPAAH4AH4AD8AD8AA+AAH//A//4AAAAAAAH//A//4H//AeAAB8AADwAAPgAAeAAA8AADwH//A//4AAAAAAAAAAAH/AB/8AeDwHAHAwAYGADAwAYGADA4A4DweAP/gA/4AAAAAAAAAAAH//A//4GBgAwMAGBgAwMAGBgAwcAH/AAfwAA8AAAAAA/4AP/gDgOA4A4GADAwAYGADAwAYHAHgeD+B/8wD+GAAAAAAAAAAA//4H//AwYAGDAAwYAGDgAweAHH8Afz4B8HAAAIAAYAPDwD8OA5w4GGDAwwYGHDAwYYHDnAePwBw8AAAAGAAAwAAGAAAwAAGAAA//4H//AwAAGAAAwAAGAAAwAAAAAAAAAH/4A//wAAPAAAYAADAAAYAADAAAYAAPA//wH/8AAAAAAAAgAAHAAA/AAB/AAD+AAD+AAD4AAfAAfwAfwAfwAH4AA4AAEAAA+AAH/AAH/gAD/AAD4AD+AH+AH8AA+AAH+AAD+AAD/AAD4AH/AP/AH+AA8AAAAAAAAAGADA4A4HweAPPgA/wAB8AAfwAPvgDweA8B4GADAAAIGAAA4AAHwAAPgAAfAAA/4AH/AD4AB8AA+AAHgAAwAAAAAAAAAGADAwB4GAfAwPYGDzAx4YGeDA/AYHwDA4AYGADAAAAAAAA///3//+wAA2AAGAAAGAAA+AAD8AAD8AAD4AAH4AAHgAAMAAAAwAA2AAG///3//+AAAAAAAAAAAOAAHwAD4AA8AAD8AADwAAGAAAAAAABgAAMAABgAAMAABgAAMAABgAAMAABgAAAEAAAwAADAAAIAAAAAAAAAAEeABn4Ad3ADMYAZjADMYAZmAB/4AP/AAAAAAAA//4H//ABgwAYDADAYAYDADg4AP+AA/gABwAAAAAAAAA/gAP+ADg4AYDADAYAYDADAYAOOABxwAAAAAEAAH8AB/wAcHADAYAYDADAYAcDA//4H//AAAAAAAAAAAAH8AB/wAdnADMYAZjADMYAZjAB84AHmAAMAAMAABgAB//gf/8HMAAxgAGIAAAAAAH8IB/zAcHMDAZgYDMDAZgcHcD//Af/wAAAAAAAAAAH//A//4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAGf/Az/4AAAAAAAAAAMz//mf/4AAAAAAAAAAH//A//4ABwAAeAAH4ABzwAcPACAYAABAAAAAAAA//4H//AAAAAAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/ABgAAYAADAAAYAADgAAP/AA/4AAAAAAAAf/AD/4AMAADAAAYAADAAAcAAD/4AP/AAAAAAAAAAAAH8AB/wAcHADAYAYDADAYAYDADx4AP+AA/gAAAAAAAAf/8D//gYDADAYAYDADAYAcHAB/wAH8AAEAAAAAAEAAH8AB/wAcHADAYAYDADAYAYDAD//gf/8AAAAAAAAAAAf/AD/4AcAADAAAYAACAAAAEAB5wAfnADMYAZjADGYAYzADn4AOeAAAAAAAADAAAYAAf/wD//ADAYAYDAAAAAAAAD/gAf/AAA4AADAAAYAADAAAwAf/AD/4AAAAAAAAYAAD4AAP4AAP4AAPAAH4AH4AD8AAcAAAAAAQAADwAAf4AAf4AAPAAP4AP4ADwAAfgAA/gAA/AAD4AH+AD+AAeAAAAAAAAACAYAcHADzwAH8AAfAAH8ADx4AcHACAIAcAMD4BgP4MAP/AAPwAP4AP4AD4AAcAAAAAAAAADAYAYHADD4AY7ADOYAfjADwYAcDADAYAAAAADAAA4AH//B/v8cABzAACAAAH//w//+AAAAAAACAACcAAx/n+H//AA4AAHAAAAAAAAAAAAAOAADgAAYAADAAAcAABgAAGAAAwAAGAADwAAcAAAAA"), 32, atob("BQUHDQwPDQQHBwkMBAYGCQwMDAwMDAwMDAwFBAsMCwoTDg0ODgwMDg8GDA0LEg8ODQ4NDA0ODRMNDQ0GCQYJCQYLDAsMCwcMDAUFCwUSDAwMDAcLBwwKEAoKCgcFBw4A"), 21+(scale<<8)+(1<<16));
  return this;
}

function setSmallFont() {
  g.setFontRoboto();
}

const h = g.getHeight();
const w = g.getWidth();

function draw() {
  if (!idle)
    drawClock();
  else
    drawIdle();
  queueDraw();
}

function drawClock() {
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);

  g.setFont('Vector', w/3);
  g.setFontAlign(0, 0);
  g.setColor(g.theme.fg);
  g.drawString(timeStr, w/2, h/2);
  setSmallFont();
  g.drawString('Last Step ' + lastStepTime, w/2, 3*h/4);
}

/////////////////   IDLE TIMER /////////////////////////////////////

function log_debug(o) {
  //print(o);
}

// variable for controlling idle alert
let lastStep = getTime();
let lastStepTime = '??';
let warned = 0;
let idle = false;
let IDLE_MINUTES = 26;

function drawIdle() {
  let mins = Math.round((getTime() - lastStep) / 60);
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);
  g.setColor(g.theme.fg);
  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString('Last step was', w/2, (h/3));
  g.drawString(mins + ' minutes ago', w/2, 20+(h/3));
  dismissBtn.draw();
}

///////////////   BUTTON CLASS ///////////////////////////////////////////

// simple on screen button class
function BUTTON(name,x,y,w,h,c,f,tx) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = c;
  this.callback = f;
  this.text = tx;
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
  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString(this.text, (this.x + this.w/2), (this.y + this.h/2));
  g.drawRect(this.x, this.y, (this.x + this.w), (this.y + this.h));
};

function dismissPrompt() {
  idle = false;
  warned = false;
  lastStep = getTime();
  Bangle.buzz(100);
  draw();
}

var dismissBtn = new BUTTON("big",0, 3*h/4 ,w, h/4, "#0ff", dismissPrompt, "Dismiss");

Bangle.on('touch', function(button, xy) {
  if (idle && dismissBtn.check(xy.x, xy.y)) return;
});

// if we get a step then we are not idle
Bangle.on('step', s => {
  setLastStepTime();
  lastStep = getTime();
  // redraw if we had been idle
  if (idle == true) {
    dismissPrompt();
  }
  idle = false;
  warned = 0;
});

function setLastStepTime() {
  var date = new Date();
  lastStepTime = require("locale").time(date,1);
}

function checkIdle() {
  let hour = (new Date()).getHours();
  let active = (hour >= 9 && hour < 21);
  //let active = true;
  let dur = getTime() - lastStep;

  if (active && dur > IDLE_MINUTES * 60) {
    drawIdle();
    if (warned++ < 3) {
      buzzer(warned);
      log_debug("checkIdle: warned=" + warned);
      Bangle.setLocked(false);
    }
    idle = true;
  } else {
    idle = false;
    warned = 0;
  }
}

setLastStepTime();

// timeout for multi-buzzer
var buzzTimeout;

// n buzzes
function buzzer(n) {
  log_debug("buzzer n=" + n);

  if (n-- < 1) return;
  Bangle.buzz(250);
  
  if (buzzTimeout) clearTimeout(buzzTimeout);
  buzzTimeout = setTimeout(function() {
    buzzTimeout = undefined;
    buzzer(n);
  }, 500);
}


///////////////////////////////////////////////////////////////////////////////


// timeout used to update every minute
var drawTimeout;
const DRAW_PERIOD = 60000;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    checkIdle();
    draw();
  }, DRAW_PERIOD - (Date.now() % DRAW_PERIOD));
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

g.clear();

// Show launcher when middle button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
