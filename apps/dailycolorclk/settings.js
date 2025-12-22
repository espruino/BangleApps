(function(back) {
  const SETTINGS_FILE = "dailycolorclk.json";
  const storage = require('Storage');
  let settings = Object.assign(
      require("Storage").readJSON(SETTINGS_FILE, true) || {}
  );

  if (!settings.bgColors) settings.bgColors = ["#0F0", "#FF0", "#F00", "#0FF"];

  function writeSettings() {
    storage.write(SETTINGS_FILE, settings);
  }

  const colors = [
    { "name": "Red", "color": "#F00", "dithered": false },
    { "name": "Yellow", "color": "#FF0", "dithered": false },
    { "name": "Green", "color": "#0F0", "dithered": false },
    { "name": "Blue", "color": "#00F", "dithered": false },
    { "name": "Cyan", "color": "#0FF", "dithered": false },
    { "name": "Magenta", "color": "#F0F", "dithered": false },
    { "name": "Black", "color": "#000", "dithered": false },
    { "name": "White", "color": "#FFF", "dithered": false },
    { "name": "Orange", "color": "#FC6A03", "dithered": true },
    { "name": "Purple", "color": "#B200ED", "dithered": true },
    { "name": "Light Pink", "color": "#ff7a7a", "dithered": true },
    { "name": "Dark Pink", "color": "#ff00ff", "dithered": true },
    { "name": "Lime Green", "color": "#9dff00", "dithered": true },
    { "name": "Teal", "color": "#0091ff", "dithered": true },
    { "name": "Sea Green", "color": "#00ff91", "dithered": true },
    { "name": "Maroon", "color": "#a80000", "dithered": true },
    { "name": "Brown", "color": "#a85100", "dithered": true },
    { "name": "Peach", "color": "#ffd77a", "dithered": true }
  ];

  function modifyColor(name, val) {
    let color = colors.find(obj => obj.name === name);
    if (color) {
      if (val === true) {
        settings.bgColors.push(color.color);
      } else {
        settings.bgColors = settings.bgColors.filter(item => item !== color.color);
      }
      print(settings)
    }
    writeSettings();
  }

  function colorSelected(name) {
    return settings.bgColors.includes(colors.find(obj => obj.name === name).color)
  }

  function showDitheringMenu(back) {
    var menu = {
      '': { 'title': 'Dithered Colors' },
      "< Back": () => back,
    }
    colors.forEach((c, i) => {
      if (c.dithered === true) {
        menu[c.name] = {
          value: !!colorSelected(c.name),
          onchange: x => modifyColor(c.name, x)
        };
      }
    });
    E.showMenu(menu);
  }
  function showMainMenu() {
    let menu = {
      '': { 'title': 'Daily Color Clock' },
      /*LANG*/'< Back': back,
      /*LANG*/'Hide Widgets': {
        value: !!settings.hideWidgets,
        onchange: x => {
          settings.hideWidgets = x;
          writeSettings();
        },
      },
      /*LANG*/'Regenerate Queue': function () {
        settings.regenerate = true;
        writeSettings();
        E.showAlert("Regenerated Queue!", "Success")
          .then(function (v) {
            eval(require("Storage").read("dailycolorclk.settings.js"))(() => load());
          }

          );
      },
      /*LANG*/'Dithered Colors': () => { showDitheringMenu(showMainMenu) },
    };
    colors.forEach((c, i) => {
      if (c.dithered === false) {
        menu[c.name] = {
          value: !!colorSelected(c.name),
          onchange: x => modifyColor(c.name, x)
        };
      }
    });
    E.showMenu(menu);
  }


  showMainMenu();
})(load)
