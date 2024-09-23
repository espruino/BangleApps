(function(back) {
  var FILE = "binaryclk.json";
  var settings = Object.assign({
    fullscreen: false,
    hidesq: false,
    showdate: false,
    showbat: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  E.showMenu({
    "" : { "title" : "Bin Clock" },
    "< Back" : () => back(),
    'Fullscreen': {
      value: settings.fullscreen,
      onchange: v => {
        settings.fullscreen = v;
        writeSettings();
      },
    },
    'Hide Squares': {
      value: settings.hidesq,
      onchange: v => {
        settings.hidesq = v;
        writeSettings();
      },
    },
    'Show Date': {
      value: settings.showdate,
      onchange: v => {
        settings.showdate = v;
        writeSettings();
      },
    },
    'Show Battery': {
      value: settings.showbat,
      onchange: v => {
        settings.showbat = v;
        writeSettings();
      },
    },
  });
})
