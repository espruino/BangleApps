(function(back) {
  var FILE = "swipeinv.json";
  // Load settings
  const settings = Object.assign({
    global: false,
    apps: {}
  }, require("Storage").readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Convert settings when coming from ver < 4
  function convertSettings() {
    if ("array" === typeof(settings.apps)) {
      let newObject = {};
      settings.apps.forEach((source)=>{
      let idExtractedFromSource = source.split(".")[0];
        newObject[idExtractedFromSource] = {};
      })
      settings.apps = newObject;
    }
  }
  convertSettings();

  function appMenu() {
    let menu = {
      "" : { "title" : /*LANG*/"Swipe inversion apps" },
      "< Back" : () => { writeSettings(); mainMenu();}
    };
    require("Storage").list(/\.info$/).map(app=>require("Storage").readJSON(app,1)).filter(app => app.type==="app" || app.type==="clock" || app.type==="launch" || !app.type).sort((a,b) => {
      if (a.name<b.name) return -1;
      if (a.name>b.name) return 1;
      return 0;
    }).forEach(app => {
      menu[app.name] = {
        value: settings.apps.keys().includes(app.id),
        onchange: v => {
          if (v) {
            if (!settings.apps[app.id] || settings.apps[app.id].keys().length===0) {
                settings.apps[app.id] = {"swipeH":true, "swipeV":true, "dragH":true, "dragV":true};
              }
          } else {
            if (settings.apps[app.id]) {delete settings.apps[app.id];}
          }
        }
      };
    });
    E.showMenu(menu);
  }

  function mainMenu() {
    let menu = {
      "" : { "title" : /*LANG*/"Swipe inversion" },
      "< Back" : () => back(),

      /*LANG*/'Invert globally': {
        value: !!settings.global,
        onchange: v => {
          settings.global = v;
          writeSettings();
        }
      },

      /*LANG*/'Select apps': () => appMenu(),
    };

    if (!settings.appTune) {settings.appTune = {};}

    settings.apps.forEach((appSrc,index,array) => {
      // Create a sub menu and show it.
      let subMenu = {
        "" : { "title" : /*LANG*/"Tune"+" "+appSrc },
        "< Back" : () => { writeSettings(); mainMenu();}
      }
      let entries = [{name:"Swipe Horizontal", id:"swipeH"}, {name:"Swipe Vertical", id:"swipeV"}, {name:"Drag Horizontal", id:"dragH"}, {name:"Drag Vertical", id:"dragV"}];
      entries.forEach((setting, index, array)=>{
        if (!settings.appTune[app[setting.id]) {settings.appTune[settings.id] = }
        subMenu[setting.name] = {
          value: settings.appTune.includes(app.src),
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

      })

      menu[appSrc] = ()=>E.showMenu(subMenu);
    });
    
    E.showMenu(menu);
  }

  mainMenu();
})
