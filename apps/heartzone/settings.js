(function(back) {
  var FILE = "heartzone.settings.json";
  var settings = Object.assign({
    minBpm: 120,
    maxBpm: 160,
    minConfidence: 60,
    minBuzzIntervalSeconds: 5,
    tooLowBuzzDurationMillis: 200,
    tooHighBuzzDurationMillis: 1000,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "HeartZone" },
    "< Save & Return" : () => { writeSettings(); back(); },
    'Min BPM': {value: 0 | settings.minBpm, min: 80, max: 200, step: 10, onchange: v => { settings.minBpm = v; }},
    'Max BPM': {value: 0 | settings.maxBpm, min: 80, max: 200, step: 10, onchange: v => { settings.maxBpm = v; }},
    'Min % conf.': {value: 0 | settings.minConfidence, min: 30, max: 100, step: 5, onchange: v => { settings.minConfidence = v; }},
    'Min buzz int. (sec)': {value: 0 | settings.minBuzzIntervalSeconds, min: 1, max: 30, onchange: v => { settings.minBuzzIntervalSeconds = v; }},
    'BPM too low buzz (ms)': {value: 0 | settings.tooLowBuzzDurationMillis, min: 0, max: 3000, step: 100, onchange: v => { settings.tooLowBuzzDurationMillis = v; }},
    'BPM too high buzz (ms)': {value: 0 | settings.tooHighBuzzDurationMillis, min: 0, max: 3000, step: 100, onchange: v => { settings.tooHighBuzzDurationMillis = v; }},
  });
})
