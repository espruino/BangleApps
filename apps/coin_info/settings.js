(function(back) {
    const SETTINGS_FILE = "coin_info.settings.json";
    const storage = require('Storage');

    // Default settings with sorted tokens and load settings
    let settings = Object.assign({
        // TODO: MZw - retrieve from upload-storage
        tokens: ['BTC', 'ETH', 'STORJ'],
        tokenSelected: ['BTC'],
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
        menu['Refresh Rate (min)'] = {
            value: settings.getRateMin,
            min: 1,
            max: 1440,
            onchange: v => {
                settings.getRateMin = v;
                save();
            }
        };

        return menu;
    }

    E.showMenu(createMenu());
})