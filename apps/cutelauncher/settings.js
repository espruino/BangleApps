(function (back) {
    const SETTINGS_FILE = "cutelauncher.setting.json";

    // initialize with default settings...
    const storage = require('Storage');
    let settings = {
        showClocks: false,
        scrollbar: true
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
        settings[key] = saved_settings[key];
    }

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    E.showMenu({
        '': { 'title': 'Cutelauncher' },
        '< Back': back,
        'Show Clocks': {
            value: settings.smallNumeralClock,
            onchange: () => {
                settings.showClocks = !settings.showClocks;
                save();
            }
        },
        'Scrollbar': {
            value: settings.smallNumeralClock,
            onchange: () => {
                settings.scrollbar = !settings.scrollbar;
                save();
            }
        }
    });
});
