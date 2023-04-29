// Get 12 hour status, from barclock
const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];

// Used from waveclk to schedule updates every minute
var drawTimeout;

// Schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

// From forum conversation 348275
function fillLine(x1, y1, x2, y2, lineWidth) {
  var dx, dy, d;
  if (!lineWidth) {
    g.drawLine(x1, y1, x2, y2);
  } else {
      lineWidth = (lineWidth - 1) / 2;
      dx = x2 - x1;
      dy = y2 - y1;
      d = Math.sqrt(dx * dx + dy * dy);
      dx = Math.round(dx * lineWidth / d, 0);
      dy = Math.round(dy * lineWidth / d, 0);
      g.fillPoly([x1 + dx, y1 - dy, x1 - dx, y1 + dy, x2 - dx, y2 + dy, x2 + dx, y2 - dy], true);
  }
}

// Mainly to convert day number to day of the week
function convertDate(date) {
  var dayNum = date.getDay();
  var month = date.getMonth();
  var dayOfMonth = date.getDate();
  var dayChar;
  
  month += 1;
  
  switch (dayNum) {
    case 0 : dayChar = "Sun"; break;
    case 1 : dayChar = "Mon"; break;
    case 2 : dayChar = "Tue"; break;
    case 3 : dayChar = "Wed"; break;
    case 4 : dayChar = "Thur"; break;
    case 5 : dayChar = "Fri"; break;
    case 6 : dayChar = "Sat"; break;
  }
  
  return dayChar + " " + month + "/" + dayOfMonth;
}

function draw() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var minutes = ("0"+m).substr(-2);
  g.reset();
  
  // If midnight clear display to remove day / date artifacts
  if (h == 0 && m == 0)
    g.clear();
  
  // Convert to 12hr time mode
  if (is12Hour && h > 12) {
    h = h - 12;
    if (h < 10) {
      h = "0" + h;
    }
  } else if (h < 12) {
    h = "0" + h;
  } else if (h == 0) {
    h = 12;
  }
  
  var hour = (" "+h).substr(-2);
  
  // Draw the time, vector font
  g.setFont("Vector", 50);
  g.setFontAlign(1,1); // Align right bottom
  g.drawString(hour, 85, 80, true);
  g.drawString(minutes, 155, 140, true);
  
  // Draw slash, width 6
  fillLine(57, 120, 112, 40, 6);

  // Convert date then draw
  g.setFont("Vector", 20);
  g.setFontAlign(0,1); // Align center bottom
  var convertedDate = convertDate(d);
  g.drawString(convertedDate, g.getWidth()/2, 170, true);

  Bangle.drawWidgets();
  queueDraw();
}

// Clear screen and draw
g.clear();
draw();

// From waveclk
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // Draw immediately, queue redraw
  } else { // Stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
