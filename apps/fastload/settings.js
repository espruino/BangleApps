(function(back) {
  var FILE="fastload.json";
  var settings;

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

    mainmenu[''] = { 'title': 'Fastload', back: back };

    mainmenu['Force load to launcher'] = {
        value: !!settings.autoloadLauncher,
        onchange: v => {
          writeSettings("autoloadLauncher",v);
        }
      };

    mainmenu['Hide "Fastloading..."'] = {
        value: !!settings.hideLoading,
        onchange: v => {
          writeSettings("hideLoading",v);
        }
      };

      mainmenu['Detect settings changes'] = {
         value: !!settings.detectSettingsChange,
         onchange: v => {
           writeSettings("detectSettingsChange",v);
         }
      };

    return mainmenu;
  }

  E.showMenu(buildMainMenu());
})
