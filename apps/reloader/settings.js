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
      value: settings.reload_delay_in_hours,
      min: 0,
      max: 24,
      step: 1,
      onchange: v => {
        settings.reload_delay_in_hours = v;
        setSettings();
      }
    }
  });
});