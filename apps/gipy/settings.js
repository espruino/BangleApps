(function (back) {
  var FILE = "gipy.json";
  // Load settings
  var settings = Object.assign(
    {
      lost_distance: 50,
    },
    require("Storage").readJSON(FILE, true) || {}
  );

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "": { title: "Gipy" },
    "< Back": () => back(),
    "lost distance": {
      value: 50 | settings.lost_distance, // 0| converts undefined to 0
      min: 10,
      max: 500,
      onchange: (v) => {
        settings.max_speed = v;
        writeSettings();
      },
    },
  });
});
