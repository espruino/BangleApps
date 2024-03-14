// Code based on the original Mixed Clock

{
/* jshint esversion: 6 */
const locale = require("locale");
const Radius = { "center": 7, "hour": 60, "min": 80, "dots": 88 };
const Center = { "x": 120, "y": 96 };
const Widths = { hour: 2, minute: 2 };
const buf = Graphics.createArrayBuffer(240,192,1,{msb:true});
let timeoutId;

const rotatePoint = function(x, y, d, center, res) {
  "jit";
  const rad = -1 * d / 180 * Math.PI;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  res[0] = ((center.x + x * cos - y * sin) + 0.5) | 0;
  res[1] = ((center.y + x * sin - y * cos) + 0.5) | 0;
};


// from https://github.com/espruino/Espruino/issues/1702
const setLineWidth = function(x1, y1, x2, y2, lw) {
    "ram";
    let dx = x2 - x1;
    let dy = y2 - y1;
    let d = Math.sqrt(dx * dx + dy * dy);
    dx = dx * lw / d;
    dy = dy * lw / d;

    return [
        // rounding
        x1 - (dx + dy) / 2, y1 - (dy - dx) / 2,
        x1 - dx, y1 -dy,
        x1 + (dy - dx) / 2, y1 - (dx + dy) / 2,

        x1 + dy, y1 - dx,
        x2 + dy, y2 - dx,

        // rounding
        x2 + (dx + dy) / 2, y2 + (dy - dx) / 2, 
        x2 + dx, y2 + dy,
        x2 - (dy - dx) / 2, y2 + (dx + dy) / 2, 

        x2 - dy, y2 + dx,
        x1 - dy, y1 + dx
    ];
};

const drawMixedClock = function() {
  const date = new Date();
  const dateArray = date.toString().split(" ");
  const isEn = locale.name.startsWith("en");
  let point = [0, 0];
  const minute = date.getMinutes();
  const hour = date.getHours();
  let radius;

  g.reset();
  buf.clear();

  // draw date
  buf.setFont("6x8", 2);
  buf.setFontAlign(-1, 0);
  buf.drawString(locale.dow(date,true) + ' ', 4, 16, true);
  buf.drawString(isEn?(' ' + dateArray[2]):locale.month(date,true), 4, 176, true);
  buf.setFontAlign(1, 0);
  buf.drawString(isEn?locale.month(date,true):(' ' + dateArray[2]), 237, 16, true);
  buf.drawString(dateArray[3], 237, 176, true);

  // draw hour and minute dots
  for (let i = 0; i < 60; i++) {
      radius = (i % 5) ? 2 : 4;
      rotatePoint(0, Radius.dots, i * 6, Center, point);
      buf.fillCircle(point[0], point[1], radius);
  }

  // draw digital time
  buf.setFont("6x8", 3);
  buf.setFontAlign(0, 0);
  buf.drawString(dateArray[4], 120, 120, true);

  // draw new minute hand
  rotatePoint(0, Radius.min, minute * 6, Center, point);
  buf.drawLine(Center.x, Center.y, point[0], point[1]);
  buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.minute));
  // draw new hour hand
  rotatePoint(0, Radius.hour, hour % 12 * 30 + date.getMinutes() / 2 | 0, Center, point);
  buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.hour));

  // draw center
  buf.fillCircle(Center.x, Center.y, Radius.center);

  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),bpp:1,buffer:buf.buffer},0,24);

  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }
  const period = (Bangle.isLCDOn() ? 1000 : 60000); // Update every second if display is on else every minute
  let timeout = period - (Date.now() % period);
  timeoutId = setTimeout(()=>{
      timeoutId = undefined;
      drawMixedClock();
  }, timeout);
};

const onLCDPower = function(on) {
    if (on) {
      drawMixedClock();
      Bangle.drawWidgets();
    }
};
Bangle.on('lcdPower', onLCDPower);

Bangle.setUI({mode:"clock", remove:function() {
  if (timeoutId !== undefined) {
    delete buf.buffer;
    clearTimeout(timeoutId);
    timeoutId = undefined;
    Bangle.removeListener('lcdPower',onLCDPower);
  }
}});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawMixedClock(); // immediately draw
}
