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
    maxmove: 44, // movement threshold on power saving mode
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

  // define circulate function
  function circulate(min, max, value) {
    return value > max ? min : value < min ? max : value;
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
      "< Exit": () => load(),
      "< Back": () => back(),
      "BreakTod": {
        value: settings.breaktod,
        step: 1,
        onchange: function(v) {
          this.value = v = circulate(0, 23, v);
          writeSetting("breaktod", v);
        }
      },
      "MaxAwake": {
        value: settings.maxawake / 6E4,
        step: 5,
        format: v => v + "min",
        onchange: function(v) {
          this.value = v = circulate(15, 120, v);
          writeSetting("maxawake", v * 6E4);
        }
      },
      "MinConsec": {
        value: settings.minconsec / 6E4,
        step: 5,
        format: v => v + "min",
        onchange: function(v) {
          this.value = v = circulate(15, 120, v);
          writeSetting("minconsec", v * 6E4);
        }
      },
      "TempThresh": {
        value: settings.tempthresh,
        step: 0.5,
        format: v => v + "°C",
        onchange: function(v) {
          this.value = v = circulate(20, 40, v);
          writeSetting("tempthresh", v);
        }
      },
      "PowerSaving": {
        value: settings.powersaving,
        format: v => v ? "on" : "off",
        onchange: function(v) {
          settings.powersaving = v;
          changeRestart();
          showMain(7);
        }
      },
      "MaxMove": {
        value: settings.maxmove,
        step: 44,
        onchange: function(v) {
          this.value = v = circulate(40, 100, v);
          writeSetting("maxmove", v);
        }
      },
      "NoMoThresh": {
        value: settings.nomothresh,
        step: 0.001,
        format: v => ("" + v).padEnd(5, "0"),
        onchange: function(v) {
          this.value = v = circulate(0.006, 0.02, v);
          writeSetting("nomothresh", v);
        }
      },
      "MinDuration": {
        value: Math.floor(settings.sleepthresh * stFactor),
        step: 1,
        format: v => v + "min",
        onchange: function(v) {
          this.value = v = circulate(5, 15, v);
          writeSetting("sleepthresh", Math.ceil(v / stFactor));
        }
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
        value: settings.logfile === "sleeplog.log" ? true : settings.logfile.endsWith(".log") ? "custom" : false,
        format: v => v === true ? "default" : v ? "custom" : "off",
        onchange: function(v) {
          if (v !== "custom") {
            settings.logfile = v ? "sleeplog.log" : undefined;
            changeRestart();
          }
        }
      }
    };
    // check power saving mode to delete unused entries
    (settings.powersaving ? ["NoMoThresh", "MinDuration"] : ["MaxMove"]).forEach(property => delete mainMenu[property]);
    var menu = E.showMenu(mainMenu);
    // workaround to display changed entries correct
    if (selected) setTimeout(_ => {
      menu.move(1);
      menu.move(1);
      menu.move(-1);
      menu.move(-1);
      menu.move(-1);
    }, 100);
  }

  // draw main menu
  showMain();
})
