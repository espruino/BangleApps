{
const SunCalc = require("suncalc"); // from modules folder
const storage = require('Storage');
const widget_utils = require('widget_utils');
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
    tab: "#505050", // grey
    keys: settings.dark_mode ? "#4287f5" : "#0000FF", // blue
    strings: settings.dark_mode ? "#F0A000" : "#FF0000", // orange or red
    ints: settings.dark_mode ? "#00FF00" : "#005F00", // green
    bg: g.theme.bg,
    brackets: g.theme.fg,
};


let jsonText;
let lines = [];
let fontSize = 13;
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
let loadLocation = function() {
    location = require("Storage").readJSON(LOCATION_FILE, 1) || {};
    location.lat = location.lat || 0;
    location.lon = location.lon || 0;
    location.location = location.location || null;
};

let getHr = function(h) {
    var amPm = "";
    if (settings.hr_12) {
        amPm = h < 12 ? "AM" : "PM";
        h = h % 12;
        if (h == 0) h = 12;
    }
    return [h, amPm];
};

let extractTime = function(d) {
    const out = getHr(d.getHours());
    const h = out[0];
    const amPm = out[1];
    const m = d.getMinutes();
    return `${h}:${("0"+m).substr(-2)}${amPm}`;
};

let extractDate = function(d) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const weekday = weekdays[d.getDay()];
    const month = months[d.getMonth()];
    const day = d.getDate();

    return `${weekday} ${month} ${day}`;
};

let getSteps = function() {
    try {
        return Bangle.getHealthStatus("day").steps;
    } catch (e) {
        if (WIDGETS.wpedom !== undefined)
            return WIDGETS.wpedom.getSteps();
        else
            return null;
    }
};

let getVal = function(now, loc) {
    const vals = {};
    const currentDateStr = extractDate(now);
    if (loc.location) {
        if (lastSunCalcDate !== currentDateStr) {
            cachedSunTimes = SunCalc.getTimes(now, location.lat, location.lon);
            lastSunCalcDate = currentDateStr;
        }
        vals.rise = extractTime(cachedSunTimes.sunrise);
        vals.set = extractTime(cachedSunTimes.sunset);
    }
    vals.time = extractTime(now);
    vals.date = currentDateStr;
    vals.batt_pct = E.getBattery();
    vals.steps = getSteps();
    return vals;
};

let loadJson = function() {
    const now = new Date();
    const vals = getVal(now, location);
    //vals.steps = null;  // For testing; uncomment to see the steps not appear
    //location.location = null;  // For testing, if null, the time becomes an struct to take up sun's struct
    let raw;

    if (location.location !== null) {
        raw = {
            time: vals.time,
            dt: vals.date,
            sun: {
                rise: vals.rise,
                set: vals.set,
            },
            "batt_%": vals.batt_pct,
        };
    } else {
        raw = {
            time: {
                hr: getHr(now.getHours())[0],
                min: now.getMinutes(),
            },
            dt: vals.date,
            "batt_%": vals.batt_pct,
        };
    }

    if (vals.steps != null) raw.steps = vals.steps;

    jsonText = JSON.stringify(raw, null, 2);
    lines = jsonText.split("\n");
};

let draw = function() {
    g.clear();
    g.setFontAlign(-1, -1);
    g.setFont("Vector", 10);
    valuePositions = [];

    g.setColor(clrs.tab);

    g.fillRect(90, 0, w, headerHeight);
    g.setColor(clrs.brackets);
    g.drawString("clockface.json", 3, 3);

    g.setFont("Vector", buttonHeight);
    g.drawString("X", buttonX, buttonY);
    g.setFont("Vector", fontSize);

    for (let i = 0; i < maxLines; i++) {
        const y = headerHeight + i * lineHeight;
        const lineNumberStr = (i + 1).toString().padStart(2, " ") + " ";
        g.drawString(lineNumberStr, 0, y);
        numWidth = Math.max(numWidth, g.stringWidth(lineNumberStr));
    }

    redrawValues();
};

let redraw = function() {
    for (let i = 0; i < maxLines; i++) {
        const lineIndex = i;
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
            } else if (value.startsWith('{') || value.startsWith('}')) {
                g.setColor(clrs.brackets);
            } else {
                g.setColor(clrs.ints);
            }
            g.drawString(valueText, valueX, y);

            valuePositions.push({
                key,
                x: valueX,
                y,
                text: value
            });
        } else {
            g.setColor(clrs.brackets);
            g.drawString(line, numWidth, y);
        }
    }
};

let clearVals = function() {
    g.setFont("Vector", fontSize);
    g.setFontAlign(-1, -1);
    valuePositions.forEach(pos => {
        g.setColor(clrs.bg);
        g.fillRect(pos.x, pos.y, w, pos.y + lineHeight);
    });
};

let redrawValues = function() {
    loadJson();
    clearVals();
    redraw();
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        redrawValues();
    }, 60000 - (Date.now() % 60000));
};

Bangle.on('touch', (zone, e) => {
    if (e.x >= (buttonY - buttonHeight) && e.x <= (buttonX + buttonHeight) &&
        (e.y >= (buttonY - buttonHeight) && e.y <= (buttonY + buttonHeight))) {
        Bangle.showLauncher(); // Exit app
    }
});

Bangle.on('backlight', function(on) {
    if (on) {
        redrawValues();
    }
});

Bangle.setUI("clock");
loadLocation();
Bangle.loadWidgets();
widget_utils.hide();
draw();
}