var storage = require("Storage");
var keyboard = "textinput";
try {
  keyboard = require(keyboard);
} catch (e) {
  keyboard = null;
}

let storedApps;
var showMainMenu = () => {
  storedApps = storage.readJSON("clkshortcuts.json", 1) || {};

  var mainMenu = {
    "": {
      title: "Shortcuts",
    },
    "< Back": () => {
      load();
    },
    "New": () => {
          // Select the app
      getSelectedApp().then((app) => {
          getSelectedIcon().then((icon) => {
            promptForRename(app.name).then((name) => {
              E.showMessage("Saving...");
              storedApps[app.src] = {
                name: name, src: app.src, icon: icon
              };
              storage.writeJSON("clkshortcuts.json", storedApps);
              showMainMenu();
            }).catch(() => {
              E.showMessage("Saving...");
              storedApps[app.src] = {
                name: app.name, src: app.src, icon: icon
              };
              storage.writeJSON("clkshortcuts.json", storedApps);
              showMainMenu();
            } );
          }).catch(() => {showMainMenu();});
        }).catch(() => {showMainMenu();});
    },
  };
  getStoredAppsArray(storedApps).forEach((app) => {
    mainMenu[app.name] = {
        onchange: () => {
          showEditMenu(app).then((dirty) => {
            if (dirty) {
              E.showMessage("Saving...");
              storage.writeJSON("clkshortcuts.json", storedApps);
            }
            showMainMenu();
          });
        },
        format: v=>"\0" + atob(app.icon)
      };
  });
  E.showMenu(mainMenu);
};

var showEditMenu = (app) => {
  return new Promise((resolve, reject) => {
    var editMenu = {
      "": {
        title: "Edit " + app.name,
      },
      "< Back": () => {
        resolve(false);
      },
      "Name":{
        onchange: () => {
          promptForRename(app.name).then((name) => {
            storedApps[app.src].name = name;
            resolve(true);
          }).catch();
        },
        format: v=>app.name.substring(0, 7)
      },
      "Icon": {
        onchange: () => {
          getSelectedIcon().then((icon) => {
            storedApps[app.src].icon = icon;
            resolve(true);
          }).catch(() => resolve(false));
        },
        format: v=>"\0" + atob(app.icon)
      },
      "Delete": {
        onchange: () => {
          delete storedApps[app.src]
          resolve(true);
        },
        format: v=>"\0" + atob("GBiBAAAAAAAAAAB+AB//+B//+AwAMAwAMAxmMAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYAZmYANmwAMAwAMAwAP/wAH/gAAAAAAAAA==")
      }
    };
      E.showMenu(editMenu);
  });
};

var promptForRename = (name) => {
  return new Promise((resolve, reject) => {
    if (!keyboard) { reject("No textinput is available"); }
    else {
      return require("textinput").input({text:name}).then((result) => resolve(result));
    }
  });
};

var getStoredAppsArray = (apps) => {
  var appList = Object.keys(apps);
  var storedAppArray = [];
  for (var i = 0; i < appList.length; i++) {
    var app = "" + appList[i];
    storedAppArray.push(
      apps[app]
    );
  }
  return storedAppArray;
};

var getSelectedIcon = () => {
  return require("icons").showIconChooser().then(iconId => {
    return btoa(require("icons").getIcon(iconId));
  });
};

var getAppList = () => {
  var appList = storage
    .list(/\.info$/)
    .map((appInfoFileName) => {
      var appInfo = storage.readJSON(appInfoFileName, 1);
      return (
        appInfo && {
          name: appInfo.name,
          sortorder: appInfo.sortorder,
          src: appInfo.src,
        }
      );
    })
    .filter((app) => app && !!app.src);
  appList.sort((a, b) => {
    var n = (0 | a.sortorder) - (0 | b.sortorder);
    if (n) return n;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  return appList;
};

var getSelectedApp = () => {
  return new Promise((resolve, reject) => {
    E.showMessage("Loading apps...");
    var selectAppMenu = {
      "": {
        title: "Select App",
      },
      "< Back": () => {
        reject("The user cancelled the operation");
      },
    };

    var appList = getAppList();
    appList.forEach((app) => {
      selectAppMenu[app.name] = () => {
        resolve(app);
      };
    });

    E.showMenu(selectAppMenu);
  });
};

showMainMenu();