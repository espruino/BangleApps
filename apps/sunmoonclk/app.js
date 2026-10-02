// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// X/Y are the position of the bottom right of the HH:MM text - make it central!
const X = g.getWidth()/2 + 45,
      Y = g.getHeight()/2 + 40;

function draw() {
  // work out how to display the current time
  var d = new Date();
  var clock = require("locale").time(d, 1 /*omit seconds*/);
  var seconds = d.getSeconds().toString().padStart(2,0);
  var meridian = require("locale").meridian(d);
 
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFontAlign(1,1); // align bottom right
  g.setFont("7x11Numeric7Seg:4");
  g.drawString(clock, X, Y, true /*clear background*/);
  // draw the meridian(am/pm) and seconds (2x size 7 segment)
  g.setFontAlign(-1,1); // align bottom left
  g.setFont("6x8:2");
  g.drawString(meridian, X+4, Y-26, true /*clear background*/);
  g.setFont("7x11Numeric7Seg:2");
  g.drawString(seconds, X+2, Y, true /*clear background*/);
  // draw the date, in a normal font
  g.setFont("6x8", 2);
  g.setFontAlign(0,-40); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, Y+15, true /*clear background*/);
  
   // Get current time
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let timeStr = ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2);

  // Draw sun or moon icon
  if (h >= 6 && h < 18) {
    drawSun(g.getWidth()/2, g.getHeight()/2 - 38);
  } else {
    clearSun(g.getWidth()/2, g.getHeight()/2 - 38);
    drawMoon(g.getWidth()/2, g.getHeight()/2 - 38);
  }
}

function drawSun(x, y) {
  g.setColor("#FF8C00"); // orange
  g.fillCircle(x, y, 12);
  for (let i = 0; i < 8; i++) {
    let angle = i * Math.PI / 4;
    g.drawLine(
      x + Math.cos(angle) * 16,
      y + Math.sin(angle) * 16,
      x + Math.cos(angle) * 22,
      y + Math.sin(angle) * 22
    );
  }
}
    function clearSun(x, y) {
  g.setColor("#000000"); // black
  g.fillCircle(x, y, 12);
  for (let i = 0; i < 8; i++) {
    let angle = i * Math.PI / 4;
    g.drawLine(
      x + Math.cos(angle) * 16,
      y + Math.sin(angle) * 16,
      x + Math.cos(angle) * 22,
      y + Math.sin(angle) * 22
    );
  }
}
function drawMoon(x, y) {
  g.setColor("#F5F5F5"); // white smoke
  g.fillCircle(x, y, 12);
  g.setColor(0, 0, 0); // mask for crescent
  g.fillCircle(x + 5, y - 2, 12);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
// now draw every second
var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();