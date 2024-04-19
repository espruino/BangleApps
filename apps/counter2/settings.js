(function (back) {
    var FILE = "counter2.json";
    const defaults={
        counter0:12,
        counter1:0,
        max0:12,
        max1:0,
        buzz: true,
        colortext: true,
    };
    const settings = Object.assign(defaults, require('Storage').readJSON(FILE, true) || {});

    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
    }

    const menu = {
        "": { "title": "Counter2" },
        "< Back": () => back(),
        'Default C1': {
            value: settings[0],
            min: -99, max: 99,
            onchange: v => {
                settings.max0 = v;
                writeSettings();
            }
        },
        'Default C2': {
            value: settings[2],
            min: -99, max: 99,
            onchange: v => {
                settings.max1 = v;
                writeSettings();
            }
        },
        'Color': {
            value: settings.colortext,
            format: v => v?"Text":"Backg",            
            onchange: v => {
                settings.colortext = v;
                console.log("Color",v);
                writeSettings();
            }
        },
        'Vibrate': {
            value: settings.buzz,
            onchange: v => {
                settings.buzz = v;
                writeSettings();
            }
        }
    };
    // Show the menu
    E.showMenu(menu);
});
