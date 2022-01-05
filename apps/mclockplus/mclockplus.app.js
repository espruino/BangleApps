// Morphing Clock +
// Modifies original Morphing Clock to make seconds and date more readable, and adds a simple stopwatch
// Icon by https://icons8.com
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];
var locale = require("locale");
var CHARW = 28; // how tall are digits?
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
// Variables for the stopwatch
var counter = -1;  // Counts seconds
var oldDate = new Date(2020,0,1);   // Initialize to a past date
var swInterval;   // The interval's id
var B3 = 0;       // Flag to track BTN3's current function
var w1;           // watch id for BTN1
var w3;           // watch id for BTN3

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
  var x = 16;  // x offset
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
function drawDate() {
  var x = (CHARW + CHARP + 8)*5;
  var y = Y + 2*CHARW + CHARP;
  var d = new Date();
  // meridian
  g.reset();
  g.setFont("6x8",2);
  g.setFontAlign(-1,-1);
  if (is12Hour) g.drawString((d.getHours() < 12) ? "AM" : "PM", x+8, Y+0, true);
  // date
  g.setFont("Vector16");
  g.setFontAlign(0,-1);
  // Only draw the date if it has changed:
  if ((d.getDate()!=oldDate.getDate())||(d.getMonth()!=oldDate.getMonth())||(d.getFullYear()!=oldDate.getFullYear())) {
    var date = locale.date(d,false);
    g.clearRect(1,y+8,g.getWidth(),y+24);
    g.drawString(date, g.getWidth()/2, y+8, true);
    oldDate = d;
  }
}

function drawSeconds() {
  var x = (CHARW + CHARP + 8)*5;
  var y = Y + 2*CHARW + CHARP;
  var d = new Date();
  // seconds
  g.reset();
  g.setFont("6x8",2);
  g.setFontAlign(-1,-1);
  g.drawString(("0"+d.getSeconds()).substr(-2), x+8, y-12, true);
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
    drawDate();
    drawSeconds();
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
    drawSeconds();
  }, 20);
  lastTime = t;
}

function stopWatch() {

  counter++;

  var hrs  = Math.floor(counter/3600);
  var mins = Math.floor((counter-hrs*3600)/60);
  var secs = counter - mins*60 - hrs*3600;

  // When starting the stopwatch:
  if (B3) {
    // Set BTN3 to stop the stopwatch and bind itself to restart it:
    w3=setWatch(() => {clearInterval(swInterval);
                       swInterval=undefined;
                       if (w3) {clearWatch(w3);w3=undefined;}
                       setWatch(() => {swInterval=setInterval(stopWatch, 1000);stopWatch();},
                       BTN3, {repeat:false,edge:"falling"});
                       B3 = 1;},
                         BTN3, {repeat:false,edge:"falling"});
    B3 = 0;  // BTN3 is bound to stop the stopwatch
  }

  // Bind BTN1 to call the reset function:
  if (!w1) w1 = setWatch(resetStopWatch, BTN1, {repeat:false,edge:"falling"});

  // Draw elapsed time:
  g.reset();
  g.setColor(0.0,0.5,1.0).setFontAlign(0,-1).setFont("Vector24");
  g.clearRect(1,180,g.getWidth(),210);
  if (hrs>0) {
    g.drawString(("0"+parseInt(hrs)).substr(-2), g.getWidth()/2 - 72, 180, true);
    g.drawString( ":",                           g.getWidth()/2 - 48, 180, true);
  }
  g.drawString(("0"+parseInt(mins)).substr(-2), g.getWidth()/2 - 24, 180, true);
  g.drawString( ":",                            g.getWidth()/2,      180, true);
  g.drawString(("0"+parseInt(secs)).substr(-2), g.getWidth()/2 + 24, 180, true);

}

function resetStopWatch() {

  // Stop the interval if necessary:
  if (swInterval) {
    clearInterval(swInterval);
    swInterval=undefined;
  }

  // Clear the stopwatch:
  g.clearRect(1,180,g.getWidth(),210);

  // Reset the counter:
  counter = -1;

  // Set BTN3 to start the stopwatch again:
  if (!B3) {
    // In case the stopwatch is reset while still running, the watch on BTN3 is still active, so we need to reset it manually:
    if (w3) {clearWatch(w3);w3=undefined;}
    // Set BTN3 to start the watch again:
    setWatch(() => {swInterval=setInterval(stopWatch, 1000);stopWatch();}, BTN3, {repeat:false,edge:"falling"});
    B3 = 1;  // BTN3 is bound to start the stopwatch
  }

  // Reset watch on BTN1:
  if (w1) {clearWatch(w1);w1=undefined;}
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

g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
// Update time once a second
timeInterval = setInterval(showTime, 1000);
showTime();

// Start stopwatch when BTN3 is pressed
setWatch(() => {swInterval=setInterval(stopWatch, 1000);stopWatch();}, BTN3, {repeat:false,edge:"falling"});
B3 = 1;  // BTN3 is bound to start the stopwatch
