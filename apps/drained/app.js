"use strict";
if (typeof drainedInterval !== "undefined")
    drainedInterval = clearInterval(drainedInterval);
Bangle.setLCDBrightness(0);
Bangle.setGPSPower = Bangle.setHRMPower = function (_val, _name) { return false; };
Bangle.removeAllListeners();
var nextDraw;
var draw = function () {
    var x = g.getWidth() / 2;
    var y = g.getHeight() / 2 - 48;
    var date = new Date();
    var timeStr = require("locale").time(date, 1);
    var dateStr = require("locale").date(date, 0).toUpperCase() +
        "\n" +
        require("locale").dow(date, 0).toUpperCase();
    g.reset()
        .clearRect(Bangle.appRect)
        .setFont("Vector", 32)
        .setFontAlign(0, 0)
        .drawString(timeStr, x, y)
        .setFont("Vector", 24)
        .drawString(dateStr, x, y + 56)
        .drawString("".concat(E.getBattery(), "%"), x, y + 104);
    if (nextDraw)
        clearTimeout(nextDraw);
    nextDraw = setTimeout(function () {
        nextDraw = undefined;
        draw();
    }, 60000 - (date.getTime() % 60000));
};
Bangle.setUI({
    mode: "clock",
    remove: function () {
        if (nextDraw)
            clearTimeout(nextDraw);
        nextDraw = undefined;
    },
});
g.clear();
draw();
