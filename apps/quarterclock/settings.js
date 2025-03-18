(function(back) {
  var FILE = 'quarterclock.json';
  // Load settings
  var settings = Object.assign({
    minuteColour: '#f00',
    hourColour: '#ff0',
    backgroundColour: 'theme',
    showWidgets: true,
    showBattery: true,
    digital: false,
    batteryColour: '#0f0',
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
    '' : { 'title' : 'Quarter Clock' },
    '< Back' : () => back(),
    'Hour Colour': stringInSettings('hourColour', ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'], ['Red', 'Green', 'Blue', 'Yellow', 'Cyan', 'Magenta']),
    'Minute Colour': stringInSettings('minuteColour', ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'], ['Red', 'Green', 'Blue', 'Yellow', 'Cyan', 'Magenta']),
    'Background Colour': stringInSettings('backgroundColour', ['theme', '#000', '#fff'],['theme', 'Black', 'White']),
    'Digital': {
      value: !!settings.digital,  // !! converts undefined to false
      onchange: v => {
        setSetting('digital', v);
      },
    },
    'Show Widgets': {
      value: !!settings.showWidgets,
      onchange: v => {
        setSetting('showWidgets', v);
      },
    },
    'Show Battery': {
      value: !!settings.showBattery,
      onchange: v => {
        setSetting('showBattery', v);
      },
     },
    'Battery Colour': stringInSettings('batteryColour', ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'], ['Red', 'Green', 'Blue', 'Yellow', 'Cyan', 'Magenta']),
  });
})
