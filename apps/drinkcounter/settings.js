(function(back) {
  var FILE = "drinkcounter.json";
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
      "title": "Drink counter"
    },
    "< Back": () => back(),

    "Beer size": stringInSettings("beerSize", ["0.3L", "0.5L"]),	


	"Sex": stringInSettings("sex", ["male", "female"]),
	
    'Weight': {
      value: 80|settings.weight,
      min: 40, max: 500,
      onchange: v => {
        settings.weight = v;
        writeSettings();
      }
    },
    "Weight unit": stringInSettings("weightUnit", ["Kilo", "US Pounds"])

	
  };

  E.showMenu(mainmenu);

})
