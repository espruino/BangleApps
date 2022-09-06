let settings = require("Storage").readJSON("6tilesclk.settings.json", true)||{};
function save(key, value) {
  settings[key] = value;
  require("Storage").writeJSON("6tilesclk.settings.json", settings);
}

let menu = {
  "": {"title": /*LANG*/"6 Tiles Clock"},
};
require("ClockFace_menu").addItems(menu, save, {
  showDate: settings.showDate,
  loadWidgets: settings.loadWidgets,
});
E.showMenu(menu);