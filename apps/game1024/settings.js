(function(back) {
    var FILE = "game1024.settings.json";
    var scoreFile = "game1024.json";
    // Load settings
    var settings = Object.assign({
      maxUndoLevels: 5,
      charIndex: 0,
      clockMode: true,
      debugMode: false,
    }, require('Storage').readJSON(FILE, true) || {});

    function writeSettings() {
      require('Storage').writeJSON(FILE, settings);
    }
    var symbols = ["1 2 3 ...", "A B C ...", "I II III..."];
    var settingsMenu = {
      "" : { "title" : "1024 Game" },
      "< Back" : () => back(),
      "Symbols": {
        value: 0|settings.charIndex,
        min:0,max:symbols.length-1,
        format: v=>symbols[v],
        onchange: v=> { settings.charIndex=v; writeSettings();}
       }
      ,
      "Undo levels:": {
        value: 0|settings.maxUndoLevels,  // 0| converts undefined to 0
        min: 0, max: 9,
        onchange: v => {
          settings.maxUndoLevels = v;
          writeSettings();
        }
      },
      "Exit press:": {
        value: !settings.clockMode,
        format: v => v?"short":"long",
        onchange: v => {
          settings.clockMode = v;
          writeSettings();
        },
      },
      "Debug mode:": {
        value: !!settings.debugMode,
        onchange: v => {
          settings.debugMode = v;
          writeSettings();
        }
      },
      "Reset Highscore": () => {
        E.showPrompt('Reset Highscore?').then((v) => {
          let delay = 50;
          if (v) {
            delay = 500;
            let sF = require("Storage").readJSON(scoreFile, true);
            if (typeof sF !== "undefined") {
                E.showMessage('Resetting');
                sF.highScore = 0;
                require("Storage").writeJSON(scoreFile, sF);
            } else {
                E.showMessage('No highscore!');
            }
          }
          setTimeout(() => E.showMenu(settingsMenu), delay);
        });
      }
    }
    // Show the menu
    E.showMenu(settingsMenu);
  })
