/*
Simple watch [slomoclock]
Mike Bennett mike[at]kereru.com
0.01 : Initial
0.03 : Use Layout library
*/

var v = "0.10";

// Colours
const col = [];
col[2] = 0xf800;
col[3] = 0xfae0;
col[4] = 0xf7e0;
col[5] = 0x4fe0;
col[6] = 0x019f;
col[7] = 0x681f;
col[8] = 0xffff;

const colH = [];
colH[0] = 0x001f;
colH[1] = 0x023f;
colH[2] = 0x039f;
colH[3] = 0x051f;
colH[4] = 0x067f;
colH[5] = 0x07fd;
colH[6] = 0x07f6;
colH[7] = 0x07ef;
colH[8] = 0x07e8;
colH[9] = 0x07e3;
colH[10] = 0x07e0;
colH[11] = 0x5fe0;
colH[12] = 0x97e0;
colH[13] = 0xcfe0;
colH[14] = 0xffe0;
colH[15] = 0xfe60;
colH[16] = 0xfc60;
colH[17] = 0xfaa0;
colH[18] = 0xf920;
colH[19] = 0xf803;
colH[20] = 0xf80e;
colH[21] = 0x981f;
colH[22] = 0x681f;
colH[23] = 0x301f;

// Colour incremented with every 10 sec timer event
var colNum = 0;
var lastMin = -1;

var Layout = require("Layout");
var layout = new Layout(
  {
    type: "h",
    c: [
      {
        type: "v",
        c: [
          { type: "txt", font: "40%", label: "", id: "hour", valign: 1 },
          { type: "txt", font: "40%", label: "", id: "min", valign: -1 },
        ],
      },
      {
        type: "v",
        c: [
          {
            type: "txt",
            font: "10%",
            label: "",
            id: "day",
            col: 0xefe0,
            halign: 1,
          },
          {
            type: "txt",
            font: "10%",
            label: "",
            id: "mon",
            col: 0xefe0,
            halign: 1,
          },
        ],
      },
    ],
  },
  { lazy: true }
);

// update the screen
function draw() {
  var date = new Date();

  // Update time
  var timeStr = require("locale").time(date, 1);
  var hh = parseFloat(timeStr.substring(0, 2));
  var mm = parseFloat(timeStr.substring(3, 5));

  // Surprise colours
  if (lastMin != mm) colNum = Math.floor(Math.random() * 24);
  lastMin = mm;

  layout.hour.label = timeStr.substring(0, 2);
  layout.min.label = timeStr.substring(3, 5);

  // Mysterion (0) different colour each hour. Surprise (1) different colour every 10 secs.
  layout.hour.col =
    cfg.colour == 0
      ? colH[hh]
      : cfg.colour == 1
      ? colH[colNum]
      : col[cfg.colour];
  layout.min.col =
    cfg.colour == 0
      ? colH[hh]
      : cfg.colour == 1
      ? colH[colNum]
      : col[cfg.colour];

  // Update date
  layout.day.label = date.getDate();
  layout.mon.label = require("locale").month(date, 1);

  layout.render();
}

// Events

// Stop updates when LCD is off, restart when on
Bangle.on("lcdPower", (on) => {
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 10000);
    draw(); // draw immediately
  }
});

var secondInterval = setInterval(draw, 10000);

// Configuration
let cfg = require("Storage").readJSON("slomoclock.json", 1) || {};
cfg.colour = cfg.colour || 0; // Colours

// update time and draw
g.clear();
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
