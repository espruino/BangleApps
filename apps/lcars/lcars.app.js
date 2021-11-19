/*
 * Requirements and globals
 */
const locale = require('locale');
var alarm = -1;

var img = {
  width : 176, height : 151, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("gF58+eAR14IN1fvv374CN7yD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/AH4A/AH4A/AB1z588+YCN+RBuj158+eARyD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf4AUhyD/gEDQaHz4BCuQaNAIN0PQaHIIN0BQaF5IN0AQaHPkBBug6DQ8iEvQaE8yBBuhyDPAQNAINsBQaACBkhCuQaACpVo0cQaACo4CFGjyD/AAMPQf4ACQf4ADgiD+AH4A/AH8J02atICIwEAgPnz15AR3gEgM27dt2wCTF4IABgYROgN9+/fAR14ILsaQBKDakwjKF5oABKZ6DwgxTPQeEmQf5cPQeMBLhyDxgJTRQd0JKaKDuhKD/gENQf6D/F4VNQf8AKaKDvKBYnBAGZQKzBB1QZOwIGqDJsBA2QZJA3QZGYIPCDH4CD/0xA4QY+wIPKDGwCD/tpB6Qf6DHthA5QY1oIPSD/QY9gQf/bIPaD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/AF8JQYgCdsEHnnz54CJgIdLwEAhqDEATtggPnz15ARHkgIdLIIKAgQcCAgQcAA/gAA=="))
}

Graphics.prototype.setFontMinaSmall = function(scale) {
  // Actual height 18 (17 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAA/8w/8wAAQAAAAAA4AA8AAAAA8AAwAAAAAAEABEABEQB/w/8AxEABEwB/w/8AxEABEABEAAAAH4MP8MMEM8GPcGOMGMMGMMH4ABwAAA/gAwgAggAggQwhw/nAAOAA4ADgAOfw8YwwQwAQQAYwAfwAPgAGAAfg85w/wwzgww4wwdgwHggHgAPwAIQAAA8AAwAAAAAAfwH/+fAP4ABgAAgAA4ABfAPH/+A/wAAAAAAEAAHgAfAAfAAHgAMAAAAAAAABgABgABgAf4AP4ABgABgABAAAAAADAADwADAAAAAgAAwAAwAAwAAwAAwAAAAADAADAADAAAAAAEAA8AH4A+AHwA+AAwAAAAAf/g//wwAwwAwwAwwAwwAwwAwf/gH+AAAAAAAYAAwAAwAA//wAAAAAAAAAwAwwBwwDwwDwwGwwcww4wfwwPAwAAAAAAwAwwQwwQwwQwwQwwYww4wf/gHHAAAAAEAAeAA+ADmAPGAcGAwGAh/wD/wAEAAEAAAAf4w/4wwwwwwwwwwwwwwwww/wgfgAAAAAAP/Af/gwwwwwwwwwwwwwwwwwww/gAAAgAAwAAwAAwAwwHww/Az4A/AA8AAAAAAAAfPg//wxwwwwwwwwwwwwww//wffgAAAAAAfwQ/wwwQwwYwwQwwQwwQw//wP/AAAAAAAMDAMDAMDAAAAAAAMDAMDwMDAAAAAAADgADgAHwAGwAMYAMYAIIAAAAEQAGYAGYAGYAGYAGYAGYAGYAAAAMYAMYAGwAGwAHgADgADAAAAAwAAwAAwAAwcwwcwwQAwQA/wAfgAAAAAAAB/8D/+TAGbHjbPzbMTbMzbMzb/zZ/zYAGf/+H/8AAAAAAABwAPwA+AH+A+GA8GAfmAD+AAfgADwAAQAAA//w//wwwwwwwwwwwwwxww//wffgAAAAAAP/Af/gwBwwAwwAwwAwwAwwAwwAwAAA//w//wwAwwAwwAwwAwwAw4Bwf/gH+AAAAAAAf/g//wwQwgQQgQQgQQgQQgQQgAQAAAf/w//wwQAgQAgQAgQAgQAgQAgAAAAAP/Af/gwAwwAwwAwwYwwYwwfwwfwAAAAAA//w//wAYAAYAAYAAYAAYAAYA//w//wAAA//w//wAAAAAAAAwAAwAAw//w//AAAA//w//wAYAA4AD8AHHAeDg4AwgAQAAAAAA//g//wAAwAAwAAwAAwAAwAAwAAQAAAP/w//w+AAPwAB+AAHwADwA/gH4A/AA/4A//wAAwAAA//w//wcAAPAADgAA4AAeAAHAADw//wAAAAAAH/Af/g4AwwAwwAwwAwwAwwAwcDwP/gB4AAAA//w//wwQAwQAwQAwYAwwA/wAPgAAAAH/Af/gwAwwAwwAwwA8wA8wA2cDkP/gB4AAAA//w//wwYAwYAwYAwcAwfA/zwPgwAAAAAAfgA/wwwQwwYwwYwwYwwYwwfwAPgAAAAAAwAAwAAwAA//w//wwAAwAAwAAwAAAAA/+A//gABwAAwAAwAAwAAwAAwAPg//AAAAAAA4AA/AAH4AA/AAHwADwAfgD8AfgA8AAgAAAAA4AA/AAH4AA/AAHwAHwA/AP4A/4Aw/AAHwAHwA/AP4A+AAwAAAAAwAw8DwOHAD8AB4AD8AOHA8DwwAwAAAAAAwAA8AAPAADwAA/wB/wHgAeAA4AAgAAgAQwBwwHwwOww8wxww3gw+Aw4AwwAQAAAH//f//YAAYAAQAAwAA+AAPwAB+AAPwAB8AAMQAAYAAYAAf//AAAAAA"), 32, atob("BgUHDAoRCwMGBggJBQYFBwwHCwsLCwsKCwsFBQkICQoPDAsKDAoKCwsEBgsKDgwMCgwLCwoMDBELCwoGBwY="), 18+(scale<<8)+(1<<16));
}

Graphics.prototype.setFontMinaLarge = function(scale) {
  // Actual height 35 (34 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAB4AAAAAPgAAAAA+AAAAAD4AAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAH4AAAAD/gAAAB/8AAAA/+AAAAf/AAAAP/gAAAH/wAAAD/4AAAD/8AAAB/+AAAAP/AAAAA/AAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///4AA////wAH////gA+AAAfADwAAA8AOAAABwA4AAAHADgAAAcAOAAABwA4AAAHADgAAAcAOAAABwA4AAAHADgAAAcAOAAABwA8AAAPAD4AAB8AH////gAP///8AAf///gAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAcAAAAADgAAAAAOAAAAAB4AAAAAHAAAAAA8AAAAAD////8AP////wA/////AD////8AAAAAAAAAAAAAAAAAAAAAGAAAAAA4AAAHADgAAA8AOAAAHwA4AAA/ADgAAD8AOAAAfwA4AAD/ADgAAfcAOAAD5wA4AAfHADgAD4cAOAAfBwA4AD8HADwAfgcAPAD8BwAeA/AHAB+f4AcAD//ABwAH/wAHAAH8AAcAAAAAAAAAAAAAAAAAAAAAGAAABgAYAAAGADgAAAcAOAHABwA4AcAHADgBwAcAOAHABwA4AcAHADgBwAcAOAHABwA4AcAHADgBwAcAOAHABwA4AcAHADwB4A8APAPgDwAfD//+AB////4AD/8//AAD/B/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAA8AAAAAPwAAAAD/AAAAAf8AAAAH9wAAAB/HAAAAPwcAAAD+BwAAAfgHAAAH8AcAAB/ABwAAPwAHAAA+AAcAADgABwAAIAAHgAAAH///AAB///8AAH///wAAAAcAAAAABwAAAAAHAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAH/8AYAP//wBgA///AHAD//wAcAOAPABwA4A4AHADgDgAcAOAOABwA4A4AHADgDgAcAOAOABwA4A4AHADgDgA8AOAOADwA4A8APADgD8H4AOAH//gA4AP/8AAAAP/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAD//+AAB///+AAP///8AB/BgH4APgOAHwA8A4APADgDgAcAOAOABwA4A4AHADgDgAcAOAOABwA4A4AHADgDgAcAOAOABwA4A4AHADgDwA8AOAP//wA4Af/+ABgA//wAAAA/8AAAAAAAAAAAAAAAAAAAAAA4AAAAADgAAAAAOAAAAAA4AAAAADgAAAAAOAAAAQA4AAAHADgAAD8AOAAA/wA4AAf+ADgAP/gAOAD/wAA4B/8AADg/+AAAOP/AAAA//wAAAD/4AAAAP8AAAAA/AAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/h/4AA//P/wAH////gA+B/AfADwD4A8AOAHABwA4AcAHADgBwAcAOAHABwA4AcAHADgBwAcAOAHABwA4AcAHADgBwAcAPAPgDwA8A+APAB////4AH////gAP/j/8AAD4B8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wAAAA//gAYAH//ABwA//+AHADwB4AcAOADgBwA4AOAHADgA4AcAOADgBwA4AOAHADgA4AcAOADgBwA4AOAHADgA4AcAPADgDwA+AOAfAB+A4f4AD////AAH///4AAD//8AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAeAAB8AD4AAHwAPgAAfAA+AAB4AB4AAAAAAAAAAAAAAAAAAAAAA="), 46, atob("CxAaDhgYGBgZFhkZCw=="), 40+(scale<<8)+(1<<16));
}


/*
 * Draw watch face
 */
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw(){
  g.reset();
  g.clearRect(0, 24, g.getWidth(), g.getHeight());

  // Draw background image
  g.drawImage(img, 0, 24);

  // Write time
  var currentDate = new Date();
  var timeStr = locale.time(currentDate,1);
  g.setFontAlign(0,0,0);
  g.setFontMinaLarge();
  g.drawString(timeStr, 115, 53);

  // Write date
  g.setFontAlign(-1,-1,0);
  g.setFontMinaSmall();

  var dayName = locale.dow(currentDate, true).toUpperCase();
  var day = currentDate.getDate();
  g.drawString("DATE:", 40, 107);
  g.drawString(dayName + " " + day, 100, 105);

  // Draw battery
  var bat = E.getBattery();
  g.drawString("BAT:", 40, 127);
  g.drawString(bat+"%", 100, 127);

  // Draw steps
  if(alarm < 0){
    var steps = Bangle.getStepCount();
    g.drawString("STEP:", 40, 147);
    g.drawString(steps, 100, 147);
  } else {
    g.drawString("ALRM:", 40, 147);
    g.drawString("T-" + alarm, 100, 147);
  }

  // Queue draw in one minute
  queueDraw();
}


/*
 * Handle alarm
 */
var alarmTimeout;
function queueAlarm() {
  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(function() {
    alarmTimeout = undefined;
    handleAlarm();
  }, 60000 - (Date.now() % 60000));
}

function handleAlarm(){

    // After n minutes, inform the user.
    if(alarm <= 1){
      alarm = -1;

      var t = 300;
      Bangle.buzz(t, 1)
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1))
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1))
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1));

      // Draw watch face again to show data instead of alarm.
      draw();

    // If we still have to wait, queue alarm again.
    } else if(alarm > 0){
      alarm--;
      queueAlarm();
      draw();
    }
}


/*
 * Swipe to set an alarm
 */
Bangle.on('swipe',function(dir) {
  // Increase alarm
  if(dir == -1){
    alarm = alarm < 0 ? 0 : alarm;
    alarm += 5;

    queueAlarm();
  }

  // Decrease alarm
  if(dir == +1){
    alarm -= 5;
    alarm = alarm <= 0 ? -1 : alarm;
  }

  draw();
});


// Clear the screen once, at startup and draw clock
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
draw();


/*
 * Stop updates when LCD is off, restart when on
 */
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

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();