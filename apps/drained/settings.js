(function (back) {
    var _a, _b, _c, _d, _e;
    var SETTINGS_FILE = "drained.setting.json";
    var storage = require("Storage");
    var settings = storage.readJSON(SETTINGS_FILE, true) || {};
    (_a = settings.battery) !== null && _a !== void 0 ? _a : (settings.battery = 5);
    (_b = settings.restore) !== null && _b !== void 0 ? _b : (settings.restore = 20);
    (_c = settings.interval) !== null && _c !== void 0 ? _c : (settings.interval = 10);
    (_d = settings.keepStartup) !== null && _d !== void 0 ? _d : (settings.keepStartup = true);
    (_e = settings.exceptions) !== null && _e !== void 0 ? _e : (settings.exceptions = ["widdst.0"]);
    var save = function () {
        storage.writeJSON(SETTINGS_FILE, settings);
    };
    var menu = {
        "": { "title": "Drained" },
        "< Back": back,
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
        "Keep startup code": {
            value: settings.keepStartup,
            onchange: function (b) {
                settings.keepStartup = b;
                save();
                updateAndRedraw();
            },
        },
    };
    var updateAndRedraw = function () {
        setTimeout(function () { E.showMenu(menu); }, 10);
        if (settings.keepStartup) {
            delete menu["Startup exceptions"];
            return;
        }
        menu["Startup exceptions"] = function () { return E.showMenu(bootExceptions); };
        var bootExceptions = {
            "": { "title": "Startup exceptions" },
            "< Back": function () { return E.showMenu(menu); },
        };
        storage.list(/\.boot\.js/)
            .map(function (name) { return name.replace(".boot.js", ""); })
            .forEach(function (name) {
            bootExceptions[name] = {
                value: settings.exceptions.indexOf(name) >= 0,
                onchange: function (b) {
                    if (b) {
                        settings.exceptions.push(name);
                    }
                    else {
                        var i = settings.exceptions.indexOf(name);
                        if (i >= 0)
                            settings.exceptions.splice(i, 1);
                    }
                    save();
                },
            };
        });
    };
    updateAndRedraw();
})
