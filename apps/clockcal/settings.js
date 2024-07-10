(function (back) {
    var FILE = "clockcal.json";
    const defaults={
        CAL_ROWS: 4, //number of calendar rows.(weeks) Shouldn't exceed 5 when using widgets.
        BUZZ_ON_BT: true, //2x slow buzz on disconnect, 2x fast buzz on connect. Will be extra widget eventually
        MODE24: true, //24h mode vs 12h mode
        FIRSTDAY: 6, //First day of the week: mo, tu, we, th, fr, sa, su
        REDSUN: true, // Use red color for sunday?
        REDSAT: true, // Use red color for saturday?
        DRAGDOWN: "[AI:messg]",
        DRAGRIGHT: "[AI:music]",
        DRAGLEFT: "[AI:agenda]",
        DRAGUP: "[calend.]"
    };
    let settings = Object.assign(defaults, require('Storage').readJSON(FILE, true) || {});

    let actions = ["[ignore]","[calend.]","[AI:music]","[AI:messg]","[AI:agenda]"];
    require("Storage").list(RegExp(".app.js")).forEach(element => actions.push(element.replace(".app.js","")));

    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
    }

    const menu = {
        "": { "title": "Clock & Calendar" },
        "< Back": () => back(),
        'Buzz(dis)conn.?': {
            value: settings.BUZZ_ON_BT,
            onchange: v => {
                settings.BUZZ_ON_BT = v;
                writeSettings();
            }
        },
        '#Calendar Rows': {
            value: settings.CAL_ROWS,
            min: 0, max: 6,
            onchange: v => {
                settings.CAL_ROWS = v;
                writeSettings();
            }
        },
        'Clock mode': {
            value: settings.MODE24,
            format: v => v ? "24h" : "12h",
            onchange: v => {
                settings.MODE24 = v;
                writeSettings();
            }
        },
        'First Day': {
            value: settings.FIRSTDAY,
            min: 0, max: 6,
            format: v => ["Sun", "Sat", "Fri", "Thu", "Wed", "Tue", "Mon"][v],
            onchange: v => {
                settings.FIRSTDAY = v;
                writeSettings();
            }
        },
        'Red Saturday?': {
            value: settings.REDSAT,
            onchange: v => {
                settings.REDSAT = v;
                writeSettings();
            }
        },
        'Red Sunday?': {
            value: settings.REDSUN,
            onchange: v => {
                settings.REDSUN = v;
                writeSettings();
            }
        },
        'Drag Up ': {
            min:0, max:actions.length-1,
            value: actions.indexOf(settings.DRAGUP),
            format: v => actions[v],
            onchange: v => {
                settings.DRAGUP = actions[v];
                writeSettings();
            }
        },
        'Drag Right': {
            min:0, max:actions.length-1,
            value: actions.indexOf(settings.DRAGRIGHT),
            format: v => actions[v],
            onchange: v => {
                settings.DRAGRIGHT = actions[v];
                writeSettings();
            }
        },
        'Drag Down': {
            min:0, max:actions.length-1,
            value: actions.indexOf(settings.DRAGDOWN),
            format: v => actions[v],
            onchange: v => {
                settings.DRAGDOWN = actions[v];
                writeSettings();
            }
        },
        'Drag Left': {
            min:0, max:actions.length-1,
            value: actions.indexOf(settings.DRAGLEFT),
            format: v => actions[v],
            onchange: v => {
                settings.DRAGLEFT = actions[v];
                writeSettings();
            }
        },
        'Load defaults': () => {
            settings = defaults;
            writeSettings();
            load();
        }
    };
    // Show the menu
    E.showMenu(menu);
});
