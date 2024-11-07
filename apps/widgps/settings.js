(function(back) {
function writeSettings(key, value) {
  var s = require('Storage').readJSON(FILE, true) || {};
  s[key] = value;
  require('Storage').writeJSON(FILE, s);
  readSettings();
}

function readSettings() {
  settings = Object.assign(
      require('Storage').readJSON("widgps.default.json", true) || {},
      require('Storage').readJSON(FILE, true) || {});
}

var FILE = "widgps.json";
var settings;
readSettings();

var mainmenu = {
  '' : {'title' : 'GPS widget'},
  '< Back' : back,
  "Cross icon" : {
    value : settings.crossIcon ,
      onchange : v => { writeSettings("crossIcon", v); }
    },
  "Hide icon when GPS off" : {
      value : settings.hideWhenGpsOff ,
        onchange : v => { writeSettings("hideWhenGpsOff", v); }
      },
};
E.showMenu(mainmenu);
})
