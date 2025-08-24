(function(back) {
  const FILE = "teatimer.json";
  const DEFAULTS = {
    timerDuration: 150,       // Initial timer duration in seconds
    bigJump: 60,          // Jump for vertical swipes
    smallJump: 15        // Jump for horizontal swipes
  };

  let settings = require("Storage").readJSON(FILE, 1) || DEFAULTS;

  function saveSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  function showSettingsMenu() {
    E.showMenu({
      '': { title: 'Tea Timer Settings' },
      '< Back': back,
      'Default Duration (sec)': {
        value: settings.timerDuration,
        min: 5, max: 900, step: 5,
        onchange: v => {
          settings.timerDuration = v;
          saveSettings();
        }
      },
      'Swipe Up/Down (sec)': {
        value: settings.bigJump,
        min: 5, max: 300, step: 5,
        onchange: v => {
          settings.bigJump = v;
          saveSettings();
        }
      },
      'Swipe Left/Right (sec)': {
        value: settings.smallJump,
        min: 5, max: 60, step: 5,
        onchange: v => {
          settings.smallJump = v;
          saveSettings();
        }
      }
    });
  }

  showSettingsMenu();
})
