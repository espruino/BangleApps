{
const SunCalc = require("suncalc"); // from modules folder
const storage = require('Storage');
const widget_utils = require('widget_utils');
const global_settings = storage.readJSON("setting.json", true) || {};
const LOCATION_FILE = "mylocation.json";
let location;
let cachedSunTimes = null;
let lastSunCalcDate = null;
var valsArrs = {};
let drawTimeout;

const h = g.getHeight();
const w = g.getWidth();
const fontSize = 13;
const lineHeight = 16;
const buttonHeight = 12;
const buttonX = 78;
const buttonY = 3;
const headerHeight = 16;
const usableHeight = h - headerHeight;
const maxLines = Math.floor(usableHeight / lineHeight);

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


let getKeyValRegex = function(line) {
    return line.trim().match(/^"([^"]+)":\s*(.+)$/);
};

let getIndentRegex = function(line) {
    const indentMatch = line.match(/^(\s*)/);
    return indentMatch ? indentMatch[1] : "";
};

let getJsonLine = function() {
    const now = new Date();
    const vals = getVal(now, location);
    //vals.steps = null;  // For testing; uncomment to see the steps not appear
    //location.location = null;  // For testing, if null, the time becomes an struct to take up sun's struct
    const hasLoc = location.location !== null;
    let raw = {
        time: hasLoc
        ? vals.time
        : {
            hr: getHr(now.getHours())[0],
            min: now.getMinutes(),
            },
        dt: vals.date,
        "batt_%": vals.batt_pct,
    };
    if (vals.steps != null) {
        raw.steps = vals.steps;
    }
    if (hasLoc) {
        raw.sun = {
        rise: vals.rise,
        set: vals.set,
        };
    }
    let jsonText = JSON.stringify(raw, null, 2);
    return jsonText.split("\n");
};

let draw = function() {
    g.clear();
    g.setFontAlign(-1, -1);
    g.setFont("Vector", 10);

    g.setColor(clrs.tab);

    g.fillRect(90, 0, w, headerHeight);
    g.setColor(clrs.brackets);
    g.drawString("clockface.json", 3, 3);

    g.setFont("Vector", buttonHeight);
    g.drawString("X", buttonX, buttonY);
    g.setFont("Vector", fontSize);
    
    var lines = getJsonLine();
    var numWidth = 0;
    
    // Draw numbers first to find out their max width
    for (let i = 0; i < maxLines; i++) {
        const y = headerHeight + i * lineHeight;
        const lineNumberStr = (i + 1).toString().padStart(2, " ") + " ";
        g.drawString(lineNumberStr, 0, y);
        numWidth = Math.max(numWidth, g.stringWidth(lineNumberStr));
    }
    for (let i = 0; i < maxLines; i++) {
        const y = headerHeight + i * lineHeight;
        const line = lines[i];
        if (!line) continue;

        let kvMatch = getKeyValRegex(line);
        if (kvMatch) {
            const key = kvMatch[1];
            let value = kvMatch[2];

            // Key
            g.setColor(clrs.keys);
            const indent = getIndentRegex(line);
            const keyText = indent + `"${key}"`;
            g.drawString(keyText, numWidth, y);
            const keyWidth = g.stringWidth(keyText);
            let x = numWidth + keyWidth;

            g.setColor(clrs.brackets);
            const colonText = ": ";
            g.drawString(colonText, x, y);
            x += g.stringWidth(colonText);
            
            // Value color
            const endComma = value.endsWith(',');
            valsArrs[key] = {text:value, x:x, y:y, endComma:endComma};
            if (endComma) value = value.slice(0, -1);
            if (value.startsWith('"')) {
                valsArrs[key].color = clrs.strings;
            } else if (value.startsWith('{') || value.startsWith('}')) {
                valsArrs[key].color = clrs.brackets;
            } else {
                valsArrs[key].color = clrs.ints;
            }
            g.setColor(valsArrs[key].color);
            g.drawString(value, x, y);
            if (endComma){
                g.setColor(clrs.brackets);
                g.drawString(',', x + g.stringWidth(value), y);
            }
        }
        else {
            g.setColor(clrs.brackets);
            g.drawString(line, numWidth, y);
        }
    }
};

// Redraws only values that changed
let redraw = function() {
    g.setFontAlign(-1, -1);
    g.setFont("Vector", fontSize);
    var lines = getJsonLine();

    for (let i = 0; i < lines.length; i++) {
        let kvMatch = getKeyValRegex(lines[i]);
        if (!kvMatch) continue;
        const key = kvMatch[1];
        let value = kvMatch[2];
        if (!(key in valsArrs)) continue;
        let valsArr = valsArrs[key];
        if (value === valsArr.text) continue; // No need to update
        if (valsArr.endComma) value = value.slice(0, -1);
        valsArrs[key].text = value;

        // Clear prev values
        g.setColor(clrs.bg);
        g.fillRect(valsArr.x, valsArr.y, w, valsArr.y + lineHeight);

        g.setColor(valsArr.color);
        g.drawString(value, valsArr.x, valsArr.y);
        if (valsArr.endComma){
            g.setColor(clrs.brackets);
            g.drawString(',', valsArr.x + g.stringWidth(value), valsArr.y);
        }
    }
};

let redrawValues = function() {
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
redrawValues(); // To set the timeout
}