(function (back) {
  // Constants
  const LOC = "shadowclk.json";
  const SYS = "setting.json";
  const teletextColors = ["#000", "#f00", "#0f0", "#ff0", "#00f", "#f0f", "#0ff", "#fff"];
  const teletextColorNames = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];

  // Load and set default settings
  let appSettings = Object.assign({
    color: teletextColors[6],
    theme: 'light',
  }, require('Storage').readJSON(LOC, true) || {});

  // Save settings to storage
  function writeSettings() {
    require('Storage').writeJSON(LOC, appSettings);
  }

  // Switch theme and save to storage
  function switchTheme(mode) {
    if (mode === g.theme.dark) return;
    let s = require("Storage").readJSON(SYS, 1) || {};
    const cl = x => g.setColor(x).getColor();
    s.theme = mode ? {
      fg: cl("#fff"), bg: cl("#000"), fg2: cl("#0ff"), bg2: cl("#000"), fgH: cl("#fff"), bgH: cl("#00f"), dark: true
    } : {
      fg: cl("#000"), bg: cl("#fff"), fg2: cl("#000"), bg2: cl("#cff"), fgH: cl("#000"), bgH: cl("#0ff"), dark: false
    };
    require("Storage").writeJSON("setting.json", s);
    if (Bangle.CLOCK) load(global.__FILE__);
  }

  // Show settings menu
  E.showMenu({
    "": { "title": "Shadow Clock" },
    "< Back": () => back(),
    'Theme:': {
      value: (appSettings.theme === 'dark'),
      format: v => v ? "Dark" : "Light",
      onchange: v => {
        const newTheme = v ? 'dark' : 'light';
        switchTheme(newTheme === 'dark');
        appSettings.theme = newTheme;
        writeSettings();
      }
    },
    'Color:': {
      value: teletextColors.indexOf(appSettings.color),
      min: 0,
      max: 7,
      onchange: v => {
        appSettings.color = teletextColors[v];
        writeSettings();
      },
      format: v => teletextColorNames[v]
    }
  });
});
