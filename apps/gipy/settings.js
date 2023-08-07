(function(back) {
    var FILE = "gipy.json";
    // Load settings
    var settings = Object.assign({
            lost_distance: 50,
            buzz_on_turns: false,
            disable_bluetooth: true,
            brightness: 0.5,
            power_lcd_off: false,
        },
        require("Storage").readJSON(FILE, true) || {}
    );

    function writeSettings() {
        require("Storage").writeJSON(FILE, settings);
    }

    // Show the menu
    E.showMenu({
        "": {
            title: "Gipy"
        },
        "< Back": () => back(),
        /*LANG*/"buzz on turns": {
            value: settings.buzz_on_turns == true,
            onchange: (v) => {
                settings.buzz_on_turns = v;
                writeSettings();
            }
        },
        /*LANG*/"disable bluetooth": {
            value: settings.disable_bluetooth == true,
            onchange: (v) => {
                settings.disable_bluetooth = v;
                writeSettings();
            }
        },
        "lost distance": {
            value: settings.lost_distance,
            min: 10,
            max: 500,
            onchange: (v) => {
                settings.lost_distance = v;
                writeSettings();
            },
        },
        "brightness": {
            value: settings.brightness,
            min: 0,
            max: 1,
            step: 0.1,
            onchange: (v) => {
                settings.brightness = v;
                writeSettings();
            },
        },

        /*LANG*/"power lcd off": {
            value: settings.power_lcd_off == true,
            onchange: (v) => {
                settings.power_lcd_off = v;
                writeSettings();
            }
        },
    });
});
