(function (back) {
    var _a;
    var SETTINGS_FILE = "clkinfostopw.setting.json";
    var storage = require("Storage");
    var settings = storage.readJSON(SETTINGS_FILE, true) || {};
    (_a = settings.format) !== null && _a !== void 0 ? _a : (settings.format = 0);
    var save = function () {
        storage.writeJSON(SETTINGS_FILE, settings);
    };
    E.showMenu({
        "": { "title": "stopwatch" },
        "< Back": back,
        "Format": {
            value: settings.format,
            min: 0,
            max: 1,
            format: function (v) { return v === 0 ? "12m34s" : "12:34"; },
            onchange: function (v) {
                settings.format = v;
                save();
            },
        },
    });
});
