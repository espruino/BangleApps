(function (back) {
  var FILE = "gipy.json";
  // Load settings
  var settings = Object.assign(
    {
      keep_gps_alive: false,
      max_speed: 35,
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
    "keep gps alive": {
      value: !!settings.keep_gps_alive, // !! converts undefined to false
      format: (v) => (v ? "Yes" : "No"),
      onchange: (v) => {
        settings.keep_gps_alive = v;
        writeSettings();
      },
    },
    "max speed": {
      value: 35 | settings.max_speed, // 0| converts undefined to 0
      min: 0,
      max: 130,
      onchange: (v) => {
        settings.max_speed = v;
        writeSettings();
      },
    },
  });
});
