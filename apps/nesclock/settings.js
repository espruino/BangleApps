(function(back) {
  var FILE = "nesclock.json";
  // Load settings
  var settings = Object.assign({
    currentFace: "Mario 3",
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }
  
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
  
  function stringInSettings(name, values) {
    return stringItems(settings[name], v => settings[name] = v, values);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "NES Clock" },
    "< Back" : () => back(),
    'Game Theme': stringInSettings("currentFace", ["Mario 3", "Mario 2", "Mario 1", "Kirby", "Zelda"]),
  });
})(load);
