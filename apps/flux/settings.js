(function(back) {
  const FILE = "flex.settings.json";

  // Load existing settings with defaults
  let settings = Object.assign({
    "24hour": false,
    bg: "Black",
    fg: "White",
    bg2: "Lime",
    fg2: "Black"
  }, require("Storage").readJSON(FILE, true) || {});

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  E.showMenu({
    "": { title: "Flex Watchface" },
    "< Back": back,
    "24 Hour Time": {
      value: !!settings["24hour"],
      onchange: v => {
        settings["24hour"] = v;
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

  // Color list shared across fields
  const COLORS = [
    "White", "Black", "Red", "Blue", "Green",
    "Yellow", "Orange", "Purple", "Lime",
    "Cyan", "Pink", "Light Blue"
  ];

  function colorIndex(name) {
    let i = COLORS.indexOf(name);
    return i >= 0 ? i : 0;
  }
});
