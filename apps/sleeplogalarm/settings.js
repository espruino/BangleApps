(function(back) {
  // read settings
  var settings = require("sleeplogalarm").getSettings();

  // write change to storage
  function writeSetting() {
    require("Storage").writeJSON("sleeplogalarm.settings.json", settings);
  }

  // read input from keyboard
  function readInput(setting, retPos, cb) {
    setTimeout((setting, retPos, cb) => {
      if (require("Storage").read("textinput")) {
        g.clear();
        require("textinput").input({text: settings[setting]}).then(result => {
          settings[setting] = result;
          writeSetting();
          cb(retPos);
        });
      } else {
        E.showAlert(/*LANG*/"No keyboard app installed").then(() => cb(retPos));
      }
    }, 0, setting, retPos, cb);
  }

  // show widget menu
  function showFilterMenu() {
    // set menu
    var filterMenu = {
      "": {
        title: "Filter Alarm"
      },
      /*LANG*/"< Back": () => showMain(8),
      /*LANG*/"time from": {
        value: settings.filter_from,
        step: 0.25,
        min: 0,
        max: 24,
        wrap: true,
        noList: true,
        format: v => (0|v) + ":" + ("" + (0|(v%1 * 60))).padStart(2, "0"),
        onchange: v => {
          settings.filter_from = v;
          writeSetting();
        }
      },
      /*LANG*/"time to": {
        value: settings.filter_to,
        step: 0.25,
        min: 0,
        max: 24,
        wrap: true,
        noList: true,
        format: v => (0|v) + ":" + ("" + (0|(v%1 * 60))).padStart(2, "0"),
        onchange: v => {
          settings.filter_to = v;
          writeSetting();
        }
      },
      /*LANG*/"msg includes": {
        value: settings.filter_msg,
        format: v => !v ? "" : v.length > 6 ? v.substring(0, 6)+"..." : v,
        // setTimeout required to load after menu refresh
        onchange: () => readInput("filter_msg", 3, showFilterMenu)
      }
    };
    var menu = E.showMenu(filterMenu);
  }

  // show widget menu
  function showWidMenu() {
    // define color values and names
    var colName = ["red", "yellow", "green", "cyan", "blue", "magenta", "black", "white"];
    var colVal = [63488, 65504, 2016, 2047, 31, 63519, 0, 65535];

    // set menu
    var widgetMenu = {
      "": {
        title: "Widget Settings"
      },
      /*LANG*/"< Back": () => showMain(9),
      /*LANG*/"hide": {
        value: settings.wid_hide,
        onchange: v => {
          settings.wid_hide = v;
          writeSetting();
        }
      },
      /*LANG*/"show time": {
        value: settings.wid_time,
        onchange: v => {
          settings.wid_time = v;
          writeSetting();
        }
      },
      /*LANG*/"color": {
        value: colVal.indexOf(settings.wid_color),
        min: 0,
        max: colVal.length -1,
        wrap: true,
        format: v => colName[v],
        onchange: v => {
          settings.wid_color = colVal[v];
          writeSetting();
        }
      }
    };
    var menu = E.showMenu(widgetMenu);
  }

  // show main menu
  function showMain(selected) {
    // set menu
    var mainMenu = {
      "": {
        title: "Sleep Log Alarm",
        selected: selected
      },
      /*LANG*/"< Back": () => back(),
      /*LANG*/"erlier": {
        value: settings.earlier,
        step: 10,
        min: 10,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v + /*LANG*/"min",
        onchange: v => {
          settings.earlier = v;
          writeSetting();
        }
      },
      /*LANG*/"from Consec.": {
        value: settings.fromConsec,
        onchange: v => {
          settings.fromConsec = v;
          writeSetting();
        }
      },
      /*LANG*/"vib pattern": require("buzz_menu").pattern(
        settings.vibrate,
        v => {
          settings.vibrate = v;
          writeSetting();
        }
      ),
      /*LANG*/"msg": {
        value: settings.msg,
        format: v => !v ? "" : v.length > 6 ? v.substring(0, 6)+"..." : v,
        // setTimeout required to load after menu refresh
        onchange: () => readInput("msg", 4, showMain)
      },
      /*LANG*/"msg as prefix": {
        value: settings.msgAsPrefix,
        onchange: v => {
          settings.msgAsPrefix = v;
          writeSetting();
        }
      },
      /*LANG*/"disable alarm": {
        value: settings.disableOnAlarm,
        onchange: v => {
          settings.disableOnAlarm = v;
          writeSetting();
        }
      },
      /*LANG*/"auto snooze": {
        value: settings.as,
        onchange: v => {
          settings.as = v;
          writeSetting();
        }
      },
      /*LANG*/"Filter Alarm": () => showFilterMenu(),
      /*LANG*/"Widget": () => showWidMenu(),
      /*LANG*/"Enabled": {
        value: settings.enabled,
        onchange: v => {
          settings.enabled = v;
          writeSetting();
        }
      }
    };
    var menu = E.showMenu(mainMenu);
  }

  // draw main menu
  showMain();
})
