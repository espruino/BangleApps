/**
 * Bangle.js Neon X/IO X Clock
 *
 * Author: Bundyo
 * Repo: https://github.com/bundyo/BangleApps/tree/master/apps/neonx
 * Initial code based on Numerals Clock by Raik M.
 * Pebble Watchface Author: Sam Jerichow
 * Created: February 2022
 */

const digits = {
  0:[[15,15,85,15,85,85,15,85,15,15]],
  1:[[85,15,85,85]],
  2:[[15,15,85,15,85,50], [15,50,15,85,85,85]],
  3:[[15,15,85,15,85,85,15,85]],
  4:[[15,15,15,50], [85,15,85,85]],
  5:[[85,15,15,15,15,50], [85,50,85,85,15,85]],
  6:[[85,15,15,15,15,85,85,85,85,50]],
  7:[[15,15,85,15,85,85]],
  8:[[15,15,85,15],[15,85,85,85]],
  9:[[15,50,15,15,85,15,85,85,15,85]],
};

const colors = {
  x: [
    ["#FF00FF", "#00FFFF"],
    ["#00FF00", "#FFFF00"]
  ],
  io: [
    ["#FF00FF", "#FFFF00"],
    ["#00FF00", "#00FFFF"]
  ]
};

const is12hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"]||false;
const screenWidth = g.getWidth();
const screenHeight = g.getHeight();
const halfWidth = screenWidth / 2;
const scale = screenWidth / 240;
const REFRESH_RATE = 10E3;

let interval = 0;
let showingDate = false;

function drawLine(poly, thickness){
  for (let i = 0; i < poly.length; i = i + 2){
    if (poly[i + 2] === undefined) {
      break;
    }

    if (poly[i] !== poly[i + 2]) {
      g.fillRect(poly[i], poly[i + 1] - thickness / 2, poly[i + 2], poly[i + 3] + thickness / 2);
    } else {
      g.fillRect(poly[i] - thickness / 2, poly[i + 1], poly[i + 2] + thickness / 2, poly[i + 3]);
    }

    g.fillCircle(poly[i], poly[i + 1], thickness / 2);
    g.fillCircle(poly[i + 2], poly[i + 3], thickness / 2);
  }
}

let settings = {
  thickness: 4,
  io: 0,
  showDate: 1,
  fullscreen: false,
};
let saved_settings = require('Storage').readJSON('neonx.json', 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key]
}



function drawClock(num){
  let tx, ty;

  for (let x = 0; x <= 1; x++) {
    for (let y = 0; y <= 1; y++) {
      const current = ((y + 1) * 2 + x - 1);
      let newScale = scale;

      g.setColor(colors[settings.io ? 'io' : 'x'][y][x]);

      if (!settings.io) {
        newScale *= settings.fullscreen ? 1.18 : 1.0;
        let dx = settings.fullscreen ? 0 : 18
        tx = (x * 100 + dx) * newScale;
        ty = (y * 100 + dx*2) * newScale;
      } else {
        newScale = 0.33 + current * (settings.fullscreen ? 0.48 : 0.4);

        tx = (halfWidth - 139) * newScale + halfWidth + (settings.fullscreen ? 2 : 0);
        ty = (halfWidth - 139) * newScale + halfWidth + (settings.fullscreen ? 2 : 12);
      }

      for (let i = 0; i < digits[num[y][x]].length; i++) {
        drawLine(g.transformVertices(digits[num[y][x]][i], { x: tx, y: ty, scale: newScale}), settings.thickness);
      }
    }
  }
}

function draw(date){
  let d = new Date();
  let l1, l2;

  showingDate = date;

  if (date) {
    setUpdateInt(0);

    l1 = ('0' + (new Date()).getDate()).substr(-2);
    l2 = ('0' + ((new Date()).getMonth() + 1)).substr(-2);

    setTimeout(_ => {
      draw();
      setUpdateInt(1);
    }, 5000);
  } else {
    l1 = ('0' + (d.getHours() % (is12hour ? 12 : 24))).substr(-2);
    l2 = ('0' + d.getMinutes()).substr(-2);
  }

  if(settings.fullscreen){
    g.clearRect(0,0,screenWidth,screenHeight);
  } else {
    g.clearRect(0,24,240,240);
  }

  drawClock([l1, l2]);
}

function setUpdateInt(set){
  if (interval) {
    clearInterval(interval);
  }

  if (set) {
    interval = setInterval(draw, REFRESH_RATE);
  }
}

g.clear(1);

Bangle.setUI("clock");

setUpdateInt(1);
draw();

if (settings.showDate) {
  Bangle.on('touch', () => draw(!showingDate));
}

Bangle.on('lcdPower', function(on){
  if (on){
    draw();
    setUpdateInt(1);
  } else setUpdateInt(0);
});

Bangle.loadWidgets();

if(settings.fullscreen){
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
} else {
  Bangle.drawWidgets();
}