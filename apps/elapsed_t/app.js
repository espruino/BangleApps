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
  displaySeconds: 1,
  displayMonthsYears: true,
  dateFormat: 0,
  time24: true
}, require('Storage').readJSON(APP_NAME + ".settings.json", true) || {});

function writeSettings() {
  require('Storage').writeJSON(APP_NAME + ".settings.json", settings);
}

if (typeof settings.displaySeconds === 'boolean') {
  settings.displaySeconds = 1;
  writeSettings();
}

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

let inMenu = false;

Bangle.on('touch', function (zone, e) {
  if (!inMenu && e.y > 24) {
    if (drawTimeout) clearTimeout(drawTimeout);
    showMainMenu();
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

function formatHourToAMPM(h) {
  var ampm = (h >= 12 ? 'PM' : 'AM');
  var h_ampm = h % 12;
  h_ampm = (h_ampm == 0 ? 12 : h_ampm);
  return `${h_ampm}\n${ampm}`;
}

function getDatePickerObject() {
  switch (settings.dateFormat) {
    case 0:
      return {
        back: showMainMenu,
        title: "Date",
        separator_1: "/",
        separator_2: "/",

        value_1: data.target.D,
        min_1: 1, max_1: 31, step_1: 1, wrap_1: true,

        value_2: data.target.M,
        min_2: 1, max_2: 12, step_2: 1, wrap_2: true,

        value_3: data.target.Y,
        min_3: 1900, max_3: 2100, step_3: 1, wrap_3: true,

        format_1: function (v_1) { return (pad2(v_1)); },
        format_2: function (v_2) { return (pad2(v_2)); },
        onchange: function (v_1, v_2, v_3) { data.target.D = v_1; data.target.M = v_2; data.target.Y = v_3; setTarget(true); }
      };

    case 1:
      return {
        back: showMainMenu,
        title: "Date",
        separator_1: "/",
        separator_2: "/",

        value_1: data.target.M,
        min_1: 1, max_1: 12, step_1: 1, wrap_1: true,

        value_2: data.target.D,
        min_2: 1, max_2: 31, step_2: 1, wrap_2: true,

        value_3: data.target.Y,
        min_3: 1900, max_3: 2100, step_3: 1, wrap_3: true,

        format_1: function (v_1) { return (pad2(v_1)); },
        format_2: function (v_2) { return (pad2(v_2)); },
        onchange: function (v_1, v_2, v_3) { data.target.M = v_1; data.target.D = v_2; data.target.Y = v_3; setTarget(true); }
      };

    case 2:
      return {
        back: showMainMenu,
        title: "Date",
        separator_1: "-",
        separator_2: "-",

        value_1: data.target.Y,
        min_1: 1900, max_1: 2100, step_1: 1, wrap_1: true,

        value_2: data.target.M,
        min_2: 1, max_2: 12, step_2: 1, wrap_2: true,

        value_3: data.target.D,
        min_3: 1, max_3: 31, step_3: 1, wrap_3: true,

        format_1: function (v_1) { return (pad2(v_1)); },
        format_2: function (v_2) { return (pad2(v_2)); },
        onchange: function (v_1, v_2, v_3) { data.target.Y = v_1; data.target.M = v_2; data.target.D = v_3; setTarget(true); }
      };
  }
}

function getTimePickerObject() {
  var timePickerObject = {
    back: showMainMenu,
    title: "Time",
    separator_1: ":",
    separator_2: ":",

    value_1: data.target.h,
    min_1: 0, max_1: 23, step_1: 1, wrap_1: true,

    value_2: data.target.m,
    min_2: 0, max_2: 59, step_2: 1, wrap_2: true,

    value_3: data.target.s,
    min_3: 0, max_3: 59, step_3: 1, wrap_3: true,

    format_2: function (v_2) { return (pad2(v_2)); },
    format_3: function (v_3) { return (pad2(v_3)); },
    onchange: function (v_1, v_2, v_3) { data.target.h = v_1; data.target.m = v_2; data.target.s = v_3; setTarget(true); },
  };

  if (settings.time24) {
    timePickerObject.format_1 = function (v_1) { return (pad2(v_1)); };
  } else {
    timePickerObject.format_1 = function (v_1) { return (formatHourToAMPM(v_1)); };
  }

  return timePickerObject;
}

function showMainMenu() {
  E.showMenu({
    "": {
      "title": "Set target",
      back: function () {
        E.showMenu();
        Bangle.setUI("clock");
        inMenu = false;
        draw();
      }
    },
    'Date': {
      value: formatDateTime(target, settings.dateFormat, settings.time24, true).date,
      onchange: function () { require("more_pickers").triplePicker(getDatePickerObject()); }
    },
    'Time': {
      value: formatDateTime(target, settings.dateFormat, settings.time24, true).time,
      onchange: function () { require("more_pickers").triplePicker(getTimePickerObject()); }
    },
    'Reset': function () {
      E.showMenu();
      inMenu = false;
      Bangle.setUI("clock");
      setTarget(false);
      draw();
    },
    'Set clock as default': function () {
      setClockAsDefault();
      E.showAlert("Elapsed Time was set as default").then(function () {
        E.showMenu();
        inMenu = false;
        Bangle.setUI("clock");
        draw();
      });
    }
  });
}

function setClockAsDefault() {
  let storage = require('Storage');
  let settings = storage.readJSON('setting.json', true) || { clock: null };
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
    target.setSeconds(0);
    Object.assign(
      data,
      {
        target: {
          isSet: false,
          Y: target.getFullYear(),
          M: target.getMonth() + 1, // Month is zero-based, so add 1
          D: target.getDate(),
          h: target.getHours(),
          m: target.getMinutes(),
          s: 0
        }
      }
    );
  }

  writeData();
}

var target;
setTarget(data.target.isSet);

var drawTimeout;
var temp_displaySeconds;
var queueMillis;

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

function updateQueueMillisAndDraw(displaySeconds) {
  temp_displaySeconds = displaySeconds;
  if (displaySeconds) {
    queueMillis = 1000;
  } else {
    queueMillis = 60000;
  }
  draw();
}

Bangle.on('lock', function (on, reason) {
  if (inMenu || settings.displaySeconds == 0 || settings.displaySeconds == 2) { // if already in a menu, or always/never show seconds, nothing to do
    return;
  }

  if (on) { // screen is locked
    updateQueueMillisAndDraw(false);
  } else { // screen is unlocked
    updateQueueMillisAndDraw(true);
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
      start = new Date(target.getTime());
      end = new Date(now.getTime());
    } else {
      start = new Date(now.getTime());
      end = new Date(target.getTime());
    }

    // Adjust for DST
    end.setMinutes(end.getMinutes() + end.getTimezoneOffset() - start.getTimezoneOffset());

    diff.Y = end.getFullYear() - start.getFullYear();
    diff.M = end.getMonth() - start.getMonth();
    diff.D = end.getDate() - start.getDate();
    diff.hh = end.getHours() - start.getHours();
    diff.mm = end.getMinutes() - start.getMinutes();
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

switch (settings.displaySeconds) {
  case 0: // never
    updateQueueMillisAndDraw(false);
    break;
  case 1: // unlocked
    updateQueueMillisAndDraw(Bangle.isBacklightOn());
    break;
  case 2: // always
    updateQueueMillisAndDraw(true);
    break;
}
