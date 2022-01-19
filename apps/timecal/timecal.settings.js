// Settings menu for Time calendar clock
(function(back) {
  DOW_abbr_FB = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var FILE = "timecal.settings.json";
  // Load settings
  var settings = Object.assign({
    wdStrt: 1, //= fix at monday, 0: sun, -1: relative
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  };
});

var mainmenu = {
  "": {
    "title": "Time calendar clock"
  },
  "< Back": () => back(),
  "Cal.Start Day": {
    value: settings.wdStrt === undefined ? 1 : settings.wdStrt, //def: 1: mon
    min: -1, max: 6,
    //render dow from locale or LANG"today"
    format: v => (v>=0 ? (require("locale") && require("locale").abday && require("locale").abday[v] ? : && require("locale").abday[v] : DOW_abbr_FB[v]) : /*LANG*/"today"),
    onchange: v => {
      settings.weekDay = v;
      writeSettings();
    }
  }
};