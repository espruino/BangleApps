(function (back) {
  const SETTINGS_FILE = "rebbleagenda.json";

  // initialize with default settings...
  let s = {
    'system': true,
    'bg': "#FFF",
    'fg': "#000",
    'acc': "#0FF"
  };

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  let settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  const saved = settings || {};
  for (const key in saved) {
    s[key] = saved[key];
  }

  const save = function () {
    settings = s;
    storage.write(SETTINGS_FILE, settings);
  };

  const color_options = [/*LANG*/"Red", /*LANG*/"Green", /*LANG*/"Blue", /*LANG*/"Purple", /*LANG*/"Cyan", /*LANG*/"Orange", /*LANG*/"Grey"];
  const color_codes = ['#F00','#0F0','#00F','#F0F','#0FF','#FF0', "#888"];
  const ground_options = [/*LANG*/"Black", /*LANG*/"White", /*LANG*/"Dark Blue", /*LANG*/"Dark Red", /*LANG*/"Dark Green", /*LANG*/"Light Blue", /*LANG*/"Light Red", /*LANG*/"Light Green"];
  const ground_codes = ["#000", "#FFF", "#003", "#300", "#030", "#BBF", "#FBB", "#BFB"];

  E.showMenu({
    '': { 'title': 'Rebble Agenda' },
    /*LANG*/'< Back': back,
    /*LANG*/'Use system theme': {
      value: !!s.system,
      onchange: v => {
        s.system = v;
        save();
      },
    },
    /*LANG*/'Accent': {
      value: 0 | color_codes.indexOf(s.acc),
      min: 0, max: color_codes.length-1,
      format: v => color_options[v],
      onchange: v => {
        s.acc = color_codes[v];
        save();
      },
    },
    /*LANG*/'Background': {
      value: 0 | ground_codes.indexOf(s.bg),
      min: 0, max: ground_codes.length-1,
      format: v => ground_options[v],
      onchange: v => {
        s.bg = ground_codes[v];
        save();
      },
    },
    /*LANG*/'Foreground': {
      value: 0 | ground_codes.indexOf(s.fg),
      min: 0, max: ground_codes.length-1,
      format: v => ground_options[v],
      onchange: v => {
        s.fg = ground_codes[v];
        save();
      },
    }
  });
})
