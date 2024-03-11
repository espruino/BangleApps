(function(back) {
  const FILE = "sportmode.json";
  const settings = Object.assign({
    mode: -1,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // see Espruino/libs/misc/vc31_binary/algo.h
  const SPORT_MODES = [
    /*LANG*/"Normal",
    /*LANG*/"Running",
    /*LANG*/"Ride bike",
    /*LANG*/"Jump rope",
    /*LANG*/"Swimming",
    /*LANG*/"Badminton",
    /*LANG*/"Table tennis",
    /*LANG*/"Tennis",
    /*LANG*/"Climbing",
    /*LANG*/"Walking",
    /*LANG*/"Basketball",
    /*LANG*/"Football",
    /*LANG*/"Baseball",
    /*LANG*/"Volleyball",
    /*LANG*/"Cricket",
    /*LANG*/"Rugby",
    /*LANG*/"Hockey",
    /*LANG*/"Dance",
    /*LANG*/"Spinning",
    /*LANG*/"Yoga",
    /*LANG*/"Sit up",
    /*LANG*/"Treadmill",
    /*LANG*/"Gymnastics",
    /*LANG*/"Boating",
    /*LANG*/"Jumping jack",
    /*LANG*/"Free training",
  ];

  E.showMenu({
    "" : { "title" : /*LANG*/"HRM sport mode", remove: () => {
      // nothing to do
      }
    },
    "< Back" : () => back(),
    /*LANG*/'Sport mode': {
      value: settings.mode,
      min: -1, max: SPORT_MODES.length-1,
      format: v => v === -1 ? /*LANG*/"Auto" : SPORT_MODES[v],
      onchange: v => {
        settings.mode = v;
        writeSettings();
        Bangle.setOptions({hrmSportMode: settings.mode});
      }
    },
  });
})
