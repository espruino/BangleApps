(function(back) {
  var FILE = "terminalclock.json";
  // Load settings
  var settings = Object.assign({
    // ClockFace lib
    loadWidgets: true,
    // TerminalClock specific
    HRMinConfidence: 50,
    powerSaving: true,
    PowerOnInterval: 15,
    L2: 'Empty',
    L3: 'Empty',
    L4: 'Empty',
    L5: 'Empty',
    L6: 'Empty',
    L7: 'Empty',
    L8: 'Empty',
    L9: 'Empty',
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  if(process.env.HWVERSION == 2) {
    var lineType = ['Date', 'HR', 'Motion', 'Alt', 'Steps', '>', 'Empty'];
  } else{
    var lineType = ['Date', 'HR', 'Motion', 'Steps', '>', 'Empty'];
  }
  function getLineChooser(lineID){
    return {
      value: lineType.indexOf(settings[lineID]),
      min: 0, max: lineType.length-1,
      format: v => lineType[v],
      onchange: v => {
        settings[lineID] = lineType[v];
        writeSettings();
      },
    };
  }

  var lineMenu = {
    '< Back': function() { E.showMenu(getMainMenu());},
    'Line 2': getLineChooser('L2'),
    'Line 3': getLineChooser('L3'),
    'Line 4': getLineChooser('L4'),
    'Line 5': getLineChooser('L5'),
    'Line 6': getLineChooser('L6'),
    'Line 7': getLineChooser('L7'),
    'Line 8': getLineChooser('L8'),
    'Line 9': getLineChooser('L9'),
  };

  function getMainMenu(){
    var mainMenu = {
      "" : { "title" : "Terminal Clock" },
      "< Back" : () => back(),
      'HR confidence': {
        value: settings.HRMinConfidence,
        min: 0, max: 100,
        onchange: v => {
          settings.HRMinConfidence = v;
          writeSettings();
        }
     },
     'Show widgets': {
        value: settings.loadWidgets,
        format: v => v?"Yes":"No",
        onchange: v => {
          settings.loadWidgets = v;
          writeSettings();
        }
      },
      'Power saving': {
        value: settings.powerSaving,
        format: v => v?"On":"Off",
        onchange: v => {
          settings.powerSaving = v;
          writeSettings();
          setTimeout(function() {
            E.showMenu(getMainMenu());
          },0);
        }
      }
    };
    if(settings.powerSaving){
      mainMenu['Power on interval'] = {
        value: settings.PowerOnInterval,
        min: 3, max: 60,
        onchange: v => {
          settings.PowerOnInterval = v;
          writeSettings();
        },
        format: x => {
            return x + " min";
        },
      };
    }

    mainMenu['Lines'] = function() { E.showMenu(lineMenu);};
    return mainMenu;
  }

  E.showMenu(getMainMenu());
})();