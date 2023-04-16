"use strict";
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
            format: function () { return settings.format == 0 ? "12h34m56s" : "12:34:56"; },
            onchange: function () {
                settings.format = (settings.format + 1) % 2;
                save();
            },
        },
    });
});
