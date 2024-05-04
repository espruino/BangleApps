(function () {
    var _a = require("Storage").readJSON("drained.setting.json", true) || {}, _b = _a.battery, threshold = _b === void 0 ? 5 : _b, _c = _a.interval, interval = _c === void 0 ? 10 : _c, _d = _a.keepStartup, keepStartup = _d === void 0 ? true : _d;
    drainedInterval = setInterval(function () {
        if (Bangle.isCharging())
            return;
        if (E.getBattery() > threshold)
            return;
        var app = "drained.app.js";
        if (!keepStartup)
            require("Storage").write(".boot0", "if(typeof __FILE__ === \"undefined\" || __FILE__ !== \"".concat(app, "\") setTimeout(load, 100, \"").concat(app, "\");"));
        load(app);
    }, interval * 60 * 1000);
})();
