(function (back) {
    var FILE = "twenties.json";

    // Load settings
    var settings = Object.assign({
        move: 20 * 60 * 1000,
        look: 20 * 1000,
        startDay: 1,
        endDay: 5,
        startHour: 8,
        endHour: 17
    }, require('Storage').readJSON(FILE, true) || {});

    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
        if (WIDGETS["twenties"]) WIDGETS["twenties"].reload();
    }

    // Show the menu
    E.showMenu({
        "": { "title": "Twenties' Settings" },
        "< Back": () => back(),
        'Move Interval (min)': {
            value: settings.move / (60 * 1000),
            min: 1, max: 60,
            onchange: v => {
                settings.move = v * 60 * 1000;
                writeSettings();
            }
        },
        'Look Duration (sec)': {
            value: settings.look / 1000,
            min: 1, max: 60,
            onchange: v => {
                settings.look = v * 1000;
                writeSettings();
            }
        },
        'Start Day (0-6, Sun=0)': {
            value: settings.startDay,
            min: 0, max: 6,
            onchange: v => {
                settings.startDay = v;
                writeSettings();
            }
        },
        'End Day (0-6, Sun=0)': {
            value: settings.endDay,
            min: 0, max: 6,
            onchange: v => {
                settings.endDay = v;
                writeSettings();
            }
        },
        'Start Hour (0-23)': {
            value: settings.startHour,
            min: 0, max: 23,
            onchange: v => {
                settings.startHour = v;
                writeSettings();
            }
        },
        'End Hour (0-23)': {
            value: settings.endHour,
            min: 0, max: 23,
            onchange: v => {
                settings.endHour = v;
                writeSettings();
            }
        }
    });
})();
