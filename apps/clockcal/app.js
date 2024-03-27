Bangle.setUI("clock");
Bangle.loadWidgets();

var s = Object.assign({
    CAL_ROWS: 4, //number of calendar rows.(weeks) Shouldn't exceed 5 when using widgets.
    BUZZ_ON_BT: true, //2x slow buzz on disconnect, 2x fast buzz on connect. Will be extra widget eventually
    MODE24: true, //24h mode vs 12h mode
    FIRSTDAY: 6, //First day of the week: mo, tu, we, th, fr, sa, su
    REDSUN: true, // Use red color for sunday?
    REDSAT: true, // Use red color for saturday?
    DRAGDOWN: "[AI:messg]",
    DRAGRIGHT: "[AI:music]",
    DRAGLEFT: "[ignore]",
    DRAGUP: "[calend.]"
}, require('Storage').readJSON("clockcal.json", true) || {});

const h = g.getHeight();
const w = g.getWidth();
const CELL_W = w / 7;
const CELL2_W = w / 8;//full calendar
const CELL_H = 15;
const CAL_Y = h - s.CAL_ROWS * CELL_H;
const DEBUG = false;
var state = "watch";
var monthOffset = 0;

/*
 *   Calendar features
 */
function drawFullCalendar(monthOffset) {
    const addMonths = function (_d, _am) {
        let ay = 0, m = _d.getMonth(), y = _d.getFullYear();
        while ((m + _am) > 11) { ay++; _am -= 12; }
        while ((m + _am) < 0) { ay--; _am += 12; }
        let n = new Date(_d.getTime());
        n.setMonth(m + _am);
        n.setFullYear(y + ay);
        return n;
    };
    monthOffset = (typeof monthOffset == "undefined") ? 0 : monthOffset;
    state = "calendar";
    var start = Date().getTime();
    const months = ['Jan.', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec.'];
    const monthclr = ['#0f0', '#f0f', '#00f', '#ff0', '#0ff', '#fff'];
    if (typeof dayInterval !== "undefined") clearTimeout(dayInterval);
    if (typeof secondInterval !== "undefined") clearTimeout(secondInterval);
    if (typeof minuteInterval !== "undefined") clearTimeout(minuteInterval);
    var d = addMonths(Date(), monthOffset);
    tdy = Date().getDate() + "." + Date().getMonth();
    newmonth = false;
    c_y = 0;
    g.reset();
    g.setBgColor(0);
    g.clear();
    var prevmonth = addMonths(d, -1);
    const today = prevmonth.getDate();
    var rD = new Date(prevmonth.getTime());
    rD.setDate(rD.getDate() - (today - 1));
    const dow = (s.FIRSTDAY + rD.getDay()) % 7;
    rD.setDate(rD.getDate() - dow);
    var rDate = rD.getDate();
    bottomrightY = c_y - 3;
    clrsun = s.REDSUN ? '#f00' : '#fff';
    clrsat = s.REDSUN ? '#f00' : '#fff';
    var fg = [clrsun, '#fff', '#fff', '#fff', '#fff', '#fff', clrsat];
    for (var y = 1; y <= 11; y++) {
        bottomrightY += CELL_H;
        bottomrightX = -2;
        for (var x = 1; x <= 7; x++) {
            bottomrightX += CELL2_W;
            rMonth = rD.getMonth();
            rDate = rD.getDate();
            if (tdy == rDate + "." + rMonth) {
                caldrawToday(rDate);
            } else if (rDate == 1) {
                caldrawFirst(rDate);
            } else {
                caldrawNormal(rDate, fg[rD.getDay()]);
            }
            if (newmonth && x == 7) {
                caldrawMonth(rDate, monthclr[rMonth % 6], months[rMonth], rD);
            }
            rD.setDate(rDate + 1);
        }
    }
    delete addMonths;
    if (DEBUG) console.log("Calendar performance (ms):" + (Date().getTime() - start));
}
function caldrawMonth(rDate, c, m, rD) {
    g.setColor(c);
    g.setFont("Vector", 18);
    g.setFontAlign(-1, 1, 1);
    drawyear = ((rMonth % 11) == 0) ? String(rD.getFullYear()).substr(-2) : "";
    g.drawString(m + drawyear, bottomrightX, bottomrightY - CELL_H, 1);
    newmonth = false;
}
function caldrawToday(rDate) {
    g.setFont("Vector", 16);
    g.setFontAlign(1, 1);
    g.setColor('#0f0');
    g.fillRect(bottomrightX - CELL2_W + 1, bottomrightY - CELL_H - 1, bottomrightX, bottomrightY - 2);
    g.setColor('#000');
    g.drawString(rDate, bottomrightX, bottomrightY);
}
function caldrawFirst(rDate) {
    g.flip();
    g.setFont("Vector", 16);
    g.setFontAlign(1, 1);
    bottomrightY += 3;
    newmonth = true;
    g.setColor('#0ff');
    g.fillRect(bottomrightX - CELL2_W + 1, bottomrightY - CELL_H - 1, bottomrightX, bottomrightY - 2);
    g.setColor('#000');
    g.drawString(rDate, bottomrightX, bottomrightY);
}
function caldrawNormal(rDate, c) {
    g.setFont("Vector", 16);
    g.setFontAlign(1, 1);
    g.setColor(c);
    g.drawString(rDate, bottomrightX, bottomrightY);//100
}
function drawMinutes() {
    if (DEBUG) console.log("|-->minutes");
    var d = new Date();
    var hours = s.MODE24 ? d.getHours().toString().padStart(2, ' ') : ((d.getHours() + 24) % 12 || 12).toString().padStart(2, ' ');
    var minutes = d.getMinutes().toString().padStart(2, '0');
    var textColor = NRF.getSecurityStatus().connected ? '#fff' : '#f00';
    var size = 50;
    var clock_x = (w - 20) / 2;
    if (dimSeconds) {
        size = 65;
        clock_x = 4 + (w / 2);
    }
    g.setBgColor(0);
    g.setColor(textColor);
    g.setFont("Vector", size);
    g.setFontAlign(0, 1);
    g.drawString(hours + ":" + minutes, clock_x, CAL_Y - 10, 1);
    var nextminute = (61 - d.getSeconds());
    if (typeof minuteInterval !== "undefined") clearTimeout(minuteInterval);
    minuteInterval = setTimeout(drawMinutes, nextminute * 1000);
}

function drawSeconds() {
    if (DEBUG) console.log("|--->seconds");
    var d = new Date();
    g.setColor();
    g.fillRect(w - 31, CAL_Y - 36, w - 3, CAL_Y - 19);
    g.setBgColor(0);
    g.setColor('#fff');
    g.setFont("Vector", 24);
    g.setFontAlign(1, 1);
    g.drawString(" " + d.getSeconds().toString().padStart(2, '0'), w, CAL_Y - 13);
    if (typeof secondInterval !== "undefined") clearTimeout(secondInterval);
    if (!dimSeconds) secondInterval = setTimeout(drawSeconds, 1000);
}

function drawWatch() {
    if (DEBUG) console.log("DRAWWATCH");
    monthOffset = 0;
    state = "watch";
    var d = new Date();
    g.reset();
    g.setBgColor(0);
    g.clear();
    drawMinutes();
    if (!dimSeconds) drawSeconds();
    const dow = (s.FIRSTDAY + d.getDay()) % 7; //MO=0, SU=6
    const today = d.getDate();
    var rD = new Date(d.getTime());
    rD.setDate(rD.getDate() - dow);
    var rDate = rD.getDate();
    g.setFontAlign(1, 1);
    for (var y = 1; y <= s.CAL_ROWS; y++) {
        for (var x = 1; x <= 7; x++) {
            bottomrightX = x * CELL_W - 2;
            bottomrightY = y * CELL_H + CAL_Y;
            g.setFont("Vector", 16);
            var fg = ((s.REDSUN && rD.getDay() == 0) || (s.REDSAT && rD.getDay() == 6)) ? '#f00' : '#fff';
            if (y == 1 && today == rDate) {
                g.setColor('#0f0');
                g.fillRect(bottomrightX - CELL_W + 1, bottomrightY - CELL_H - 1, bottomrightX, bottomrightY - 2);
                g.setColor('#000');
                g.drawString(rDate, bottomrightX, bottomrightY);
            }
            else {
                g.setColor(fg);
                g.drawString(rDate, bottomrightX, bottomrightY);
            }
            rD.setDate(rDate + 1);
            rDate = rD.getDate();
        }
    }
    Bangle.drawWidgets();

    var nextday = (3600 * 24) - (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + 1);
    if (DEBUG) console.log("Next Day:" + (nextday / 3600));
    if (typeof dayInterval !== "undefined") clearTimeout(dayInterval);
    dayInterval = setTimeout(drawWatch, nextday * 1000);
    if (DEBUG) console.log("ended DRAWWATCH. next refresh in " + nextday + "s");
}

function BTevent() {
    drawMinutes();
    if (s.BUZZ_ON_BT) {
        var interval = (NRF.getSecurityStatus().connected) ? 100 : 500;
        Bangle.buzz(interval);
        setTimeout(function () { Bangle.buzz(interval); }, interval * 3);
    }
}
function action(a) {
    g.reset();
    if (typeof secondInterval !== "undefined") clearTimeout(secondInterval);
    if (DEBUG) console.log("action:" + a);
    state = "unknown";
    console.log("state -> unknown");
    switch (a) {
        case "[ignore]":
            drawWatch();
            break;
        case "[calend.]":
            drawFullCalendar();
            break;
        case "[AI:music]":
            l = require("Storage").list(RegExp("music.*app.js"));
            if (l.length > 0) {
                load(l[0]);
            } else E.showAlert("Music app not found", "Not found").then(drawWatch);
            break;
        case "[AI:messg]":
            l = require("Storage").list(RegExp("message.*app.js"));
            if (l.length > 0) {
                load(l[0]);
            } else E.showAlert("Message app not found", "Not found").then(drawWatch);
            break;
        case "[AI:agenda]":
            l = require("Storage").list(RegExp("agenda.*app.js"));
            if (l.length > 0) {
                load(l[0]);
            } else E.showAlert("Agenda app not found", "Not found").then(drawWatch);
            break;            
        default:
            l = require("Storage").list(RegExp(a + ".app.js"));
            if (l.length > 0) {
                load(l[0]);
            } else E.showAlert(a + ": App not found", "Not found").then(drawWatch);
            break;
    }
}
function input(dir) {
    Bangle.buzz(100, 1);
    if (DEBUG) console.log("swipe:" + dir);
    switch (dir) {
        case "r":
            if (state == "calendar") {
                drawWatch();
            } else {
                action(s.DRAGRIGHT);
            }
            break;
        case "l":
            if (state == "calendar") {
                drawWatch();
            } else {
                action(s.DRAGLEFT);
            }
            break;
        case "d":
            if (state == "calendar") {
                monthOffset--;
                drawFullCalendar(monthOffset);
            } else {
                action(s.DRAGDOWN);
            }
            break;
        case "u":
            if (state == "calendar") {
                monthOffset++;
                drawFullCalendar(monthOffset);
            } else {
                action(s.DRAGUP);
            }
            break;
        default:
            if (state == "calendar") {
                drawWatch();
            }
            break;
    }
}

let drag;
Bangle.on("drag", e => {
    if (!drag) {
        drag = { x: e.x, y: e.y };
    } else if (!e.b) {
        const dx = e.x - drag.x, dy = e.y - drag.y;
        var dir = "t";
        if (Math.abs(dx) > Math.abs(dy) + 20) {
            dir = (dx > 0) ? "r" : "l";
        } else if (Math.abs(dy) > Math.abs(dx) + 20) {
            dir = (dy > 0) ? "d" : "u";
        }
        drag = null;
        input(dir);
    }
});

//register events
Bangle.on('lock', locked => {
    if (typeof secondInterval !== "undefined") clearTimeout(secondInterval);
    dimSeconds = locked; //dim seconds if lock=on
    drawWatch();
});
NRF.on('connect', BTevent);
NRF.on('disconnect', BTevent);

dimSeconds = Bangle.isLocked();
drawWatch();

setWatch(function() {
    if (state == "watch") {
        Bangle.showLauncher()
    } else if (state == "calendar") {
        drawWatch();
    }
}, BTN1, {repeat:true, edge:"falling"});
