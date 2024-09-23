const SETTINGS_FILE = "themeSwitch.json";
const storage = require("Storage");
var sunrise, sunset, date;
var SunCalc = require("suncalc"); // from modules folder
let settings = storage.readJSON('setting.json', 1);
let saved = storage.readJSON(SETTINGS_FILE, 1) || {};
if (settings.theme.fg > 0) {
    saved.darkModeActive = 1;
} else {
    saved.darkModeActive = 0;
}
let dmH, dmM, lmH, lmM;
if (require("Storage").readJSON("themeSwitch.json", 1) !== undefined) {
    dmH = parseInt(saved.darkModeAt.split(":")[0] | 0);
    dmM = parseInt(saved.darkModeAt.split(":")[1] | 0);
    lmH = parseInt(saved.lightModeAt.split(":")[0] | 0);
    lmM = parseInt(saved.lightModeAt.split(":")[1] | 0);
} else {
    dmH = 0;
    dmM = 0;
    lmH = 0;
    lmM = 0;
}
// Main menu

var mainmenu = {
    "": {
        "title": "Theme Switch"
    },
    "< Back": function () { load(); },
    "Automatic Dark Mode": {
        value: saved.darkMode | false,
        format: v => v ? "On" : "Off",
        min: 0, max: 1, step: 1,
        onchange: v => {
            saved.darkMode = v;
            storage.writeJSON(SETTINGS_FILE, saved);
        }
    },
    "Dark Mode Active": {
        value: saved.darkModeActive | false,
        format: v => v ? "On" : "Off",
        min: 0, max: 1, step: 1,
        onchange: v => {
            saved.darkModeActive = v;
            storage.writeJSON(SETTINGS_FILE, saved);
            if (v !== 0) {
                setDarkTheme();
                Bangle.drawWidgets();
            } else {
                setLightTheme();
                Bangle.drawWidgets();
            }
        }
    },
    "Dark Mode by Sun": {
        value: saved.darkModeBySun | false,
        format: v => v ? "On" : "Off",
        min: 0, max: 1, step: 1,
        onchange: v => {
            saved.darkModeBySun = v;
            if (v !== 0) {
                //print("calculating sun times");
                calculateSunTimes();
                saved.lightModeAt = sunrise;
                saved.darkModeAt = sunset;
                //print("sunrise" +sunrise);
                //print("sunset" +sunset);
            }
            storage.writeJSON(SETTINGS_FILE, saved);
        },
    },
    "light mode at": {
        value: saved.lightModeAt,
        format: v => saved.lightModeAt,
        onchange: function () {
            if (saved.darkModeBySun === 0) {
                E.showMenu(lightModeAtMenu);
            }
            else {
                E.showAlert("Deactivate dark mode first!", "Action Blocked").then(
                    function () { E.showMenu(mainmenu); });
            }
        }
    },
    "dark mode at": {
        value: saved.darkModeAt,
        format: v => saved.darkModeAt,
        onchange: function () {
            if (saved.darkModeBySun === 0) {
                E.showMenu(darkModeAtMenu);
            }
            else {
                E.showAlert("Deactivate dark mode first!", "Action Blocked").then(function () { E.showMenu(mainmenu); });
            }
        }
    },
    "Exit": function () { load(); },
};

var lightModeAtMenu = {
    "": {
        "title": "light mode at"
    },
    "Hour": {
        value: lmH,
        min: 0, max: 23, step: 1,
        onchange: v => { lmH = v; }
    },
    "Minute": {
        value: lmM,
        min: 0, max: 59, step: 1,
        onchange: v => { lmM = v; }
    },
    "< Back": function () {
        saved.lightModeAt = fixTime(lmH, lmM);
        storage.writeJSON(SETTINGS_FILE, saved);
        E.showMenu(mainmenu);
    },
};

var darkModeAtMenu = {
    "": {
        "title": "dark mode at"
    },
    "Hour": {
        value: dmH,
        min: 0, max: 23, step: 1,
        onchange: v => { dmH = v; }
    },
    "Minute": {
        value: dmM,
        min: 0, max: 59, step: 1,
        onchange: v => { dmM = v; }
    },
    "< Back": function () {
        saved.darkModeAt = fixTime(dmH, dmM);
        storage.writeJSON(SETTINGS_FILE, saved);
        E.showMenu(mainmenu);
    },
};

// Actually display the menu
E.showMenu(mainmenu);

// Function to fix time format
function fixTime(h, m) {
    if (h.toString().length < 2) {
        h = "0" + h.toString();
    }
    if (m.toString().length < 2) {
        m = "0" + m.toString();
    }
    return h.toString() + ":" + m.toString();
}

function calculateSunTimes() {
    var location = require("Storage").readJSON("mylocation.json", 1) || {};
    location.lat = location.lat || 51.5072;
    location.lon = location.lon || 0.1276; // London
    date = new Date(Date.now());
    var times = SunCalc.getTimes(date, location.lat, location.lon);
    sunrise = fixTime(times.sunrise.getHours(), times.sunrise.getMinutes());
    sunset = fixTime(times.sunset.getHours(), times.sunset.getMinutes());
    /* do we want to re-calculate this every day? Or we just assume
    that 'show' will get called once a day? */
}

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

function setDarkTheme() {
    if (!g.theme.dark) {
        upd({
            fg: cl("#fff"), bg: cl("#000"),
            fg2: cl("#fff"), bg2: cl("#004"),
            fgH: cl("#fff"), bgH: cl("#00f"),
            dark: true
        });
    }
}

function setLightTheme() {
    if (g.theme.dark) {
        upd({
            fg: cl("#000"), bg: cl("#fff"),
            fg2: cl("#000"), bg2: cl("#cff"),
            fgH: cl("#000"), bgH: cl("#0ff"),
            dark: false
        });
    }
}

// const SETTINGS_FILE = "themeSwitch.json";
// const storage = require("Storage");
// let settings = storage.readJSON('setting.json', 1);
// let saved = storage.readJSON(SETTINGS_FILE, 1) || {};

// function cl(x) { return g.setColor(x).getColor(); }

// function upd(th) {
//     g.theme = th;
//     settings.theme = th;
//     storage.write('setting.json', settings);
//     delete g.reset;
//     g._reset = g.reset;
//     g.reset = function (n) { return g._reset().setColor(th.fg).setBgColor(th.bg); };
//     g.clear = function (n) { if (n) g.reset(); return g.clearRect(0, 0, g.getWidth(), g.getHeight()); };
//     g.clear(1);
// }

// function flipTheme(saved) {
//     if (!g.theme.dark) {
//         upd({
//             fg: cl("#fff"), bg: cl("#000"),
//             fg2: cl("#fff"), bg2: cl("#004"),
//             fgH: cl("#fff"), bgH: cl("#00f"),
//             dark: true
//         });

//         saved.darkModeActive = 1;
//     } else {
//         upd({
//             fg: cl("#000"), bg: cl("#fff"),
//             fg2: cl("#000"), bg2: cl("#cff"),
//             fgH: cl("#000"), bgH: cl("#0ff"),
//             dark: false
//         });
//         saved.darkModeActive = 0;
//     }
//     return saved;
// }

// if (settings.theme.fg > 0) {
//     saved.darkModeActive = 1;
// } else {
//     saved.darkModeActive = 0;
// }

// saved = flipTheme(saved);
// storage.writeJSON(SETTINGS_FILE, saved);
// Bangle.drawWidgets();
// load();