(function (back) {
  const FILE = "jwalk.json";
  const DEFAULTS = {
    totalDuration: 30,
    intervalDuration: 3,
    startMode: 0,
    modeBuzzerDuration: 1000,
    finishBuzzerDuration: 1500,
    showClock: 1,
    updateWhileLocked: 0
  };

  let settings = require("Storage").readJSON(FILE, 1) || DEFAULTS;

  function saveSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  function showSettingsMenu() {
    E.showMenu({
      '': { title: 'Japanese Walking' },
      '< Back': back,
      'Total Time (min)': {
        value: settings.totalDuration,
        min: 10, max: 60, step: 1,
        onchange: v => { settings.totalDuration = v; saveSettings(); }
      },
      'Interval (min)': {
        value: settings.intervalDuration,
        min: 1, max: 10, step: 1,
        onchange: v => { settings.intervalDuration = v; saveSettings(); }
      },
      'Start Mode': {
        value: settings.startMode,
        min: 0, max: 1,
        format: v => v ? "Intense" : "Relax",
        onchange: v => { settings.startMode = v; saveSettings(); }
      },
      'Display Clock': {
        value: settings.showClock,
        min: 0, max: 1,
        format: v => v ? "Show" : "Hide" ,
        onchange: v => { settings.showClock = v; saveSettings(); }
      },
      'Update UI While Locked': {
        value: settings.updateWhileLocked,
		min: 0, max: 1,
        format: v => v ? "Always" : "On Change",
        onchange: v => { settings.updateWhileLocked = v; saveSettings(); }
      },
      'Mode Buzz (ms)': {
        value: settings.modeBuzzerDuration,
        min: 0, max: 2000, step: 50,
        onchange: v => { settings.modeBuzzerDuration = v; saveSettings(); }
      },
      'Finish Buzz (ms)': {
        value: settings.finishBuzzerDuration,
        min: 0, max: 5000, step: 100,
        onchange: v => { settings.finishBuzzerDuration = v; saveSettings(); }
      },
    });
  }

  showSettingsMenu();
})