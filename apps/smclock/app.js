const SETTINGSFILE = "smclock.json";
const image3bit = {
  width : 176, height : 176, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("2Gw4f/AoPX3sggf/A4QAFtu27YC/AX/bkmSpICcpdpEL5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INNt23bAX4C/7dsgAA+jZB/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INI="))
};
const image4bit = {
  width : 176, height : 176, bpp : 4,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/4A/AH4Au1QAp1/2swApK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K+//AH4A/AF8AAH4AUK/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/AA=="))
};
const imagework = {
  width : 176, height : 176, bpp : 4,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("s1l4n/43ilkapcalHL9Mx83i9OqlFi1OCpkS9G68/alcig/bg/ThUqiIAS5GqACOCFCYAJvR7PqACB0gxcj9tWKXYkIybi8wGSUDuIyb/SHCACENt4xaiWNGKQAB6/BGTMUmoyUq1BGTP46AyUhuMGTNzGKkAgs0S7NlGSsA7HxGS8nS6oABgdxGS9GqAyWgtvGK0SxoxWTIQyWi8wGTEKoIyV/CXXAAMNxgxUjlzGLAAB04yUj9lgoyZ60hGSfIZTIABgdxGSdKZTIABguvGKUSxoxaAAPY4IyRiiXbAANaoIyRk3QGTkNxgxQjl9GLgABm6ZQillGT3W+IyP5CXdAAMDuIyPpVQGT0FsgxOj+NGLwAB7DMOi8wGUEKoIyN+yXfAAMNxgyNuYxgAAM3GJkUsAyiq3xGRco6AyigeCGRd6GMUAgukGReNEKVQCKE44L9dhqrRGRnID6MN9qYQt6YLimgXKPqTJ8DuIyLjjMS7U1CB3YS5YABowyRqZGP0gxMiMXZiVmCZsNwQyNj9lMyPXTJtWoIyNiNzdh4jCuYOMm4xOiP4TKWGCZcNt4yPiiFNAAcF09gBpUDuIyPjmNZiPYTI0FBgnxGR8R/TMRgd4TJMF0gxQiMXmCZRsllZROMGSMftqZRm6ZGAAXWS6IABDxIAIg1ITJE3FJXEogAG/C4JRpGEsczAA2CGJMcw1mAA10sBmR09Hu4AGoIyJik1qoAG0mNGSPYYKcoRxHYowyRgdxGSVDXBOHmDMRt4xRj9lDxEF06ZTkIyQ46XIAAPWudQGSFaZiNGEpUDvA/KTI+MGJ8SRZmnUpIAImgyPi7xM619ZiSZP/CKMgeGTKMDuIyOuYeMgs3GSMFsgxNj9gD5vatqZSGRsYKp0NsdQGSFaoIyMowfP7SZRhuMGJccxofPqflTKM3GRcXmDsQGSVW+IyK+yGRqoyRgdxGRX6diIASGRnIMqIAS7CYLimlGUb+MiWDGMUNxgyLf4LMiq1BGRkXmDKiGJkRj+NGMEFsgyNiNKGUEDuIyO5HQGT9Y+IyOillS780GJ0RjlzGT0NxgyPiP2TL1aS54ABi8wGTs44IyQj+NS7tvGKAAB+dQGTcDvgySlDMc7CXRTIWlGTekGKQABubKbxgyU+yZag1BGSkX0AyZm4xUiMcxoxYgtvGSsRpQaBGS0DuIyWjDMY7HxGS0fsovUqB8B0gxWAANzMi0NxgyY/CZWq1BGTEXmoyV64xYiMcxqXVtgyZiNKdQIASgaXZAAPHZinYkIyaj9tGSekGLQABuaXTvgyclHVqoAQq3xGTkUswARs4oTA="))
}
const monthName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// dynamic variables
var batLevel = -1;
var batColor = "";

// settings variables
var backgroundImage;
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

  backgroundImage = def(settings.backgroundImage, "3bit");
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
    color = "#00f";
  } else if (level > 60) {
    color = "#0ff";
  } else if (level > 40) {
    color = "#0f0";
  } else if (level > 20) {
    color = "#f40";
  } else {
    color = "f00";
  }
  return color;
}

function draw() {
  var background;
  if (backgroundImage == "work") {
    background = imagework;
  } else if (backgroundImage == "3bit") {
    background = image3bit;
  } else if (backgroundImage == "4bit") {
    background = image4bit;
  }
  g.drawImage(background);

  batColor = getBatteryColor(batLevel);
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

  g.reset();

  // draw battery info
  var x = 12;
  var y = 16;
  if (Bangle.isCharging()) {
    g.setColor("#ff0").drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),x,y);
  } else {
    g.clearRect(x,y,x+14,y+24);
    g.setColor("#fff").fillRect(x+2,y+2,x+12,y+22).clearRect(x+4,y+4,x+10,y+20).fillRect(x+5,y+1,x+9,y+2);
    g.setColor(batColor).fillRect(x+4,y+20-(batLevel*16/100),x+10,y+20);
  }
  if (Bangle.isCharging()) {
    g.setColor("#ff0");
  } else {
    g.setColor("#fff");
  }
  if (useVectorFont == true) {
    g.setFont("Vector", 16);
  } else {
    g.setFont("4x6", 3);
  }
  if (batLevel < 100) {
    bat = d02(batLevel) + "%";
    g.drawString(bat, 50, 22, false);
  } else {
    bat = "100%";
    g.drawString(bat, 40, 22, false);
  }

  // draw date info
  g.setColor("#000");
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
    date2 = weekday[d.getDay()] + " " + d02(week);
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
  if (backgroundImage == "work") {
    g.setColor("#000");
  } else {
    g.setColor("#fff");
  }
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
