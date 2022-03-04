const SETTINGSFILE = "smclock.json";
const background = {
  width: 176,
  height: 176,
  bpp: 3,
  transparent: 1,
  buffer: require("heatshrink").decompress(
    atob(
      "/4A/AH4ACUb8H9MkyVJAThB/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INP/AH4A/AAX8Yz4Afn5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INI="
    )
  ),
};
const monthName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// dynamic variables
var batLevel = -1;
var batColor = [0, 0, 0];

// settings variables
var dateFormat;
var drawInterval;
var pollInterval;
var showAnalogFace;
var showWeekInfo;
var useVectorFont;

// load settings
function loadSettings() {
  // Helper function default setting
  function def(value, def) {return value !== undefined ? value : def;}
  var settings = require("Storage").readJSON(SETTINGSFILE, true) || {};

  dateFormat = def(settings.dateFormat, "Short");
  drawInterval = def(settings.drawInterval, 10);
  pollInterval = def(settings.pollInterval, 60);
  showAnalogFace = def(settings.showAnalogFace, false);
  showWeekInfo = def(settings.showWeekInfo, false);
  useVectorFont = def(settings.useVectorFont, false);
}

// copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
function ISO8601_week_no(date) {
  var tdt = new Date(date.valueOf());
  var dayn = (date.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function d02(value) {
  return ("0" + value).substr(-2);
}

function pollBattery() {
  batLevel = E.getBattery();
}

function getBatteryColor(level) {
  var color;
  if (level < 0) {
    pollBattery();
    level = batLevel;
  }
  if (level > 80) {
    color = [0, 0, 1];
  } else if (level > 60) {
    color = [0, 1, 1];
  } else if (level > 40) {
    color = [0, 1, 0];
  } else if (level > 20) {
    color = [1, 1, 0];
  } else {
    color = [1, 0, 0];
  }
  return color;
}

function draw() {
  g.drawImage(background);

  const color = getBatteryColor(batLevel);
  var bat = "";
  const d = new Date();
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const week = d02(ISO8601_week_no(d));
  var date1 = "";
  var date2 = "";
  const h = d.getHours();
  const m = d.getMinutes();
  const time = d02(h) + ":" + d02(m);

  if (E.getBattery() < 100) {
    bat = d02(E.getBattery()) + "%";
  } else {
    bat = E.getBattery() + "%";
  }

  g.reset();

  // draw battery info
  g.setColor(1, 1, 1);
  if (useVectorFont == true) {
    g.setFont("Vector", 16);
    g.drawString("Bat:", 12, 22, false);
  } else {
    g.setFont("4x6", 2);
    g.drawString("Bat:", 10, 22, false);
  }
  g.setColor(color[0], color[1], color[2]);
  if (batLevel < 100) {
    g.drawString(bat, 52, 22, false);
  } else {
    g.drawString(bat, 46, 22, false);
  }

  // draw date info
  g.setColor(0, 0, 0);
  if (useVectorFont == true) {
    g.setFont("Vector", 20);
  } else {
    g.setFont("6x8", 2);
  }
  if (dateFormat == "Short") {
    date1 = d02(day) + "/" + d02(month);
    g.drawString(date1, 105, 20, false);
  } else {
    date1 = monthName[month - 1] + d02(day);
    g.drawString(date1, 104, 20, false);
  }

  // draw week info
  if (showWeekInfo == true) {
    date2 = weekday[d.getDay()] + " " + d02(week)
    if (useVectorFont == true) {
      g.setFont("Vector", 18);
    } else {
      g.setFont("6x8", 2);
    }
    g.drawString(date2, 105, 55, false);
  } else {
    date2 = d.getFullYear();
    if (useVectorFont == true) {
      g.setFont("Vector", 22);
      g.drawString(date2, 105, 55, false);
    } else {
      g.setFont("4x6", 3);
      g.drawString(date2, 108, 55, false);
    }
  }

  // draw time
  g.setColor(1, 1, 1);
  if (useVectorFont == true) {
    g.setFont("Vector", 60);
    g.drawString(time, 10, 108, false);
  } else {
    g.setFont("6x8", 5);
    g.drawString(time, 14, 112, false);
  }
}

loadSettings();

g.clear();

pollBattery();
draw();

var batInterval = setInterval(pollBattery, pollInterval * 1000);
var actualDrawInterval = setInterval(draw, drawInterval * 1000);

// Stop updates when LCD is off, restart when on
Bangle.on("lcdPower", (on) => {
  if (batInterval) clearInterval(batInterval);
  batInterval = undefined;
  if (actualDrawInterval) clearInterval(actualDrawInterval);
  actualDrawInterval = undefined;
  if (on) {
    batInterval = setInterval(pollBattery, pollInterval * 1000);
    actualDrawInterval = setInterval(draw, drawInterval * 1000);

    pollBattery();
    draw();
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
