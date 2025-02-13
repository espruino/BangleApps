(function(back) {
    const SETTINGS_FILE = "pebbleDistance.json";

    // initialize with default settings...
    let s = {'bg': '#0f0', 'color': 'Green', 'avStep': 0.75, 'localization': 'World'};

    // ...and overwrite them with any saved values
    // This way saved values are preserved if a new version adds more settings
    const storage = require('Storage');
    let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
    const saved = settings || {};
    for (const key in saved) {
        s[key] = saved[key];
    }

    function save() {
        settings = s;
        storage.write(SETTINGS_FILE, settings);
    }

    var color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
    var bg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
    var local_options = ['World', 'US'];

    E.showMenu({
        '': { 'title': 'PebbleD Clock' },
        '< Back': back,
        'Color': {
            value: 0 | color_options.indexOf(s.color),
            min: 0, max: 5,
            format: v => color_options[v],
            onchange: v => {
                s.color = color_options[v];
                s.bg = bg_code[v];
                save();
            },
        },
        'Step length': {
            value: s.avStep || 0.75,
            min: 0.2,
            max: 1.5,
            step: 0.01,
            onchange : v => {
                s.avStep = v;
                save();
            }
        },
        'Localization': {
            value: 0 | local_options.indexOf(s.localization),
            min: 0, max: 1,
            format: v => local_options[v],
            onchange: v => {
                s.localization = local_options[v];
                save();
            },
        }
    });
})
