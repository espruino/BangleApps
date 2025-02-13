(function(back) {
  var FILE = "swipeinv.json";
  // Load settings
  const settings = Object.assign({
    global: false,
    apps: []
  }, require("Storage").readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  function appMenu() {
    let menu = {
      "" : { "title" : /*LANG*/"Swipe inversion apps" },
      "< Back" : () => { writeSettings(); mainMenu();}
    };
    require("Storage").list(/\.info$/).map(app=>require("Storage").readJSON(app,1)).filter(app => app.type === "app" || !app.type).sort((a,b) => {
      if (a.name<b.name) return -1;
      if (a.name>b.name) return 1;
      return 0;
    }).forEach(app => {
      menu[app.name] = {
        value: settings.apps.includes(app.src),
        onchange: v => {
          if (v) {
            settings.apps.push(app.src);
          } else {
            const idx = settings.apps.indexOf(app.src);
            if (idx !== -1) {
              settings.apps.splice(idx, 1);
            }
          }
        }
      };
    });
    E.showMenu(menu);
  }

  function mainMenu() {
    E.showMenu({
      "" : { "title" : /*LANG*/"Swipe inversion" },
      "< Back" : () => back(),

      /*LANG*/'Invert globally': {
        value: !!settings.global,
        onchange: v => {
          settings.global = v;
          writeSettings();
        }
      },

      /*LANG*/'Select apps': () => appMenu()
    });
  }

  mainMenu();
})
