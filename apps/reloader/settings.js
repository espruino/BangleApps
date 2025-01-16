(function (back) {
  let settings = Object.assign({
    reload_delay_in_hours: 2,
  }, require("Storage").readJSON("reloader.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("reloader.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"Reloader" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"Reload Delay in Hours": {
      value: settings.reminder_start_time,
      min: 0,
      max: 24,
      step: 1,
      onchange: v => {
        settings.reminder_start_time = v;
        setSettings();
      }
    }
  });
});