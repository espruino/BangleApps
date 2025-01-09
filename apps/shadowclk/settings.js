(function (back) {
  let teletextColors = ["#000", "#f00", "#0f0", "#ff0", "#00f", "#f0f", "#0ff", "#fff"];
  let teletextColorNames = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];
  let sysSettings = require('Storage').readJSON("setting.json", 1) || {};

  // Load and set default settings
  let appSettings = Object.assign({
    color: teletextColors[6],
    theme: 'light',
    enableSuffix: true,
    enableLeadingZero: false,
    enable12Hour: false
  }, require('Storage').readJSON("shadowclk.json", true) || {});

  // Check if shadowclk is the selected clock
  if (sysSettings.clock === "shadowclk.app.js") {
      // Sync app settings with system settings
      appSettings.theme = sysSettings.theme.dark ? 'dark' : 'light';
      if (sysSettings['12hour'] !== undefined) {
          appSettings.enable12Hour = sysSettings['12hour'];
      }
  }

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
    sysSettings.theme = createThemeColors(mode);
    if (sysSettings.clock === "shadowclk.app.js") {
      require('Storage').writeJSON("setting.json", sysSettings);
    }
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
    g.reset = function (n) {
      return g._reset().setColor(newTheme.fg).setBgColor(newTheme.bg);
    };
    g.clear = function (n) {
      if (n) g.reset();
      return g.clearRect(0, 0, g.getWidth(), g.getHeight());
    };
    g.clear(1);
    Bangle.drawWidgets();
    showMenu();
  }

  // Read current system theme setting
  function getCurrentTheme() {
    if (appSettings && appSettings.theme) {
      return appSettings.theme;
    }
    return sysSettings && sysSettings.theme && sysSettings.theme.dark ? 'dark' : 'light';
  }

  // Read the current time mode
  function getCurrentTimeMode() {
    if (appSettings && appSettings.enable12Hour !== undefined) {
      return appSettings.enable12Hour;
    }
    return sysSettings && sysSettings['12hour'] !== undefined ? sysSettings['12hour'] : undefined;
  }

  // Save settings to storage
  function writeSettings() {
    require('Storage').writeJSON("shadowclk.json", appSettings);
  }

  function writeTimeModeSetting() {
    if (sysSettings.clock === "shadowclk.app.js") {
        sysSettings['12hour'] = appSettings.enable12Hour;
        require('Storage').writeJSON("setting.json", sysSettings);
    }
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
          writeSettings();
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
        onchange: v => {
          appSettings.enableSuffix = v;
          writeSettings();
        }
      },
      'Lead Zero:': {
        value: appSettings.enableLeadingZero,
        onchange: v => {
          appSettings.enableLeadingZero = v;
          writeSettings();
        }
      },
      'Time Mode:': {
        value: appSettings.enable12Hour,
        format: v => v ? '12 Hr' : '24 Hr',
        onchange: v => {
          appSettings.enable12Hour = v;
          writeSettings();
          writeTimeModeSetting();
        }
      }
    });
  }
  // Initially show the menu
  showMenu();
})
