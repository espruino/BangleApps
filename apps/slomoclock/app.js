/*
Simple watch [slomoclock]
Mike Bennett mike[at]kereru.com
0.01 : Initial
*/

var v='0.01';

// timeout used to update every minute
var drawTimeout;
var x,y,w,h;

// Variables for the stopwatch
var counter = -1;  // Counts seconds
var oldDate = new Date(2020,0,1);   // Initialize to a past date
var swInterval;   // The interval's id
var B3 = 0;       // Flag to track BTN3's current function
var w1;           // watch id for BTN1
var w3;           // watch id for BTN3

// Colours
var colTime = 0x4FE0;
var colDate = 0xEFE0;
var colSW = 0x1DFD;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function stopWatch(clear) {

  x = 120;
  y = 200;
  w = 240;
  h = 25;

  g.reset();
  g.setColor(colSW);
  g.clearRect(x-(w/2),y-h,x+(w/2),y); // clear the background
  if (clear) return;
  
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
  g.setFontAlign(0,1);
  g.setFont("Vector24");
  
  var swStr = ("0"+parseInt(mins)).substr(-2) + ':' + ("0"+parseInt(secs)).substr(-2);

  if (hrs>0) swStr = ("0"+parseInt(hrs)).substr(-2) + ':' + swStr;

  g.drawString(swStr, x, y, true);

}

function resetStopWatch() {

  // Stop the interval if necessary:
  if (swInterval) {
    clearInterval(swInterval);
    swInterval=undefined;
  }

  // Clear the stopwatch:
  stopWatch(true);
  
  // Restore the date
  drawDate();

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


function drawDate() {
  // draw date
  x = 120;
  y = 200;
  w = 240;
  h = 25;

  g.reset();
  g.setColor(colDate);
  g.clearRect(x-(w/2),y-h,x+(w/2),y); // clear the background
  
  var date = new Date();
//  var dateStr = require("locale").date(date,1);  
  var dateStr = date.getDate() + ' ' +require("locale").month(date,1);  
  g.setFontAlign(0,1);
  g.setFont("Vector24");
  g.drawString(dateStr,x,y);
  
}


function drawTime() {
  x = 120;
  y = 107;
  w = 120;
  h = 134;

  var date = new Date();
  var timeStr = require("locale").time(date,1);
  g.reset();
  g.clearRect(x-(w/2),y-(h/2),x+(w/2),y+(h/2)); // clear the background
  g.setFontAlign(0,0);
  g.setFontVector(85);  
  g.setColor(colTime);
  g.drawString(timeStr.substring(0,2),x,y-30);
  g.drawString(timeStr.substring(3,5),x,y+38);
}

function draw() {
  x = g.getWidth()/2;
  y = g.getHeight()/2;
  g.reset();
  
  drawTime();
  if ( counter < 0 ) drawDate(); // Only draw date when SW is not running.
  
  // queue draw in one minute
  queueDraw();
}

// Clear the screen once, at startup
g.clear();

// draw immediately at first, queue update
draw();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Start stopwatch when BTN3 is pressed
setWatch(() => {swInterval=setInterval(stopWatch, 1000);stopWatch();}, BTN3, {repeat:false,edge:"falling"});
B3 = 1;  // BTN3 is bound to start the stopwatch

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
