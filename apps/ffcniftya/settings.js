(function (back) {
  const settings = Object.assign({ showWeekNum: true }, require("Storage").readJSON("ffcniftya.json", true));

  E.showMenu({
    "": { "title": "Nifty-A Clock" },
    "< Back": () => back(),
    /*LANG*/"Show Week Number": {
      value: settings.showWeekNum,
      onchange: v => {
        settings.showWeekNum = v;
        require("Storage").writeJSON("ffcniftya.json", settings);
      }
    }
  });
})
