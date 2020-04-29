var locale = require("locale");
var CHARW = 34;
var CHARP = 2;
var Y = 50;
// Offscreen buffer
var buf = Graphics.createArrayBuffer(CHARW+CHARP*2,CHARW*2 + CHARP*2,1,{msb:true});
var bufimg = {width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer};
// The last time that we displayed
var lastTime = "     ";
// If animating, this is the interval's id
var animInterval;
var timeInterval;

/* Get array of lines from digit d to d+1.
 n is the amount (0..1)
 maxFive is true is this digit only counts 0..5 */
const DIGITS = {
" ":(g,s,p,n)=>{},
"0":(g,s,p,n)=>{
g.fillRect(1+s*n,1-p, 1+s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1+s*n,1+2*s-p, 1+s,1+2*s+p);
g.fillRect(1+s*n,1+s-p, 1+s*n,1+2*s+p);
g.fillRect(1+s*n-p,1, 1+s*n+p,1+s)},
"1":(g,s,p,n)=>{
g.fillRect(1+(1-n)*s,1-p, 1+s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1+(1-n)*s,1+s-p, 1+s,1+s+p);
g.fillRect(1-p+(1-n)*s,1+s, 1+p+(1-n)*s,1+2*s);
g.fillRect(1+(1-n)*s,1-p+2*s, 1+s,1+p+2*s)},
"2":(g,s,p,n)=>{
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1,1+s-p, 1+s,1+s+p);
g.fillRect(1-p,1+(1+n)*s, 1+p,1+2*s);
g.fillRect(1+s-p,1+(2-n)*s, 1+s+p,1+2*s);
g.fillRect(1,1+2*s-p, 1+s,1+2*s+p)},
"3":(g,s,p,n)=>{
g.fillRect(1,1-p, 1+(1-n)*s,1+p);
g.fillRect(1-p,1, 1+p,n);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1+s*n,1+2*s-p, 1+s,1+2*s+p)},
"4":(g,s,p,n)=>{
g.fillRect(1-p,1, 1+p,1+s);
g.fillRect(1+s,1-p, 1+(1-n)*s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+(1-n)*s);
g.fillRect(1,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1+(1-n)*s,1+2*s-p, 1+s,1+2*s+p)},
"5to0": (g,s,p,n)=>{ // 5 -> 0
g.fillRect(1-p,1, 1+p,1+s);
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1+s*n,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1,1+2*s*p, 1+s,1+2*s+p);
g.fillRect(1,1+2*s-p, 1,1+2*s+p);
g.fillRect(1+s-p,1+(1-n)*s, 1+s+p,1+s);
g.fillRect(1-p,1+s, 1+p,1+(1+n)*s)},
"5to6": (g,s,p,n)=>{ // 5 -> 6
g.fillRect(1-p,1, 1+p,1+s);
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1,1+2*s-p, 1+s,1+2*s+p);
g.fillRect(1-p,2-n, 1+p,1+2*s)},
"6":(g,s,p,n)=>{
g.fillRect(1-p,1, 1+p,1+(1-n)*s);
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1+s*n,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+(1-n)*s, 1+s+p,1+s);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1+s*n,1+2*s-p, 1+s,1+2*s+p);
g.fillRect(1-p,1+(1-n)*s, 1+p,1+s*(2-2*n))},
"7":(g,s,p,n)=>{
g.fillRect(1-p,1, 1+p,n);
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1+(1-n)*s,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1+(1-n)*s,1+2*s-p, 1+s,1+2*s+p);
g.fillRect(1+(1-n)*s-p,1+s, 1+(1-n)*s+p,1+2*s)},
"8":(g,s,p,n)=>{
g.fillRect(1-p,1, 1+p,1+s);
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1,1+s-p, 1+s,1+s+p);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1,1+2*s-p, 1+s,1+2*s+p);
g.fillRect(1-p,1+s, 1+p,1+s*(2-n))},
"9":(g,s,p,n)=>{
g.fillRect(1-p,1, 1+p,1+s);
g.fillRect(1,1-p, 1+s,1+p);
g.fillRect(1+s-p,1, 1+s+p,1+s);
g.fillRect(1,1+s-p, 1+(1-n)*s,1+s+p);
g.fillRect(1-p,1+s, 1+p,1+(1+n)*s);
g.fillRect(1+s-p,1+s, 1+s+p,1+2*s);
g.fillRect(1,1+2*s-p, 1+s,1+2*s+p)},
":":(g,s,p,n)=>{
g.fillRect(1+s*0.4,1+s*0.4-p, 1+s*0.6,1+s*0.4+p);
g.fillRect(1+s*0.6-p,1+s*0.4, 1+s*0.6+p,1+s*0.6);
g.fillRect(1+s*0.6,1+s*0.6-p, 1+s*0.4,1+s*0.6+p);
g.fillRect(1+s*0.4-p,1+s*0.4, 1+s*0.4+p,1+s*0.6);
g.fillRect(1+s*0.4,1+s*1.4-p, 1+s*0.6,1+s*1.4+p);
g.fillRect(1+s*0.6-p,1+s*1.4, 1+s*0.6+p,1+s*1.6);
g.fillRect(1+s*0.6,1+s*1.6-p, 1+s*0.4,1+s*1.6+p);
g.fillRect(1+s*0.4-p,1+s*1.4, 1+s*0.4+p,1+s*1.6)
}};

/* Draw a transition between lastText and thisText.
 'n' is the amount - 0..1 */
function drawDigits(lastText,thisText,n) {
  const p = CHARP; // padding around digits
  const s = CHARW; // character size
  var x = p;  // x offset
  var y = Y+p; // y offset
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
      if (ch=="5") ch = (lastCh==5 && thisCh==0)?"5to0":"5to6";
      buf.clear();
      DIGITS[ch](buf,s,p,chn);
      g.drawImage(bufimg,x-1,y-1);
    }
    if (thisCh==":") x-=4;
    x+=s+p+7;
  }
}
function drawSeconds() {
  var x = CHARW*6 + CHARP*2 - 4;
  var y = Y + 2*CHARW + CHARP;
  var d = new Date();
  g.reset();
  g.setFont("6x8");
  g.setFontAlign(-1,-1);
  g.drawString(("0"+d.getSeconds()).substr(-2), x, y-8, true);
  // date
  g.setFontAlign(0,-1);
  var date = locale.date(d,false);
  g.drawString(date, g.getWidth()/2, y+8, true);
}

/* Show the current time, and animate if needed */
function showTime() {
  if (animInterval) return; // in animation - quit
  var d = new Date();
  var t = (" "+d.getHours()).substr(-2)+":"+
          ("0"+d.getMinutes()).substr(-2);
  var l = lastTime;
  // same - don't animate
  if (t==l || l=="     ") {
    drawDigits(t,l,0);
    drawSeconds();
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
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
// Update time once a second
timeInterval = setInterval(showTime, 1000);
showTime();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
