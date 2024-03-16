const SETTINGS_FILE = "themeSwitch.json";
const storage = require("Storage");
let settings = storage.readJSON('setting.json', 1);
let saved = storage.readJSON(SETTINGS_FILE, 1) || {};

function cl(x) { return g.setColor(x).getColor(); }

function upd(th) {
    g.theme = th;
    settings.theme = th;
    storage.write('setting.json', settings);
    delete g.reset;
    g._reset = g.reset;
    g.reset = function (n) { return g._reset().setColor(th.fg).setBgColor(th.bg); };
    g.clear = function (n) { if (n) g.reset(); return g.clearRect(0, 0, g.getWidth(), g.getHeight()); };
    g.clear(1);
}

function flipTheme(saved) {
    if (!g.theme.dark) {
        upd({
            fg: cl("#fff"), bg: cl("#000"),
            fg2: cl("#fff"), bg2: cl("#004"),
            fgH: cl("#fff"), bgH: cl("#00f"),
            dark: true
        });

        saved.darkModeActive = 1;
    } else {
        upd({
            fg: cl("#000"), bg: cl("#fff"),
            fg2: cl("#000"), bg2: cl("#cff"),
            fgH: cl("#000"), bgH: cl("#0ff"),
            dark: false
        });
        saved.darkModeActive = 0;
    }
    return saved;
}

if (settings.theme.fg > 0) {
    saved.darkModeActive = 1;
} else {
    saved.darkModeActive = 0;
}

saved = flipTheme(saved);
storage.writeJSON(SETTINGS_FILE, saved);
Bangle.drawWidgets();