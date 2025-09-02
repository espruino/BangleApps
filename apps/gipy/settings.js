(function(back) {
    var FILE = "gipy.json";
    // Load settings
    var settings = Object.assign({
            lost_distance: 50,
            wake_up_speed: 13,
            active_time: 10,
            buzz_on_turns: false,
            disable_bluetooth: false,
            brightness: 0.5,
            power_lcd_off: false,
            powersave_by_default: false,
            sleep_between_waypoints: false,
            keep_gps_alive: true
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
        "wake-up speed": {
            value: settings.wake_up_speed,
            min: 0,
            max: 30,
            onchange: (v) => {
                settings.wake_up_speed = v;
                writeSettings();
            },
        },
        "active time": {
            value: settings.active_time,
            min: 5,
            max: 60,
            onchange: (v) => {
                settings.active_time = v;
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
        "powersave by default": {
            value: settings.powersave_by_default == true,
            onchange: (v) => {
                settings.powersave_by_default = v;
                writeSettings();
            }
        },
        "sleep between waypoints": {
            value: settings.sleep_between_waypoints == true,
            onchange: (v) => {
                settings.sleep_between_waypoints = v;
                writeSettings();
            }
        },
        "keep gps alive": {
          value: !!settings.keep_gps_alive, // !! converts undefined to false
          onchange: (v) => {
            settings.keep_gps_alive = v;
            writeSettings();
          },
        },
    });
})
