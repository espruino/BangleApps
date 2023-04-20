(function(back) {
  const CONFIGFILE = "widalarmeta.json";
  // Load settings
  const settings = Object.assign({
    maxhours: 24,
    drawBell: false,
    padHours: true,
    showSeconds: 0, // 0=never, 1=only when display is unlocked, 2=for less than a minute
    font: 0, // 0=segment style font, 1=teletest font, 2=4x5
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
    /*LANG*/'Pad hours': {
      value: !!settings.padHours,
      onchange: v => {
        settings.padHours = v;
        writeSettings();
      }
    },
    /*LANG*/'Font': {
      value: settings.font,
      min: 0, max: 2,
      format: v => [/*LANG*/"Segment", /*LANG*/"Teletext", /*LANG*/"4x5"][v || 0],
      onchange: v => {
        settings.font = v;
        writeSettings();
      }
    },
  });
});
