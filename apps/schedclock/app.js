(function () {

  // Load the settings page
  eval(require("Storage").read("schedclock.settings.js"))(()=>load());

})();
