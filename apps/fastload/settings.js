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
    var mainmenu = {
      '': { 'title': 'Fastload', back: back },
      'Force load to launcher': {
        value: !!settings.autoloadLauncher,
        onchange: v => {
          writeSettings("autoloadLauncher",v);
        }
      },
      'Hide "Fastloading..."': {
        value: !!settings.hideLoading,
        onchange: v => {
          writeSettings("hideLoading",v);
        }
      }
    };
    return mainmenu;
  }

  E.showMenu(buildMainMenu());
})
