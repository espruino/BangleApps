/**
 * Mystic Dock for Bangle.js
 *
 * + Original Author: Eric Wooodward https://itsericwoodward.com/
 * + see README.md for details
 */

/* jshint esversion: 6 */

const timeFontSize = 6;
const dataFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;

const ypos = [
    45,   // Time
    105,  // Date
    145,  // Symbol
    210   // Info
];

const settings = require('Storage').readJSON('mysticdock.json', 1) ||
    require('Storage').readJSON('mysticclock.json', 1) || {};
const colors = ['white', 'blue', 'green', 'purple', 'red', 'teal', 'other'];
const color = settings.color ? colors[settings.color] : 0;

const yposMax = 190;
const yposMin = 60;
let y = yposMax;

let lastButtonPressTime;
let wasInActiveMode = false;


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


function drawInfo() {
  if (infoData[infoMode] && infoData[infoMode].calc) {
    // clear info
    g.setColor(0, 0, 0);
    g.fillRect(0, ypos[3] - 8, 239, ypos[3] + 25);
  
    // draw info
    g.setFont(font, dataFontSize);
    setColor();
    g.drawString((infoData[infoMode].calc()), xyCenter, ypos[3], true);
  }
}
  
function drawImage() {
  setColor();
  g.drawPoly([xyCenter - 100, ypos[2], xyCenter + 100, ypos[2], xyCenter, ypos[2] + 30], true);
}

function drawClock() {

    // default draw styles
    g.reset();

    // get date
    const d = new Date();
    const dLocal = d.toString().split(" ");

    const minutes = (`0${d.getMinutes()}`).substr(-2);
    const seconds = (`0${d.getSeconds()}`).substr(-2);

    const useLocale = !settings.useLocale;

    let hours = (`0${d.getHours()}`).substr(-2);
    let meridian = "";
  
    if (d.getSeconds() % 10 === 0) {
        y = Math.floor(Math.random() * (yposMax - yposMin)) + yposMin;
    }
  
    // drawSting centered
    g.setFontAlign(0, 0);
  
    // setup color
    setColor();

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

    if (lastButtonPressTime && ((d.getTime() - lastButtonPressTime) / 1000) < 5) {

        // clear screen when switching modes
        if (!wasInActiveMode) {
            g.clear();
            wasInActiveMode = true;
        }

        // draw clock in center w/ seconds
        // show date (locale'd, based on settings)
        // show info line below it
        g.drawString(`${hours}${(d.getSeconds() % 2) ? ' ' : ':'}${minutes}`, xyCenter - 15, ypos[0], true);
        g.setFont(font, dataFontSize);
      
        if (settings.use12Hour) {
          g.drawString(seconds, xyCenter + 97, ypos[0] - 10, true);
          g.drawString(meridian, xyCenter + 97, ypos[0] + 10, true);
        }
        else {
          g.drawString(seconds, xyCenter + 97, ypos[0] + 10, true);
        }
      
        // draw DoW, name of month, date, year
        g.setFont(font, dataFontSize);
        g.drawString([
          useLocale ? require('locale').dow(d, 1) : dLocal[0],
          useLocale ? require('locale').month(d, 1) : dLocal[1],
          d.getDate(),
          d.getFullYear()
        ].join(' '), xyCenter, ypos[1], true);     
        
        drawInfo();
        drawImage();
    }
    else if (d.getSeconds() % 10 === 8) {
        g.clear();
        wasInActiveMode = false;
    }
    else if (d.getSeconds() % 10 !== 9) {
        // clear screen when switching modes
        if (wasInActiveMode) {
            g.clear();
            wasInActiveMode = false;
        }
        g.drawString(`${hours}${(d.getSeconds() % 2) ? ' ' : ':'}${minutes}`, xyCenter - (settings.use12Hour ? 15 : 0), y, true);
        g.setFont(font, dataFontSize);
        if (settings.use12Hour) {
            g.drawString(meridian, xyCenter + 97, y + 10, true);
        }
        g.drawString(`BATT: ${E.getBattery() === 100 ? '100' : ('0' + E.getBattery()).substr(-2)}%`, xyCenter, y + 35, true);
    }

    g.flip();
}


function nextInfo() {
  lastButtonPressTime = Date.now();
  let idx = infoList.indexOf(infoMode);

  if (idx > -1) {
    if (idx === infoList.length - 1) infoMode = infoList[0];
    else infoMode = infoList[idx + 1];
  }
}
  
  
function prevInfo() {
  lastButtonPressTime = Date.now();
  let idx = infoList.indexOf(infoMode);

  if (idx > -1) {
    if (idx === 0) infoMode = infoList[infoList.length - 1];
    else infoMode = infoList[idx - 1];
  }
}


if (Bangle.getAccel().x < -0.7) {
    g.setRotation(3); // assume watch in charge cradle
}

g.clear();

setInterval(drawClock, 1000);
drawClock();

if (Bangle.isCharging()) {
  Bangle.on("charging", isCharging => {
    const reloadOnUplug = !settings.reloadOnUplug;

    if (!isCharging && reloadOnUplug) load();
  });
}

// show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

// change to "active mode" and rotate through info when the buttons are pressed
setWatch(() => {
  nextInfo();
  drawClock();
}, BTN3, { repeat: true });

setWatch(() => {
    prevInfo();
    drawClock();
}, BTN1, { repeat: true });
