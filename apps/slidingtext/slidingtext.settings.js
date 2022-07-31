(function(back) {
    const PREFERENCE_FILE = "slidingtext.settings.json";
    var settings = Object.assign({},
        require('Storage').readJSON(PREFERENCE_FILE, true) || {});
    // the screen controls are defaulted on for a bangle 1 and off for a bangle 2
    if(settings.enable_live_controls == null){
        settings.enable_live_controls = (g.getHeight()> 200);
    }
    console.log("loaded:" + JSON.stringify(settings));
    var locale_mappings = {
        'English Time':'en',
        'English Date + Time': 'en3',
        'English Time (Trad)': 'en2',
        'French': 'fr',
        'German': 'de',
        'Spanish': 'es',
        'Japanese': 'jp',
    }
    var locales = Object.keys(locale_mappings);

    function writeSettings() {
        console.log("saving:" + JSON.stringify(settings));
        require('Storage').writeJSON(PREFERENCE_FILE, settings);
    }

    // Helper method which uses int-based menu item for set of string values
    function stringItems(startvalue, writer, values, value_mapping) {
        return {
            value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
            format: v => values[v],
            min: 0,
            max: values.length - 1,
            wrap: true,
            step: 1,
            onchange: v => {
                var write_value = (value_mapping == null)? values[v] : value_mapping(values[v]);
                writer(write_value);
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
        "Languages": stringInSettings("date_format", locales, (l)=>locale_mappings[l] ),
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