/*
Draws a fullscreen image from flash memory
Saves a small image to flash which is just the area where the clock is
Keeps an offscreen buffer and draws the time to that
*/
g.clear(); //clears other apps's graphics
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
var inf = require("Storage").readJSON("imgclock.face.json");
var img = require("Storage").read("imgclock.face.img");
var IX = inf.x, IY = inf.y, IBPP = inf.bpp;
var IW = 174, IH = 45, OY = 24;
if (inf.hideWidgets) OY=0;
var bgwidth = img.charCodeAt(0);
var bgoptions;
if (bgwidth<g.getWidth())
  bgoptions = { scale : g.getWidth()/bgwidth };

require("Font7x11Numeric7Seg").add(Graphics);
var cg = Graphics.createArrayBuffer(IW,IH,IBPP,{msb:true});
var cgimg = {width:IW,height:IH,bpp:IBPP,buffer:cg.buffer};
var locale = require("locale");

// store clock background image in bgimg (a file in flash memory)
var bgimg = require("Storage").read("imgclock.face.bg");
// if it doesn't exist, make it
function createBgImg() {
  cg.drawImage(img,-IX,-IY,bgoptions);
  require("Storage").write("imgclock.face.bg", cg.buffer);
  bgimg = require("Storage").read("imgclock.face.bg");
}
if (!bgimg || bgimg.length<10) createBgImg();

function draw() {
  var t = new Date();
  var hours = t.getHours();
  var meridian = "";
  if (is12Hour) {
    meridian = (hours < 12) ? "AM" : "PM";
    hours = ((hours + 11) % 12) + 1;
  }
  // quickly set background image
  new Uint8Array(cg.buffer).set(bgimg);
  // draw time
  cg.setColor(inf.col);
  var x = 74 + 32 * inf.align;
  cg.setFont("7x11Numeric7Seg",3);
  cg.setFontAlign(1,-1);
  cg.drawString(hours, x, 0);
  x+=2;
  if (t.getSeconds() & 1)
    cg.fillRect(x, 10, x+2, 10+2).fillRect(x, 20, x+2, 20+2);
  x+=6;
  cg.setFontAlign(-1,-1);
  cg.drawString(("0"+t.getMinutes()).substr(-2), x, 0);
  x+=44;
  cg.setFont("7x11Numeric7Seg",1);
  cg.drawString(("0"+t.getSeconds()).substr(-2), x, 20);
  cg.setFont("6x8",1);
  cg.drawString(meridian, x+2, 0);
  let date = locale.date(t);
  if (cg.stringWidth(date) < IW-64) {
    cg.setFontAlign(0, -1);
    cg.drawString(date,IW/2+32*inf.align,IH-8);
  } else {
    cg.setFontAlign(inf.align, -1);
    cg.drawString(date,IW*(inf.align+1)/2,IH-8);
  }
  // draw to screen
  g.drawImage(cgimg,IX,IY+OY);
}

// draw background
g.drawImage(img, 0,OY,bgoptions);
// draw clock itself and do it every second
draw();
var secondInterval = setInterval(draw,1000);
// Show launcher when button pressed
Bangle.setUI("clock");
// load widgets
Bangle.loadWidgets();
if (inf.hideWidgets)
  require("widget_utils").swipeOn();
Bangle.drawWidgets();
// Stop when LCD goes off
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw,1000);
    draw();
  }
});

