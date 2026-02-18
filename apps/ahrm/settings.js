(function (back) {
  // Load settings, providing a default for 'adaptive' if not present.
  var settings = Object.assign({
    adaptive: false
  }, require("Storage").readJSON("ahrm.json", true) || {});

  function setSettings() {
    require("Storage").writeJSON("ahrm.json", settings);
  }

  E.showMenu({
    "": { title: /*LANG*/"AHRM" },

    /*LANG*/"< Back": () => back(),

    /*LANG*/"ADAPTIVE HRM": {
      value: "adaptive" in settings ? settings.adaptive : false,
      onchange: () => {
        settings.adaptive = !settings.adaptive;
        setSettings();
      }
    },
  });
})
