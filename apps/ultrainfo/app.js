// Load fonts
let background = require("clockbg");
var settings = Object.assign(
  {
    accentColor: "#f00",
    mainColor:"#000"
  },
  require("Storage").readJSON("ultrainfo.json", true) || {}
);

require("Font7x11Numeric7Seg").add(Graphics);

let drawTimeout;

let draw = function () {
  var date = new Date();
  background.fillRect(0, 62, g.getWidth() - 1, 110);

  var timeStr = require("locale").time(date, 1); // Hour and minute
  g.setFontAlign(0, -1)
    .setColor(settings.mainColor)
    .setFont("Vector", 30)
    .drawString(timeStr, g.getWidth() / 2, 62 + 3);

  // Show date and day of week
  var dateStr =
    require("locale").dow(date, 1) +
    ", " +
    require("locale").month(date, 1) +
    " " +
    date.getDate();
  g.setFont("14")
    .setFontAlign(0, 1)
    .drawString(dateStr, g.getWidth() / 2, 110 - 2);

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(
    function () {
      drawTimeout = undefined;
      draw();
    },
    60000 - (Date.now() % 60000)
  );
};

// Clear the screen once, at startup
g.clear();

background.fillRect(Bangle.appRect);

draw();

// CLOCKINFOS:

let clockInfoItems = require("clock_info").load();

function drawProgBar(x, y, w, val, col) {
  g.setColor(col).fillRect({
    x: x,
    y: y - 2,
    w: w * Math.min(1, val),
    h: 3,
    r: 8
  });
}

let drawRectClockInfo = function (itm, info, options, top) {
  background.fillRect(
    options.x,
    options.y,
    options.x + options.w,
    options.y + options.h
  );

  drawProgBar(
    options.x + 3,
    top ? options.y + options.h - 3 : options.y + 3,
    options.w - 6,
    1,
    settings.mainColor
  );
  if (info.max) {
    drawProgBar(
      options.x + 3,
      top ? options.y + options.h - 3 : options.y + 3,
      options.w - 6,
      +parseFloat(("" + info.text).match(/[\d.]+/)) / info.max,
      settings.accentColor
    );
  }
  let font = g.findFont(info.text, {
    w: options.w - 5,
    h: 30,
    max: 15,
    wrap: true,
    trim: true
  });
  g.setFont(font.font)
    .setColor(options.focus ? settings.accentColor : settings.mainColor)
    .drawImage(
      info.img,
      options.x + options.w / 2 - 12,
      options.y + options.h / 2 + (top ? -3 : 2)
    )
    .setFontAlign(0, 0)
    .drawString(
      font.text,
      options.x + options.w / 2,
      options.y + options.h / 2 + (top ? -15 : 2 - 10)
    );
};

const edge = 0;
const gap = 2;
const itemW = (g.getWidth() - 2 * edge - 2 * gap) / 3;

require("clock_info").addInteractive(clockInfoItems, {
  x: edge,
  y: 3,
  w: itemW,
  h: 60,
  draw: function (itm, info, options) {
    drawRectClockInfo(itm, info, options, true);
  }
});

require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap,
  y: 3,
  w: itemW,
  h: 60,
  draw: function (itm, info, options) {
    drawRectClockInfo(itm, info, options, true);
  }
});

require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap + itemW + gap,
  y: 3,
  w: itemW,
  h: 60,
  draw: function (itm, info, options) {
    drawRectClockInfo(itm, info, options, true);
  }
});

require("clock_info").addInteractive(clockInfoItems, {
  x: edge,
  y: g.getHeight() - 60 - 3,
  w: itemW,
  h: 60,
  draw: function (itm, info, options) {
    drawRectClockInfo(itm, info, options, false);
  }
});

require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap,
  y: g.getHeight() - 60 - 3,
  w: itemW,
  h: 60,
  draw: function (itm, info, options) {
    drawRectClockInfo(itm, info, options, false);
  }
});

require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap + itemW + gap,
  y: g.getHeight() - 60 - 3,
  w: itemW,
  h: 60,
  draw: function (itm, info, options) {
    drawRectClockInfo(itm, info, options, false);
  }
});

Bangle.setUI("clock");
