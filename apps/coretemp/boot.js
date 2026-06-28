var s = require("Storage").readJSON("coretemp.json", true) || {};

if (s.enabled === true) {
  require("CORESensor").enable();
}
