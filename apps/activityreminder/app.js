(function () {
  // todo do something more interesting than just showing the settings
  /*
  // load variable before defining functions cause it can trigger a ReferenceError
  const activityreminder = require("activityreminder");
  const storage = require("Storage");
  const activityreminder_settings = activityreminder.loadSettings();
  let activityreminder_data = activityreminder.loadData();
  */

  function run() {
    eval(storage.read("activityreminder.settings.js"))(() => load());
  }

  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  run();

})();