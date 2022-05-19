(function(back) {
  const SETTINGS_FILE = "rebble.json";

  // initialize with default settings...
  let localSettings = {'bg': '#0f0', 'color': 'Green', 'autoCycle': true, 'sideTap':'on'};

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || localSettings;

  const saved = settings || {}
  for (const key in saved) {
    localSettings[key] = saved[key]
  }

  function save() {
    settings = localSettings
    storage.write(SETTINGS_FILE, settings)
  }

  var color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
  var bg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
  
  function showMenu()
  {
    const menu={
      '': { 'title': 'Rebble Clock' },
      '< Back': back,
      'Colour': {
        value: 0 | color_options.indexOf(localSettings.color),
        min: 0, max: 5,
        format: v => color_options[v],
        onchange: v => {
          localSettings.color = color_options[v];
          localSettings.bg = bg_code[v];
          save();
        },
      },
      'Auto Cycle': {
        value: localSettings.autoCycle,
        onchange: (v) => {
          localSettings.autoCycle = v;
          save();
          showMenu();
        }
      }
    };

    if( !localSettings.autoCycle)
    {
      menu['Tap to Cycle']={
        value: localSettings.sideTap,
        onchange: () => setTimeout(showTapMenu, 100, changedValue => {
          localSettings.sideTap=changedValue;
          save();
          setTimeout(showMenu, 10);
        })
      };
    }
    E.showMenu(menu);
  }

  function showTapMenu(changeCallback)
  {
    var current = localSettings.sideTap;
    const menu = {
      "": { "title": /*LANG*/"Tap to Cycle" },
      "< Back": () => changeCallback(current),
      "on": { // No days set: the alarm will fire once
        value: current == 'on',
        onchange: () => changeCallback('on')
      },
      "1": {
        value: current == '1',
        onchange: () => changeCallback('1')
      },
      "2": {
        value: current == '2',
        onchange: () => changeCallback('2')
      },
      "3": {
        value: current == '3',
        onchange: () => changeCallback('3')
      },
    };
  
    E.showMenu(menu);
  }
  
  showMenu();
})
