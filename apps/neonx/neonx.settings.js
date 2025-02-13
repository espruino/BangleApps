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
      showLock: false,
    };

    updateSettings();
  }

  let neonXSettings = storage.readJSON('neonx.json',1);

  if (!neonXSettings) resetSettings();

  let thicknesses = [1, 2, 3, 4, 5, 6, 7];

  const menu = {
    "" : { "title":"Neon X & IO"},
    "< Back": back,
    "Neon IO X": {
      value: !!neonXSettings.io,
      onchange: v => {
        neonXSettings.io = v?1:0;
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
      value: !!neonXSettings.showDate,
      onchange: v => {
        neonXSettings.showDate = v?1:0;
        updateSettings();
      }
    },
    'Fullscreen': {
      value: !!neonXSettings.fullscreen,
      onchange: v => {
        neonXSettings.fullscreen = v;
        updateSettings();
      },
    },
    'Show lock': {
      value: !!neonXSettings.showLock,
      onchange: v => {
        neonXSettings.showLock = v;
        updateSettings();
      },
    },
  };
  E.showMenu(menu);
})
