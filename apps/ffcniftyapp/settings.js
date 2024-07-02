
(function (back) {
  var DEFAULTS = {
    'showWeekNum': false,
    'showWeather': false,
    'showSteps': false,
  };
  let settings = require('Storage').readJSON("ffcniftyapp.json", 1) || DEFAULTS;
  E.showMenu({
    
    "": { "title": "Nifty-A Clock ++" },
    "< Back": () => back(),
    /*LANG*/"Show Week Number": {
      value: settings.showWeekNum,
      onchange: v => {
        settings.showWeekNum = v;
        require("Storage").writeJSON("ffcniftyapp.json", settings);
      }
    },
    /*LANG*/"Show Weather": {
      value: settings.showWeather,
      onchange: w => {
        settings.showWeather = w;
        require("Storage").writeJSON("ffcniftyapp.json", settings);
      }
    },
        /*LANG*/"Show Steps": {
          value: settings.showSteps,
          onchange: z => {
            settings.showSteps = z;
            require("Storage").writeJSON("ffcniftyapp.json", settings);
          }
        }
  });
})
