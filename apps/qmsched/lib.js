/**
 * Apply appropriate theme for given mode
 * @param {int} mode Quiet Mode
 */
function switchTheme(mode) {
  if (!!mode === g.theme.dark) return; // nothing to do
  let s = require("Storage").readJSON("setting.json", 1) || {};
  // default themes, copied from settings.js:showThemeMenu()
  function cl(x) { return g.setColor(x).getColor(); }
  s.theme = mode ? {
    // 'Dark BW'
    fg: cl("#fff"), bg: cl("#000"),
    fg2: cl("#0ff"), bg2: cl("#000"),
    fgH: cl("#fff"), bgH: cl("#00f"),
    dark: true
  } : {
    // 'Light BW'
    fg: cl("#000"), bg: cl("#fff"),
    fg2: cl("#000"), bg2: cl("#cff"),
    fgH: cl("#000"), bgH: cl("#0ff"),
    dark: false
  };
  require("Storage").writeJSON("setting.json", s);
  if (typeof __FILE__ === 'string') { // undefined means it loaded the default clock
    const info = require("Storage").readJSON(__FILE__.split(".")[0]+".info", 1);
    if (info && info.type!=="clock") { // info can have no type (but then it isn't a clock)
      return; // not a clock: wait for user to switch apps
    }
  }
  // current app is a clock: reload it with new theme
  load(global.__FILE__);
}
/**
 * Apply LCD options and theme for given mode
 * @param {int} mode Quiet Mode
 */
exports.applyOptions = function(mode) {
  const s = require("Storage").readJSON(mode ? "qmsched.json" : "setting.json", 1) || {};
  const get = (k, d) => k in s ? s[k] : d;
  Bangle.setOptions(get("options", {}));
  Bangle.setLCDBrightness(get("brightness", 1));
  Bangle.setLCDTimeout(get("timeout", 10));
  if ((require("Storage").readJSON("qmsched.json", 1) || {}).switchTheme) switchTheme(mode);
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
  if (global.__FILE__ === "qmsched.app.js") setAppMode(mode);
};
