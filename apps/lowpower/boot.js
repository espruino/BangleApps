"use strict";
var lowpowerInterval = setInterval(function () {
    if (Bangle.isCharging())
        return;
    if (E.getBattery() > 5)
        return;
    load("lowpower.app.js");
}, 5 * 60 * 1000);
