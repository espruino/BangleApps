(function(back) {
  const SETTINGS_FILE = "daisy.json";

  // initialize with default settings...
  let s = {'gy' : '#020',
           'fg' : '#0f0',
           'color': 'Green',
           'check_idle' : true,
           'batt_hours' : false,
           'hr_12' : false,
           'ring' : 'Steps',
           'idxInfo' : 0,
           'step_target' : 10000};

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
  const saved = settings || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  function save() {
    settings = s;
    storage.write(SETTINGS_FILE, settings);
  }

  var color_options = ['Green','Orange','Cyan','Purple','Red','Blue'];
  var fg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f'];
  var gy_code = ['#020','#220','#022','#202','#200','#002'];
  var ring_options = ['Hours', 'Minutes', 'Seconds', 'Steps', 'Battery', 'Sun'];
  var step_options = [100, 1000, 5000, 10000, 15000, 20000];

  function showMainMenu() {
    let appMenu = {
      '': { 'title': 'Daisy Clock' },
      '< Back': back,
      'Colour': {
        value: 0 | color_options.indexOf(s.color),
        min: 0, max: color_options.length - 1,
        format: v => color_options[v],
        onchange: v => {
          s.color = color_options[v];
          s.fg = fg_code[v];
          s.gy = gy_code[v];
          save();
        },
      },
      'Idle Warning': {
        value: !!s.idle_check,
        onchange: v => {
          s.idle_check = v;
          save();
        },
      },
      'Expected Battery Life In Days Not Percentage': {
        value: !!s.batt_hours,
        onchange: v => {
          s.batt_hours = v;
          save();
        },
      },
      '12 Hr Time': {
        value: !!s.hr_12,
        onchange: v => {
          s.hr_12 = v;
          save();
        },
      },
      'Ring Display': {
        value: 0 | ring_options.indexOf(s.ring),
        min: 0, max: ring_options.length - 1,
        format: v => ring_options[v],
        onchange: v => {
          let prev = s.ring;
          s.ring = ring_options[v];
          save();
          if (prev != s.ring && (prev === 'Steps' || s.ring === 'Steps')) {
            // redisplay the menu with/without ring setting
            // Reference https://github.com/orgs/espruino/discussions/7697
            setTimeout(showMainMenu, 0);
          }
        },
      }
    };
    if (s.ring == 'Steps') {
      appMenu[/*LANG*/"Step Target"] = {
        value: 0 | step_options.indexOf(s.step_target),
        min: 0, max: step_options.length - 1,
        format: v => step_options[v],
        onchange: v => {
          s.step_target = step_options[v];
          save();
        },
      };
    } 
    E.showMenu(appMenu);
  }

  showMainMenu();
})