(function (back) {
    var FILE = "devolov.json";
    const defaults={
        btnToStop: true,
    };
    const settings = Object.assign(defaults, require('Storage').readJSON(FILE, true) || {});

    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
    }

    const menu = {
        "": { "title": "devolov" },
        "< Back": () => back(),
        'BTN1 to Stop': {
            value: settings.btnToStop,
            onchange: v => {
                settings.btnToStop = v;
                writeSettings();
            }
        }
    };
    // Show the menu
    E.showMenu(menu);
})
