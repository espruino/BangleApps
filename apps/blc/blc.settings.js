// Change settings for BinaryClk

(function(back){
    
    // color array -- don't change order unless change oder in BinaryClk.js     
    let LED_ColorNames = ["white", "red", "green", "blue", "yellow", "magenta", "cyan", "black"];   

    var FILE = "BinaryClk.settings.json";
    // Load settings
    var settings = Object.assign({
        HourCol: "red",
        MinCol: "green",
        DayCol: "yellow",
        MonCol: "yellow",
        RingOn: true,
    }, require('Storage').readJSON(FILE, true) || {});

    function writeSettings(){
        require('Storage').writeJSON(FILE, settings);
    }

    // Helper method which uses int-based menu item for set of string values
    function stringItems(startvalue, writer, values) {
        return{
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
    var mainmenu = {
        "" : {
             "title" : "BinaryCLK"
        },
        "< Back" : () => back(),
        'Color Hour.:': stringInSettings("HourCol", LED_ColorNames),
        'Color Minute:': stringInSettings("MinCol", LED_ColorNames),
        'Color Day': stringInSettings("DayCol", LED_ColorNames),
        'Color Month:': stringInSettings("MonCol", LED_ColorNames),
        'LED ring on/off':  {
            value: (settings.RingOn !== undefined ? settings.RingOn : true),
            onchange: v => {
                settings.RingOn = v;
                writeSettings();
            }
        },
    };
    
    // Show submenues
    //var submenu1 = {
    //"": {
    //  "title": "Show sub1..."
    //},
    //"< Back": () => E.showMenu(mainmenu),
    //"ItemName": stringInSettings("settingsVar", ["Yes", "No", "DontCare"]),
    //};
    
    E.showMenu(mainmenu);
})
