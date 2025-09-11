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
  function convertAppsArrayToObject() {
    if (Array.isArray(settings.apps)) {
      let newObject = {};
      settings.apps.forEach((source)=>{
        let idExtractedFromSource = source.split(".")[0];
        newObject[idExtractedFromSource] = {};
      })
      settings.apps = newObject;
    }
  }
  convertAppsArrayToObject();

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
        value: Object.keys(settings.apps).includes(app.id),
        onchange: v => {
          if (v) {
            if (!settings.apps[app.id] || Object.keys(settings.apps[app.id]).length===0) {
                settings.apps[app.id] = {"name":app.name, "swipeH":true, "swipeV":true, "dragH":true, "dragV":true};
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

    Object.keys(settings.apps).forEach((appID) => {
      // Create a sub menu and show it.
      let subMenu = {
        "" : { "title" : /*LANG*/"Tune"+" "+appID },
        "< Back" : () => { writeSettings(); mainMenu();}
      }
      let subMenuEntries = [{name:"Swipe Horizontal", id:"swipeH"}, {name:"Swipe Vertical", id:"swipeV"}, {name:"Drag Horizontal", id:"dragH"}, {name:"Drag Vertical", id:"dragV"}];
      subMenuEntries.forEach((setting)=>{
        if (!Object.keys(settings.apps).includes(appID)) {settings.apps[appID] = {"swipeH":true, "swipeV":true, "dragH":true, "dragV":true}}
        subMenu[setting.name] = {
          value: settings.apps[appID][setting.id],
          onchange: v => {
            if (v) {
              settings.apps[appID][setting.id] = true;
            } else {
              settings.apps[appID][setting.id] = false;
            }
          }
        };
      })

      menu[settings.apps[appID].name] = ()=>E.showMenu(subMenu);
    });
    
    E.showMenu(menu);
  }

  mainMenu();
})
