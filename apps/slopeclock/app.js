{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
  
const fontBitmap = E.toString(require('heatshrink').decompress(atob('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')));

Graphics.prototype.setFontPaytoneOne = function(scale) {
  // Actual height 81 (91 - 11)
  this.setFontCustom(
    fontBitmap,
    46,
    atob("ITZOMzs7SDxHNUdGIQ=="),
    113+(scale<<8)+(1<<16)
  );
  return this;
};

let drawTimeout;

let g2 = Graphics.createArrayBuffer(g.getWidth(),90,1,{msb:true});
let g2img = {
  width:g2.getWidth(), height:g2.getHeight(), bpp:1,
  buffer:g2.buffer, transparent:0
};
const slope = 20;
const offsy = 20; // offset of numbers from middle
const fontBorder = 4; // offset from left/right
const slopeBorder = 10, slopeBorderUpper = 4; // fudge-factor to move minutes down from slope
let R,x,y; // middle of the clock face
let dateStr = "";
let bgColors = g.theme.dark ? ["#ff0","#0ff","#f0f"] : ["#f00","#0f0","#00f"];
let bgColor = bgColors[(Math.random()*bgColors.length)|0];


// Draw the hour, and the minute into an offscreen buffer
let draw = function() {
  R = Bangle.appRect;
  x = R.w / 2;
  y = R.y + R.h / 2 - 12; // 12 = room for date
  var date = new Date();
  var local_time = require("locale").time(date, 1);
  var hourStr = local_time.split(":")[0].trim().padStart(2,'0');
  var minStr = local_time.split(":")[1].trim().padStart(2, '0');
  dateStr = require("locale").dow(date, 1).toUpperCase()+ " "+
            require("locale").date(date, 0).toUpperCase();

  // Draw hour
  g.reset().clearRect(R); // clear whole background (w/o widgets)
  g.setFontAlign(-1, 0).setFont("PaytoneOne");
  g.drawString(hourStr, fontBorder, y-offsy).setFont("4x6"); // draw and unload custom font
  // add slope in background color
  g.setColor(g.theme.bg).fillPoly([0,y+slope-slopeBorderUpper, R.w,y-slope-slopeBorderUpper,
                                   R.w,y-slope, 0,y+slope]);
  // Draw minute to offscreen buffer
  g2.setColor(0).fillRect(0,0,g2.getWidth(),g2.getHeight()).setFontAlign(1, 0).setFont("PaytoneOne");
  g2.setColor(1).drawString(minStr, g2.getWidth()-fontBorder, g2.getHeight()/2).setFont("4x6"); // draw and unload custom font
  g2.setColor(0).fillPoly([0,0, g2.getWidth(),0, 0,slope*2]);
  // start the animation *in*
  animate(true);

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    animate(false, function() {
      draw();
    });
  }, 60000 - (Date.now() % 60000));
};

let isAnimIn = true;
let animInterval;
// Draw *just* the minute image
let drawMinute = function() {
  var yo = slopeBorder + offsy + y - 2*slope*minuteX/R.w;
  // draw over the slanty bit
  g.setColor(bgColor).fillPoly([0,y+slope, R.w,y-slope, R.w,R.h+R.y, 0,R.h+R.y]);
  // draw the minutes
  g.setColor(g.theme.bg).drawImage(g2img, x+minuteX-(g2.getWidth()/2), yo-(g2.getHeight()/2));
};
let animate = function(isIn, callback) {
  if (animInterval) clearInterval(animInterval);
  isAnimIn = isIn;
  minuteX = isAnimIn ? -g2.getWidth() : 0;
  drawMinute();
  animInterval = setInterval(function() {
    minuteX += 8;
    let stop = false;
    if (isAnimIn && minuteX>=0) {
      minuteX=0;
      stop = true;
    } else if (!isAnimIn && minuteX>=R.w)
      stop = true;
    drawMinute();
    if (stop) {
      clearInterval(animInterval);
      animInterval=undefined;
      if (isAnimIn) // draw the date
        g.setColor(g.theme.bg).setFontAlign(0, 0).setFont("6x15").drawString(dateStr, R.x + R.w/2, R.y+R.h-9);
      if (callback) callback();
    }
  }, 20);
};


// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (animInterval) clearInterval(animInterval);
    animInterval = undefined;
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontPaytoneOne;
  }});
// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}
