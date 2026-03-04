const { getDefaultSettings, color_options, fg_code, gy_code, fg_code_font } = require('./modules/set-def');
(function(back) {
  const SETTINGS_FILE = "harvester.json";

  let s = getDefaultSettings();
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

  // TODO: Fix all this
  function showRingMenu(ringIndex) {
    const ring = s.rings[ringIndex];
    let ringMenu = {
      '': { title: `Ring ${ringIndex + 1}` },
      '< Back': showMainMenu,
      'Type': {
        value: ring_types.indexOf(ring.type),
        min: 0, max: ring_types.length - 1,
        format: v => ring_types[v],
        onchange: v => {
          let prev = ring.type;
          ring.type = ring_types[v];
          save();
          if (prev != ring.type && (prev === 'None' || ring.type === 'None')) {
            setTimeout(showRingMenu, 0, ringIndex);
          }
        }
      },
    };
    if (ring.type != 'None') {
      ringMenu['Color'] = {
        value: 0 | color_options.indexOf(ring.color),
        min: 0, max: color_options.length - 1,
        format: v => color_options[v],
        onchange: v => {
          ring.color = color_options[v];
          ring.fg = fg_code[v];
          ring.gy = gy_code[v];
          save();
        }
      };
      ringMenu['Display'] = {
        value: 0 | ring_options.indexOf(ring.ring),
        min: 0, max: ring_options.length - 1,
        format: v => ring_options[v],
        onchange: v => {
          let prev = ring.ring;
          ring.ring = ring_options[v];
          save();
          if (prev != ring.ring && (prev === 'Steps' || ring.ring === 'Steps')) {
            setTimeout(showRingMenu, 0, ringIndex);
          }
        },
      };
      if (ring.ring == 'Steps') {
        ringMenu[/*LANG*/"Step Target"] = {
          value: 0 | step_options.indexOf(ring.step_target),
          min: 0, max: step_options.length - 1,
          format: v => step_options[v],
          onchange: v => {
            ring.step_target = step_options[v];
            save();
          },
        };
      }
    }
    E.showMenu(ringMenu);
  }

  function showMainMenu() {
    let appMenu = {
      '': { title: 'Time Harvester' },
      '< Back': back,
      'Ring 1': () => showRingMenu(0),
      'Ring 2': () => showRingMenu(1),
      'Ring 3': () => showRingMenu(2),
      'Hour Color': {
        value: 0 | color_options_font.indexOf(s.color),
        min: 0, max: color_options_font.length - 1,
        format: v => color_options_font[v],
        onchange: v => {
          s.color = color_options_font[v];
          s.fg = fg_code_font[v];
          save();
        },
      },
      'Battery Life Format' : {
        value: !!s.batt_hours,
        format: value => value?"Days":"%",
        onchange: v => {
          s.batt_hours = v;
          save();
        },
      },
      'Idle Warning' : {
        value: !!s.idle_check,
        onchange: v => {
          s.idle_check = v;
          save();
        },
      },
    };
    E.showMenu(appMenu);
  }

  showMainMenu();
})
