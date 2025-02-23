(function(back) {
    const SETTINGS_FILE = "coin_info.settings.json";

    // Initialize with default settings...
    // TODO: retrieve from upload-storage
    const token_options = ['bitcoin', 'ethereum', 'tether'];
    let settings = {'tokens':token_options, 'tokenSelected':['bitcoin'], 'getRateMin':60}
    // ...and overwrite them with any saved values
    // This way saved values are preserved if a new version adds more settings
    const storage = require('Storage');
    settings = Object.assign(settings, storage.readJSON(SETTINGS_FILE, 1)||{});

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    function createMultiSelectMenu() {
        const menu = {
            '': { 'title': 'Crpyto-Coin Info' },
            '< Back': () => Bangle.showClock()
        };

        // Dynamic checkbox creation
        settings.tokens.forEach((token, index) => {
            menu[token] = {
                value: settings.tokenSelected.includes(token),
                onchange: v => {
                    if (v) {
                        settings.tokenSelected.push(token);
                    } else {
                        settings.tokenSelected = settings.tokenSelected.filter(f => f !== token);
                    }
                    save();
                }
            };
        });

        // update time
        menu['Req. Rate in Min'] = {
            value: !!settings.getRateMin,
            onchange: v => {
                settings.getRateMin = v;
                save();
            }
        }

        E.showMenu(menu);
    }

    Bangle.setUI({
        mode: 'custom',
        btn: createMultiSelectMenu
    });
})