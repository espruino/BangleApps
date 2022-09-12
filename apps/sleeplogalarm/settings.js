(function(back) {
  // define settings filename
  var filename = "sleeplogalarm.json";

  // define default vaules
  var defaults = {
  };

  // assign loaded settings to default values
  var settings = Object.assign(defaults, require("Storage").readJSON(filename, true) || {});

  // write change to storage
  function writeSetting() {
    require("Storage").writeJSON(filename, settings);
  }

  // show main menu
  function showMain(selected) {
    // set menu
    var mainMenu = {
      "": {
        title: "Sleep Log Alarm",
        selected: selected
      },
      /*LANG*/"< Back": () => back(),
      /*LANG*/"up to": {
        value: settings.earlier,
        step: 10,
        min: 10,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v + "min earlier",
        onchange: v => {
          settings.earlier = v;
          writeSetting();
        }
      },
      /*LANG*/"Enabled": {
        value: settings.enabled,
        onchange: v => {
          settings.enabled = v;
          writeSetting();
        }
      }
    };
    var menu = E.showMenu(mainMenu);
  }

  // draw main menu
  showMain();
})
