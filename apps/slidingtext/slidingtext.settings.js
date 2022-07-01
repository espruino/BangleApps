(function(back) {
    const PREFERENCE_FILE = "slidingtext.settings.json";
    var settings = Object.assign({},
        require('Storage').readJSON(PREFERENCE_FILE, true) || {});
    // the screen controls are defaulted on for a bangle 1 and off for a bangle 2
    if(settings.enable_live_controls == null){
        settings.enable_live_controls = (g.getHeight()> 200);
    }
    console.log("loaded:" + JSON.stringify(settings));

    const LANGUAGES_FILE = "slidingtext.languages.json";
    const LANGUAGES_DEFAULT = ["en","en2"];
    var locales = null;
    try {
        locales = require("Storage").readJSON(LANGUAGES_FILE);
    } catch(e) {
        console.log("failed to load languages:" + e);
    }
    if(locales == null || locales.length == 0){
        locales = LANGUAGES_DEFAULT;
        console.log("defaulting languages to locale:" + locales);
    }

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
        "" : { "title" : "Sliding Text" },
        "< Back" : () => back(),
        "Colour": stringInSettings("color_scheme", ["white", "black", "red","grey","purple","blue"]),
        "Languages": stringInSettings("date_format", locales),
        "Live Control": {
            value: (settings.enable_live_controls !== undefined ? settings.enable_live_controls : true),
            format: v => v ? "On" : "Off",
            onchange: v => {
                settings.enable_live_controls = v;
                writeSettings();
            }
        },
    });
})