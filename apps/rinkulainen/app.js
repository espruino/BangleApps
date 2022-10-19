// Rinkulainen
//
// Bangle.js 2 watch face
// by Jukio Kallio
// www.jukiokallio.com

// settings
const watch = { 
  theme: "default", 
  x:0, y:0, w:0, h:0, 
  color:"#000000", // change background color
  finland:true, // change if you want Finnish style date, or US style
  
    // default theme "colorful"
    hour: { size:60, weight:8, color:"#00FFFF", cursor:10 },
    minute: { size:40, weight:16, color:"#FFFF00", cursor:6 },
    second: { on: false, cursor:2 }, // if on, uses a lot more battery
    date: { font:"6x8", size:1, y:15, color:"#FFFF00" }
};

// more themes
if (watch.theme == "grayscale") {
  watch.hour = { size:60, weight:20, color:"#999999", cursor:8 };
  watch.minute = { size:40, weight:20, color:"#dddddd", cursor:8 };
  watch.second = { on: false, cursor:2 }; // if on, uses a lot more battery
  watch.date = { font:"6x8", size:1, y:15, color:"#ffffff" };
} else if (watch.theme == "maze") {
  watch.hour = { size:50, weight:7, color:"#ffffff", cursor:6 };
  watch.minute = { size:30, weight:7, color:"#ffffff", cursor:6 };
  watch.second = { on: false, cursor:2 }; // if on, uses a lot more battery
  watch.date = { font:"6x8", size:1, y:15, color:"#ffffff" };
} else if (watch.theme == "disks") {
  watch.hour = { size:72, weight:30, color:"#00ff66", cursor:4 };
  watch.minute = { size:36, weight:32, color:"#0066ff", cursor:4 };
  watch.second = { on: false, cursor:2 }; // if on, uses a lot more battery
  watch.date = { font:"6x8", size:1, y:10, color:"#ffffff" };
}

// set some additional settings
watch.w = g.getWidth(); // size of the background
watch.h = g.getHeight();
watch.x = watch.w * 0.5; // position of the circles
watch.y = watch.h * 0.46;
watch.date.y = watch.date.y + watch.y + watch.hour.size; // final position of the date

const dateWeekday = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4:"Thursday", 5:"Friday", 6:"Saturday" }; // weekdays

var wait = 60000; // wait time, normally a minute
if (watch.second.on) wait = 1000; // a second if seconds are used


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
  g.setColor(watch.color);
  g.fillRect(0, 0, watch.w, watch.h);
  
  // variables for vertex transformation
  var tver, tobj, tran;
  
  // draw hour circle
  g.setColor(watch.hour.color).fillCircle(watch.x, watch.y, watch.hour.size);
  g.setColor(watch.color).fillCircle(watch.x, watch.y, watch.hour.size - watch.hour.weight);
  // draw hour line
  g.setColor(watch.color);
  var thour = (date.getHours() / 12) * (Math.PI * 2);
  tver = [-watch.hour.cursor, 0, watch.hour.cursor, 0, watch.hour.cursor, -watch.hour.size*1.05, -watch.hour.cursor, -watch.hour.size*1.05];
  tobj = { x:watch.x, y:watch.y, scale:1, rotate:thour };
  tran = g.transformVertices(tver, tobj);
  g.fillPoly(tran);
  
  // draw minute circle
  g.setColor(watch.minute.color).fillCircle(watch.x, watch.y, watch.minute.size);
  g.setColor(watch.color).fillCircle(watch.x, watch.y, watch.minute.size - watch.minute.weight);
  // draw minute line
  g.setColor(watch.color);
  var tmin = (date.getMinutes() / 60) * (Math.PI * 2);
  tver = [-watch.minute.cursor, 0, watch.minute.cursor, 0, watch.minute.cursor, -watch.minute.size*1.05, -watch.minute.cursor, -watch.minute.size*1.05];
  tobj = { x:watch.x, y:watch.y, scale:1, rotate:tmin };
  tran = g.transformVertices(tver, tobj);
  g.fillPoly(tran);
  
  // draw seconds line, if the feature is on
  if (watch.second.on) {
    g.setColor(watch.color);
    var tsec = (date.getSeconds() / 60) * (Math.PI * 2);
    tver = [-watch.second.cursor, 0, watch.second.cursor, 0, watch.second.cursor, -watch.second.size*1.045, -watch.second.cursor, -watch.second.size*1.045];
    tobj = { x:watch.x, y:watch.y, scale:1, rotate:tsec };
    tran = g.transformVertices(tver, tobj);
    g.fillPoly(tran);
  }
  
  // draw date
  g.setFontAlign(0,0).setFont(watch.date.font, 1).setColor(watch.date.color);
  g.drawString(dateStr, watch.x, watch.date.y + watch.date.size + 2);
  
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
