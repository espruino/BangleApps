(function(back) {
  let menu = {
    "": {"title": /*LANG*/"Analog Clock"},
    /*LANG*/"< Back": back,
  };
  require("ClockFace_menu").addSettingsFile(menu, "saclock.settings.json", [
    "loadWidgets"
  ]);
  E.showMenu(menu);
});
