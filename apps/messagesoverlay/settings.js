(function(back) {
  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = Object.assign(
      require('Storage').readJSON("messagesoverlay.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {}
    );
  }

  var FILE="messagesoverlay.json";
  var settings;
  readSettings();

  function buildMainMenu(){
    var mainmenu = {
      '' : { title: "Messages Overlay"},
      '< Back': back,
      'Border': {
        value: settings.border,
        min: 0,
        max: Math.floor(g.getWidth()/2-50),
        step: 1,
        format: v=>v + "px",
        onchange: v => {
          writeSettings("border",v);
        }
      },
      'Autoclear after': {
        value: settings.autoclear,
        min: 0,
        max: 3600,
        step: 10,
        format: v=>v>0?v+"s":"Off",
        onchange: v => {
          writeSettings("autoclear",v);
        }
      },
      'Theme': {
        value: settings.systemTheme,
        format: v=>v?"System":"low RAM",
        onchange: v => {
          writeSettings("systemTheme",v);
        }
      },
      'Min. free RAM': {
        value: settings.minfreemem,
        min: 0,
        max: process.memory().total/1000,
        step: 1,
        format: v=>v + "k free",
        onchange: v => {
          writeSettings("minfreemem",v);
        }
      }
    };
    return mainmenu;
  }

  E.showMenu(buildMainMenu());
})
