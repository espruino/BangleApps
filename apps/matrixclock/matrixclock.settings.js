(function(back) {
    const PREFERENCE_FILE = "matrixclock.settings.json";
    var settings = Object.assign({color : "theme"},
        require('Storage').readJSON(PREFERENCE_FILE, true) || {});

    console.log("loaded:" + JSON.stringify(settings));

    function writeSettings() {
        console.log("saving:" + JSON.stringify(settings));
        require('Storage').writeJSON(PREFERENCE_FILE, settings);
    }

    // Helper method which uses int-based menu item for set of string values
    function stringItems(startvalue, writer, values) {
        return {
            value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
            format: v => values[v],
            min: 0,
            max: values.length - 1,
            wrap: true,
            step: 1,
            onchange: v => {
                writer(values[v]);
                writeSettings();
            }
        };
    }

    // Helper method which breaks string set settings down to local settings object
    function stringInSettings(name, values) {
        return stringItems(settings[name], v => settings[name] = v, values);
    }

    // Show the menu
    E.showMenu({
        "" : { "title" : "Matrix Clock" },
        "< Back" : () => back(),
        "Colour": stringInSettings("color", ["theme", "black", "purple", "red", "white"])
    });
})