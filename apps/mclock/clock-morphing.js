var locale = require("locale");
// Offscreen buffer
var buf = Graphics.createArrayBuffer(240,86,1,{msb:true});
function flip() {
  g.setColor(1,1,1);
  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer},0,50);
}
// The last time that we displayed
var lastTime = "     ";
// If animating, this is the interval's id
var animInterval;

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
"5": (n,maxFive)=>maxFive ? [ // 5 -> 0
[0,0,0,1],
[0,0,1,0],
[n,1,1,1],
[1,1,1,2],
[0,2,1,2],
[0,2,0,2],
[1,1-n,1,1],
[0,1,0,1+n]] : [ // 5 -> 6
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
function draw(lastText,thisText,n) {
  buf.clear();
  var x = 1;  // x offset
  const p = 2; // padding around digits
  var y = p; // y offset
  const s = 34; // character size
  for (var i=0;i<lastText.length;i++) {
    var lastCh = lastText[i];
    var thisCh = thisText[i];
    if (thisCh==":") x-=4;
    var ch, chn = n;
    if (lastCh!==undefined &&
        (thisCh-1==lastCh ||
         (thisCh==0 && lastCh==5) ||
         (thisCh==0 && lastCh==9)))
      ch = lastCh;
    else {
      ch = thisCh;
      chn = 0;
    }
    var l = DIGITS[ch](chn,lastCh==5 && thisCh==0);
    l.forEach(c=>{
      if (c[0]!=c[2]) // horiz
        buf.fillRect(x+c[0]*s,y+c[1]*s-p,x+c[2]*s,y+c[3]*s+p);
      else if (c[1]!=c[3]) // vert
        buf.fillRect(x+c[0]*s-p,y+c[1]*s,x+c[2]*s+p,y+c[3]*s);
    });
    if (thisCh==":") x-=4;
    x+=s+p+7;
  }
  y += 2*s;
  var d = new Date();
  buf.setFont("6x8");
  buf.setFontAlign(-1,-1);
  buf.drawString(("0"+d.getSeconds()).substr(-2), x, y-8);
  // date
  buf.setFontAlign(0,-1);
  var date = locale.date(d,false);
  buf.drawString(date, buf.getWidth()/2, y+8);
  flip();
}

/* Show the current time, and animate if needed */
function showTime() {
  if (!Bangle.isLCDOn()) return;
  if (animInterval) return; // in animation - quit
  var d = new Date();
  var t = (" "+d.getHours()).substr(-2)+":"+
          ("0"+d.getMinutes()).substr(-2);
  var l = lastTime;
  // same - don't animate
  if (t==l) {
    draw(t,l,0);
    return;
  }
  var n = 0;
  animInterval = setInterval(function() {
    n += 1/10;
    if (n>=1) {
      n=1;
      clearInterval(animInterval);
      animInterval=0;
    }
    draw(l,t,n);
  }, 20);
  lastTime = t;
}

Bangle.on('lcdPower',function(on) {
  if (on)
    showTime();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
// Update time once a second
setInterval(showTime, 1000);
showTime();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
