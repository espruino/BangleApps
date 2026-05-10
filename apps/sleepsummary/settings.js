(function (back) {
  var FILE = "sleepsummary.settings.json";
  // Load settings
  var settings = require("sleepsummary").getSettings();

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }
  function showMsgSettings() {
    let menu = {
      "": { title: "Message" },
      "< Back": () => mainMenu(),

      "Show Message": {
        value: !!settings.showMessage,
        onchange: (v) => {
          settings.showMessage = v;
          writeSettings();
        }
      },
      "Message Delay": {
        value: settings.messageDelay || 0,
        min: 0,
        max: 7200000,
        step: 300000,
        onchange: (v) => {
          settings.messageDelay = v;
          writeSettings();
        },
        format: (v) => {
          let totalMinutes = Math.floor(v / 60000);
          let h = Math.floor(totalMinutes / 60);
          let m = totalMinutes % 60;
          let str = "";
          if (h) str += h + "h";
          if (m) str += (h ? " " : "") + m + "m";
          return str || "0m";
        }
      }
    };
    E.showMenu(menu);
  }

  function mainMenu() {
    E.showMenu({
      "": { title: "Sleep Summary" },
      "< Back": () => back(),
      "Use True Sleep": {
        value: !!settings.useTrueSleep,
        onchange: (v) => {
          settings.useTrueSleep = v;
          writeSettings();
        }
      },
      Message: showMsgSettings,
      "Min Consec Sleep": {
        value: 0 | settings.minConsecSleep,
        min: 30,
        max: 60 * 8,
        step: 30,
        onchange: (v) => {
          settings.minConsecSleep = v;
          writeSettings();
        },
        format: (v) => {
          let h = Math.floor(v / 60);
          let m = v % 60;
          let str = "";
          if (h) str += h + "h";
          if (m) str += " " + m + "m";
          return str || "0m";
        },
        noList: true
      },

      "Ideal Deep Sleep": {
        value: 0 | (settings.deepSleepHours * 60),
        min: 60,
        max: 600,
        step: 15,
        onchange: (v) => {
          settings.deepSleepHours = v / 60;
          writeSettings();
        },
        format: (v) => {
          let h = Math.floor(v / 60);
          let m = v % 60;
          let str = "";
          if (h) str += h + "h";
          if (m) str += " " + m + "m";
          return str || "0m";
        }
      },
      "Ideal Sleep Time": {
        value: 0 | (settings.idealSleepHours * 60),
        min: 120,
        max: 60 * 14,
        step: 15,
        onchange: (v) => {
          ((settings.idealSleepHours = v / 60), writeSettings());
        },
        format: (v) => {
          let h = Math.floor(v / 60);
          let m = v % 60;
          let str = "";
          if (h) str += h + "h";
          if (m) str += " " + m + "m";
          return str || "0m";
        }
      },
      "Logging Enabled": {
        value: !!settings.logging,
        onchange: (v) => {
          settings.logging = v;
          writeSettings();
        },
      },
      "Clear Data": function () {
        E.showPrompt("Are you sure you want to delete all saved data?", {
          title: "Confirmation"
        }).then(function (v) {
          if (v) {
            require("sleepsummary").deleteData();
            E.showAlert("Cleared data!", { title: "Cleared!" }).then(
              function (v) {
                eval(require("Storage").read("sleepsummary.settings.js"))(() =>
                  load()
                );
              }
            );
          } else {
            eval(require("Storage").read("sleepsummary.settings.js"))(() =>
              load()
            );
          }
        });
      }
    });
  }
  mainMenu();
})
