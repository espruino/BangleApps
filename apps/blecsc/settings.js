(function(back) {
  const storage = require('Storage')
  const SETTINGS_FILE = 'blecsc.json'

  // Set default values and merge with stored values
  let settings = Object.assign({
    circum: 2068 // circumference in mm
  }, (storage.readJSON(SETTINGS_FILE, true) || {}));

  function saveSettings() {
    storage.writeJSON(SETTINGS_FILE, settings);
  }

  function circumMenu() {
    var v = 0|settings.circum;
    var cm = 0|(v/10);
    var mm = v-(cm*10);
    E.showMenu({
      '': { title: /*LANG*/"Circumference", back: mainMenu },
      'cm': {
        value: cm,
        min: 80, max: 240, step: 1,
        onchange: (v) => {
          cm = v;
          settings.circum = (cm*10)+mm;
          saveSettings();
        },
      },
      '+ mm': {
        value: mm,
        min: 0, max: 9, step: 1,
        onchange: (v) => {
          mm = v;
          settings.circum = (cm*10)+mm;
          saveSettings();
        },
      },
      /*LANG*/'Std Wheels': function() {
        // https://support.wahoofitness.com/hc/en-us/articles/115000738484-Tire-Size-Wheel-Circumference-Chart
        E.showMenu({
          '': { title: /*LANG*/'Std Wheels', back: circumMenu },
          '650x38 wheel' : function() {
            settings.circum = 1995;
            saveSettings();
            mainMenu();
          },
          '700x32c wheel' : function() {
            settings.circum = 2152;
            saveSettings();
            mainMenu();
          },
          '24"x1.75 wheel' : function() {
            settings.circum = 1890;
            saveSettings();
            mainMenu();
          },
          '26"x1.5 wheel' : function() {
            settings.circum = 2010;
            saveSettings();
            mainMenu();
          },
          '27.5"x1.5 wheel' : function() {
            settings.circum = 2079;
            saveSettings();
            mainMenu();
          }
        });
      }

    });
  }

  function mainMenu() {
    E.showMenu({
      '': { 'title': 'BLE CSC' },
      '< Back': back,
      /*LANG*/'Circumference': {
        value: settings.circum+"mm",
        onchange: circumMenu
      },
    });
  }

  mainMenu();
})