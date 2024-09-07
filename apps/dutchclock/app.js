// Load libraries
const storage = require("Storage");
const locale = require('locale');
const widget_utils = require('widget_utils');

// Define constants
const DATETIME_SPACING_HEIGHT = 5;
const TIME_HEIGHT = 8;
const DATE_HEIGHT = 8;
const BOTTOM_SPACING = 2;

const MINS_IN_HOUR = 60;
const MINS_IN_DAY = 24 * MINS_IN_HOUR;

const VARIANT_EXACT = 'exact';
const VARIANT_APPROXIMATE = 'approximate';
const VARIANT_HYBRID = 'hybrid';

const DEFAULTS_FILE = "dutchclock.default.json"; 
const SETTINGS_FILE = "dutchclock.json";

// Load settings
const settings = Object.assign(
    storage.readJSON(DEFAULTS_FILE, true) || {},
    storage.readJSON(SETTINGS_FILE, true) || {}
);

// Define global variables
const textBox = {};
let date, mins;

// Define functions
function initialize() {
  // Reset the state of the graphics library
  g.clear(true);

  // Tell Bangle this is a clock
  Bangle.setUI("clock");

  // Load widgets
  Bangle.loadWidgets();

  // Show widgets, or not
  if (settings.showWidgets) {
    Bangle.drawWidgets();
  } else {
    widget_utils.swipeOn();
  }

  const dateTimeHeight = (settings.showDate || settings.showTime ? DATETIME_SPACING_HEIGHT : 0)
    + (settings.showDate ? DATE_HEIGHT : 0)
    + (settings.showTime ? TIME_HEIGHT : 0);

  Object.assign(textBox, {
    x: Bangle.appRect.x + Bangle.appRect.w / 2,
    y: Bangle.appRect.y + (Bangle.appRect.h - dateTimeHeight) / 2,
    w: Bangle.appRect.w - 2,
    h: Bangle.appRect.h - dateTimeHeight
  });

  // draw immediately at first
  tick();

  // now check every second
  let secondInterval = setInterval(tick, 1000);

  // Stop updates when LCD is off, restart when on
  Bangle.on('lcdPower',on=>{
    if (secondInterval) clearInterval(secondInterval);
    secondInterval = undefined;
    if (on) {
      secondInterval = setInterval(tick, 1000);
      draw(); // draw immediately
    }
  });
}

function tick() {
  date = new Date();
  const m = (date.getHours() * MINS_IN_HOUR + date.getMinutes()) % MINS_IN_DAY;

  if (m !== mins) {
    mins = m;
    draw();
  }
}

function draw() {
  // work out how to display the current time
  const timeLines = getTimeLines(mins);
  const bottomLines = getBottomLines();

  g.reset().clearRect(Bangle.appRect);

  // draw the current time (4x size 7 segment)
  setFont(timeLines);

  g.setFontAlign(0,0); // align center top
  g.drawString(timeLines.join("\n"), textBox.x, textBox.y, false);

  if (bottomLines.length) {  
    // draw the time and/or date, in a normal font
    g.setFont("6x8");
    g.setFontAlign(0,1); // align center bottom
    // pad the date - this clears the background if the date were to change length
    g.drawString(bottomLines.join('\n'), Bangle.appRect.w / 2, Bangle.appRect.y2 - BOTTOM_SPACING, false);
  }
}

function setFont(timeLines) {
  const size = textBox.h / timeLines.length;

  g.setFont("Vector", size);

  let width = g.stringWidth(timeLines.join('\n'));

  if (width > textBox.w) {
    g.setFont("Vector", Math.floor(size * (textBox.w / width)));
  }
}

function getBottomLines() {
    const lines = [];
  
    if (settings.showTime) {
        lines.push(locale.time(date, 1));
    }
  
    if (settings.showDate) {
        lines.push(locale.date(date));
    }
  
    return lines;
  }
  
function getTimeLines(m) {
  switch (settings.variant) {
    case VARIANT_EXACT:
      return getExactTimeLines(m);
    case VARIANT_APPROXIMATE:
      return getApproximateTimeLines(m);
    case VARIANT_HYBRID:
      return distanceFromNearest(15)(m) < 3
        ? getApproximateTimeLines(m)
        : getExactTimeLines(m);
    default:
      console.warn(`Error in settings: unknown variant "${settings.variant}"`);
      return getExactTimeLines(m);
  }
}

function getExactTimeLines(m) {
  if (m === 0) {
    return ['middernacht'];
  }

  const hour = getHour(m);
  const minutes = getMinutes(hour.offset);

  const lines = minutes.concat(hour.lines);
  if (lines.length === 1) {
    lines.push('uur');
  }

  return lines;
}

function getApproximateTimeLines(m) {
  const roundMinutes = getRoundMinutes(m);

  const lines = getExactTimeLines(roundMinutes.minutes);

  return addApproximateDescription(lines, roundMinutes.offset);
}

function getHour(minutes) {
  const hours = ['twaalf', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];

  const h = Math.floor(minutes / MINS_IN_HOUR), m = minutes % MINS_IN_HOUR;

  if (m <= 15) {
    return {lines: [hours[h % 12]], offset: m};
  }

  if (m > 15 && m < 45) {
    return {
      lines: ['half', hours[(h + 1) % 12]],
      offset: m - (MINS_IN_HOUR / 2)
    };
  }

  return {lines: [hours[(h + 1) % 12]], offset: m - MINS_IN_HOUR};
}

function getMinutes(m) {
  const minutes = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'kwart'];

  if (m === 0) {
    return [];
  }

  return [minutes[Math.abs(m)], m > 0 ? 'over' : 'voor'];
}

function getRoundMinutes(m) {
  const nearest = roundTo(5)(m);

  return {
    minutes: nearest % MINS_IN_DAY,
    offset: m - nearest
  };
}

function addApproximateDescription(lines, offset) {
  if (offset === 0) {
    return lines;
  }

  if (lines.length === 1 || lines[1] === 'uur') {
    const singular = lines[0];
    const plural = getPlural(singular);
    return {
      '-2': ['tegen', plural],
      '-1': ['iets voor', singular],
       '1': ['iets na', plural],
       '2': ['even na', plural]
    }[`${offset}`];
  }

  return {
    '-2': ['bijna'].concat(lines),
    '-1': ['rond'].concat(lines),
     '1': ['iets na'].concat(lines),
     '2': lines.concat(['geweest'])
  }[`${offset}`];
}

function getPlural(h) {
  return {
    middernacht: 'middernacht',
    een: 'enen',
    twee: 'tweeën',
    drie: 'drieën',
    vijf: 'vijven',
    zes: 'zessen',
    elf: 'elven',
    twaalf: 'twaalven'
  }[h] || `${h}en`;
}

function distanceFromNearest(x) {
  return n => Math.abs(n - roundTo(x)(n));
}

function roundTo(x) {
  return n => Math.round(n / x) * x;
}

// Let's go
initialize();