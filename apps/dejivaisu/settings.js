(function back() {
    const storage = require('Storage');
    // Load existing settings or initialize defaults
    let settings = storage.readJSON('setting.json') || {};

    function saveSettings() {
        storage.write('setting.json', settings);
    }

    E.showMenu({
        '': { 'title': 'Dejivaisu Settings' },
        'Show Mascot': {
            value: settings.showMascot,
            onchange: v => {
                settings.showMascot = v;
                saveSettings();
            }
        },
        'Show Seconds': {
            value: settings.showDJSeconds,
            onchange: v => {
                settings.showDJSeconds = v;
                saveSettings();
            }
        },
        '< Back': () => load()
    });
})