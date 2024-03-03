(function(back) {
  const SETTINGS_FILE = "lcars.setting.json";

  // initialize with default settings...
  const storage = require('Storage')
  let settings = {
    alarm: -1,
    dataRow1: "Steps",
    dataRow2: "HRM",
    dataRow3: "Battery",
    speed: "kph",
    fullscreen: false,
    themeColor1BG: "#FF9900",
    themeColor2BG: "#FF00DC",
    themeColor3BG: "#0094FF",
    disableAlarms: false,
    disableData: false,
    randomColors: false,
  };
  let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
  for (const key in saved_settings) {
    settings[key] = saved_settings[key]
  }

  function save() {
    storage.write(SETTINGS_FILE, settings)
  }


  var dataOptions = ["Steps", "Battery", "BattVolt", "VREF", "HRM", "Temp", "Humidity", "Wind", "Altitude", "CoreT"];
  var speedOptions = ["kph", "mph"];
  var color_options = [
  'Green', 'Orange', 'Cyan', 'Purple', 'Red', 'Blue', 'Yellow', 'White',
  'Purple', 'Pink', 'Light Green', 'Brown', 'Turquoise', 'Magenta', 'Lime',
  'Gold', 'Sky Blue', 'Rose', 'Lavender', 'Amber', 'Indigo', 'Teal',
  'Crimson', 'Maroon', 'Firebrick', 'Dark Red', 'Aqua', 'Emerald', 'Royal Blue',
  'Sunset Orange', 'Turquoise Blue', 'Hot Pink', 'Goldenrod', 'Deep Sky Blue'
];

var bg_code = [
  '#00ff00', '#FF9900', '#0094FF', '#FF00DC', '#ff0000', '#0000ff', '#ffef00', '#FFFFFF',
  '#FF00FF', '#6C00FF', '#99FF00', '#8B4513', '#40E0D0', '#FF00FF', '#00FF00', '#FFD700',
  '#87CEEB', '#FF007F', '#E6E6FA', '#FFBF00', '#4B0082', '#008080', '#DC143C', '#800000',
  '#B22222', '#8B0000', '#00FFFF', '#008000', '#4169E1', '#FF4500', '#40E0D0', '#FF69B4',
  '#DAA520', '#00BFFF'
];
  E.showMenu({
    '': { 'title': 'LCARS Clock' },
    '< Back': back,
    'Row 1': {
      value: 0 | dataOptions.indexOf(settings.dataRow1),
      min: 0, max: 8,
      format: v => dataOptions[v],
      onchange: v => {
        settings.dataRow1 = dataOptions[v];
        save();
      },
    },
    'Row 2': {
      value: 0 | dataOptions.indexOf(settings.dataRow2),
      min: 0, max: 8,
      format: v => dataOptions[v],
      onchange: v => {
        settings.dataRow2 = dataOptions[v];
        save();
      },
    },
    'Row 3': {
      value: 0 | dataOptions.indexOf(settings.dataRow3),
      min: 0, max: 8,
      format: v => dataOptions[v],
      onchange: v => {
        settings.dataRow3 = dataOptions[v];
        save();
      },
    },
    'Full Screen': {
      value: settings.fullscreen,
      onchange: () => {
        settings.fullscreen = !settings.fullscreen;
        save();
      },
    },
    'Speed': {
      value: 0 | speedOptions.indexOf(settings.speed),
      min: 0, max: 1,
      format: v => speedOptions[v],
      onchange: v => {
        settings.speed = speedOptions[v];
        save();
      },
    },
    'Theme Color 1': {
      value: 0 | bg_code.indexOf(settings.themeColor1BG),
      min: 0, max: 34,
      format: v => color_options[v],
      onchange: v => {
        settings.themeColor1BG = bg_code[v];
        save();
      },
    },
    'Theme Color 2': {
      value: 0 | bg_code.indexOf(settings.themeColor2BG),
      min: 0, max: 34,
      format: v => color_options[v],
      onchange: v => {
        settings.themeColor2BG = bg_code[v];
        save();
      },
    },
    'Theme Color 3': {
      value: 0 | bg_code.indexOf(settings.themeColor3BG),
      min: 0, max: 34,
      format: v => color_options[v],
      onchange: v => {
        settings.themeColor3BG = bg_code[v];
        save();
      },
    },
    'Disable alarm functionality': {
      value: settings.disableAlarms,
      onchange: () => {
        settings.disableAlarms = !settings.disableAlarms;
        save();
      },
    },
    'Disable data pages functionality': {
      value: settings.disableData,
      onchange: () => {
        settings.disableData = !settings.disableData;
        save();
      },
    },
    'Random colors on open': {
      value: settings.randomColors,
      onchange: () => {
        settings.randomColors = !settings.randomColors;
        save();
      },
    },
  });
})
