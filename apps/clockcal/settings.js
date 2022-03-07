(function (back) {
    var FILE = "clockcal.json";

    settings = Object.assign({
        CAL_ROWS: 4, //number of calendar rows.(weeks) Shouldn't exceed 5 when using widgets.
        BUZZ_ON_BT: true, //2x slow buzz on disconnect, 2x fast buzz on connect. Will be extra widget eventually
        MODE24: true, //24h mode vs 12h mode
        FIRSTDAY: 6, //First day of the week: mo, tu, we, th, fr, sa, su
        REDSUN: true, // Use red color for sunday?
        REDSAT: true, // Use red color for saturday?
    }, require('Storage').readJSON(FILE, true) || {});


    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
    }

    menu = {
        "": { "title": "Clock & Calendar" },
        "< Back": () => back(),
        'Buzz(dis)conn.?': {
            value: settings.BUZZ_ON_BT,
            format: v => v ? "On" : "Off",
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
            format: v => v ? "On" : "Off",
            onchange: v => {
                settings.REDSAT = v;
                writeSettings();
            }
        },
        'Red Sunday?': {
            value: settings.REDSUN,
            format: v => v ? "On" : "Off",
            onchange: v => {
                settings.REDSUN = v;
                writeSettings();
            }
        },
        'Load deafauls?': {
            value: 0,
            min: 0, max: 1,
            format: v => ["No", "Yes"][v],
            onchange: v => {
                if (v == 1) {
                    settings = {
                        CAL_ROWS: 4, //number of calendar rows.(weeks) Shouldn't exceed 5 when using widgets.
                        BUZZ_ON_BT: true, //2x slow buzz on disconnect, 2x fast buzz on connect. 
                        MODE24: true, //24h mode vs 12h mode
                        FIRSTDAY: 6, //First day of the week: mo, tu, we, th, fr, sa, su
                        REDSUN: true, // Use red color for sunday?
                        REDSAT: true, // Use red color for saturday?
                    };
                    writeSettings();
                    load()
                }
            }
        },
    }
    // Show the menu
    E.showMenu(menu);
})
