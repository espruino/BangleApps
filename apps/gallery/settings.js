(function back() {
    const storage = require('Storage');
    // Load existing settings or initialize defaults
    let settings = storage.readJSON('setting.json') || {};
    settings.disablePowerSaving = settings.disablePowerSaving || false; // Default to false if not set

    function saveSettings() {
        storage.write('setting.json', settings);
    }

    E.showMenu({
        '': { 'title': 'Gallery Settings' },
        'Disable Power Saving': {
            value: settings.disablePowerSaving,
            onchange: v => {
                settings.disablePowerSaving = v;
                saveSettings();
            }
        },
        '< Back': () => load()
    });
})