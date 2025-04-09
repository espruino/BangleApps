(function (back) {
    var FILE = "counter2.json";
    const defaults={
        display2:true,
        counter0:40,
        counter1:0,
        max0:40,
        max1:0,
        buzz: true,
        colortext: true,
    };
    const settings = Object.assign(defaults, require('Storage').readJSON(FILE, true) || {});

    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
    }

    function showMainMenu() {
        let appMenu = {
            "": { "title": "Counter2" },
            "< Back": () => back(),
            'Display Two Counters': {
                value: settings.display2,
                onchange: v => {
                    settings.display2 = v;
                    writeSettings();
                    // redisplay the menu with/without C2 setting
                    setTimeout(showMainMenu, 0);
                }
            },
            'Default C1': {
                value: settings.max0,
                min: -99, max: 99,
                onchange: v => {
                    settings.max0 = v;
                    writeSettings();
                }
            },
        };
        if (settings.display2) {
            appMenu['Default C2'] = {
                value: settings.max1,
                min: -99, max: 99,
                onchange: v => {
                    settings.max1 = v;
                    writeSettings();
                }
            };
        }
        appMenu['Color'] = {
            value: settings.colortext,
            format: v => v?"Text":"Backg",            
            onchange: v => {
                settings.colortext = v;
                console.log("Color",v);
                writeSettings();
            }
        };
        appMenu['Vibrate'] = {
            value: settings.buzz,
            onchange: v => {
                settings.buzz = v;
                writeSettings();
        },
      };
      E.showMenu(appMenu);
    }
  
    showMainMenu();
  })