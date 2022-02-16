(function(back) {
  var filename = "sleeplog.json";

  // set storage and load settings
  var storage = require("Storage");
  var settings = Object.assign({
    breaktod: 10, // time of day when to start/end graphs
    maxawake: 36E5, // 60min in ms
    minconsec: 18E5, // 30min in ms
    tempthresh: 27, // every temperature above ist registered as worn
    powersaving: false, // disables ESS and uses build in movement detection
    maxmove: 100, // movement threshold on power saving mode
    nomothresh: 0.012, // values lower than 0.008 getting triggert by noise
    sleepthresh: 577, // 577 times no movement * 1.04s window width > 10min
    winwidth: 13, // 13 values, read with 12.5Hz = every 1.04s
    enabled: true, // en-/disable completely
    logfile: "sleeplog.log", // logfile
  }, storage.readJSON(filename, true) || {});

  // write change to global.sleeplog and storage
  function writeSetting(key, value) {
    // change key in global.sleeplog
    if (typeof global.sleeplog === "object") global.sleeplog[key] = value;
    // reread settings to only change key
    settings = Object.assign(settings, storage.readJSON(filename, true) || {});
    // change the value of key
    settings[key] = value;
    // write to storage
    storage.writeJSON(filename, settings);
  }

  // define function to change values that need a restart of the service
  function changeRestart() {
    require("sleeplog").setEnabled(settings.enabled, settings.logfile, settings.powersaving);
  }

  // calculate sleepthresh factor
  var stFactor = settings.winwidth / 12.5 / 60;

  // show main menu
  function showMain(selected) {
    var mainMenu = {
      "": {
        title: "Sleep Log",
        selected: selected
      },
      "Exit": () => load(),
      "< Back": () => back(),
      "Break Tod": {
        value: settings.breaktod,
        step: 1,
        min: 0,
        max: 23,
        wrap: true,
        onchange: v => writeSetting("breaktod", v),
      },
      "Max Awake": {
        value: settings.maxawake / 6E4,
        step: 5,
        min: 15,
        max: 120,
        wrap: true,
        format: v => v + "min",
        onchange: v => writeSetting("maxawake", v * 6E4),
      },
      "Min Consec": {
        value: settings.minconsec / 6E4,
        step: 5,
        min: 15,
        max: 120,
        wrap: true,
        format: v => v + "min",
        onchange: v => writeSetting("minconsec", v * 6E4),
      },
      "Temp Thresh": {
        value: settings.tempthresh,
        step: 0.5,
        min: 20,
        max: 40,
        wrap: true,
        format: v => v + "°C",
        onchange: v => writeSetting("tempthresh", v),
      },
      "Power Saving": {
        value: settings.powersaving,
        format: v => v ? "on" : "off",
        onchange: function(v) {
          settings.powersaving = v;
          changeRestart();
          // redraw menu with changed entries subsequent to onchange
          // https://github.com/espruino/Espruino/issues/2149
          setTimeout(showMain, 1, 6);
        }
      },
      "Max Move": {
        value: settings.maxmove,
        step: 1,
        min: 50,
        max: 200,
        wrap: true,
        onchange: v => writeSetting("maxmove", v),
      },
      "NoMo Thresh": {
        value: settings.nomothresh,
        step: 0.001,
        min: 0.006,
        max: 0.02,
        wrap: true,
        format: v => ("" + v).padEnd(5, "0"),
        onchange: v => writeSetting("nomothresh", v),
      },
      "Min Duration": {
        value: Math.floor(settings.sleepthresh * stFactor),
        step: 1,
        min: 5,
        max: 15,
        wrap: true,
        format: v => v + "min",
        onchange: v => writeSetting("sleepthresh", Math.ceil(v / stFactor)),
      },
      "Enabled": {
        value: settings.enabled,
        format: v => v ? "on" : "off",
        onchange: function(v) {
          settings.enabled = v;
          changeRestart();
        }
      },
      "Logfile ": {
        value: settings.logfile === "sleeplog.log" ? true : (settings.logfile || "").endsWith(".log") ? "custom" : false,
        format: v => v === true ? "default" : v ? "custom" : "off",
        onchange: function(v) {
          if (v !== "custom") {
            settings.logfile = v ? "sleeplog.log" : false;
            changeRestart();
          }
        }
      }
    };
    // check power saving mode to delete unused entries
    (settings.powersaving ? ["NoMo Thresh", "Min Duration"] : ["Max Move"]).forEach(property => delete mainMenu[property]);
    var menu = E.showMenu(mainMenu);
  }

  // draw main menu
  showMain();
})
