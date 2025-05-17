(function(back) {
  const SETTINGS_FILE = "daisy.json";

  // initialize with default settings...
  let defaultRing = () => ({
    color: 'Green',
    fg: '#0f0',
    gy: '#020',
    ring: 'Steps',
    type: 'Full',
    step_target: 10000,
  });

  let s = {
    rings: [defaultRing(), defaultRing(), defaultRing()],
    check_idle: true,
    batt_hours: false,
    idxInfo: 0,
  };

// ...and overwrite them with any saved values
// This way saved values are preserved if a new version adds more settings
const storage = require('Storage');
let settings = storage.readJSON(SETTINGS_FILE, 1) || s;
const saved = settings || {};
for (const key in saved) {
s[key] = saved[key];
}

// Fill in any missing ring defaults
for (let i = 0; i < 3; i++) {
  s.rings[i] = Object.assign(defaultRing(), s.rings[i] || {});
}

function save() {
  settings = s;
  storage.write(SETTINGS_FILE, settings);
}

var color_options = ['Green','Orange','Cyan','Purple','Red','Blue', 'Fore'];
var fg_code = ['#0f0','#ff0','#0ff','#f0f','#f00','#00f', g.theme.fg];
var gy_code = ['#020','#220','#022','#202','#200','#002', g.theme.fg];
var ring_options = ['Hours', 'Minutes', 'Seconds', 'Day', 'Sun', 'Steps', 'Battery'];
var step_options = [100, 1000, 5000, 10000, 15000, 20000];

  function showRingMenu(ringIndex) {
    const ring = s.rings[ringIndex];
    let ringMenu = {
      '': { title: `Ring ${ringIndex + 1}` },
      '< Back': showMainMenu,
      'Color': {
        value: 0 | color_options.indexOf(ring.color),
        min: 0, max: color_options.length - 1,
        format: v => color_options[v],
        onchange: v => {
          ring.color = color_options[v];
          ring.fg = fg_code[v];
          ring.gy = gy_code[v];
          save();
        }
      },
      'Type': {
        value: ring_types.indexOf(ring.type),
        min: 0, max: ring_types.length - 1,
        format: v => ring_types[v],
        onchange: v => {
          ring.type = ring_types[v];
          save();
        }
      },
      'Display': {
        value: 0 | ring_options.indexOf(ring.ring),
        min: 0, max: ring_options.length - 1,
        format: v => ring_options[v],
        onchange: v => {
          let prev = ring.ring;
          ring.ring = ring_options[v];
          save();
          if (prev != ring.ring && (prev === 'Steps' || ring.ring === 'Steps')) {
            // redisplay the menu with/without ring setting
            // Reference https://github.com/orgs/espruino/discussions/7697
            setTimeout(showRingMenu, 0, ringIndex);
          }
        },
      }
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
    E.showMenu(ringMenu);
  }

  function showMainMenu() {
    let appMenu = {
      '': { title: 'Daisy Clock' },
      '< Back': back,
      'Ring 1': () => showRingMenu(0),
      'Ring 2': () => showRingMenu(1),
      'Ring 3': () => showRingMenu(2),
      'Idle Warning' : {
        value: !!s.idle_check,
        onchange: v => {
          s.idle_check = v;
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
      }
    };
    E.showMenu(appMenu);
  }

  showMainMenu();
})