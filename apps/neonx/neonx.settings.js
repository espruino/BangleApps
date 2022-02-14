(function(back) {
  function updateSettings() {
    storage.write('neonx.json', neonXSettings);
  }

  function resetSettings() {
    neonXSettings = {
      thickness: 4,
      io: 0,
      showDate: 1
    };

    updateSettings();
  }

  let neonXSettings = storage.readJSON('neonx.json',1);

  if (!neonXSettings) resetSettings();

  let thicknesses = [1, 2, 3, 4, 5];

  const menu = {
    "" : { "title":"Neon X & IO"},
    "Neon IO X": {
      value: 0 | neonXSettings.io,
      min: 0, max: 1,
      format: v => v ? "On" : "Off",
      onchange: v => {
        neonXSettings.showDate = v;
        updateSettings();
      }
    },
    "Thickness": {
      value: 0 | thicknesses.indexOf(neonXSettings.thickness),
      min: 0, max: thicknesses.length - 1,
      format: v => thicknesses[v],
      onchange: v => {
        neonXSettings.thickness = thicknesses[v];
        updateSettings();
      }
    },
    "Date on touch": {
      value: 0 | neonXSettings.showDate,
      min: 0, max: 1,
      format: v => v ? "On" : "Off",
      onchange: v => {
        neonXSettings.showDate = v;
        updateSettings();
      }
    },
    "< back": back
  };
  E.showMenu(menu);
})
