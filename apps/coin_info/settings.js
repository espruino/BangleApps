(function(back) {
    const SETTINGS_FILE = "coin_info.settings.json";
    const storage = require('Storage');

    // Default settings with sorted tokens
    let settings = Object.assign({
        // TODO: MZw - retrieve from upload-storage
        tokens: ['bitcoin', 'ethereum', 'tether'],
        tokenSelected: ['bitcoin'],
        getRateMin: 60
    }, storage.readJSON(SETTINGS_FILE, 1) || {});

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    function createMenu() {
        const menu = {
            '': { 'title': 'Crypto-Coin Info' },
            '< Back': () => Bangle.showClock()
        };

        // Dynamic checkbox creation
        settings.tokens.sort().forEach(token => {
            menu[token] = {
                value: settings.tokenSelected.includes(token),
                onchange: v => {
                    settings.tokenSelected = v
                        ? [...new Set([...settings.tokenSelected, token])] // Prevent duplicates
                        : settings.tokenSelected.filter(t => t !== token);
                }
            };
        });

        // update time
        menu['Refresh Rate (min)'] = {
            value: settings.getRateMin,
            min: 1,
            max: 1440,
            onchange: v => {
                settings.getRateMin = v;
            }
        };

        menu['SAVE'] = {
            cb: () => {
                save();
                Bangle.showClock();
            }
        }

        return menu;
    }

    E.showMenu(createMenu());
})