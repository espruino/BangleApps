(function(back) {

  var settings = Object.assign({
    default_colour: true,
    hide: false,
    red: 0,
    green: 0,
    blue: 0,
  }, require('Storage').readJSON("widmp.json", true) || {});

  function writeSettings() {
    require('Storage').writeJSON("widmp.json", settings);
	if (WIDGETS["widmp"]) WIDGETS["widmp"].draw();
  }
  
  function writeSettingsCustom() {
    settings.default_colour = false;
    mainmenu["Default"].value = false;
    writeSettings();
  }
  
  var mainmenu = {
    "": {
      "title": "Moon colour"
    },
    "< Back": () => back(),
    "Default": {
      value: (settings.default_colour !== undefined ? settings.default_colour : true),
      onchange: v => {
        settings.default_colour = v;
        writeSettings();
      }
    },
    "Hide Widget": {
      value: settings.hide,
      onchange: () => {
        settings.hide = !settings.hide;
        writeSettings();
      }
    },
    "Custom...": () => E.showMenu(custommenu)
  };
  
  var custommenu = {
    "": {
      "title": "Custom colour..."
    },
    "< Back": () => E.showMenu(mainmenu),
    "red": {
      value: 0|settings.red,
      min: 0,
      max: 4,
      onchange: v => {
        settings.red = v;
        writeSettingsCustom();
      }
    },
    "green": {
      value: 0|settings.green,
      min: 0,
      max: 4,
      onchange: v => {
        settings.green = v;
        writeSettingsCustom();
      }
    },
    "blue": {
      value: 0|settings.blue,
      min: 0,
      max: 4,
      onchange: v => {
        settings.blue = v;
        writeSettingsCustom();
      }
    }
  };

  E.showMenu(mainmenu);

})
