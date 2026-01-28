(function() {
  var settings = require("Storage").readJSON("ahrm.json", 1) || {};
  if (settings.adaptive){
    eval(require("Storage").read("ahrm.adaptivemode.js"));
  }else{
    // If adaptive mode is not enabled, ensure HRM is off or handled by other apps
    Bangle.setHRMPower(0, "ahrm");
  }
})();
