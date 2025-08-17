(function(back) {
  const SETTINGS_FILE = "daisy.json";

  function getDefaultSettings() {
  return {
    rings: [
      {
        color: 'Green',
        fg: '#0f0',
        gy: '#020',
        ring: 'Steps',
        type: 'Full',
        step_target: 10000,
      },
      {
        color: 'Blk/Wht',
        fg: null,
        gy: null,
        ring: 'Minutes',
        type: 'None',
        step_target: 10000,
      },
      {
        color: 'Green',
        fg: '#0f0',
        gy: '#020',
        ring: 'Hours',
        type: 'None',
        step_target: 10000,
      }
    ],
    color: 'Outer',
    fg: '#0f0',
    check_idle: true,
    batt_hours: false,
    idxInfo: 0,
  };
}

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

  var color_options = ['Cyan','Green','Orange','Purple','Red','Blue', 'Blk/Wht'];
  var fg_code = ['#0ff','#0f0','#ff0','#f0f','#f00','#00f', null];
  var gy_code = ['#022','#020','#220','#202','#200','#002', null];
  var ring_options = ['Hours', 'Minutes', 'Seconds', 'Day', 'Sun', 'Steps', 'Battery'];
  var ring_types = ['None', 'Full', 'Semi', 'C'];
  var step_options = [100, 1000, 5000, 10000, 15000, 20000];
  var color_options_font = ['Outer', 'Inner', 'Fullest'].concat(color_options);
  var fg_code_font = [null, null].concat(color_options);

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
      '': { title: 'Daisy Clock' },
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