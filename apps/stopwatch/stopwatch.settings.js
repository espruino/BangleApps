(function (back) {
    var storage = require("Storage");
    var SETTINGS_FILE = "stopwatch.json";
    var cfg = storage.readJSON(SETTINGS_FILE, 1) || {};
    function saveSettings() {
        storage.writeJSON(SETTINGS_FILE, cfg);
    }
    E.showMenu({
        "": { "title": "Stopwatch Config" },
        "< Back": back,
        "Lap Support": {
            value: !!cfg.lapSupport,
            onchange: function (v) {
                cfg.lapSupport = v;
                saveSettings();
            },
        },
    });
})
