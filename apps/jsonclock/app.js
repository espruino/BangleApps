var SunCalc = require("suncalc"); // from modules folder
const storage = require('Storage');
const widget_utils = require('widget_utils');
//const SETTINGS_FILE = "jsonClock.json";
const global_settings = storage.readJSON("setting.json", true) || {};
const LOCATION_FILE = "mylocation.json";
const h = g.getHeight();
const w = g.getWidth();
let location;
let cachedSunTimes = null;
let lastSunCalcDate = null;
var prevVals = {};
let drawTimeout;

var settings = {
  hr_12: global_settings["12hour"] !== undefined ? global_settings["12hour"] : false,
  dark_mode: g.theme.dark
};

let clrs = {
  tab :     "#DDDDDD",                                  // grey
  keys:     settings.dark_mode ? "#4287f5" : "#0000FF", // blue
  strings:  settings.dark_mode ? "#F0A000" : "#FF0000", // orange or red
  ints:     settings.dark_mode ? "#00FF00" : "#00FF00", // green
  bg:       g.theme.bg,
  brackets: g.theme.fg,
};


let jsonText;
let lines = [];
let scrollOffset = 0;
let fontSize = 12;
const lineHeight = 16;

const buttonHeight = 12;
const buttonX = 78;
const buttonY = 3;

let valuePositions = [];
const headerHeight = 16;
const usableHeight = h - headerHeight;
const maxLines = Math.floor(usableHeight / lineHeight);
var numWidth = 0;

// requires the myLocation app
function loadLocation() {
    location = require("Storage").readJSON(LOCATION_FILE,1)||{};
    location.lat = location.lat||35.7796;
    location.lon = location.lon||-78.6382;
    location.location = location.location||"Raleigh";
}

function extractTime(d){
    var h = d.getHours(), m = d.getMinutes();
    var amPm = "";
    if (settings.hr_12) {
      amPm = h < 12 ? "AM" : "PM";
      h = h % 12;
      if (h == 0) h = 12;
    }
    return `${h}:${("0"+m).substr(-2)}${amPm}`;
  }

  function extractDate(d) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    const weekday = weekdays[d.getDay()];
    const month = months[d.getMonth()];
    const day = d.getDate();
  
    return `${weekday} ${month}, ${day}`;
  }

  function getSteps() {
    try {
      return Bangle.getHealthStatus("day").steps;
    } catch (e) {
      if (WIDGETS.wpedom !== undefined)
        return WIDGETS.wpedom.getSteps();
      else
        return 0;
    }
  }

  function getVal() {
    const vals = {};
    const now = new Date();
    const currentDateStr = extractDate(now);
    if (lastSunCalcDate !== currentDateStr) {
      cachedSunTimes = SunCalc.getTimes(now, location.lat, location.lon);
      lastSunCalcDate = currentDateStr;
    }
    vals.time = extractTime(now);
    vals.date = currentDateStr;
    vals.rise = extractTime(cachedSunTimes.sunrise);
    vals.set = extractTime(cachedSunTimes.sunset);
    vals.batt_pct = E.getBattery();
    vals.steps = getSteps();
    return vals;
  }
  

function loadJson() {
    vals = getVal();
    const raw = JSON.stringify({
        time: vals.time,
        date: vals.date,
        sun: {
        rise: vals.rise,
        set: vals.set,
        },
        "batt_%": vals.batt_pct,
        steps: vals.steps
    });
  jsonText = JSON.stringify(JSON.parse(raw), null, 2);
  lines = jsonText.split("\n");
}

function draw() {
  g.clear();
  g.setFontAlign(-1, -1);
  g.setFont("Vector", 10);
  valuePositions = [];

  g.setColor(clrs.tab);
  
  g.fillRect(90, 0, w, headerHeight);
  loadJson();
  g.setColor(clrs.brackets);
  g.drawString("clockface.json",3,3);

  g.setFont("Vector", buttonHeight);
  g.drawString("X",buttonX,buttonY);
  g.setFont("Vector", fontSize);

  for (let i = 0; i < maxLines; i++) {
    const lineIndex = i + scrollOffset;
    const line = lines[lineIndex];
    if (!line) continue;

    const y = headerHeight + i * lineHeight;

    const lineNumberStr = (lineIndex + 1).toString().padStart(2, " ") + " ";
    g.drawString(lineNumberStr, 0, y);
    numWidth = Math.max(numWidth, g.stringWidth(lineNumberStr));
  }

  redraw();
}

function redraw() {
  for (let i = 0; i < maxLines; i++) {
    const lineIndex = i + scrollOffset;
    const line = lines[lineIndex];
    if (!line) continue;
    const y = headerHeight + i * lineHeight;

    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";

    const kvMatch = line.trim().match(/^"([^"]+)":\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2];

      if (prevVals.key == value) continue;
      prevVals.key = value;

      // Key
      g.setColor(clrs.keys);
      g.drawString(indent + `"${key}"`, numWidth, y);
      const keyWidth = g.stringWidth(indent + `"${key}"`);
      const valueX = numWidth + keyWidth;
      const valueText = ": " + value;

      // Value color
      if (value.startsWith('"')) {
        g.setColor(clrs.strings);
      }
      else if (value.startsWith('{') || value.startsWith('}')) {
        g.setColor(clrs.brackets);
      }
      else {
        g.setColor(clrs.ints);
      }
      g.drawString(valueText, valueX, y);

      valuePositions.push({ key, x: valueX, y, text: value });
    }
    else {
      g.setColor(clrs.brackets);
      g.drawString(line, numWidth, y);
    }
  }
  Bangle.drawWidgets();
}

function clearVals() {
  g.setFont("Vector", fontSize);
  g.setFontAlign(-1, -1);
  valuePositions.forEach(pos => {
    g.setColor(clrs.bg);
    g.fillRect(pos.x, pos.y, w, pos.y + lineHeight);
  });
}

function redrawValues(){
    loadJson();
    clearVals();
    redraw();
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      redrawValues();
    }, 60000 - (Date.now() % 60000));
}

function scroll(amount) {
  const maxOffset = Math.max(0, lines.length - Math.floor((h - headerHeight) / lineHeight));
  scrollOffset = Math.max(0, Math.min(scrollOffset + amount, maxOffset));
  draw();
}


Bangle.on('touch', (zone, e) => {
  if (e.x >= (buttonY - buttonHeight) && e.x <= (buttonX + buttonHeight)
      && (e.y >= (buttonY - buttonHeight) && e.y <= (buttonY + buttonHeight))) {
    load(); // Exit app
  }
});


Bangle.on('drag', (e) => scroll(-e.dy));

Bangle.on('backlight', function(on) {
  if (on) {
    redrawValues(); // or just draw() if you want full re-render
  }
});

Bangle.setUI({
  mode: "clock",
  remove: function () {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

loadLocation();
Bangle.loadWidgets();
widget_utils.hide();
draw();
setTimeout(Bangle.drawWidgets,0);
