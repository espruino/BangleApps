(function(back) {
  var FILE = "widbt_notify.json";
  var settings = Object.assign({
    secondsOnUnlock: false,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Helper method which uses int-based menu item for set of string values
  function stringItems(startvalue, writer, values) {
    return {
      value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
      format: v => values[v],
      min: 0,
      max: values.length - 1,
      wrap: true,
      step: 1,
      onchange: v => {
        writer(values[v]);
        writeSettings();
      }
    };
  }

  // Helper method which breaks string set settings down to local settings object
  function stringInSettings(name, values) {
    return stringItems(settings[name], v => settings[name] = v, values);
  }

  var mainmenu = {
    "": {
      "title": "Bluetooth Widget WN"
    },
    "< Back": () => back(),
    "Show Widget": {
      value: (settings.showWidget !== undefined ? settings.showWidget : true),
      onchange: v => {
        settings.showWidget = v;
        writeSettings();
      }
    },
    "Buzz on Connect": {
      value: (settings.buzzOnConnect !== undefined ? settings.buzzOnConnect : true),
      onchange: v => {
        settings.buzzOnConnect = v;
        writeSettings();
      }
    },
    "Buzz on loss": {
      value: (settings.buzzOnLoss !== undefined ? settings.buzzOnLoss : true),
      onchange: v => {
        settings.buzzOnLoss = v;
        writeSettings();
      }
    },
    "Hide connected": {
      value: (settings.hideConnected !== undefined ? settings.hideConnected : false),
      onchange: v => {
        settings.hideConnected = v;
        writeSettings();
      }
    }		
  };

  E.showMenu(mainmenu);

});
