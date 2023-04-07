"use strict";
var drainedInterval = setInterval(function () {
    if (Bangle.isCharging())
        return;
    if (E.getBattery() > 5)
        return;
    load("drained.app.js");
}, 5 * 60 * 1000);
