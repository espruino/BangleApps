(function(back) {
    const PREFERENCE_FILE = "slidingtext.settings.json";
    const settings = Object.assign({},
        require('Storage').readJSON(PREFERENCE_FILE, true) || {});
    const bangleVersion = (g.getHeight()>200)? 1 : 2;
    // the screen controls are defaulted on for a bangle 1 and off for a bangle 2
    if(settings.enable_live_controls == null){
        settings.enable_live_controls = bangleVersion < 2;
    }
    console.log("loaded:" + JSON.stringify(settings));
    const locale_mappings = (bangleVersion > 1)? {
        'english' : { date_formatter: 'en' },
        'english alt': {
            date_formatter: 'en',
            row_types: {
                large:{
                    size: 'mlarge',
                    angle_to_horizontal: 90,
                    scroll_off: ['down'],
                    scroll_in: ['up'],
                    speed: 'vslow'
                },
                medium: {
                    size: 'msmall',
                    scroll_off: ['right'],
                    scroll_in: ['right'],
                },
                small: {
                    scroll_off: ['right'],
                    scroll_in: ['right'],
                }
            },
            row_defs: [
                {
                    type: 'large',
                    init_coords: [0.05,0.99],
                    row_direction: [1.0,0.0],
                    alignment: 'centre-6',
                    rows: 1
                },
                {
                    type: 'medium',
                    init_coords: [0.26,0.1],
                    row_direction: [0.0,1.0],
                    rows: 2
                },
                {
                    type: 'small',
                    init_coords: [0.26,0.65],
                    row_direction: [0.0,1.0],
                    rows: 3
                }
            ]
        },
        'english2': { date_formatter: 'en2' },
        'english2 alt': { date_formatter: 'en2',
            row_types: {
                vsmall: {
                    color: 'minor',
                    speed: 'superslow',
                    angle_to_horizontal: 0,
                    scroll_off: ['left'],
                    scroll_in: ['left'],
                    size: 'ssmall'
                },
                small: {
                    scroll_off: ['left'],
                    scroll_in: ['left']
                },
                large: {
                    size: 'mlarge',
                    angle_to_horizontal: 90,
                    color: 'major',
                    scroll_off: ['down'],
                    scroll_in: ['up']
                }
            },
            row_defs: [
                {
                    type: 'large',
                    init_coords: [0.8,0.99],
                    row_direction: [0.0,1.0],
                    alignment: 'centre-6',
                    rows: 1
                },
                {
                    type: 'small',
                    init_coords: [0.05,0.45],
                    row_direction: [0.0,1.0],
                    rows: 3
                },
                {
                    type: 'large',
                    init_coords: [0.8,0.99],
                    row_direction: [0.0,1.0],
                    alignment: 'centre-6',
                    rows: 1
                },
                {
                    type: 'vsmall',
                    init_coords: [0.05,0.1],
                    row_direction: [0.0,1.0],
                    rows: 2
                },
            ]
        },
        'french': { date_formatter:'fr'},
        'german': { date_formatter: 'de'},
        'german 24h': { date_formatter: 'de2'},
        'spanish': { date_formatter: 'es'},
        'japanese': { date_formatter: 'jp'},
        'hybrid': { date_formatter: 'hyb'},
        'digits': { date_formatter: 'dgt'},
    } : {
        'english' : { date_formatter: 'en' },
        'french': { date_formatter:'fr'},
        'german': { date_formatter: 'de'},
        'spanish': { date_formatter: 'es'},
        'japanese': { date_formatter: 'jp'},
        'hybrid': { date_formatter: 'hyb'},
        'digits': { date_formatter: 'dgt'},
    }

    const locales = Object.keys(locale_mappings);

    function writeSettings() {
        if(settings.date_format == null){
            settings.date_format = 'en';
        }
        const styling = locale_mappings[settings.date_format];
        if(styling.date_formatter != null)
            settings.date_formatter = styling.date_formatter;

        settings.row_types = {};
        if(styling.row_types != null)
            settings.row_types = styling.row_types;

        settings.row_defs = [];
        if(styling.row_defs != null)
            settings.row_defs = styling.row_defs;

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
                const write_value = (value_mapping == null)? values[v] : value_mapping(values[v]);
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
        "Colour": stringInSettings("color_scheme", ["black","white", "red","grey","purple","blue"]),
        "Style": stringInSettings("date_format", locales, (l)=>locale_mappings[l] ),
        "Live Control": {
            value: (settings.enable_live_controls !== undefined ? !!settings.enable_live_controls : true),
            onchange: v => {
                settings.enable_live_controls = v;
                writeSettings();
            }
        },
    });
})
