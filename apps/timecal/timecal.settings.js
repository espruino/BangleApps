// Settings menu for Time calendar clock
(function(exit) {
  ABR_DAY = require("locale") && require("locale").abday ? require("locale").abday : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var FILE = "timecal.validSttngs.json";

  const DEFAULTS = {
    shwDate:1, //0:none, 1:locale, 2:month, 3:monthshort.year #week
      
    wdStrt:0, //identical to getDay() 0->Su, 1->Mo, ... //Issue #1154: weekstart So/Mo, -1 for use today

    tdyNumClr:3, //0:fg, 1:red=#E00, 2:green=#0E0, 3:blue=#00E
    tdyMrkr:0, //0:none, 1:circle, 2:rectangle, 3:filled
    tdyMrkClr:2, //1:red=#E00, 2:green=#0E0, 3:blue=#00E
    tdyMrkPxl:3, //px

    suClr:1, //0:fg, 1:red=#E00, 2:green=#0E0, 3:blue=#00E
    //phColor:"#E00", //public holiday

    calBrdr:false 
  };
  validSttngs = require("Storage").readJSON("timecal.validSttngs.json", 1) || {};
  for (const k in validSttngs) if (!DEFAULTS.hasOwnProperty(k)) delete this.validSttngs[k]; //remove invalid settings
  for (const k in DEFAULTS) if(!validSttngs.hasOwnProperty(k)) validSttngs[k] = DEFAULTS[k]; //assign missing defaults

  var changedSttngs = Object.assign({}, validSttngs);

  var saveExitSettings = () => {
    require('Storage').writeJSON(FILE, changedSttngs);
    exit();
  };

  var cancelExitSettings = () => {
    require('Storage').writeJSON(FILE, validSttngs);
    exit();
  };

  var showMainMenu = () => {
    E.showMenu({
      "": {
        "title": "TimeCal "+ /*LANG*/"settings"
      },
      /*LANG*/"< Save": () => saveExitSettings(),
      /*LANG*/"Show date": {
        value: validSttngs.shwDate,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"locale", /*LANG*/"M", /*LANG*/"m.Y #W"][v],
        onchange: v => validSttngs.shwDate = v
      },
      /*LANG*/"Start wday": {
        value: validSttngs.wdStrt,
        min: -1, max: 6,
        format: v => v>=0 ? ABR_DAY[v] : /*LANG*/"today",
        onchange: v => validSttngs.wdStrt = v
      },
      /*LANG*/"Su color": {
        value: validSttngs.suClr,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"red", /*LANG*/"green", /*LANG*/"blue"][v],
        onchange: v => validSttngs.suClr = v
      },
      /*LANG*/"Border": {
        value: validSttngs.calBrdr,
        format: v => v ? /*LANG*/"show" : /*LANG*/"none",
        onchange: v => validSttngs.calBrdr = v
      },
      /*LANG*/"Today settings": () => {
        showTodayMenu();
      },
      /*LANG*/"< Cancel": () => cancelExitSettings()
    });
  };

  var showTodayMenu = () => {
    E.showMenu({
      "": {
        "title": /*LANG*/"Today settings"
    },
    "< Back": () => showMainMenu(),
    /*LANG*/"Color": {
        value: validSttngs.tdyNumClr,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"red", /*LANG*/"green", /*LANG*/"blue"][v],
        onchange: v => validSttngs.tdyNumClr = v
      },
      /*LANG*/"Marker": {
        value: validSttngs.tdyMrkr,
        min: 0, max: 3,
        format: v => [/*LANG*/"none", /*LANG*/"circle", /*LANG*/"rectangle", /*LANG*/"filled"][v],
        onchange: v => validSttngs.tdyMrkr = v
      },
      /*LANG*/"Mrk.Color": {
        value: validSttngs.tdyMrkClr,
        min: 0, max: 2,
        format: v => [/*LANG*/"red", /*LANG*/"green", /*LANG*/"blue"][v],
        onchange: v => validSttngs.tdyMrkClr = v
      },
      /*LANG*/"Mrk.Size": {
        value: validSttngs.tdyMrkPxl,
        min: 1, max: 10,
        format: v => v+"px",
        onchange: v => validSttngs.tdyMrkPxl = v
      },
    /*LANG*/"< Cancel": () => cancelExitSettings()
  });
  };

  showMainMenu();
});
