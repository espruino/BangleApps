var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
var locale = require("locale");
var CHARW = 34; // how tall are digits?
var CHARP = 2; // how chunky are digits?
var Y = 50; // start height
// Offscreen buffer
var buf = Graphics.createArrayBuffer(CHARW+CHARP*2,CHARW*2 + CHARP*2,1,{msb:true});
var bufimg = {width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer};
// The last time that we displayed
var lastTime = "-----";
// If animating, this is the interval's id
var animInterval;
var timeInterval;

/* Get array of lines from digit d to d+1.
 n is the amount (0..1)
 maxFive is true is this digit only counts 0..5 */
const DIGITS = {
  " ":n=>[],
  "0":n=>[
    [n,0,1,0],
    [1,0,1,1],
    [1,1,1,2],
    [n,2,1,2],
    [n,1,n,2],
    [n,0,n,1]],
  "1":n=>[
    [1-n,0,1,0],
    [1,0,1,1],
    [1-n,1,1,1],
    [1-n,1,1-n,2],
    [1-n,2,1,2]],
  "2":n=>[
    [0,0,1,0],
    [1,0,1,1],
    [0,1,1,1],
    [0,1+n,0,2],
    [1,2-n,1,2],
    [0,2,1,2]],
  "3":n=>[
    [0,0,1-n,0],
    [0,0,0,n],
    [1,0,1,1],
    [0,1,1,1],
    [1,1,1,2],
    [n,2,1,2]],
  "4":n=>[
    [0,0,0,1],
    [1,0,1-n,0],
    [1,0,1,1-n],
    [0,1,1,1],
    [1,1,1,2],
    [1-n,2,1,2]],
  "5to0": n=>[ // 5 -> 0
    [0,0,0,1],
    [0,0,1,0],
    [n,1,1,1],
    [1,1,1,2],
    [0,2,1,2],
    [0,2,0,2],
    [1,1-n,1,1],
    [0,1,0,1+n]],
  "5to6": n=>[ // 5 -> 6
    [0,0,0,1],
    [0,0,1,0],
    [0,1,1,1],
    [1,1,1,2],
    [0,2,1,2],
    [0,2-n,0,2]],
  "6":n=>[
    [0,0,0,1-n],
    [0,0,1,0],
    [n,1,1,1],
    [1,1-n,1,1],
    [1,1,1,2],
    [n,2,1,2],
    [0,1-n,0,2-2*n]],
  "7":n=>[
    [0,0,0,n],
    [0,0,1,0],
    [1,0,1,1],
    [1-n,1,1,1],
    [1,1,1,2],
    [1-n,2,1,2],
    [1-n,1,1-n,2]],
  "8":n=>[
    [0,0,0,1],
    [0,0,1,0],
    [1,0,1,1],
    [0,1,1,1],
    [1,1,1,2],
    [0,2,1,2],
    [0,1,0,2-n]],
  "9":n=>[
    [0,0,0,1],
    [0,0,1,0],
    [1,0,1,1],
    [0,1,1-n,1],
    [0,1,0,1+n],
    [1,1,1,2],
    [0,2,1,2]],
  ":":n=>[
    [0.4,0.4,0.6,0.4],
    [0.6,0.4,0.6,0.6],
    [0.6,0.6,0.4,0.6],
    [0.4,0.4,0.4,0.6],
    [0.4,1.4,0.6,1.4],
    [0.6,1.4,0.6,1.6],
    [0.6,1.6,0.4,1.6],
    [0.4,1.4,0.4,1.6]]
};

/* Draw a transition between lastText and thisText.
 'n' is the amount - 0..1 */
function drawDigits(lastText,thisText,n) {
  "ram"
  const p = CHARP; // padding around digits
  const s = CHARW; // character size
  var x = 0;  // x offset
  g.reset();
  for (var i=0;i<lastText.length;i++) {
    var lastCh = lastText[i];
    var thisCh = thisText[i];
    if (thisCh==":") x-=4;
    if (lastCh!=thisCh) {
      var ch, chn = n;
      if ((thisCh-1==lastCh ||
          (thisCh==0 && lastCh==5) ||
          (thisCh==0 && lastCh==9)))
        ch = lastCh;
      else {
        ch = thisCh;
        chn = 0;
      }
      buf.clear();
      if (ch=="5") ch = (lastCh==5 && thisCh==0)?"5to0":"5to6";
      var l = DIGITS[ch](chn);
      l.forEach(c=>{
        if (c[0]!=c[2]) // horiz
          buf.fillRect(p+c[0]*s,c[1]*s,p+c[2]*s,2*p+c[3]*s);
        else if (c[1]!=c[3]) // vert
          buf.fillRect(c[0]*s,p+c[1]*s,2*p+c[2]*s,p+c[3]*s);
      });
      g.drawImage(bufimg,x,Y);
    }
    if (thisCh==":") x-=4;
    x+=s+p+7;
  }
}
function drawEverythingElse() {
  var x = (CHARW + CHARP + 6)*5;
  var y = Y + 2*CHARW + CHARP;
  var d = new Date();
  g.reset();
  g.setFont("6x8");
  g.setFontAlign(-1,-1);
  g.drawString(("0"+d.getSeconds()).substr(-2), x, y-8, true);
  // meridian
  if (is12Hour) g.drawString((d.getHours() < 12) ? "AM" : "PM", x, Y + 4, true);
  // date
  g.setFontAlign(0,-1);
  var date = locale.date(d,false);
  g.drawString(date, g.getWidth()/2, y+8, true);
}

/* Show the current time, and animate if needed */
function showTime() {
  if (animInterval) return; // in animation - quit
  var d = new Date();
  var hours = d.getHours();
  if (is12Hour) hours = ((hours + 11) % 12) + 1;
  var t = (" "+hours).substr(-2)+":"+
          ("0"+d.getMinutes()).substr(-2);
  var l = lastTime;
  // same - don't animate
  if (t==l || l=="-----") {
    drawDigits(l,t,0);
    drawEverythingElse();
    lastTime = t;
    return;
  }
  var n = 0;
  animInterval = setInterval(function() {
    n += 1/10;
    if (n>=1) {
      n=1;
      clearInterval(animInterval);
      animInterval = undefined;
    }
    drawDigits(l,t,n);
  }, 20);
  lastTime = t;
}

Bangle.on('lcdPower',function(on) {
  if (animInterval) {
    clearInterval(animInterval);
    animInterval = undefined;
  }
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = undefined;
  }
  if (on) {
    showTime();
    timeInterval = setInterval(showTime, 1000);
  } else {
    lastTime = "-----";
  }
});

// Show launcher when button pressed
Bangle.setUI("clock");

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
// Update time once a second
timeInterval = setInterval(showTime, 1000);
showTime();

