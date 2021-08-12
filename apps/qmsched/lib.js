/**
 * Set new Quiet Mode and apply Bangle options
 * @param {int} mode Quiet Mode
 */
exports.setMode = function(mode) {
  let s = require("Storage").readJSON("setting.json", 1) || {};
  s.quiet = mode;
  require("Storage").writeJSON("setting.json", s);
  if (s.options) Bangle.setOptions(s.options);
  if (mode && s.qmOptions) Bangle.setOptions(s.qmOptions);
  if (mode && s.qmBrightness) {
    if (s.qmBrightness!=1) Bangle.setLCDBrightness(s.qmBrightness);
  } else {
    if (s.brightness && s.brightness!=1) Bangle.setLCDBrightness(s.brightness);
  }
  if (mode && s.qmTimeout) Bangle.setLCDTimeout(s.qmTimeout);
  if (typeof (WIDGETS)!=="undefined" && "qmsched" in WIDGETS) {WIDGETS["qmsched"].draw();}
};