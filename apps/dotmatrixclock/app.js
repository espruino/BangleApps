/**
 * BangleJS DotMatrixCLOCK
 *
 * + Original Author: Paul Cockrell https://github.com/paulcockrell
 * + Created: May 2020
 */
const storage = require('Storage');
const settings = (storage.readJSON('setting.json', 1) || {});
const is12Hour = settings["12hour"] || false;
const timeout = settings.timeout || 20;

const font7x7 = {
  "empty": "00000000",
  "0": "3E61514945433E",
  "1": "1808080808081C",
  "2": "7E01013E40407F",
  "3": "7E01013E01017E",
  "4": "4141417F010101",
  "5": "7F40407E01017E",
  "6": "3E40407E41413E",
  "7": "3F010202040408",
  "8": "3E41413E41413E",
  "9": "3E41413F01013E",
};

const font5x5 = {
  "empty": "00000000",
  "-": "0000FF0000",
  "0": "0E1915130E",
  "1": "0C0404040E",
  "2": "1E010E101F",
  "3": "1E010E011E",
  "4": "11111F0101",
  "5": "1F101E011E",
  "6": "0E101E110E",
  "7": "1F01020408",
  "8": "0E110E110E",
  "9": "0E110F010E",
  "A": "040A0E1111",
  "B": "1E111E111E",
  "C": "0F1010100F",
  "D": "1E1111111E",
  "E": "1F101E101F",
  "F": "1F101E1010",
  "G": "0F1013110E",
  "H": "11111F1111",
  "I": "0E0404040E",
  "J": "1F0404140C",
  "L": "101010101F",
  "M": "111B151111",
  "N": "1119151311",
  "O": "0E1111110E",
  "P": "1E111E1010",
  "R": "1E111E1111",
  "S": "0F100E011E",
  "T": "1F04040404",
  "U": "111111110E",
  "V": "1111110A04",
  "W": "111115150A",
  "Y": "110A040404",
};

// Char renderer
const COLORS = {
  blue: {
    BG: "#0297fe",
    DARK: "#3b3ce8",
    LIGHT: "#E9ffff",
  },
  orange: {
    BG: "#f7b336",
    DARK: "#ac721e",
    LIGHT: "#f6fc0f",
  }
};

let selectedColor = "blue";
let displayTimeoutRef, sensorTimeoutRef;

// Example
// binToHex(["0111110", "1000000", "1000000", "1111110", "1000001", "1000001", "0111110"])
function binToHex(bins) {
  return bins.map(bin => ("00" + (parseInt(bin, 2).toString(16))).substr(-2).toUpperCase()).join("");
}

// Example
// hexToBin("3E40407E41413E")
function hexToBin(hexStr) {
  const regEx = new RegExp("..", "g");
  const bin = hexStr
    .replace(regEx, el => el + '_')
    .slice(0, -1)
    .split('_')
    .map(hex => ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8));

  return bin;
}

function drawPixel(opts) {
  g.setColor(opts.color);
  g.fillRect(opts.x, opts.y, opts.x + opts.w, opts.y + opts.h);
}

function drawGrid(pos, dims, charAsBin, opts) {
  const defaultOpts = {
    pxlW: 5,
    pxlH: 5,
    gap: 1,
    offColor: COLORS[selectedColor].DARK,
    onColor: COLORS[selectedColor].LIGHT
  };
  const pxl = Object.assign({}, defaultOpts, opts);

  for (let rowY = 0; rowY < dims.rows; rowY++) {
    const y = pos.y + ((pxl.pxlH + pxl.gap) * rowY);

    for (let colX = 7; colX > (7 - dims.cols); colX--) {
      const x = pos.x + ((pxl.pxlW + pxl.gap) * colX);
      const color = (charAsBin && parseInt(charAsBin[rowY][colX])) ? pxl.onColor : pxl.offColor;

      drawPixel({
        x: x,
        y: y,
        w: pxl.pxlW,
        h: pxl.pxlH,
        color: color,
      });
    }
  }
}

function drawFont(str, font, x, y) {
  let fontMap, rows, cols;

  switch(font) {
    case "7x7":
      fontMap = font7x7;
      rows = cols = 7;
      break;
    case "5x5":
      fontMap = font5x5;
      rows = cols = 5;
      break;
    default:
      throw "Unknown font type: " + font;
  }

  const pxlW = 2;
  const pxlH = 2;
  const gap = 2;
  const gutter = 3;
  const charArr = str.split("");
  const gridWidthTotal = (rows * (pxlW + gap)) + gutter;
  for (let i = 0; i < charArr.length; i++) {
    const charAsBin = fontMap.hasOwnProperty(charArr[i])?
      hexToBin(fontMap[charArr[i]]):
      fontMap.empty;

    drawGrid(
      {x: x + (i * gridWidthTotal), y: y},
      {rows: rows, cols: cols},
      charAsBin,
      {pxlW: pxlW, pxlH: pxlH, gap: gap}
    );
  }
}

function drawTitles() {
  g.setColor("#ffffff");
  g.setFont("6x8");
  g.drawString("COMPASS", 52, 49);
  g.drawString("HEART", 122, 49);
  g.drawString("TIME", 52, 94);
  g.drawString("DATE", 52, 144);
}

function drawCompass(lastHeading) {
  const directions = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW'
  ];
  const cps = Bangle.getCompass();
  let angle = 360-cps.heading;
  let heading = angle?
    directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8]:
    "-- ";

  heading = (heading + "   ").slice(0, 3);
  if (lastHeading != heading) drawFont(heading, "5x5", 40, 67);
  setTimeout(drawCompass.bind(null, heading), 1000 * 2);
}

function drawHeart(hrm) {
  drawFont(("   " + (hrm ? hrm.bpm : "---")).slice(-3), "5x5", 109, 67);
}

function drawTime(lastHrs, lastMns, toggle) {
  const date = new Date();
  const h = date.getHours();
  const hrs = ("00" + ((is12Hour && h > 12) ? h - 12 : h)).substr(-2);
  const mns = ("00" + date.getMinutes()).substr(-2);

  if (lastHrs != hrs) {
    drawFont(hrs, "7x7", 48, 109);
  }
  if (lastMns != mns) {
    drawFont(mns, "7x7", 124, 109);
  }

  const color = toggle? COLORS[selectedColor].LIGHT : COLORS[selectedColor].DARK;

  // This should toggle on/off per second
  drawPixel({
    color: color,
    x: 118, y: 118,
    w: 2, h: 2,
  });
  drawPixel({
    color: color,
    x: 118, y: 125,
    w: 2, h: 2,
  });

  setTimeout(drawTime.bind(null, hrs, mns, !toggle), 1000);
}

function drawDate(lastDate) {
  const locale = require('locale');
  const date = new Date();

  if (lastDate != date.toISOString().split('T')[0]) {
    const dow = locale.dow(date, 1).toUpperCase();
    const dayNum = ("00" + date.getDate()).slice(-2);
    const mon = locale.month(date).toUpperCase().slice(0, 3);
    const yr = date.getFullYear().toString().slice(-2);
    drawFont(dow + " " + dayNum, "5x5", 40, 159);
    drawFont(mon + " " + yr, "5x5", 40, 189);
  }

  setTimeout(drawDate.bind(null, date.toISOString().split('T')), 1000 * 60);
}

function setSensors(state) {
  // Already reading sensors and trying to activate sensors, do nothing
  if (sensorTimeoutRef && state === 1) return;

  // If we are activating the sensors, turn them off again in one minute
  if (state === 1) {
    sensorTimeoutRef = setTimeout(() => { setSensors(0); }, 1000 * 60);
  } else {
    if (sensorTimeoutRef) {
      clearInterval(sensorTimeoutRef);
      sensorTimeoutRef = null;
    }
    // Bit nasty, but we only redraw the heart value on sensor callback
    // but we want to blank out when sensor is off, but no callback for
    // that so force redraw here
    drawHeart();
  }

  Bangle.setHRMPower(state);
  Bangle.setCompassPower(state);
}

function drawScreen() {
  g.setBgColor(COLORS[selectedColor].BG);
  g.clearRect(0, 24, g.getWidth(), g.getHeight());

  // Draw components
  drawTitles();
  drawCompass();
  drawHeart();
  drawTime();
  drawDate();
}

function clearTimers(){
  if (displayTimeoutRef) {
    clearInterval(displayTimeoutRef);
    displayTimeoutRef = null;
  }

  if (sensorTimeoutRef) {
    clearInterval(sensorTimeoutRef);
    sensorTimeoutRef = null;
  }
}

function resetDisplayTimeout() {
  if (displayTimeoutRef) clearInterval(displayTimeoutRef);
  Bangle.setLCDPower(true);

  displayTimeoutRef = setTimeout(() => {
    if (Bangle.isLCDOn()) Bangle.setLCDPower(false);
    clearTimers();
  }, 1000 * timeout);
}

// Turn sensors on
setSensors(1);

// Reset screen
g.clear();

// Load and draw widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Draw screen
drawScreen();
resetDisplayTimeout();

// Setup callbacks
Bangle.on('swipe', (sDir) => {
  selectedColor = selectedColor === "blue" ? "orange" : "blue";
  resetDisplayTimeout();
  drawScreen();
});

Bangle.on('HRM', drawHeart);

setWatch(() => {
  setSensors(1);
  resetDisplayTimeout();
}, BTN1, {repeat: true, edge: "falling"});

setWatch(() => {
  setSensors(0);
  clearTimers();
  Bangle.setLCDMode();
  Bangle.showLauncher();
}, BTN2, {repeat: false, edge: "falling"});

Bangle.on('lcdPower', (on) => {
  if(on) {
    resetDisplayTimeout();
  } else {
    clearTimers();
    setSensors(0);
  }
});

Bangle.on('faceUp', (up) => {
  if (up && !Bangle.isLCDOn()) {
    setSensors(1);
    resetDisplayTimeout();
  }
});
