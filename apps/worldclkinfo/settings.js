(function(back) {
  var FILE = "worldclkinfo.settings.json";
  // Load settings
  var settings = Object.assign({
    shorten: false,
    showMeridians: true,
    shortenMeridians: false,
    simpleModes: true
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "World ClockInfo" },
    "< Back" : () => back(),
    'Shorten Cities ': {
      value: !!settings.shorten,  // !! converts undefined to false
      onchange: v => {
        settings.shorten = v;
        writeSettings();
      }
    },
    'Show Meridians': {
      value: !!settings.showMeridians,  // !! converts undefined to false
      onchange: v => {
        settings.showMeridians = v;
        writeSettings();
      }
    },
    'Shorten Meridians': {
      value: !!settings.shortenMeridians,  // !! converts undefined to false
      onchange: v => {
        settings.shortenMeridians = v;
        writeSettings();
      }
    },
    'Simple Mode': {
      value: !!settings.shortenMeridians,  // !! converts undefined to false
      onchange: v => {
        settings.simpleModes = v;
        writeSettings();
      }
    },
  });
})
