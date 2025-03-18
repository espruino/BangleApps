// Palikkainen
//
// Bangle.js 2 watch face
// by Jukio Kallio
// www.jukiokallio.com

require("Font6x8").add(Graphics);

// settings
const watch = {  
  x:0, y:0, w:0, h:0, 
  bgcolor:g.theme.bg, 
  fgcolor:g.theme.fg, 
  font: "6x8", fontsize: 1,
  finland:true, // change if you want Finnish style date, or US style
};

// set some additional settings
watch.w = g.getWidth(); // size of the background
watch.h = g.getHeight();
watch.x = watch.w * 0.5; // position of the circles
watch.y = watch.h * 0.45;

const dateWeekday = { 0: "SUN", 1: "MON", 2: "TUE", 3: "WED", 4:"THU", 5:"FRI", 6:"SAT" }; // weekdays

var wait = 60000; // wait time, normally a minute


// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, wait - (Date.now() % wait));
}


// main function
function draw() {
  // make date object
  var date = new Date();
  
  // work out the date string
  var dateDay = date.getDate();
  var dateMonth = date.getMonth() + 1;
  var dateYear = date.getFullYear();
  var dateStr = dateWeekday[date.getDay()] + " " + dateMonth + "." + dateDay + "." + dateYear;
  if (watch.finland) dateStr = dateWeekday[date.getDay()] + " " + dateDay + "." + dateMonth + "." + dateYear; // the true way of showing date

  // Reset the state of the graphics library
  g.reset();
  
  // Clear the area where we want to draw the time
  g.setColor(watch.bgcolor);
  g.fillRect(0, 0, watch.w, watch.h);
  
  // setup watch face
  const block = {
    w: watch.w / 2 - 6,
    h: 18,
    pad: 4,
  };
  
  // get hours and minutes
  var hour = date.getHours();
  var minute = date.getMinutes();
  
  // calculate size of the block face
  var facew = block.w * 2 + block.pad;
  var faceh = (block.h + block.pad) * 6;
  
  
  // loop through first 12 hours and draw blocks accordingly
  g.setColor(watch.fgcolor); // set foreground color
  
  for (var i = 0; i < 12; i++) {
    // where to draw
    var x = watch.x - facew / 2; // starting position
    var y = watch.y + faceh / 2 - block.h - block.pad / 2; // draw blocks from bottom up
    if (i > 5) { 
      // second column
      x += block.w + block.pad;
      y -= (block.h + block.pad) * (i - 6);
    } else { 
      // first column
      x += 0;
      y -= (block.h + block.pad) * i;
    }
    
    if (i < hour) {
      // draw full hour block
      g.fillRect(x, y, x + block.w, y + block.h);
    } else if (i == hour) {
      // draw minutes
      g.fillRect(x, y, x + block.w * (minute / 60), y + block.h);
      
      // minute reading help
      for (var m = 1; m < 12; m++) {
        // set color
        if (m * 5 < minute) g.setColor(watch.bgcolor); else g.setColor(watch.fgcolor);

        var mlineh = 1; // minute line height
        if (m == 3 || m == 6 || m == 9) mlineh = 3; // minute line height at 15, 30 and 45 minutes

        g.drawLine(x + (block.w / 12 * m), y + block.h / 2 - mlineh, x + (block.w / 12 * m), y + block.h / 2 + mlineh);
      }
    }
  }
  
  
  // loop through second 12 hours and draw blocks accordingly
  if (hour >= 12) {
    g.setColor(watch.bgcolor); // set foreground color
    
    for (var i2 = 0; i2 < 12; i2++) {
      // where to draw
      var x2 = watch.x - facew / 2; // starting position
      var y2 = watch.y + faceh / 2 - block.h - block.pad / 2; // draw blocks from bottom up
      if (i2 > 5) { 
        // second column
        x2 += block.w + block.pad;
        y2 -= (block.h + block.pad) * (i2 - 6);
      } else { 
        // first column
        x2 += 0;
        y2 -= (block.h + block.pad) * i2;
      }

      if (i2 < hour % 12) {
        // draw full hour block
        g.fillRect(x2, y2, x2 + block.w, y2 + block.h);
      } else if (i2 == hour % 12) {
        // draw minutes
        g.fillRect(x2, y2, x2 + block.w * (minute / 60), y2 + block.h);
        
        // minute reading help
        for (var m2 = 1; m2 < 12; m2++) {
          // set color
          if (m2 * 5 < minute) g.setColor(watch.fgcolor); else g.setColor(watch.bgcolor);
          
          var mlineh2 = 1; // minute line height
          if (m2 == 3 || m2 == 6 || m2 == 9) mlineh2 = 3; // minute line height at 15, 30 and 45 minutes
          
          g.drawLine(x2 + (block.w / 12 * m2), y2 + block.h / 2 - mlineh2, x2 + (block.w / 12 * m2), y2 + block.h / 2 + mlineh2);
        }
      }
    }
  }
  
  
  // draw date
  var datey = 11;
  g.setFontAlign(0,-1).setFont(watch.font, watch.fontsize).setColor(watch.fgcolor);
  g.drawString(dateStr, watch.x, watch.y + faceh / 2 + datey);
  
  
  // queue draw
  queueDraw();
}


// Clear the screen once, at startup
g.clear();
// draw immediately at first
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
