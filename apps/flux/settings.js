(function(back) {
  const FILE = "flux.settings.json";

  // Color list shared across fields
  const COLORS = [
    "White", "Black", "Red", "Blue", "Green",
    "Yellow", "Orange", "Purple", "Lime",
    "Cyan", "Pink", "Light Blue"
  ];

  const directions = [
    "Up > Down",
    "Down > Up"
  ];

  function colorIndex(name) {
    let i = COLORS.indexOf(name);
    return i >= 0 ? i : 0;
  }

  // Load existing settings with defaults
  let settings = Object.assign({
    direction: 0,
    bg: "Black",
    fg: "White",
    bg2: "Lime",
    fg2: "Black"
  }, require("Storage").readJSON(FILE, true) || {});

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  E.showMenu({
    "": { title: "Flux Watchface" },
    "< Back": back,
    "Direction": {
      value: settings.direction,
      min: 0, max: 1,
      format: i => directions[i],
      onchange: i => {
        settings.direction = i;
        writeSettings();
      }
    },
    "BG Color": {
      value: colorIndex(settings.bg),
      min: 0, max: COLORS.length - 1,
      format: i => COLORS[i],
      onchange: i => {
        settings.bg = COLORS[i];
        writeSettings();
      }
    },
    "FG Color": {
      value: colorIndex(settings.fg),
      min: 0, max: COLORS.length - 1,
      format: i => COLORS[i],
      onchange: i => {
        settings.fg = COLORS[i];
        writeSettings();
      }
    },
    "BG Highlight": {
      value: colorIndex(settings.bg2),
      min: 0, max: COLORS.length - 1,
      format: i => COLORS[i],
      onchange: i => {
        settings.bg2 = COLORS[i];
        writeSettings();
      }
    },
    "FG Highlight": {
      value: colorIndex(settings.fg2),
      min: 0, max: COLORS.length - 1,
      format: i => COLORS[i],
      onchange: i => {
        settings.fg2 = COLORS[i];
        writeSettings();
      }
    },
  });
})
