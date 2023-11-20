(function(back) {
  var rotNames = [/*LANG*/"No",/*LANG*/"Rotate CW",/*LANG*/"Left Handed",/*LANG*/"Rotate CCW",/*LANG*/"Mirror"];
  var FILE = "chargerot.settings.json";
  var appSettings = Object.assign({
    rotate: 0,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, appSettings);
  }


  E.showMenu({
    "" : { "title" : "Charging rotation" },
    "< Back" : () => back(),
    'Rotate': {
      value: 0|appSettings.rotate,
      min: 0, 
      max: rotNames.length-1,
      format: v=> rotNames[v],
      onchange: v => {
        appSettings.rotate = 0 | v;
        writeSettings();
      }
    },
  });
  // If(true) big();
})