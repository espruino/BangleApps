(function (back) {
    const SETTINGS_FILE = "themes.settings.json";

    // initialize with default settings...
    const storage = require('Storage');
    let settings = {
        cycleInterval: 0
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
        settings[key] = saved_settings[key];
    }

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    E.showMenu({
        '': { 'title': 'Themes' },
        '< Back': back,
        'Cycle Themes Interval': {
            value: settings.cycleInterval,
            min: 0, max: 1440, step: 5,
            onchange: v => {
                settings.cycleInterval = v;
                save();
            },
        },
    });
})