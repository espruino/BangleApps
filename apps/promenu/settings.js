(function (back) {
    var _a, _b;
    var SETTINGS_FILE = "promenu.settings.json";
    var storage = require("Storage");
    var settings = (storage.readJSON(SETTINGS_FILE, true) || {});
    (_a = settings.naturalScroll) !== null && _a !== void 0 ? _a : (settings.naturalScroll = false);
    (_b = settings.wrapAround) !== null && _b !== void 0 ? _b : (settings.wrapAround = true);
    var save = function () {
        storage.writeJSON(SETTINGS_FILE, settings);
    };
    var menu = {
        "": { "title": "Promenu" },
        "< Back": back,
        "Natural Scroll": {
            value: !!settings.naturalScroll,
            onchange: function (v) {
                settings.naturalScroll = v;
                save();
            }
        },
        "Wrap Around": {
            value: !!settings.wrapAround,
            onchange: function (v) {
                settings.wrapAround = v;
                save();
            }
        }
    };
    E.showMenu(menu);
})
