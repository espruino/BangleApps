// Settings menu for Time calendar clock
(function(save) {
  ABR_DAY = require("locale") && require("locale").abday ? require("locale").abday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var FILE = "timecal.settings.json";
  var settings = Object.assign( // Load settings and use defaults
    {
      shwDate:1, //0:none, 1:locale, 2:month short, 3:month shortyear week
        
      wdStrt:0, //identical to getDay() 0->Su, 1->Mo, ... //Issue #1154: weekstart So/Mo, -1 for always focus/center today

      tdyNumClr:3, //0:fg, 1:red=#E00, 2:green=#0E0, 3:blue=#00E
      tdyMrkr:0, //0:none, 1:circle, 2:rectangle, 3:filled
      tdyMrkClr:2, //1:red=#E00, 2:green=#0E0, 3:blue=#00E
      tdyMrkPxl:3, //px

      suClr:1, //0:fg, 1:red=#E00, 2:green=#0E0, 3:blue=#00E
      //phColor:"#E00", //public holiday

      calBrdr:false 
    }, 
    require('Storage').readJSON(FILE, true) || {}
  );

  const SETTINGS_AT_START = Object.assign(settings); //hardcopy of current and defaults

  var saveSettings = () => {
    require('Storage').writeJSON(FILE, settings);
  };

  var restoreAndExitSettings = () => {
    require('Storage').writeJSON(FILE, SETTINGS_AT_START);
    E.showMenu();
  };

  var showMainMenu = () => {
    E.showMenu({
      "": {
        "title": /*LANG*/"Time cal clock"
      },
      /*LANG*/"< Save": () => save(),
      /*LANG*/"Show date": {
        value: settings.shwDate,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"locale", /*LANG*/"M", /*LANG*/"m.Y #W"][v],
        onchange: v => {
          settings.shwDate = v;
          saveSettings();
        }
      },
      /*LANG*/"Start wday": {
        value: settings.wdStrt,
        min: -1, max: 6,
        format: v => v>=0 ? ABR_DAY[v] : /*LANG*/"today",
        onchange: v => {
          settings.wdStrt = v;
          saveSettings();
        }
      },
      /*LANG*/"Su color": {
        value: settings.suClr,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"red", /*LANG*/"green", /*LANG*/"blue"][v],
        onchange: v => {
          settings.suClr = v;
          saveSettings();
        }
      },
      /*LANG*/"Border": {
        value: settings.calBrdr,
        format: v => v ? "show" : "none",
        onchange: v => {
          settings.calBrdr = v;
          saveSettings();
        }
      },
      /*LANG*/"Today settings": () => {
        showTodayMenu();
      },
      /*LANG*/"< Cancel": () => restoreAndExitSettings()
    });
  };

  var showTodayMenu = () => {
    E.showMenu({
      "": {
        "title": /*LANG*/"Today settings"
    },
    "< Back": () => showMainMenu(),
    /*LANG*/"Color": {
        value: settings.tdyNumClr,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"red", /*LANG*/"green", /*LANG*/"blue"][v],
        onchange: v => {
          settings.tdyNumClr = v;
          saveSettings();
        }
      },
      /*LANG*/"Marker": {
        value: settings.tdyMrkr,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"circle", /*LANG*/"rectangle", /*LANG*/"filled"][v],
        onchange: v => {
          settings.tdyMrkr = v;
          saveSettings();
        }
      },
      /*LANG*/"Mrk.Color": {
        value: settings.tdyMrkClr,
        min: 0, max: 2,
        format: v => [/*LANG*/"red", /*LANG*/"green", /*LANG*/"blue"][v],
        onchange: v => {
          settings.tdyMrkClr = v;
          saveSettings();
        }
      },
      /*LANG*/"Mrk.Size": {
        value: settings.tdyMrkPxl,
        min: 0, max: 10,
        format: v => v+"px",
        onchange: v => {
          settings.tdyMrkPxl = v;
          saveSettings();
        }
      },
    /*LANG*/"< Cancel": () => restoreAndExitSettings()
  });
  };

  showMainMenu();
});
