"use strict";
var _a = require("Storage")
    .readJSON("".concat(app, ".setting.json"), true) || {}, _b = _a.battery, battery = _b === void 0 ? 5 : _b, _c = _a.interval, interval = _c === void 0 ? 10 : _c;
var drainedInterval = setInterval(function () {
    if (Bangle.isCharging())
        return;
    if (E.getBattery() > battery)
        return;
    load("drained.app.js");
}, interval * 60 * 1000);
