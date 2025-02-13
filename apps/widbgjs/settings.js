(function (back) {
    const SAVEFILE = "widbgjs.settings.json";

    // initialize with default settings...
    let s = {
        'unitIsMmol': true,
        'expireThreshold': 600000,
        'hide': false
    };
    // ...and overwrite them with any saved values
    // This way saved values are preserved if a new version adds more settings
    const storage = require('Storage');
    var d = storage.readJSON(SAVEFILE, 1) || {};
    const saved = d || {};
    for (const key in saved) {
        s[key] = saved[key];
    }

    function save() {
        d = s;
        storage.write(SAVEFILE, d);
        WIDGETS['widbgjs'].draw();
    }

    E.showMenu({
        '': { 'title': 'BG widget' },
        'Unit': {
            value: s.unitIsMmol,
            format: () => (s.unitIsMmol ? 'mmol/L' : 'mg/dL'),
            onchange: () => {
                s.unitIsMmol = !s.unitIsMmol;
                save();
            },
        },
        'Exp. BG': {
            value: s.expireThreshold,
            min: 18000, step: 60000,
            format: s => (s ? s / 60000 + ' min' : '0'),
            onchange: (g) => {
                s.expireThreshold = g;
                save();
            },
        },
        'Hide Widget': {
            value: s.hide,
            onchange: () => {
                s.hide = !s.hide;
                save();
            },
        },
        '< Back': back,
    });
})
