/**
 * Apply appropriate theme for given mode
 * @param {int} mode Quiet Mode
 */
function switchTheme(mode) {
  function cl(x) { return g.setColor(x).getColor(); }
  const readTheme = function(name) {
    const n = require("Storage").readJSON(name);
    return {
      fg:cl(n.fg), bg:cl(n.bg),
      fg2:cl(n.fg2), bg2:cl(n.bg2),
      fgH:cl(n.fgH), bgH:cl(n.bgH),
      dark:n.dark
    };
  }
  const s = require("Storage").readJSON("setting.json", 1) || {};
  // default themes, copied from settings.js:showThemeMenu()

  const q = require("Storage").readJSON("qmsched.json", 1) || {};
  let quietTheme = {
    // 'Dark BW'
    fg:cl("#fff"), bg:cl("#000"),
    fg2:cl("#fff"), bg2:cl("#004"),
    fgH:cl("#fff"), bgH:cl("#00f"),
    dark:true
  };
  let normalTheme = {
    // 'Light BW'
    fg:cl("#000"), bg:cl("#fff"),
    fg2:cl("#000"), bg2:cl("#cff"),
    fgH:cl("#000"), bgH:cl("#0ff"),
    dark:false
  };

  let miss = false;

  // ensure referenced theme files actually exist or remove reference
  if (q.normalTheme && require("Storage").read(q.normalTheme) == undefined){
    delete q.normalTheme;
    miss = true;
  }
  if (q.quietTheme && require("Storage").read(q.quietTheme) == undefined){
    delete q.quietTheme;
    miss = true;
  }
  if (miss) 
    require("Storage").writeJSON("qmsched.json", q);

  // load theme files
  if (q.normalTheme)
    normalTheme = readTheme(q.normalTheme);
  if (q.quietTheme)
    quietTheme = readTheme(q.quietTheme);


  const newTheme = mode ? quietTheme : normalTheme;
  let changed = false;
  for (const c in newTheme) {
      if (!(c in g.theme) || newTheme[c] !== g.theme[c]) {
          changed = true;
          break;
      }
  }
  if (changed) {
    s.theme = newTheme;
    require("Storage").writeJSON("setting.json", s);
    // reload clocks with new theme, otherwise just wait for user to switch apps
    if (Bangle.CLOCK) load(global.__FILE__);
  }
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
  if (global.setAppQuietMode) setAppQuietMode(mode); // current app knows how to update itself
};
