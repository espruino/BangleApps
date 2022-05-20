(function(back) {
  // define settings filename
  var filename = "sleeplog.json";
  // define logging prompt display status
  var thresholdsPrompt = true;

  // define default vaules
  var defaults = {
    // main settings
    enabled: true, //   en-/disable completely
    // threshold settings
    maxAwake: 36E5, //  [ms] maximal awake time to count for consecutive sleep
    minConsec: 18E5, // [ms] minimal time to count for consecutive sleep
    deepTh: 100, //     threshold for deep sleep
    lightTh: 200, //    threshold for light sleep
    // app settings
    breakToD: 12, //    [h] time of day when to start/end graphs
    appTimeout: 0 //   lock and backlight timeouts for the app
  };

  // assign loaded settings to default values
  var settings = Object.assign(defaults, require("Storage").readJSON(filename, true) || {});

  // write change to storage
  function writeSetting() {
    require("Storage").writeJSON(filename, settings);
  }

  // show menu to change thresholds
  function showThresholds() {
    // setup logging menu
    var menu;
    var thresholdsMenu = {
      "": {
        title: /*LANG*/"Thresholds"
      },
      /*LANG*/"< Back": () => showMain(2),
      /*LANG*/"Max Awake": {
        value: settings.maxAwake / 6E4,
        step: 10,
        min: 10,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v + /*LANG*/"min",
        onchange: v => {
          settings.maxAwake = v * 6E4;
          writeSetting();
        }
      },
      /*LANG*/"Min Consecutive": {
        value: settings.minConsec / 6E4,
        step: 10,
        min: 10,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v + /*LANG*/"min",
        onchange: v => {
          settings.minConsec = v * 6E4;
          writeSetting();
        }
      },
      /*LANG*/"Deep Sleep": {
        value: settings.deepTh,
        step: 1,
        min: 30,
        max: 200,
        wrap: true,
        noList: true,
        onchange: v => {
          settings.deepTh = v;
          writeSetting();
        }
      },
      /*LANG*/"Light Sleep": {
        value: settings.lightTh,
        step: 10,
        min: 100,
        max: 400,
        wrap: true,
        noList: true,
        onchange: v => {
          settings.lightTh = v;
          writeSetting();
        }
      },
      /*LANG*/"Reset to Default": () => {
        settings.maxAwake = defaults.maxAwake;
        settings.minConsec = defaults.minConsec;
        settings.deepTh = defaults.deepTh;
        settings.lightTh = defaults.lightTh;
        writeSetting();
        showThresholds();
      }
    };

    // display info/warning prompt or menu
    if (thresholdsPrompt) {
      thresholdsPrompt = false;
      E.showPrompt("Changes take affect from now on, not retrospective", {
        title: /*LANG*/"Thresholds",
        buttons: {
          /*LANG*/"Ok": 0
        }
      }).then(() => menu = E.showMenu(thresholdsMenu));
    } else {
      menu = E.showMenu(thresholdsMenu);
    }
  }

  // show menu or promt to change debugging
  function showDebug() {
    // check if sleeplog is available
    if (global.sleeplog) {
      // get debug status, file and duration
      var enabled = !!sleeplog.debug;
      var file = typeof sleeplog.debug === "object";
      var duration = 0;
      // setup debugging menu
      var debugMenu = {
        "": {
          title: /*LANG*/"Debugging"
        },
        /*LANG*/"< Back": () => {
          // check if some value has changed
          if (enabled !== !!sleeplog.debug || file !== (typeof sleeplog.debug === "object") || duration)
            require("sleeplog").setDebug(enabled, file ? duration || 12 : undefined);
          // redraw main menu
          showMain(7);
        },
        /*LANG*/"Display log": () => {
          // choose log...
          E.showPrompt( /*LANG*/"Function\nunder\nconstruction.", {
            title: /*LANG*/"Debug log",
            buttons: {
              /*LANG*/"Back": 0
            }
          }).then(() => menu = E.showMenu(debugMenu));
        },
        /*LANG*/"Debug": {
          value: enabled,
          onchange: v => enabled = v
        },
        /*LANG*/"File": {
          value: file,
          onchange: v => file = v
        },
        /*LANG*/"Duration": {
          value: file ? (sleeplog.debug.writeUntil - Date.now()) / 36E5 | 0 : 12,
          min: 1,
          max: 96,
          wrap: true,
          format: v => v + /*LANG*/ "h",
          onchange: v => duration = v
        },
        /*LANG*/"Cancel": () => showMain(7),
      };
      // show menu
      var menu = E.showMenu(debugMenu);
    } else {
      // show error prompt
      E.showPrompt("Sleeplog" + /*LANG*/"not enabled!", {
        title: /*LANG*/"Debugging",
        buttons: {
          /*LANG*/"Back": 7
        }
      }).then(showMain);
    }
  }

  // show main menu
  function showMain(selected) {
    // set debug image
    var debugImg = !global.sleeplog ?
      "FBSBAOAAfwAP+AH3wD4+B8Hw+A+fAH/gA/wAH4AB+AA/wAf+APnwHw+D4Hx8A++AH/AA/gAH" : // X
      typeof sleeplog.debug === "object" ?
      "FBSBAB/4AQDAF+4BfvAX74F+CBf+gX/oFJKBf+gUkoF/6BSSgX/oFJ6Bf+gX/oF/6BAAgf/4" : // file
      sleeplog.debug ?
      "FBSBAP//+f/V///4AAGAABkAAZgAGcABjgAYcAGDgBhwAY4AGcABmH+ZB/mAABgAAYAAH///" : // console
      0; // off
    debugImg = debugImg ? "\0" + atob(debugImg) : false;
    // set menu
    var mainMenu = {
      "": {
        title: "Sleep Log",
        selected: selected
      },
      /*LANG*/"< Back": () => back(),
      /*LANG*/"Thresholds": () => showThresholds(),
      /*LANG*/"Break ToD": {
        value: settings.breakToD,
        step: 1,
        min: 0,
        max: 23,
        wrap: true,
        noList: true,
        format: v => v + ":00",
        onchange: v => {
          settings.breakToD = v;
          writeSetting();
        }
      },
      /*LANG*/"App Timeout": {
        value: settings.appTimeout / 1E3,
        step: 10,
        min: 0,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v ? v + "s" : "-",
        onchange: v => {
          settings.appTimeout = v * 1E3;
          writeSetting();
        }
      },
      /*LANG*/"Enabled": {
        value: settings.enabled,
        onchange: v => {
          settings.enabled = v;
          require("sleeplog").setEnabled(v);
        }
      },
      /*LANG*/"Debugging": {
        value: debugImg,
        onchange: () => setTimeout(showDebug, 10)
      }
    };
    var menu = E.showMenu(mainMenu);
  }

  // draw main menu
  showMain();
})
