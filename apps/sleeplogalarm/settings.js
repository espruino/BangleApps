(function(back) {
  // define settings filename
  var filename = "sleeplogalarm.settings.json";

  // define settings
  var settings = Object.assign({
    enabled: true,
    hide: false,
    drawRange: true,
    color: g.theme.dark ? 65504 : 31, // yellow or blue
    from: 4, // 0400
    to: 8, // 0800
    earlier: 30,
    disableOnAlarm: false, // !!! not available if alarm is at the next day
    msg: "...\n",
    msgAsPrefix: true,
    vibrate: "..",
    as: true
  }, require("Storage").readJSON(filename, true) || {});

  // write change to storage
  function writeSetting() {
    require("Storage").writeJSON(filename, settings);
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
      /*LANG*/"< Back": () => showMain(7),
      /*LANG*/"hide": {
        value: settings.hide,
        onchange: v => {
          settings.hide = v;
          writeSetting();
        }
      },
      /*LANG*/"time range": {
        value: settings.drawRange,
        onchange: v => {
          settings.drawRange = v;
          writeSetting();
        }
      },
      /*LANG*/"color": {
        value: colVal.indexOf(settings.color),
        min: 0,
        max: colVal.length -1,
        wrap: true,
        format: v => colName[v],
        onchange: v => {
          settings.color = colVal[v];
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
      /*LANG*/"time from": {
        value: settings.from,
        min: 0,
        max: 23,
        wrap: true,
        noList: true,
        format: v => v + ":00",
        onchange: v => {
          settings.from = v;
          writeSetting();
        }
      },
      /*LANG*/"time to": {
        value: settings.to,
        min: 1,
        max: 24,
        wrap: true,
        noList: true,
        format: v => v + ":00",
        onchange: v => {
          settings.to = v;
          writeSetting();
        }
      },
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
      /*LANG*/"disable alarm": {
        value: settings.disableOnAlarm,
        onchange: v => {
          settings.disableOnAlarm = v;
          writeSetting();
        }
      },
      /*LANG*/"msg": {
        value: settings.msg,
        format: v => !v ? "" : v.length > 6 ? v.substring(0, 6)+"..." : v,
        // setTimeout required to load after menu refresh
        onchange: () => setTimeout((msg, cb) => {
          if (require("Storage").read("textinput")) {
            g.clear();
            require("textinput").input({text: msg}).then(result => {
              settings.msg = result;
              writeSetting();
              cb(7);
            });
          } else {
            E.showAlert(/*LANG*/"No keyboard app installed").then(() => cb(7));
          }
        }, 0, settings.msg, showMain),
      },
      /*LANG*/"msg as prefix": {
        value: settings.msgAsPrefix,
        onchange: v => {
          settings.msgAsPrefix = v;
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
      /*LANG*/"auto snooze": {
        value: settings.as,
        onchange: v => {
          settings.as = v;
          writeSetting();
        }
      },
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
