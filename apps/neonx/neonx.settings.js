(function(back) {
  function updateSettings() {
    storage.write('neonx.json', neonXSettings);
  }

  function resetSettings() {
    neonXSettings = {
      thickness: 4,
      io: 0,
      showDate: 1,
      fullscreen: false,
    };

    updateSettings();
  }

  let neonXSettings = storage.readJSON('neonx.json',1);

  if (!neonXSettings) resetSettings();

  let thicknesses = [1, 2, 3, 4, 5, 6];

  const menu = {
    "" : { "title":"Neon X & IO"},
    "< Back": back,
    "Neon IO X": {
      value: 0 | neonXSettings.io,
      min: 0, max: 1,
      format: v => v ? "On" : "Off",
      onchange: v => {
        neonXSettings.io = v;
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
    'Fullscreen': {
      value: false | neonXSettings.fullscreen,
      format: () => (neonXSettings.fullscreen ? 'Yes' : 'No'),
      onchange: () => {
        neonXSettings.fullscreen = !neonXSettings.fullscreen;
        updateSettings();
      },
    },
  };
  E.showMenu(menu);
})
