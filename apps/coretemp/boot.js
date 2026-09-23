var s = require("coretemp.migrate").run();

if (s.enabled === true) {
  require("CORESensor").enable();
}
