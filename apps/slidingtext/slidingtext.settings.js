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
        'en' : { date_format: 'en' },
        'en patchwork': {
            date_format: 'en patchwork',
            date_formatter: 'en',
            row_types: {
                large:{
                    angle_to_horizontal: 90
                }
            },
            row_defs: [
                {
                    type: 'large',
                    init_coords: [0.05,0.95],
                    row_direction: [1.0,0.0],
                    rows: 1
                },
                {
                    type: 'medium',
                    init_coords: [0.3,0.1],
                    row_direction: [0.0,1.0],
                    rows: 2
                },
                {
                    type: 'small',
                    init_coords: [0.3,0.9],
                    row_direction: [0.0,1.0],
                    rows: 1
                }
            ]
        },
        'en2': { date_format: 'en2' },
        'en2 patchwork': { date_format: 'en2 patchwork',
            date_formatter: 'en2',
            row_types: {
                vsmall: {
                    scroll_off: ['right'],
                    scroll_in: ['right'],
                    angle_to_horizontal: 0
                },
                large: {
                    size: 'vlarge',
                    angle_to_horizontal: 90,
                    speed: 'slow',
                    color: 'major',
                    scroll_off: ['down'],
                    scroll_in: ['up']
                }
            },
            row_defs: [
                {
                    type: 'large',
                    init_coords: [0.7,0.9],
                    row_direction: [0.0,1.0],
                    rows: 1
                },
                {
                    type: 'small',
                    init_coords: [0.05,0.35],
                    row_direction: [0.0,1.0],
                    rows: 3
                },
                {
                    type: 'large',
                    init_coords: [0.7,0.9],
                    row_direction: [0.0,1.0],
                    rows: 1
                },
                {
                    type: 'vsmall',
                    init_coords: [0.05,0.1],
                    row_direction: [0.0,1.0],
                    rows: 1
                },
            ]
        },
        'French': { date_format:'fr'},
        'German': { date_format: 'de'},
        'Spanish': { date_format: 'es'},
        'Japanese': { date_format: 'jp'},
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
        "Style": stringInSettings("date_format", locales, (l)=>locale_mappings[l] ),
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