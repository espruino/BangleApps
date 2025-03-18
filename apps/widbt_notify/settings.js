(function(back) {

  var filename = "widbt_notify.json";

  // set Storage and load settings
  var storage = require("Storage");
  var settings = Object.assign({
    showWidget: true,
    buzzOnConnect: true,
    buzzOnLoss: true,
    hideConnected: true,
    showMessage: true,
    nextBuzz: 30000
  }, storage.readJSON(filename, true) || {});

  // setup boolean menu entries
  function boolEntry(key) {
    return {
      value: settings[key],
      onchange: v => {
        // change the value of key
        settings[key] = v;
        // write to storage
        storage.writeJSON(filename, settings);
      }
    };
  }

  // setup menu
  var menu = {
    "": {
      "title": "Bluetooth Widget WN"
    },
    "< Back": () => back(),
    "Show Widget": boolEntry("showWidget"),
    "Buzz on connect": boolEntry("buzzOnConnect"),
    "Buzz on loss": boolEntry("buzzOnLoss"),
    "Hide connected": boolEntry("hideConnected"),
    "Show Message": boolEntry("showMessage"),
    "Next Buzz": {
      value: settings.nextBuzz,
      step: 1000,
      min: 1000,
      max: 120000,
      wrap: true,
      format: v => (v / 1000) + "s",
      onchange: v => {
        settings.nextBuzz = v;
        storage.writeJSON(filename, settings);
      }
    }
  };

  // draw main menu
  E.showMenu(menu);

})