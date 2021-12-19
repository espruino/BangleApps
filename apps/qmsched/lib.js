/**
 * Apply LCD options for given mode
 * @param {int} mode Quiet Mode
 */
exports.applyOptions = function(mode) {
  const s = require("Storage").readJSON(mode ? "qmsched.json" : "setting.json", 1) || {};
  const get = (k, d) => k in s ? s[k] : d;
  Bangle.setOptions(get("options", {}));
  Bangle.setLCDBrightness(get("brightness", 1));
  Bangle.setLCDTimeout(get("timeout", 10));
};
/**
 * Set new Quiet Mode and apply Bangle options
 * @param {int} mode Quiet Mode
 */
exports.setMode = function(mode) {
  require("Storage").writeJSON("setting.json", Object.assign(
    require("Storage").readJSON("setting.json", 1) || {},
    {quiet:mode}
  ));
  exports.applyOptions(mode);
  if (typeof WIDGETS === "object" && "qmsched" in WIDGETS) WIDGETS["qmsched"].draw();
};
