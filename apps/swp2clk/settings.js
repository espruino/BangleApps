(function (back) {
  var DEBUG = false;
  var FILE = "swp2clk.data.json";

  var settings = {};

  var showMainMenu = () => {
    log("Loading main menu");

    E.showMenu({
      "": { title: "Swipe to Clock" },
      "< Back": () => back(),
      Mode: {
        value: settings.mode,
        min: 0,
        max: 3,
        format: (value) => ["Off", "White List", "Black List", "Always"][value],
        onchange: (value) => {
          settings.mode = value;
          writeSettings(settings);
        },
      },
      "White List": () => showWhiteListMenu(),
      "Black List": () => showBlackListMenu(),
    });
  };

  var showWhiteListMenu = () => {
    var appList = getAppList();

    var whiteListMenu = {
      "": { title: "White List" },
      "< Back": () => showMainMenu(),
      "_Add App_": () => {
        var addAppMenu = {
          "": { title: "Add app to WL" },
          "< Back": () => showWhiteListMenu(),
        };

        appList.forEach((app) => {
          if (settings.whiteList.indexOf(app.src) < 0) {
            addAppMenu[app.name] = () => {
              settings.whiteList.push(app.src);
              writeSettings(settings);
              showWhiteListMenu();
            };
          }
        });

        E.showMenu(addAppMenu);
      },
    };

    appList.forEach((app) => {
      if (settings.whiteList.indexOf(app.src) >= 0) {
        let index = settings.whiteList.indexOf(app.src);
        whiteListMenu[app.name] = () => {
          E.showPrompt("Delete from WL?", {
            title: "Delete from WL?",
            buttons: { Yes: true, No: false },
          }).then(function (flag) {
            if (flag) {
              settings.whiteList.splice(index, 1);
              writeSettings(settings);
            }

            showWhiteListMenu();
          });
        };
      }
    });

    log("Loading white list menu");
    E.showMenu(whiteListMenu);
  };

  var showBlackListMenu = () => {
    var appList = getAppList();

    var blackListMenu = {
      "": { title: "Black List" },
      "< Back": () => showMainMenu(),
      "_Add App_": () => {
        var addAppMenu = {
          "": { title: "Add app to BL" },
          "< Back": () => showBlackListMenu(),
        };

        appList.forEach((app) => {
          if (settings.blackList.indexOf(app.src) < 0) {
            addAppMenu[app.name] = () => {
              settings.blackList.push(app.src);
              writeSettings(settings);
              showBlackListMenu();
            };
          }
        });

        E.showMenu(addAppMenu);
      },
    };

    appList.forEach((app) => {
      if (settings.blackList.indexOf(app.src) >= 0) {
        let index = settings.whiteList.indexOf(app.src);
        blackListMenu[app.name] = () => {
          E.showPrompt("Delete from BL?", {
            title: "Delete from BL?",
            buttons: { Yes: true, No: false },
          }).then(function (flag) {
            if (flag) {
              settings.blackList.splice(index, 1);
              writeSettings(settings);
            }

            showBlackListMenu();
          });
        };
      }
    });

    log("Loading black list menu");
    E.showMenu(blackListMenu);
  };

  // lib functions

  var log = (message) => {
    if (DEBUG) {
      console.log(JSON.stringify(message));
    }
  };

  var readSettings = () => {
    log("reading settings");
    var settings = require("Storage").readJSON(FILE, 1) || {
      mode: 0,
      whiteList: [],
      blackList: [],
      addSwipeHandler: false,
    };
    log(settings);
    return settings;
  };

  var writeSettings = (settings) => {
    log("writing settings");
    log(settings);
    require("Storage").writeJSON(FILE, settings);
  };

  var getAppList = () => {
    var appList = require("Storage")
      .list(/\.info$/)
      .map((appInfoFileName) => {
        var appInfo = require("Storage").readJSON(appInfoFileName, 1);
        return (
          appInfo && {
            name: appInfo.name,
            // type: appInfo.type,
            // icon: appInfo.icon,
            sortorder: appInfo.sortorder,
            src: appInfo.src,
          }
        );
      })
      .filter((app) => app && !!app.src);
    appList.sort((a, b) => {
      var n = (0 | a.sortorder) - (0 | b.sortorder);
      if (n) return n; // do sortorder first
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    return appList;
  };

  // start main function

  settings = readSettings();
  showMainMenu();
})
