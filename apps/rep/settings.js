(function (back) {
    var _a, _b, _c;
    var SETTINGS_FILE = "rep.setting.json";
    var storage = require("Storage");
    var settings = (storage.readJSON(SETTINGS_FILE, true) || {});
    (_a = settings.record) !== null && _a !== void 0 ? _a : (settings.record = false);
    (_b = settings.recordStopOnExit) !== null && _b !== void 0 ? _b : (settings.recordStopOnExit = false);
    (_c = settings.stepMs) !== null && _c !== void 0 ? _c : (settings.stepMs = 5 * 1000);
    var save = function () {
        storage.writeJSON(SETTINGS_FILE, settings);
    };
    var menu = {
        "": { "title": "Rep" },
        "< Back": back,
        "Fwd/back seconds": {
            value: settings.stepMs / 1000,
            min: 1,
            max: 60,
            step: 1,
            format: function (v) { return "".concat(v, "s"); },
            onchange: function (v) {
                settings.stepMs = v * 1000;
                save();
            },
        },
    };
    if (global["WIDGETS"] && WIDGETS["recorder"]) {
        menu["Record activity"] = {
            value: !!settings.record,
            onchange: function (v) {
                settings.record = v;
                save();
            }
        };
        menu["Stop record on exit"] = {
            value: !!settings.recordStopOnExit,
            onchange: function (v) {
                settings.recordStopOnExit = v;
                save();
            }
        };
    }
    E.showMenu(menu);
})
