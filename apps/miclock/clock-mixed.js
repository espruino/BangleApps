/* jshint esversion: 6 */
var locale = require("locale");
const Radius = { "center": 8, "hour": 78, "min": 95, "dots": 102 };
const Center = { "x": 120, "y": 132 };

function rotatePoint(x, y, d) {
  rad = -1 * d / 180 * Math.PI;
  var sin = Math.sin(rad);
  var cos = Math.cos(rad);
  xn = ((Center.x + x * cos - y * sin) + 0.5) | 0;
  yn = ((Center.y + x * sin - y * cos) + 0.5) | 0;
  p = [xn, yn];
  return p;
}

function drawMixedClock() {

  var date = new Date();
  var dateArray = date.toString().split(" ");
  var isEn = locale.name.startsWith("en");
  var point = [];
  var minute = date.getMinutes();
  var hour = date.getHours();
  var radius;

  // draw date
  g.setColor(0x7be0);
  g.setFont("6x8", 2);
  g.setFontAlign(-1, 0);
  g.drawString(locale.dow(date,true) + ' ', 4, 35, true);
  g.drawString(isEn?(' ' + dateArray[2]):locale.month(date,true), 4, 225, true);
  g.setFontAlign(1, 0);
  g.drawString(isEn?locale.month(date,true):(' ' + dateArray[2]), 237, 35, true);
  g.drawString(dateArray[3], 237, 225, true);

  // draw hour and minute dots
  g.setColor(0xFD20); // orange
  for (i = 0; i < 60; i++) {
    radius = (i % 5) ? 2 : 4;
    point = rotatePoint(0, Radius.dots, i * 6);
    g.fillCircle(point[0], point[1], radius);
  }

  // erase last minutes hand
  g.setColor(0);
  point = rotatePoint(0, Radius.min, (minute - 1) * 6);
  g.drawLine(Center.x, Center.y, point[0], point[1]);

  // erase last two hour hands
  g.setColor(0);
  p = rotatePoint(0, Radius.hour, hour % 12 * 30 + (minute - 2) / 2 | 0);
  g.drawLine(Center.x, Center.y, p[0], p[1]);
  point = rotatePoint(0, Radius.hour, hour % 12 * 30 + (minute - 1) / 2 | 0);
  g.drawLine(Center.x, Center.y, point[0], point[1]);

  // draw digital time
  g.setFont("6x8", 3);
  g.setColor(0x7be0);
  g.setFontAlign(0, 0);
  g.drawString(dateArray[4].substr(0, 5), 120, 180, true);

  // draw new minute hand
  point = rotatePoint(0, Radius.min, minute * 6);
  g.setColor(0xFFFF);
  g.drawLine(Center.x, Center.y, point[0], point[1]);
  // draw new hour hand
  point = rotatePoint(0, Radius.hour, hour % 12 * 30 + date.getMinutes() / 2 | 0);
  g.setColor(0xFFFF);
  g.drawLine(Center.x, Center.y, point[0], point[1]);

  // draw center
  g.setColor(0xFD20);
  g.fillCircle(Center.x, Center.y, Radius.center);
}
Bangle.on('lcdPower', function(on) {
  if (on)
    drawMixedClock();
});

// Show launcher when button pressed
Bangle.setUI("clock");

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(drawMixedClock, 5E3);
drawMixedClock();


