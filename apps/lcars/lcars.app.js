/*
 * Assets: Images, fonts etc.
 */
var img = {
  width : 176, height : 176, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pNx48cAR1wyVJkgCrrdt23bARvaINyD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf4C/AX4C/AVNLlmy5YCN5RBuvPnzwCOvCD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/AX4C/AX4C/ASUSCaJBuufPnnzARvyQf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/ASkjQf9JkQTRqRBtkqDQ+fSINskxITQpRBuy6DQ5JBuyQTRlJBuriDP58lIN1ICaOUINtJkaDPnnyqRBtkgTSZF2XQZ4Cq6REFoj3uARTvHiaD/AQOJQf4CBpCD/AQdEQfoC/AX4C/pMtmnTpoCIiVJkss2XLAR0qEwO27dtAShBDpVp02aARIRBkvnz15AR3iEwIjLF5pBBqaAJQbW0EZQvNIIJTPQeGUKZ6DwKaCDwLhyDxkqD/F4JTRQd0pQf9JlqD/Qf6D/F4hTRQd5TRQfckKAICyKBXRIOqDJwQ+zQZdEH2iDLH2qDK6JB4QY8JQf80H2yDJ0RB5QY0SQf9pH26D/QZVoQf/TphB6Qf6DHoiD/zVkQf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/AVUtQYgCdomRGJclkodLiVJlKDEATtky88+fPARE9kodLKIKAgQcCAgQcBdLAWgA=="))
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
 * Queue drawing every minute
 */
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


/*
 * Draw watch face
 */
function draw(){
  g.reset();
  g.clearRect(0, 0, g.getWidth(), g.getHeight());

  // Draw background image
  g.drawImage(img, 0,0)

  // work out locale-friendly date/time
  var date = new Date();

  // Write time
  var timeStr = require("locale").time(date,1);
  g.setFontAlign(0,0,0);
  g.setFontMinaLarge();
  g.drawString(timeStr, 115, 40);

  // Write date
  g.setFontAlign(-1,-1,0);
  var dateStr = require('locale').date(date,1);
  g.setFontMinaSmall();
  g.drawString("DAT:", 28, 110);
  g.drawString(dateStr, 78, 110);

  // Draw steps
  var steps = Bangle.getStepCount();
  g.drawString("STEP:", 28, 130);
  g.drawString(steps, 78, 130);

  // Draw battery
  var bat = E.getBattery();
  g.drawString("BAT:", 28, 150);
  g.drawString(bat+"%", 78, 150);

  // Queue draw in one minute
  queueDraw();
}


// Clear the screen once, at startup
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();

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

// Currently we don't load widgets an use the full screen
// Bangle.loadWidgets();
// Bangle.drawWidgets();