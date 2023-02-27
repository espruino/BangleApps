(function () {
  // load variable before defining functions cause it can trigger a ReferenceError
  const activityreminder = require("activityreminder");
  const storage = require("Storage");
  let activityreminder_data = activityreminder.loadData();

  function run() {
    E.showPrompt("Inactivity detected", {
      title: "Activity reminder",
      buttons: { "Ok": 1, "Dismiss": 2, "Pause": 3 }
    }).then(function (v) {
      if (v == 1) {
        activityreminder_data.okDate = new Date();
      }
      if (v == 2) {
        activityreminder_data.dismissDate = new Date();
      }
      if (v == 3) {
        activityreminder_data.pauseDate = new Date();
      }
      activityreminder.saveData(activityreminder_data);
      load();
    });

    // Obey system quiet mode:
    if (!(storage.readJSON('setting.json', 1) || {}).quiet) {
      Bangle.buzz(400);
    }

    if ((storage.readJSON('activityreminder.s.json', 1) || {}).unlock) {
      Bangle.setLocked(false);
      Bangle.setLCDPower(1);
    }

    setTimeout(load, 20000);
  }

  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  run();

})();
