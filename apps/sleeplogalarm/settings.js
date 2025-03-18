(function(back) {
  // read settings
  let settings = require("sleeplogalarm").getSettings();

  // write change to storage
  function writeSetting() {
    require("Storage").writeJSON("sleeplogalarm.settings.json", settings);
  }

  // read input from keyboard
  function readInput(v, cb) {
    // setTimeout required to load after menu refresh
    setTimeout((v, cb) => {
      if (require("Storage").read("textinput")) {
        g.clear();
        require("textinput").input({text: v}).then(v => cb(v));
      } else {
        E.showAlert(/*LANG*/"No keyboard app installed").then(() => cb());
      }
    }, 0, v, cb);
  }

  // show widget menu
  function showFilterMenu() {
    // set menu
    let filterMenu = {
      "": {
        title: "Filter Alarm"
      },
      /*LANG*/"< Back": () => showMain(8),
      /*LANG*/"time from": {
        value: settings.filter.from / 6E4,
        step: 10,
        min: 0,
        max: 1440,
        wrap: true,
        noList: true,
        format: v => (0|v/60) + ":" + ("" + (v%60)).padStart(2, "0"),
        onchange: v => {
          settings.filter.from = v * 6E4;
          writeSetting();
        }
      },
      /*LANG*/"time to": {
        value: settings.filter.to / 6E4,
        step: 10,
        min: 0,
        max: 1440,
        wrap: true,
        noList: true,
        format: v => (0|v/60) + ":" + ("" + (v%60)).padStart(2, "0"),
        onchange: v => {
          settings.filter.to = v * 6E4;
          writeSetting();
        }
      },
      /*LANG*/"msg includes": {
        value: settings.filter.msg,
        format: v => !v ? "" : v.length > 6 ? v.substring(0, 6)+"..." : v,
        onchange: v => readInput(v, v => {
          settings.filter.msg = v;
          writeSetting();
          showFilterMenu(3);
        })
      }
    };
    E.showMenu(filterMenu);
  }

  // show widget menu
  function showWidMenu() {
    // define color values and names
    let colName = ["red", "yellow", "green", "cyan", "blue", "magenta", "black", "white"];
    let colVal = [63488, 65504, 2016, 2047, 31, 63519, 0, 65535];

    // set menu
    let widgetMenu = {
      "": {
        title: "Widget Settings"
      },
      /*LANG*/"< Back": () => showMain(9),
      /*LANG*/"hide always": {
        value: settings.wid.hide,
        onchange: v => {
          settings.wid.hide = v;
          writeSetting();
        }
      },
      /*LANG*/"show time": {
        value: settings.wid.time,
        onchange: v => {
          settings.wid.time = v;
          writeSetting();
        }
      },
      /*LANG*/"color": {
        value: colVal.indexOf(settings.wid.color),
        min: 0,
        max: colVal.length -1,
        wrap: true,
        format: v => colName[v],
        onchange: v => {
          settings.wid.color = colVal[v];
          writeSetting();
        }
      }
    };
    E.showMenu(widgetMenu);
  }

  // show main menu
  function showMain(selected) {
    // set menu
    let mainMenu = {
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
        onchange: v => readInput(v, v => {
          settings.msg = v;
          writeSetting();
          showMenu(4);
        })
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
    E.showMenu(mainMenu);
  }

  // draw main menu
  showMain();
})
