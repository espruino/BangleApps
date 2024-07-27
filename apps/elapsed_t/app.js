const APP_NAME = "elapsed_t";

//const COLOUR_BLACK = 0x0;
//const COLOUR_DARK_GREY = 0x4208;   // same as: g.setColor(0.25, 0.25, 0.25)
const COLOUR_GREY = 0x8410;   // same as: g.setColor(0.5, 0.5, 0.5)
const COLOUR_LIGHT_GREY = 0xc618;   // same as: g.setColor(0.75, 0.75, 0.75)
const COLOUR_RED = 0xf800;   // same as: g.setColor(1, 0, 0)
const COLOUR_BLUE = 0x001f;   // same as: g.setColor(0, 0, 1)
//const COLOUR_YELLOW = 0xffe0;   // same as: g.setColor(1, 1, 0)
//const COLOUR_LIGHT_CYAN = 0x87ff;   // same as: g.setColor(0.5, 1, 1)
//const COLOUR_DARK_YELLOW = 0x8400;   // same as: g.setColor(0.5, 0.5, 0)
//const COLOUR_DARK_CYAN = 0x0410;   // same as: g.setColor(0, 0.5, 0.5)
const COLOUR_CYAN = "#00FFFF";
const COLOUR_ORANGE = 0xfc00;   // same as: g.setColor(1, 0.5, 0)

const SCREEN_WIDTH = g.getWidth();
const SCREEN_HEIGHT = g.getHeight();
const BIG_FONT_SIZE = 38;
const SMALL_FONT_SIZE = 22;

var arrowFont = atob("BwA4AcAOAHADgBwA4McfOf3e/+P+D+A+AOA="); // contains only the > character

var now = new Date();

var settings = Object.assign({
  // default values
  displaySeconds: true,
  displayMonthsYears: true,
  dateFormat: 0,
  time24: true
}, require('Storage').readJSON(APP_NAME + ".settings.json", true) || {});

var temp_displaySeconds = settings.displaySeconds;

var data = Object.assign({
  // default values
  target: {
    isSet: false,
    Y: now.getFullYear(),
    M: now.getMonth() + 1, // Month is zero-based, so add 1
    D: now.getDate(),
    h: now.getHours(),
    m: now.getMinutes(),
    s: 0
  }
}, require('Storage').readJSON(APP_NAME + ".data.json", true) || {});

function writeData() {
  require('Storage').writeJSON(APP_NAME + ".data.json", data);
}

function writeSettings() {
  require('Storage').writeJSON(APP_NAME + ".settings.json", settings);
  temp_displaySeconds = settings.temp_displaySeconds;
}

let inMenu = false;

Bangle.on('touch', function (zone, e) {
  if (!inMenu && e.y > 24) {
    if (drawTimeout) clearTimeout(drawTimeout);
    E.showMenu(menu);
    inMenu = true;
  }
});

function pad2(number) {
  return (String(number).padStart(2, '0'));
}

function formatDateTime(date, dateFormat, time24, showSeconds) {
  var formattedDateTime = {
    date: "",
    time: ""
  };

  var DD = pad2(date.getDate());
  var MM = pad2(date.getMonth() + 1); // Month is zero-based
  var YYYY = date.getFullYear();
  var h = date.getHours();
  var hh = pad2(date.getHours());
  var mm = pad2(date.getMinutes());
  var ss = pad2(date.getSeconds());

  switch (dateFormat) {
    case 0:
      formattedDateTime.date = `${DD}/${MM}/${YYYY}`;
      break;

    case 1:
      formattedDateTime.date = `${MM}/${DD}/${YYYY}`;
      break;

    case 2:
      formattedDateTime.date = `${YYYY}-${MM}-${DD}`;
      break;

    default:
      formattedDateTime.date = `${YYYY}-${MM}-${DD}`;
      break;
  }

  if (time24) {
    formattedDateTime.time = `${hh}:${mm}${showSeconds ? `:${ss}` : ''}`;
  } else {
    var ampm = (h >= 12 ? 'PM' : 'AM');
    var h_ampm = h % 12;
    h_ampm = (h_ampm == 0 ? 12 : h_ampm);
    formattedDateTime.time = `${h_ampm}:${mm}${showSeconds ? `:${ss}` : ''} ${ampm}`;
  }

  return formattedDateTime;
}

function formatHourToAMPM(h){
  var ampm = (h >= 12 ? 'PM' : 'AM');
  var h_ampm = h % 12;
  h_ampm = (h_ampm == 0 ? 12 : h_ampm);
  return `${h_ampm} ${ampm}`
}

function howManyDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function handleExceedingDay() {
  var maxDays = howManyDaysInMonth(data.target.M, data.target.Y);
  menu.Day.max = maxDays;
  if (data.target.D > maxDays) {
    menu.Day.value = maxDays;
    data.target.D = maxDays;
  }
}

var menu = {
  "": {
    "title": "Set target",
    back: function () {
      E.showMenu();
      Bangle.setUI("clock");
      inMenu = false;
      draw();
    }
  },
  'Day': {
    value: data.target.D,
    min: 1, max: 31, wrap: true,
    onchange: v => {
      data.target.D = v;
    }
  },
  'Month': {
    value: data.target.M,
    min: 1, max: 12, noList: true, wrap: true,
    onchange: v => {
      data.target.M = v;
      handleExceedingDay();
    }
  },
  'Year': {
    value: data.target.Y,
    min: 1900, max: 2100,
    onchange: v => {
      data.target.Y = v;
      handleExceedingDay();
    }
  },
  'Hours': {
    value: data.target.h,
    min: 0, max: 23, wrap: true,
    onchange: v => {
      data.target.h = v;
    },
    format: function (v) {return(settings.time24 ? pad2(v) : formatHourToAMPM(v))}
  },
  'Minutes': {
    value: data.target.m,
    min: 0, max: 59, wrap: true,
    onchange: v => {
      data.target.m = v;
    },
    format: function (v) { return pad2(v); }
  },
  'Seconds': {
    value: data.target.s,
    min: 0, max: 59, wrap: true,
    onchange: v => {
      data.target.s = v;
    },
    format: function (v) { return pad2(v); }
  },
  'Save': function () {
    E.showMenu();
    inMenu = false;
    Bangle.setUI("clock");
    setTarget(true);
    writeSettings();
    temp_displaySeconds = settings.displaySeconds;
    updateQueueMillis(settings.displaySeconds);
    draw();
  },
  'Reset': function () {
    E.showMenu();
    inMenu = false;
    Bangle.setUI("clock");
    setTarget(false);
    updateQueueMillis(settings.displaySeconds);
    draw();
  },
  'Set clock as default': function () {
    setClockAsDefault();
    E.showAlert("Elapsed Time was set as default").then(function() {
      E.showMenu();
      inMenu = false;
      Bangle.setUI("clock");
      draw();
    });
  }
};

function setClockAsDefault(){
  let storage = require('Storage');
  let settings = storage.readJSON('setting.json',true)||{clock:null};
  settings.clock = "elapsed_t.app.js";
  storage.writeJSON('setting.json', settings);
}

function setTarget(set) {
  if (set) {
    target = new Date(
      data.target.Y,
      data.target.M - 1,
      data.target.D,
      data.target.h,
      data.target.m,
      data.target.s
    );
    data.target.isSet = true;
  } else {
    target = new Date();
    Object.assign(
      data,
      {
        target: {
          isSet: false,
          Y: now.getFullYear(),
          M: now.getMonth() + 1, // Month is zero-based, so add 1
          D: now.getDate(),
          h: now.getHours(),
          m: now.getMinutes(),
          s: 0
        }
      }
    );
    menu.Day.value = data.target.D;
    menu.Month.value = data.target.M;
    menu.Year.value = data.target.Y;
    menu.Hours.value = data.target.h;
    menu.Minutes.value = data.target.m;
    menu.Seconds.value = 0;
  }

  writeData();
}

var target;
setTarget(data.target.isSet);

var drawTimeout;
var queueMillis = 1000;


function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  var delay = queueMillis - (Date.now() % queueMillis);
  if (queueMillis == 60000 && signIsNegative()) {
    delay += 1000;
  }

  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw();
  }, delay);
}

function updateQueueMillis(displaySeconds) {
  if (displaySeconds) {
    queueMillis = 1000;
  } else {
    queueMillis = 60000;
  }
}

Bangle.on('lock', function (on, reason) {
  if (inMenu) { // if already in a menu, nothing to do
    return;
  }

  if (on) { // screen is locked
    temp_displaySeconds = false;
    updateQueueMillis(false);
    draw();
  } else { // screen is unlocked
    temp_displaySeconds = settings.displaySeconds;
    updateQueueMillis(temp_displaySeconds);
    draw();
  }
});

function signIsNegative() {
  var now = new Date();
  return (now < target);
}

function diffToTarget() {
  var diff = {
    sign: "+",
    Y: "0",
    M: "0",
    D: "0",
    hh: "00",
    mm: "00",
    ss: "00"
  };

  if (!data.target.isSet) {
    return (diff);
  }

  var now = new Date();
  diff.sign = now < target ? '-' : '+';

  if (settings.displayMonthsYears) {
    var start;
    var end;

    if (now > target) {
      start = target;
      end = now;
    } else {
      start = now;
      end = target;
    }

    diff.Y = end.getFullYear() - start.getFullYear();
    diff.M = end.getMonth() - start.getMonth();
    diff.D = end.getDate() - start.getDate();
    diff.hh = end.getHours() - start.getHours();
    diff.mm = end.getMinutes() - start.getMinutes() + end.getTimezoneOffset() - start.getTimezoneOffset();
    diff.ss = end.getSeconds() - start.getSeconds();

    // Adjust negative differences
    if (diff.ss < 0) {
      diff.ss += 60;
      diff.mm--;
    }
    if (diff.mm < 0) {
      diff.mm += 60;
      diff.hh--;
    }
    if (diff.hh < 0) {
      diff.hh += 24;
      diff.D--;
    }
    if (diff.D < 0) {
      var lastMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      diff.D += lastMonthDays;
      diff.M--;
    }
    if (diff.M < 0) {
      diff.M += 12;
      diff.Y--;
    }


  } else {
    var timeDifference = target - now;
    timeDifference = Math.abs(timeDifference);

    // Calculate days, hours, minutes, and seconds
    diff.D = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    diff.hh = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    diff.mm = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    diff.ss = Math.floor((timeDifference % (1000 * 60)) / 1000);
  }

  // add zero padding
  diff.hh = pad2(diff.hh);
  diff.mm = pad2(diff.mm);
  diff.ss = pad2(diff.ss);

  return diff;
}

function draw() {
  var now = new Date();
  var nowFormatted = formatDateTime(now, settings.dateFormat, settings.time24, temp_displaySeconds);
  var targetFormatted = formatDateTime(target, settings.dateFormat, settings.time24, true);
  var diff = diffToTarget();

  const nowY = now.getFullYear();
  const nowM = now.getMonth();
  const nowD = now.getDate();

  const targetY = target.getFullYear();
  const targetM = target.getMonth();
  const targetD = target.getDate();

  var diffYMD;
  if (settings.displayMonthsYears)
    diffYMD = `${diff.sign}${diff.Y}Y ${diff.M}M ${diff.D}D`;
  else
    diffYMD = `${diff.sign}${diff.D}D`;

  var diff_hhmm = `${diff.hh}:${diff.mm}`;

  g.clearRect(0, 24, SCREEN_WIDTH, SCREEN_HEIGHT);
  //console.log("drawing");

  let y = 24; //Bangle.getAppRect().y;

  // draw current date
  g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_CYAN : COLOUR_BLUE);
  g.drawString(nowFormatted.date, 4, y);
  y += SMALL_FONT_SIZE;

  // draw current time
  g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_CYAN : COLOUR_BLUE);
  g.drawString(nowFormatted.time, 4, y);
  y += SMALL_FONT_SIZE;

  // draw arrow
  g.setFontCustom(arrowFont, 62, 16, 13).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_ORANGE : COLOUR_RED);
  g.drawString(">", 4, y + 3);

  if (data.target.isSet) {
    g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_ORANGE : COLOUR_RED);

    if (nowY == targetY && nowM == targetM && nowD == targetD) {
      // today
      g.drawString("TODAY", 4 + 16 + 6, y);
    } else if (nowY == targetY && nowM == targetM && nowD - targetD == 1) {
      // yesterday
      g.drawString("YESTERDAY", 4 + 16 + 6, y);
    } else if (nowY == targetY && nowM == targetM && targetD - nowD == 1) {
      // tomorrow
      g.drawString("TOMORROW", 4 + 16 + 6, y);
    } else {
      // general case
      // draw target date
      g.drawString(targetFormatted.date, 4 + 16 + 6, y);
    }

    y += SMALL_FONT_SIZE;

    // draw target time
    g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_ORANGE : COLOUR_RED);
    g.drawString(targetFormatted.time, 4, y);
    y += SMALL_FONT_SIZE + 4;

  } else {
    // draw NOT SET
    g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_ORANGE : COLOUR_RED);
    g.drawString("NOT SET", 4 + 16 + 6, y);
    y += 2 * SMALL_FONT_SIZE + 4;
  }

  // draw separator
  g.setColor(g.theme.fg);
  g.drawLine(0, y - 4, SCREEN_WIDTH, y - 4);

  // draw diffYMD
  g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(0, -1).setColor(g.theme.fg);
  g.drawString(diffYMD, SCREEN_WIDTH / 2, y);
  y += SMALL_FONT_SIZE;

  // draw diff_hhmm
  g.setFont("Vector", BIG_FONT_SIZE).setFontAlign(0, -1).setColor(g.theme.fg);
  g.drawString(diff_hhmm, SCREEN_WIDTH / 2, y);

  // draw diff_ss
  if (temp_displaySeconds) {
    g.setFont("Vector", SMALL_FONT_SIZE).setFontAlign(-1, -1).setColor(g.theme.dark ? COLOUR_LIGHT_GREY : COLOUR_GREY);
    g.drawString(diff.ss, SCREEN_WIDTH / 2 + 52, y + 13);
  }

  queueDraw();
}

Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setUI("clock");

draw();
