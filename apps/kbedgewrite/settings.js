(function(back) {
  var FILE = 'kbedgewrite.json';

  // Load settings
  var settings = Object.assign({
    fontSize: 32
  }, require('Storage').readJSON(FILE, true) || {});

  function setSetting(key,value) {
    settings[key] = value;
    require('Storage').writeJSON(FILE, settings);
  }

  // Helper method which uses int-based menu item for set of string values and their labels
  function stringItems(key, startvalue, values, labels) {
    return {
      value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
      format: v => labels[v],
      min: 0,
      max: values.length - 1,
      wrap: true,
      step: 1,
      onchange: v => {
        setSetting(key,values[v]);
      }
    };
  }

  // Helper method which breaks string set settings down to local settings object
  function stringInSettings(name, values, labels) {
    return stringItems(name,settings[name], values, labels);
  }

  // Show the menu
  E.showMenu({
    '' : { 'title' : 'EdgeWrite' },
    '< Back' : () => back(),
    'Font Size': stringInSettings('fontSize', [24, 32, 48], ['Small', 'Medium', 'Large'])
  });
})