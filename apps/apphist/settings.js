(function(back) {
  var FILE="appHist.json";
  var settings;
  var isQuicklaunchPresent = !!require('Storage').read("quicklaunch.app.js", 0, 1);

  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = require('Storage').readJSON(FILE, true) || {};
  }

  readSettings();

  function buildMainMenu(){
    var mainmenu = {};

    mainmenu[''] = { 'title': 'App History', back: back };

    if (isQuicklaunchPresent) {
      mainmenu['Exclude Quick Launch from history'] = {
        value: !!settings.disregardQuicklaunch,
        onchange: v => {
          writeSettings("disregardQuicklaunch",v);
        }
      };
    }
    return mainmenu;
  }

  E.showMenu(buildMainMenu());
})
