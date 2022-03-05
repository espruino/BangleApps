Bangle.loadWidgets();

var s = Object.assign({
    CAL_ROWS: 4, //number of calendar rows.(weeks) Shouldn't exceed 5 when using widgets.
    BUZZ_ON_BT: true, //2x slow buzz on disconnect, 2x fast buzz on connect. Will be extra widget eventually
    MODE24: true, //24h mode vs 12h mode
    FIRSTDAYOFFSET: 6, //First day of the week: 0-6: Sun, Sat, Fri, Thu, Wed, Tue, Mon
    REDSUN: true, // Use red color for sunday?
    REDSAT: true, // Use red color for saturday?
}, require('Storage').readJSON("clockcal.json", true) || {});

const h = g.getHeight();
const w = g.getWidth();
const CELL_W = w / 7;
const CELL_H = 15;
const CAL_Y = h - s.CAL_ROWS * CELL_H;
const DEBUG = false;

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

function drawCalendar() {
    if (DEBUG) console.log("CALENDAR");
    var d = new Date();
    g.reset();
    g.setBgColor(0);
    g.clear();
    drawMinutes();
    if (!dimSeconds) drawSeconds();
    const dow = (s.FIRSTDAYOFFSET + d.getDay()) % 7; //MO=0, SU=6
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
    dayInterval = setTimeout(drawCalendar, nextday * 1000);
}

function BTevent() {
    drawMinutes();
    if (s.BUZZ_ON_BT) {
        var interval = (NRF.getSecurityStatus().connected) ? 100 : 500;
        Bangle.buzz(interval);
        setTimeout(function () { Bangle.buzz(interval); }, interval * 3);
    }
}

//register events
Bangle.on('lock', locked => {
    if (typeof secondInterval !== "undefined") clearTimeout(secondInterval);
    dimSeconds = locked; //dim seconds if lock=on
    drawCalendar();
});
NRF.on('connect', BTevent);
NRF.on('disconnect', BTevent);


dimSeconds = Bangle.isLocked();
drawCalendar();

Bangle.setUI("clock");
