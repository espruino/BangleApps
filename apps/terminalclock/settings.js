(function (back) {
  var FILE = "terminalclock.json";
  // Load settings
  var settings = Object.assign(
    {
      // TerminalClock specific
      isoDate: false,
      HRMinConfidence: 50,
      PowerOnInterval: 15,
      L2: "Date",
      L3: "HR",
      L4: "Motion",
      L5: "Steps",
      L6: ">",
      L7: "Empty",
      L8: "Empty",
      L9: "Empty",
    },
    require("Storage").readJSON(FILE, true) || {},
  );
  // ClockFace lib: migrate "don't load widgets" to "hide widgets"
  if (!("hideWidgets" in settings)) {
    if ("loadWidgets" in settings && !settings.loadWidgets)
      settings.hideWidgets = 1;
    else settings.hideWidgets = 0;
  }
  delete settings.loadWidgets;
  // ClockFace lib: migrate `powerSaving` to `powerSave`
  if (!("powerSave" in settings)) {
    if ("powerSaving" in settings) settings.powerSave = settings.powerSaving;
    else settings.powerSave = true;
  }
  delete settings.powerSaving;

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  if (process.env.HWVERSION == 2) {
    var lineType = [
      "Date",
      "DOW",
      "HR",
      "Motion",
      "Alt",
      "Steps",
      ">",
      "Empty",
    ];
  } else {
    var lineType = ["Date", "DOW", "HR", "Motion", "Steps", ">", "Empty"];
  }
  function getLineChooser(lineID) {
    return {
      value: lineType.indexOf(settings[lineID]),
      min: 0,
      max: lineType.length - 1,
      format: (v) => lineType[v],
      onchange: (v) => {
        settings[lineID] = lineType[v];
        writeSettings();
      },
    };
  }

  var lineMenu = {
    "< Back": function () {
      E.showMenu(getMainMenu());
    },
    "Line 2": getLineChooser("L2"),
    "Line 3": getLineChooser("L3"),
    "Line 4": getLineChooser("L4"),
    "Line 5": getLineChooser("L5"),
    "Line 6": getLineChooser("L6"),
    "Line 7": getLineChooser("L7"),
    "Line 8": getLineChooser("L8"),
    "Line 9": getLineChooser("L9"),
  };

  function getMainMenu() {
    var mainMenu = {
      "": { title: "Terminal Clock" },
      "< Back": () => back(),
      "HR confidence": {
        value: settings.HRMinConfidence,
        min: 0,
        max: 100,
        onchange: (v) => {
          settings.HRMinConfidence = v;
          writeSettings();
        },
      },
      "ISO date": {
        value: !!settings.isoDate,
        onchange: (v) => {
          settings.isoDate = v;
          writeSettings();
        },
      },
    };
    const save = (key, v) => {
      settings[key] = v;
      writeSettings();
    };
    require("ClockFace_menu").addItems(mainMenu, save, {
      hideWidgets: settings.hideWidgets,
      powerSave: settings.powerSave,
    });
    if (settings.powerSave) {
      mainMenu["Power on interval"] = {
        value: settings.PowerOnInterval,
        min: 3,
        max: 60,
        onchange: (v) => {
          settings.PowerOnInterval = v;
          writeSettings();
        },
        format: (x) => x + "m",
      };
    }

    mainMenu["Lines"] = function () {
      E.showMenu(lineMenu);
    };
    return mainMenu;
  }

  E.showMenu(getMainMenu());
})
