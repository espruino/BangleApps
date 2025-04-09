(function(back) {
  var FILE = "dtlaunch.json";
  
  var settings = Object.assign({
    showClocks: true,
    showLaunchers: true,
    direct: false,
    swipeExit: false,
    timeOut: "Off",
    interactionBuzz: false,
    rememberPage: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  const timeOutChoices = [/*LANG*/"Off", "10s", "15s", "20s", "30s"];

  function clearCache() {
    require("Storage").erase("dtlaunch.cache.json")
  }

  E.showMenu({
    "" : { "title" : "Desktop launcher" },
    /*LANG*/"< Back" : () => back(),
    /*LANG*/'Show clocks': {
      value: settings.showClocks,
      onchange: v => {
        settings.showClocks = v;
        writeSettings();
        clearCache();
      }
    },
    /*LANG*/'Show launchers': {
      value: settings.showLaunchers,
      onchange: v => {
        settings.showLaunchers = v;
        writeSettings();
        clearCache();
      }
    },
    /*LANG*/'Direct launch': {
      value: settings.direct,
      onchange: v => {
        settings.direct = v;
        writeSettings();
      }
    },
    /*LANG*/'Swipe Exit': {
      value: settings.swipeExit,
      onchange: v => {
        settings.swipeExit = v;
        writeSettings();
      }
    },
    /*LANG*/'Time Out': { // Adapted from Icon Launcher
      value: timeOutChoices.indexOf(settings.timeOut),
      min: 0,
      max: timeOutChoices.length-1,
      format: v => timeOutChoices[v],
      onchange: v => {
        settings.timeOut = timeOutChoices[v];
        writeSettings();
      }
    },
    /*LANG*/'Interaction buzz': {
      value: settings.interactionBuzz,
      onchange: v => {
        settings.interactionBuzz = v;
        writeSettings();
      }
    },
    /*LANG*/'Remember Page': {
      value: settings.rememberPage,
      onchange: v => {
        settings.rememberPage = v;
        writeSettings();
      }
    },
  });
})
