"use strict";
var _a = require("Storage").readJSON("drained.setting.json", true) || {}, _b = _a.battery, threshold = _b === void 0 ? 5 : _b, _c = _a.interval, interval = _c === void 0 ? 10 : _c, _d = _a.disableBoot, disableBoot = _d === void 0 ? false : _d;
drainedInterval = setInterval(function () {
    if (Bangle.isCharging())
        return;
    if (E.getBattery() > threshold)
        return;
    if (disableBoot) {
        require("Storage").erase(".boot0");
        Bangle.on("charging", function (charging) {
            if (charging)
                eval(require('Storage').read('bootupdate.js'));
        });
    }
    load("drained.app.js");
}, interval * 60 * 1000);
