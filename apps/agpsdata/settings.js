(function(back) {
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("agpsdata.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  var FILE="agpsdata.json";
  var settings;
  readSettings();

  function buildMainMenu(){
    var mainmenu = {
      '': { 'title': 'AGPS download' },
      '< Back': back,
      "Enabled": {
        value: !!settings.enabled,
        onchange: v => {
          writeSettings("enabled", v);
        }
      },
      "Refresh every": {
        value: settings.refresh / 60,
        min: 1,
        max: 168,
        step: 1,
        format: v=>v+"h",
        onchange: v => {
          writeSettings("refresh",Math.round(v * 60));
        }
      },
      "Force refresh": ()=>{
        E.showMessage("Loading AGPS data");
        
        require("agpsdata").pull(function() {
             E.showAlert("Success").then(()=>{
                E.showMenu(buildMainMenu());
              });
         },function(error) {
             E.showAlert(error,"Error").then(()=>{
                E.showMenu(buildMainMenu());
              });
        });
      }
    };

    return mainmenu;
  }

  E.showMenu(buildMainMenu());
});
