/* Set background image */

var imgBg = {
  width : 176, height : 176, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("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"))
};

/* Set hour hand image */

var imgHour = {
  width : 19, height : 62, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("/wAF64AEBgwQJChYRJCY4RLCYoRNCQYROCYYS/CWKXSXqbjTCZYRHCZIRJCY4RLCQVWqwSQwOBCX4S/CXb1VCRYRGChIJC1hJDAYYTFA4QMBCQuB1gTFCIoSFCYokGCQyJEBQwSHA4ISSCYIKFqwSRSgiKCCQwhBM4QAFEpAMEDA1WCQgyHHwy9JChASRchYkJCYpNBAAQQICYxaHCZwRKCYTTCCR6ZCCR62BLoIRMawoSNJgQSRCKASmCYQSRCKASmABIA="))
};

/* Set minute hand image */

var imgMin = {
  width : 10, height : 80, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("/wAL64ABA44ADBBAKCBKQAdHhJQILZBtIBLwKEHRoTKBMlWqwJIwIJ/BP4J/BKDbJBM2BBP4J/BKgADBJoKEBAgJoBQYJIBAwJoBQIJIABw="))
};

/* Set second hand image */

var imgSec = {
  width : 8, height : 116, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("/3XAAf+AAIHEBAQHMC4QIEA4wGDBAYH/A/4HsayD0BBYj9DBowDLC44nIHAxHGR/4H/A/4H/A9IGBA4YFCAAYHHAAmsAomBqwABA4gICA4oIBC5YICGZRAGK5Cf/A/4H/A7YGFA4oA=="))
};

/* Set variables to get screen width, height and center points */

let W = g.getWidth();
let H = g.getHeight();
let cx = W/2;
let cy = H/2;
let Timeout;

/* set font */

require("Font4x5Numeric").add(Graphics);

Bangle.loadWidgets();

/* Custom version of Bangle.drawWidgets (does not clear the widget areas) Thanks to rozek */

Bangle.drawWidgets = function () {
  var w = g.getWidth(), h = g.getHeight();

  var pos = {
    tl:{x:0,   y:0,    r:0, c:0}, // if r==1, we're right->left
    tr:{x:w-1, y:0,    r:1, c:0},
    bl:{x:0,   y:h-24, r:0, c:0},
    br:{x:w-1, y:h-24, r:1, c:0}
  };

  if (global.WIDGETS) {
    for (var wd of WIDGETS) {
      var p = pos[wd.area];
      if (!p) continue;

      wd.x = p.x - p.r*wd.width;
      wd.y = p.y;

      p.x += wd.width*(1-2*p.r);
      p.c++;
    }

    g.reset();                                 // also loads the current theme

    try {
      for (var wd of WIDGETS) {
        g.setClipRect(wd.x,wd.y, wd.x+wd.width-1,23);
        wd.draw(wd);
      }
    } catch (e) { print(e); }

    g.reset();                               // clears the clipping rectangle!
    }
  };

/* Draws the clock hands and date */

function drawHands() {
  let d = new Date();

  let hour = d.getHours() % 12;
  let min = d.getMinutes();
  let sec = d.getSeconds();

  let twoPi = 2*Math.PI;
  let Pi = Math.PI;
  let halfPi = Math.PI/2;

  let hourAngle = (hour+(min/60))/12 * twoPi - Pi;
  let minAngle = (min/60) * twoPi - Pi;
  let secAngle = (sec/60) * twoPi - Pi;

  let hourSin = Math.sin(hourAngle);
  let hourCos = Math.cos(hourAngle);
  let minSin = Math.sin(minAngle);
  let minCos = Math.cos(minAngle);
  let secSin = Math.sin(secAngle);
  let secCos = Math.cos(secAngle);

  g.drawImage(imgHour,cx-22*hourSin,cy+22*hourCos,{rotate:hourAngle});
  g.drawImage(imgMin,cx-34*minSin,cy+34*minCos,{rotate:minAngle});
  g.drawImage(imgSec,cx-25*secSin,cy+25*secCos,{rotate:secAngle});
  g.setFont("4x5Numeric:3");
  g.drawString(d.getDate(),157,81);
}

function drawBackground() {
  g.setBgColor(0,0,0);
  g.setColor(1,1,1);
  g.clear();
  g.drawImage(imgBg,0,0);
  g.reset();
}

/* Refresh the display every second */

function displayRefresh() {
  g.clear(true);
  drawBackground();
  drawHands();
  Bangle.drawWidgets();

  let Pause = 1000 - (Date.now() % 1000);
  Timeout = setTimeout(displayRefresh,Pause);
}
setTimeout(displayRefresh,500);

Bangle.on('lcdPower', (on) => {
  if (on) {
    if (Timeout != null) { clearTimeout(Timeout); Timeout = undefined;}
    displayRefresh();
  }
});

Bangle.loadWidgets();
Bangle.setUI("clock");