"use strict";
var app = "drained";
if (typeof drainedInterval !== "undefined")
    drainedInterval = clearInterval(drainedInterval);
Bangle.setLCDBrightness(0);
var powerNoop = function () { return false; };
var forceOff = function (name) {
    var _a;
    if ((_a = Bangle._PWR) === null || _a === void 0 ? void 0 : _a[name])
        Bangle._PWR[name] = [];
    Bangle["set".concat(name, "Power")](0, app);
    Bangle["set".concat(name, "Power")] = powerNoop;
};
forceOff("GPS");
forceOff("HRM");
NRF.disconnect();
NRF.sleep();
Bangle.removeAllListeners();
clearWatch();
Bangle.setOptions({
    wakeOnFaceUp: 0,
    wakeOnTouch: 0,
    wakeOnTwist: 0,
});
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
        .setFont("Vector", 55)
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
    mode: "custom",
    remove: function () {
        if (nextDraw)
            clearTimeout(nextDraw);
        nextDraw = undefined;
    },
});
Bangle.CLOCK = 1;
g.clear();
draw();
