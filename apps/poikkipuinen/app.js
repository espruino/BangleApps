// Poikkipuinen
//
// Bangle.js 2 watch face
// by Jukio Kallio
// www.jukiokallio.com

require("Font5x9Numeric7Seg").add(Graphics);

// settings
const watch = {  
  x:0, y:0, w:0, h:0, 
  bgcolor:g.theme.bg, 
  fgcolor:g.theme.fg, 
  font: "5x9Numeric7Seg", fontsize: 1,
  finland:true, // change if you want Finnish style date, or US style
};


// set some additional settings
watch.w = g.getWidth(); // size of the background
watch.h = g.getHeight();
watch.x = watch.w * 0.5; // position of the circles
watch.y = watch.h * 0.46;

const dateWeekday = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4:"Thursday", 5:"Friday", 6:"Saturday" }; // weekdays

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
  
  // set foreground color
  g.setColor(watch.fgcolor);
  g.setFontAlign(1,-1).setFont(watch.font, watch.fontsize);
  
  // watch face size
  var facew, faceh; // halves of the size for easier calculation
  facew = 40;
  faceh = 59;
  
  // save hour and minute y positions
  var houry, minutey;
  
  // draw hour meter
  g.drawLine(watch.x - facew, watch.y - faceh, watch.x - facew, watch.y + faceh);
  var lines = 13;
  for (var i = 1; i < lines; i++) {
    var w = 2;
    var y = -faceh * 2 / (lines-2) * (i-1) + faceh;
    
    if (i % 3 == 0) {
      // longer line and numbers every 3
      w = 5;
      g.drawString(i, watch.x - facew - 2, y + watch.y);
    }
    
    g.drawLine(watch.x - facew, y + watch.y, watch.x - facew + w, y + watch.y);
    
    // get hour y position
    if (i == date.getHours() % 12) houry = y;
  }
  
  // draw minute meter
  g.drawLine(watch.x + facew, watch.y - faceh, watch.x + facew, watch.y + faceh);
  g.setFontAlign(-1,-1);
  lines = 60;
  for (i = 0; i < lines; i++) {
    var mw = 2;
    var my = -faceh * 2 / (lines-1) * (i) + faceh;
    
    if (i % 15 == 0 && i != 0) {
      // longer line and numbers every 3
      mw = 5;
      g.drawString(i, watch.x + facew + 4, my + watch.y);
    }
    
    g.drawLine(watch.x + facew, my + watch.y, watch.x + facew - mw, my + watch.y);
    
    // get minute y position
    if (i == date.getMinutes()) minutey = my;
  }
  
  // draw the time
  var timexpad = 8;
  g.drawLine(watch.x - facew + timexpad, watch.y + houry, watch.x + facew - timexpad, watch.y + minutey);
  
  // draw date
  var datey = 12;
  g.setFontAlign(0,-1);
  g.drawString(dateStr, watch.x, watch.y + faceh + datey);
  
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
