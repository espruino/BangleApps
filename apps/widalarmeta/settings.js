(function(back) {
  const CONFIGFILE = "widalarmeta.json";
  // Load settings
  const settings = Object.assign({
    maxhours: 24,
    drawBell: false,
    showSeconds: 0, // 0=never, 1=only when display is unlocked, 2=for less than a minute
  }, require("Storage").readJSON(CONFIGFILE,1) || {});

  function writeSettings() {
    require('Storage').writeJSON(CONFIGFILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Alarm & Timer ETA" },
    "< Back" : () => back(),
    /*LANG*/'Maximum hours': {
      format: v => v === 0 ? /*LANG*/'disabled' : v,
      value: settings.maxhours,
      min: 0, max: 24,
      onchange: v => {
        settings.maxhours = v;
        writeSettings();
      }
    },
    /*LANG*/'Draw bell': {
      value: !!settings.drawBell,
      format: v => v?/*LANG*/"Yes":/*LANG*/"No",
      onchange: v => {
        settings.drawBell = v;
        writeSettings();
      }
    },
    /*LANG*/'Show seconds': {
      value: settings.showSeconds,
      min: 0, max: 2,
      format: v => [/*LANG*/"Never", /*LANG*/"Unlocked", /*LANG*/"Last minute"][v || 0],
      onchange: v => {
        settings.showSeconds = v;
        writeSettings();
      }
    },
  });
});
