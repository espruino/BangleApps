(function(back) {
function writeSettings(key, value) {
  var s = Object.assign(
      require('Storage').readJSON(settingsDefaultFile, true) || {},
      require('Storage').readJSON(settingsFile, true) || {});
  s[key] = value;
  require('Storage').writeJSON(settingsFile, s);
  readSettings();
}

function readSettings() {
  settings = Object.assign(
      require('Storage').readJSON(settingsDefaultFile, true) || {},
      require('Storage').readJSON(settingsFile, true) || {});
}

var settingsFile = "agpsdata.settings.json";
var settingsDefaultFile = "agpsdata.default.json";

var settings;
readSettings();

const gnsstypes = [
  "", "GPS", "BDS", "GPS+BDS", "GLONASS", "GPS+GLONASS", "BDS+GLONASS",
  "GPS+BDS+GLON."
];

function buildMainMenu() {
  var mainmenu = {
    '' : {'title' : 'AGPS download'},
    '< Back' : back,
    "Enabled" : {
      value : !!settings.enabled,
      onchange : v => { writeSettings("enabled", v); }
    },
    "Refresh every" : {
      value : settings.refresh / 60,
      min : 6,
      max : 168,
      step : 1,
      format : v => v + "h",
      onchange : v => { writeSettings("refresh", Math.round(v * 60)); }
    },
    "GNSS type" : {
      value : settings.gnsstype,
      min : 1,
      max : 7,
      step : 1,
      format : v => gnsstypes[v],
      onchange : x => writeSettings('gnsstype', x)
    },
    "Force refresh" : () => {
      E.showMessage("Loading A-GPS data");
      require("agpsdata")
          .pull(
              function() {
                E.showAlert("Success").then(
                    () => { E.showMenu(buildMainMenu()); });
              },
              function(error) {
                E.showAlert(error, "Error")
                    .then(() => { E.showMenu(buildMainMenu()); });
              });
    }
  };

  return mainmenu;
}

E.showMenu(buildMainMenu());
})
