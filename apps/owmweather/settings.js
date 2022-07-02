(function(back) {
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("owmweather.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  var FILE="owmweather.json";
  var settings;
  readSettings();

  function buildMainMenu(){
    var mainmenu = {
      '': { 'title': 'OWM weather' },
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
        max: 48,
        step: 1,
        format: v=>v+"h",
        onchange: v => {
          writeSettings("refresh",Math.round(v * 60));
        }
      },
      "Force refresh": Bangle.pullOwmWeather
    };

    if (require("textinput")){
      mainmenu["API key"] = function (){
        require("textinput").input({text:settings.apikey}).then(result => {
          if (result != "") {
            settings.apikey = result;
            writeSettings("apikey",result);
          }
          E.showMenu(buildMainMenu());
        });
      };
    }

    return mainmenu;
  }

  E.showMenu(buildMainMenu());
});
