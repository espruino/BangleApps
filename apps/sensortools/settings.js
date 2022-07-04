(function(back) {
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("sensortools.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  var FILE="sensortools.json";
  var settings;
  readSettings();

  function buildMainMenu(){
    var mainmenu = {
      '': { 'title': 'Sensor tools' },
      '< Back': back
    };
    return mainmenu;
  }

  E.showMenu(buildMainMenu());
});
