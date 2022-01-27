(function(back) {
  const SETTINGS_FILE = "run.json";
  var ExStats = require("exstats");
  var statsList = ExStats.getList();
  statsList.unshift({name:"-",id:""}); // add blank menu item
  var statsIDs = statsList.map(s=>s.id);

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = Object.assign({
    B1 : "dist",
    B2 : "time",
    B3 : "pacea",
    B4 : "bpm",
    B5 : "step",
    B6 : "caden",
    paceLength : 1000
  }, storage.readJSON(SETTINGS_FILE, 1) || {});
  function save() {
    storage.write(SETTINGS_FILE, settings)
  }

  function getBoxChooser(boxID) {
    return {
      min :0, max: statsIDs.length-1,
      value: Math.max(statsIDs.indexOf(settings[boxID]),0),
      format: v => statsList[v].name,
      onchange: v => {
        settings[boxID] = statsIDs[v];
        save();
      },
    }
  }

  var paceNames = ["1000m","1 mile","1/2 Mthn", "Marathon",];
  var paceAmts = [1000,1609,21098,42195];
  E.showMenu({
    '': { 'title': 'Run' },
    '< Back': back,
    'Pace': {
      min :0, max: paceNames.length-1,
      value: Math.max(paceAmts.indexOf(settings.paceLength),0),
      format: v => paceNames[v],
      onchange: v => {
        settings.paceLength = paceAmts[v];
        print(settings);
        save();
      },
    },
    'Box 1': getBoxChooser("B1"),
    'Box 2': getBoxChooser("B2"),
    'Box 3': getBoxChooser("B3"),
    'Box 4': getBoxChooser("B4"),
    'Box 5': getBoxChooser("B5"),
    'Box 6': getBoxChooser("B6"),
  })
})
