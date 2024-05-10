const SETTINGSFILE = "smclock.json";
const image3bit = {
  width : 176, height : 176, bpp : 3,
  transparent : -1,
  palette : new Uint16Array([0,48599,800,65535,0,0,0,0]),
  buffer : require("heatshrink").decompress(atob("tu27YC/AX/bkmSpICcpdpEL5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INNt23bAX4C/7dsgAA+jZB/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INIA="))
};
const image4bit = {
  width : 176, height : 176, bpp : 4,
  transparent : -1,
  palette : new Uint16Array([0,48599,800,65535,0,0,0,0,0,0,0,0,0,0,0,0]),
  buffer : require("heatshrink").decompress(atob("mYA/AH4AuiIApicykQApK/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K/5X/K+8zAH4A/AF8AAH4AUK/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/4A/K/5X/AH5X/K/5X/AH5X/K/5X/AH5X/K/4A/K/5X/K/4A/K/5X/K/AA=="))
};
const imagework = {
  width : 176, height : 176, bpp : 4,
  transparent : -1,
  palette : new Uint16Array([60003,4587,18953,57955,55908,41542,4619,29223,53860,8714,10762,51812,12810,45637,55907,43589]),
  buffer : require("heatshrink").decompress(atob("swAfspCghpDgACfATcMmK+fQK8O2K2ViK0MAg5XytZXigmmK+NwK8UAqxWwtNAK8cCK+FlK0cAhpXw4BXkgF2K9/QK8uGK11nK0sAg5XutBXmgemK9twK80AqxWstUwK88CK9llK08AhZXskBXogF2K9fQK9NJK1VnK1MAg5XqyhXqgHGK9NwK9fWK1FsmBXrgRXot5WrgELK9EgK9kAuxXn2BXtpJWms5WtgEFK82UK90A4xXlqBXv6xWkthWvgECK8ltK+EIK8kgK+EAuxXjwBXxnRWis5WxgEFK8WkK+UAkxXhqBXz6xWgsRWzgEHK8FtK+kEyxXfuBX0gF2K7+AK+s8Kz1nK2sAgpXe0ZX2gEmK7tQK++2KzliK28Ag5XctZX4gmWK7dwK/EAqxWatNAK/MMK7VlK3MAhpXa4ZX6gEmK7PwK/e2KzFiK3cAg5XYtZX8gmmK69wK/kAqxWWtNAK/sMK61lK3sAhpXW4BX+gEmK6vQK/+GKyliK38Ag5XUtBW/gED0xXTuBW/AANWK6fQKv4ABhhXTkA2goggf2xXTspXghogfkxXTtUwGz8EqAfdgpWTAANwWEFbDzs8K6toK8EHDzt2K6tnK8ENaTkIyxXVs3QLEF7ZrhWWs0gK8GCmAca6xXXspXgg9wDjUmK69qoBXfgetDbMFKy4ABRrYAFrh6ZnRXZtZXggR6ZuxXZsRXghtvDK8IKzIAB6BYgvVAZK5Xb4BXgpMgDC3WK7dlK8EHES/GK7dpcq4AIgfJwAXUgpWbAANwWEFWkAWUpJXdtZXggVlCyl2K7tiK8ELs2wCqgAe+BYgu0gYqZXf4ZXgpNnCiX2K740TABsFs2wCaED4xXftNALEHGaaMHKz4ABuBXg6zTRpJXhtZXggVm6ASPuxXhsRXghdm4gRQAEVQLEF2s7BQACNlqoAMq9m0ZXgpNmkQANkxXSuCMfACMFesVpwA0OnlmCJ4AR4xXhTqENs0gK8HWK8PDGiF2tpXggRXhqA0QnlsK8EIK0FiGiMLNaTTQK79rGieUK8E6K79wGiUCs5XggpWetNAGiULs2wLEEmK7tlGilWkBXg6xXd4A0UgVtK8EHK7vQGikIzhXggmWKzdiGq1WqBYguxXbtY0WgWUK8E8K7dwcq+nK8EFKzVpoA1X+2wLEEmK7NlGjEHkBXg2xXZ4A0YgfFK8EHK7PQGrPcmBXfgmWKy9iRrdwWEFWK69oGjUDkhXghhXXSTm3K8ENKy1qmA1bg/QLEEmK6tlGrrNcAAm2K6sgGru1K8EHK6roeh8wK78EyxWTs42fO7wACqxXTyg1foBXghhXTuA2gAEEFK6ewKv4ABgRXTkBV/AAPWK6dtKv4ABkxXTthV/gEFKyYABqBX/pRXVyhX/uxXVs5W+hZWVAAOwK/sCK68gK/vWK69vK/vGK69smBW7gpWXAANwK/dJK7OUK/d2K7NnK3ULKzIAB6BX5gRXbkBX5qxXbspW4gfGK7dqmBX3g5WbAANwK+9JK7toK+92K7tiK20LKzoAB6BX1gRXf4BX1qxXfspW0gemK79poBXzg5WfAANwK+eGK8NrK+cmK8NiK2UNK0IAB6BXxgRXj4BXxqxXjspWwgmWK8dpoBXvg5WjAANwK9+2K8trK98mK8tiK10NK0oABqBXthhXn4ZXtqxXns5WsgmWK89pwBXrg5WnAANwK9e2K9NtK9cmK9NiK1UFK1IABqBXpnhXr0ZXpuxXrs5WogmWK9dmwBXng5Wss0gK8+2K9ttK88mK9tsK00FK1oABqBXlnRXvyhXluxXvs5WkhBWvAAOwK8cCK+MgK8fWK+NvK8fGK+NsmBWhgpWxAANQK8NJK+eUK8N2K+dnogAfpZHkA=="))
};
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
  if (backgroundImage == "3bit") {
    background = image3bit;
  } else if (backgroundImage == "4bit") {
    background = image4bit;
  } else {
    background = imagework;
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
    g.setColor("#000").fillRect(x+2,y+2,x+12,y+22).clearRect(x+4,y+4,x+10,y+20).fillRect(x+5,y+1,x+9,y+2);
    g.setColor(batColor).fillRect(x+4,y+20-(batLevel*16/100),x+10,y+20);
  }
  if (Bangle.isCharging()) {
    g.setColor("#ff0");
  } else {
    g.setColor(batColor);
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
  g.setColor("#fff");
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
