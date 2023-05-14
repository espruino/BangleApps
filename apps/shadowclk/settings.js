(function(back) {
  let teletextColors = ["#000", "#f00", "#0f0", "#ff0", "#00f", "#f0f", "#0ff", "#fff"];
  let teletextColorNames = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];
  let sysSettings = require('Storage').readJSON("setting.json", 1) || {};

  // Load and set default settings
  let appSettings = Object.assign({
    color: teletextColors[6],
    theme: 'light',
    enableSuffix: true,
    enableLeadingZero: false,
    enable12Hour: '24hour' // default time mode
  }, require('Storage').readJSON("shadowclk.json", true) || {});

  // Colors from 'Light BW' and 'Dark BW' themes
  function createThemeColors(mode) {
    let cl = x => g.setColor(x).getColor();
    return mode ? {
      fg: cl("#fff"),
      bg: cl("#000"),
      fg2: cl("#fff"),
      bg2: cl("#004"),
      fgH: cl("#fff"),
      bgH: cl("#00f"),
      dark: true
    } : {
      fg: cl("#000"),
      bg: cl("#fff"),
      fg2: cl("#000"),
      bg2: cl("#cff"),
      fgH: cl("#000"),
      bgH: cl("#0ff"),
      dark: false
    };
  }

  // Switch theme and save to storage
  function switchTheme(mode) {
    if (mode === g.theme.dark) return;
    let s = require('Storage').readJSON("setting.json", 1) || {};
    s.theme = createThemeColors(mode);
    require('Storage').writeJSON("setting.json", s);
    updateTheme(mode);
  }

  // Update the current menu with the new theme
  function updateTheme(mode) {
    let newTheme = createThemeColors(mode);
    g.theme = newTheme;
    appSettings.theme = mode ? 'dark' : 'light';
    writeSettings();
    delete g.reset;
    g._reset = g.reset;
    g.reset = function(n) {
      return g._reset().setColor(newTheme.fg).setBgColor(newTheme.bg);
    };
    g.clear = function(n) {
      if (n) g.reset();
      return g.clearRect(0, 0, g.getWidth(), g.getHeight());
    };
    g.clear(1);
    Bangle.drawWidgets();
    showMenu();
  }

  // Read the current system theme
  function getCurrentTheme() {
    if (!sysSettings.theme) {
      return appSettings.theme; // fallback to appSettings.theme (light or dark)
    }
    return sysSettings.theme.dark ? 'dark' : 'light';
  }

  // Read the current time mode
  function getCurrentTimeMode() {
    if (!sysSettings['12hour']) {
      return appSettings.enable12Hour; // fallback to appSettings.enable12Hour
    }
    return sysSettings['12hour'] ? '12hour' : '24hour';
  }

  // Save settings to storage
  function writeSettings() {
    appSettings.enable12Hour = appSettings.enable12Hour === '12hour' ? '12hour' : '24hour';
    require('Storage').writeJSON("shadowclk.json", appSettings);
  }

  // Save time mode to system settings
  function writeTimeModeSetting() {
    sysSettings['12hour'] = appSettings.enable12Hour === '12hour';
    require('Storage').writeJSON("setting.json", sysSettings);
  }

  function showMenu() {
    appSettings.theme = getCurrentTheme();
    appSettings.enable12Hour = getCurrentTimeMode();

    E.showMenu({
      "": {
        "title": "Shadow Clock"
      },
      "< Back": () => back(),
      'Theme:': {
        value: (appSettings.theme === 'dark'),
        format: v => v ? "Dark" : "Light",
        onchange: v => {
          switchTheme(v);
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
      },
      'Date Suffix:': {
        value: appSettings.enableSuffix,
        format: v => v ? 'Yes' : 'No',
        onchange: v => {
          appSettings.enableSuffix = v;
          writeSettings();
        }
      },
      'Lead Zero:': {
        value: appSettings.enableLeadingZero,
        format: v => v ? 'Yes' : 'No',
        onchange: v => {
          appSettings.enableLeadingZero = v;
          writeSettings();
        }
      },
      'Time Mode:': {
        value: (appSettings.enable12Hour === '12hour'),
        format: v => v ? '12 Hr' : '24 Hr',
        onchange: v => {
          appSettings.enable12Hour = v ? '12hour' : '24hour';
          writeSettings();
          writeTimeModeSetting();
        }
      }
    });
  }
  // Initially show the menu
  showMenu();
});