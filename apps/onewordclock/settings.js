(function (back) {
    const SETTINGS_FILE = "onewordclock.settings.json";

    // initialize with default settings...
    const storage = require('Storage');
    let settings = {
        mode: "Named",
        smallNumeralClock: true
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
        settings[key] = saved_settings[key];
    }

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    var screenOptions = ["Named", "Hours"];
    E.showMenu({
        '': { 'title': 'One Word Clock' },
        '< Back': back,
        'Mode': {
            value: 0 | screenOptions.indexOf(settings.mode),
            min: 0, max: 1,
            format: v => screenOptions[v],
            onchange: v => {
                settings.mode = screenOptions[v];
                save();
            },
        },
        'Small Numeral Clock': {
            value: settings.smallNumeralClock,
            onchange: () => {
                settings.smallNumeralClock = !settings.smallNumeralClock;
                save();
            }
        }
    });
})