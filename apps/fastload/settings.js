(function(back) {
  var FILE="fastload.json";
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

    mainmenu[''] = { 'title': 'Fastload', back: back };

    mainmenu['Activate app history'] = {
        value: !!settings.useAppHistory,
        onchange: v => {
          writeSettings("useAppHistory",v);
          if (v && settings.autoloadLauncher) {
            writeSettings("autoloadLauncher",!v);  // Don't use app history and load to launcher together.
            setTimeout(()=>E.showMenu(buildMainMenu()), 0); // Update the menu so it can be seen if a value was automatically set to false (app history vs load launcher).
          }
        }
      };

    if (isQuicklaunchPresent) {
      mainmenu['Exclude Quick Launch from history'] = {
        value: !!settings.disregardQuicklaunch,
        onchange: v => {
          writeSettings("disregardQuicklaunch",v);
        }
      };
    }

    mainmenu['Force load to launcher'] = {
        value: !!settings.autoloadLauncher,
        onchange: v => {
          writeSettings("autoloadLauncher",v);
          if (v && settings.useAppHistory) {
            writeSettings("useAppHistory",!v);
            setTimeout(()=>E.showMenu(buildMainMenu()), 0); // Update the menu so it can be seen if a value was automatically set to false (app history vs load launcher).
          } // Don't use app history and load to launcher together.
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
