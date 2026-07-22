(function (back) {
  var settings = Object.assign({
    hrm: 0,
    hrmTimeout: 0,
    wearCheckTemp: 0, // 0 = Movement/Z-Axis, > 0 = Temperature check
    stepGoal: 10000,
    stepGoalNotification: false
  }, require("Storage").readJSON("health.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("health.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Health Tracking" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"HRM Interval": {
      value: settings.hrm,
      min: 0,
      max: 3,
      format: v => [
        /*LANG*/"Off",
        /*LANG*/"3 min",
        /*LANG*/"10 min",
        /*LANG*/"Always"
      ][v],
      onchange: v => {
        settings.hrm = v;
        setSettings();
      }
    },

    /*LANG*/"HRM Stop Delay": {
      value: settings.hrmTimeout,
      min: 0,
      max: 60,
      step: 1,
      format: v => v === 0 ? /*LANG*/"None" : v + "s",
      onchange: v => {
        settings.hrmTimeout = v;
        setSettings();
      }
    },

    /*LANG*/"Wear Check": {
      value: settings.wearCheckTemp || 0,
      min: 0,
      max: 40,
      step: 0.5,
      format: v => v === 0 ? /*LANG*/"Movement" : v.toFixed(1) + "°C",
      onchange: v => {
        settings.wearCheckTemp = v;
        setSettings();
      }
    },

    /*LANG*/"Daily Step Goal": {
      value: settings.stepGoal,
      min: 0,
      max: 20000,
      step: 250,
      onchange: v => {
        settings.stepGoal = v;
        setSettings();
      }
    },

    /*LANG*/"Step Goal Notification": {
      value: "stepGoalNotification" in settings ? settings.stepGoalNotification : false,
      onchange: () => {
        settings.stepGoalNotification = !settings.stepGoalNotification;
        setSettings();
      }
    },
  });
})
