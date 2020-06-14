// Code based on the original Mixed Clock

/* jshint esversion: 6 */
var locale = require("locale");
const Radius = { "center": 7, "hour": 60, "min": 80, "dots": 88 };
const Center = { "x": 120, "y": 96 };
const Widths = { hour: 2, minute: 2 };
var buf = Graphics.createArrayBuffer(240,192,1,{msb:true});

function rotatePoint(x, y, d) {
    rad = -1 * d / 180 * Math.PI;
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
    xn = ((Center.x + x * cos - y * sin) + 0.5) | 0;
    yn = ((Center.y + x * sin - y * cos) + 0.5) | 0;
    p = [xn, yn];
    return p;
}


// from https://github.com/espruino/Espruino/issues/1702
function setLineWidth(x1, y1, x2, y2, lw) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = Math.sqrt(dx * dx + dy * dy);
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
}


function drawMixedClock(force) {
  if ((force || Bangle.isLCDOn()) && buf.buffer) {
    var date = new Date();
    var dateArray = date.toString().split(" ");
    var isEn = locale.name.startsWith("en");
    var point = [];
    var minute = date.getMinutes();
    var hour = date.getHours();
    var radius;
    
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
    for (i = 0; i < 60; i++) {
        radius = (i % 5) ? 2 : 4;
        point = rotatePoint(0, Radius.dots, i * 6);
        buf.fillCircle(point[0], point[1], radius);
    }

    // draw digital time
    buf.setFont("6x8", 3);
    buf.setFontAlign(0, 0);
    buf.drawString(dateArray[4], 120, 120, true);

    // draw new minute hand
    point = rotatePoint(0, Radius.min, minute * 6);
    buf.drawLine(Center.x, Center.y, point[0], point[1]);
    buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.minute));
    // draw new hour hand
    point = rotatePoint(0, Radius.hour, hour % 12 * 30 + date.getMinutes() / 2 | 0);
    buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.hour));

    // draw center
    buf.fillCircle(Center.x, Center.y, Radius.center);

    g.drawImage({width:buf.getWidth(),height:buf.getHeight(),bpp:1,buffer:buf.buffer},0,24);
  }
}

Bangle.on('lcdPower', function(on) {
  if (on)
    drawMixedClock(true);
    Bangle.drawWidgets();
});

setInterval(() => drawMixedClock(true), 30000); // force an update every 30s even screen is off

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawMixedClock(); // immediately draw
setInterval(drawMixedClock, 500); // update twice a second

// Show launcher when middle button pressed after freeing memory first
setWatch(() => {delete buf.buffer; Bangle.showLauncher()}, BTN2, {repeat:false,edge:"falling"});
