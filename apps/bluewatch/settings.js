(function (back) {
  const FILE = "bluewatch.settings.json";
  // Load settings
  var settings = Object.assign(
    {
      overrideGPS: true
    },
    require("Storage").readJSON(FILE, true) || {}
  );

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "": { title: "BlueWatch" },
    "< Back": () => back(),
    "Overwrite GPS": {
      value: !!settings.overrideGPS,
      onchange: (v) => {
        settings.overrideGPS = v;
        writeSettings();
      }
    }
  });
})
