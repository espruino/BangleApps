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
      "Force refresh": ()=>{
        if (!settings.apikey){
          E.showAlert("API key is needed","Hint").then(()=>{
            E.showMenu(buildMainMenu());
          });
        } else {
          E.showMessage("Reloading weather");
          require("owmweather").pull((e)=>{
            if (e) {
              E.showAlert(e,"Error").then(()=>{
                E.showMenu(buildMainMenu());
              });
            } else {
              E.showAlert("Success").then(()=>{
                E.showMenu(buildMainMenu());
              });
            }
          });
        }
      }
    };

    mainmenu["API key"] = function (){
      if (require("textinput")){
        require("textinput").input({text:settings.apikey}).then(result => {
          if (result != "") {
            print("Result is", result);
            settings.apikey = result;
            writeSettings("apikey",result);
          }
          E.showMenu(buildMainMenu());
        });
      } else {
        E.showAlert("Install a text input lib").then(()=>{
          E.showMenu(buildMainMenu());
        });
      }
    };


    return mainmenu;
  }

  E.showMenu(buildMainMenu());
})
