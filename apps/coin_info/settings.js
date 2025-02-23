(function(back) {
    const SETTINGS_FILE = "coin_info.settings.json";

    // Initialize with default settings...
    let settings = {'tokens':'bitcoin', 'getRateMin':60}
    // ...and overwrite them with any saved values
    // This way saved values are preserved if a new version adds more settings
    const storage = require('Storage');
    settings = Object.assign(settings, storage.readJSON(SETTINGS_FILE, 1)||{});

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    var token_options = ['bitcoin', 'ethereum', 'tether'];

    E.showMenu({
        '': { 'title': 'Crpyto-Coin Info' },
        '< Back': back,
        'Traceable Tokens': {
            value: 0 | theme_options.indexOf(settings.theme),
            min: 0, max: theme_options.length - 1,
            format: v => theme_options[v],
            onchange: v => {
                settings.theme = theme_options[v];
                save();
            }
        },
        'Req. Rate in Min': {
            value: !!settings.getRateMin,
            onchange: v => {
                settings.getRateMin = v;
                save();
            }
        }
    });
})