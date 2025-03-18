/**
 * Mystic Clock for Bangle.js
 *
 * + Original Author: Eric Wooodward https://itsericwoodward.com/
 * + see README.md for details
 */

/* jshint esversion: 6 */

const timeFontSize = 6;
const dataFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;

const yposTime = 75;
const yposDate = 125;
const yposSymbol = 160;
const yposInfo = 220;

const settings = require('Storage').readJSON('mysticclock.json', 1) || {};
const colors = ['white', 'blue', 'green', 'purple', 'red', 'teal', 'other'];
const color = settings.color ? colors[settings.color] : 0;

const infoData = {
  '*GMT_MODE': {
    calc: () => (new Date()).toString().split(" ")[5],
  },
  BATT_MODE: {
    calc: () => `BATT: ${E.getBattery()}%`,
  },
  ID_MODE: {
    calc: () => {
      const val = NRF.getAddress().split(":");
      return `ID: ${val[4]}${val[5]}`;
    },
  },
  MEM_MODE: {
    calc: () => {
      const val = process.memory();
      return `MEM: ${Math.round(val.usage * 100 / val.total)}%`;
    },
  },
  VER_MODE: {
    calc: () => `FW: ${process.env.VERSION}`,
  },
};
const infoList = Object.keys(infoData).sort();
let infoMode = infoList[0];

function setColor() {
  const colorCommands = {
    white: () => g.setColor(1, 1, 1),
    blue: () => g.setColor(0, 0, 1),
    green: () => g.setColor(0, 1, 0),
    purple: () => g.setColor(1, 0, 1),
    red: () => g.setColor(1, 0, 0),
    teal: () => g.setColor(0, 1, 1),
    other: () => g.setColor(1, 1, 0)
  };

  // default if value unknown
  if (!color || !colorCommands[color]) return colorCommands.white();
  return colorCommands[color]();
}

function getLocale() {
  return require('locale');
}

function drawClock() {

  // default draw styles
  g.reset();

  // drawSting centered
  g.setFontAlign(0, 0);

  // setup color
  setColor();

  // get date
  const d = new Date();
  const dLocal = d.toString().split(" ");

  const useLocale = !settings.useLocale;

  const minutes = (`0${d.getMinutes()}`).substr(-2);
  const seconds = (`0${d.getSeconds()}`).substr(-2);

  let hours = (`0${d.getHours()}`).substr(-2);
  let meridian = "";

  if (settings.use12Hour) {
    hours = parseInt(hours, 10);
    meridian = 'AM';
    if (hours === 0) {
      hours = 12;
    }
    else if (hours >= 12) {
      meridian = 'PM';
      if (hours > 12) hours -= 12;
    }
    hours = (' ' + hours).substr(-2);
  }

  g.setFont(font, timeFontSize);
  g.drawString(`${hours}${(d.getSeconds() % 2) ? ' ' : ':'}${minutes}`, xyCenter - 15, yposTime, true);
  g.setFont(font, dataFontSize);

  if (settings.use12Hour) {
    g.drawString(seconds, xyCenter + 97, yposTime - 10, true);
    g.drawString(meridian, xyCenter + 97, yposTime + 10, true);
  }
  else {
    g.drawString(seconds, xyCenter + 97, yposTime + 10, true);
  }

  // draw DoW, name of month, date, year
  g.setFont(font, dataFontSize);
  g.drawString([
    useLocale ? getLocale().dow(d, 1) : dLocal[0],
    useLocale ? getLocale().month(d, 1) : dLocal[1],
    d.getDate(),
    d.getFullYear()
  ].join(" "), xyCenter, yposDate, true);

}

function drawInfo() {
  if (infoData[infoMode] && infoData[infoMode].calc) {
    // clear info
    g.setColor(0, 0, 0);
    g.fillRect(0, yposInfo - 8, 239, yposInfo + 25);

    // draw info
    g.setFont(font, dataFontSize);
    setColor();
    g.drawString((infoData[infoMode].calc()), xyCenter, yposInfo, true);
  }
}

function drawImage() {
  setColor();
  g.drawPoly([xyCenter - 100, yposSymbol, xyCenter + 100, yposSymbol, xyCenter, yposSymbol + 30], true);
}

function drawAll() {
  drawClock();
  drawInfo();
  drawImage();
}

function nextInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === infoList.length - 1) infoMode = infoList[0];
    else infoMode = infoList[idx + 1];
  }
}

function prevInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === 0) infoMode = infoList[infoList.length - 1];
    else infoMode = infoList[idx - 1];
  }
}


let secondInterval;

// handle LCD power state change
Bangle.on('lcdPower', on => {

  // stop running when screen turns off
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;

  // start running
  if (on) {
    secondInterval = setInterval(drawAll, 1000);
    drawAll(); // draw immediately
  }
});

// cover screen to put it to sleep
Bangle.on('touch', (button) => {
  if (button === 3 && Bangle.isLCDOn()) Bangle.setLCDPower(false);
});

// Show launcher when button pressed
Bangle.setUI("clockupdown", btn=>{
  if (btn<0) prevInfo();
  if (btn>0) nextInfo();
  drawAll();
});

// clean app screen
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// if screen already active, draw now and start interval
if (Bangle.isLCDOn()) {
  secondInterval = setInterval(drawAll, 1000);
  drawAll(); // draw immediately
}

