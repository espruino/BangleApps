(function (back) {
    const SETTINGS_FILE = "cutelauncher.settings.json";

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
            value: settings.showClocks,
            onchange: () => {
                settings.showClocks = !settings.showClocks;
                save();
                storage.erase("launch.cache.json"); //delete the cache app list
            }
        },
        'Scrollbar': {
            value: settings.scrollbar,
            onchange: () => {
                settings.scrollbar = !settings.scrollbar;
                save();
            }
        }
    });
})
