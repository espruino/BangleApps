(function (back) {
    var _a, _b, _c, _d;
    var SETTINGS_FILE = "drained.setting.json";
    var storage = require("Storage");
    var settings = storage.readJSON(SETTINGS_FILE, true) || {};
    (_a = settings.battery) !== null && _a !== void 0 ? _a : (settings.battery = 5);
    (_b = settings.restore) !== null && _b !== void 0 ? _b : (settings.restore = 20);
    (_c = settings.interval) !== null && _c !== void 0 ? _c : (settings.interval = 10);
    (_d = settings.disableBoot) !== null && _d !== void 0 ? _d : (settings.disableBoot = false);
    var save = function () {
        storage.writeJSON(SETTINGS_FILE, settings);
    };
    E.showMenu({
        "": { "title": "Drained" },
        "< Back": back,
        "Keep startup code": {
            value: settings.disableBoot,
            format: function () { return settings.disableBoot ? "No" : "Yes"; },
            onchange: function () {
                settings.disableBoot = !settings.disableBoot;
                save();
            },
        },
        "Trigger at batt%": {
            value: settings.battery,
            min: 0,
            max: 95,
            step: 5,
            format: function (v) { return "".concat(v, "%"); },
            onchange: function (v) {
                settings.battery = v;
                save();
            },
        },
        "Poll interval": {
            value: settings.interval,
            min: 1,
            max: 60 * 2,
            step: 5,
            format: function (v) { return "".concat(v, " mins"); },
            onchange: function (v) {
                settings.interval = v;
                save();
            },
        },
        "Restore watch at %": {
            value: settings.restore,
            min: 0,
            max: 95,
            step: 5,
            format: function (v) { return "".concat(v, "%"); },
            onchange: function (v) {
                settings.restore = v;
                save();
            },
        },
    });
});
