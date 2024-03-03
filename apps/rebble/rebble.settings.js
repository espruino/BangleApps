(function(back) {
  const SETTINGS_FILE = "rebble.json";

  // initialize with default settings...
  let localSettings = {'bg': '#0f0', 'color': 'Green', 'autoCycle': true, 'fullScreen': true, 'sideTap':0};
  //sideTap 0 = on| 1= sideBar1 | 2 = ...

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = storage.readJSON(SETTINGS_FILE, 1) || localSettings;

  const saved = settings || {}
  for (const key in saved) {
    localSettings[key] = saved[key]
  }

  let save=function() {
    settings = localSettings
    storage.write(SETTINGS_FILE, settings)
  }

  let color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
  let bg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
  
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
       'Fullscreen': {
        value: localSettings.fullScreen,
        onchange: (v) => {
          localSettings.fullScreen = v;
          save();
          showMenu();
        }
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
      menu['Tap to Cycle']= {
        value: localSettings.sideTap,
        min: 0,
        max: 3,
        step: 1,
        format: v => NumberToSideTap(v),
        onchange: v => {
          localSettings.sideTap=v
          save();
          setTimeout(showMenu, 10);
        }
      };
    }
    E.showMenu(menu);
  }

  let NumberToSideTap=function(Number)
  {
    if(Number==0)
      return 'on';
    return Number+"";
  }
  
  showMenu();
})
