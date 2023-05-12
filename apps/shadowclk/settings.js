(function (back) {
  let teletextColors = ["#000", "#f00", "#0f0", "#ff0", "#00f", "#f0f", "#0ff", "#fff"];
  let teletextColorNames = ["Black", "Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];

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

  function updateTheme(mode, newTheme) {
    g.theme = newTheme;
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

  function showMenu() {
    let sysSettings = require('Storage').readJSON("setting.json", 1) || {};
    // Load and set default settings
    let appSettings = Object.assign({
      color: teletextColors[6],
      theme: 'light',
      enableSuffix: true,
      enableLeadingZero: false,
      enable12Hour: '24hour' // default time mode
    }, require('Storage').readJSON("shadowclk.json", true) || {});

    let currentTheme = sysSettings.theme ? (sysSettings.theme.dark ? 'dark' : 'light') : appSettings.theme;
    let currentTimeMode = sysSettings['12hour'] ? '12hour' : '24hour';

    appSettings.theme = currentTheme;
    appSettings.enable12Hour = currentTimeMode;

    E.showMenu({
      "": {
        "title": "Shadow Clock"
      },
      "< Back": () => {
        // Save settings to storage
        appSettings.enable12Hour = appSettings.enable12Hour === '12hour' ? '12hour' : '24hour';
        require('Storage').writeJSON("shadowclk.json", appSettings);
        back();
      },
      'Theme:': {
        value: (appSettings.theme === 'dark'),
        format: v => v ? "Dark" : "Light",
        onchange: v => {
          appSettings.theme = v ? 'dark' : 'light';
          let newTheme = createThemeColors(v);
          // Save theme to storage
          sysSettings.theme = newTheme;
          require('Storage').writeJSON("setting.json", sysSettings);
          updateTheme(v, newTheme);
        }
      },
      'Color:': {
        value: teletextColors.indexOf(appSettings.color),
        min: 0,
        max: 7,
        onchange: v => {
          appSettings.color = teletextColors[v];
        },
        format: v => teletextColorNames[v]
      },
      'Date Suffix:': {
        value: appSettings.enableSuffix,
        format: v => v ? 'Yes' : 'No',
        onchange: v => {
          appSettings.enableSuffix = v;
        }
      },
      'Lead Zero:': {
        value: appSettings.enableLeadingZero,
        format: v => v ? 'Yes' : 'No',
        onchange: v => {
          appSettings.enableLeadingZero = v;
        }
      },
      'Time Mode:': {
        value: (appSettings.enable12Hour === '12hour'),
        format: v => v ? '12 Hr' : '24 Hr',
        onchange: v => {
          let mode = v ? '12hour' : '24hour';
          appSettings.enable12Hour = mode;
          sysSettings['12hour'] = mode === '12hour';
          require('Storage').writeJSON("setting.json", sysSettings);
        }
      }
    });
  }
  // Initially show the menu
  showMenu();
});
