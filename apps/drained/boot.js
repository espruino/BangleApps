{
    var _a = require("Storage").readJSON("drained.setting.json", true) || {}, _b = _a.battery, threshold_1 = _b === void 0 ? 5 : _b, _c = _a.interval, interval = _c === void 0 ? 10 : _c, _d = _a.disableBoot, disableBoot_1 = _d === void 0 ? false : _d;
    drainedInterval = setInterval(function () {
        if (Bangle.isCharging())
            return;
        if (E.getBattery() > threshold_1)
            return;
        var app = "drained.app.js";
        if (disableBoot_1)
            require("Storage").write(".boot0", "if(typeof __FILE__ === \"undefined\" || __FILE__ !== \"".concat(app, "\") setTimeout(load, 100, \"").concat(app, "\");"));
        load(app);
    }, interval * 60 * 1000);
}
