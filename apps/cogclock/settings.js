(function(back) {
  let menu = {
    "": {"title": /*LANG*/"Cog Clock"},
    /*LANG*/"< Back": back,
  };
  require("ClockFace_menu").addSettingsFile(menu, "cogclock.settings.json", [
    "showDate", "loadWidgets"
  ]);
  E.showMenu(menu);
});
