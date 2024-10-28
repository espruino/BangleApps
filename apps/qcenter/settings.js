// make sure to enclose the function in parentheses
(function (back) {
  let settings = require("Storage").readJSON("qcenter.json", 1) || {};
  var apps = require("Storage")
    .list(/\.info$/)
    .map((app) => {
      var a = require("Storage").readJSON(app, 1);
      return (
        a && {
          name: a.name,
          type: a.type,
          sortorder: a.sortorder,
          src: a.src,
          icon: a.icon,
        }
      );
    })
    .filter(
      (app) =>
        app &&
        (app.type == "app" ||
          app.type == "launch" ||
          app.type == "clock" ||
          !app.type)
    );
  apps.sort((a, b) => {
    var n = (0 | a.sortorder) - (0 | b.sortorder);
    if (n) return n; // do sortorder first
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  function save(key, value) {
    settings[key] = value;
    require("Storage").write("qcenter.json", settings);
  }

  var pinnedApps = settings.pinnedApps || [];
  var exitGesture = settings.exitGesture || "swipeup";

  function showMainMenu() {
    var mainmenu = {
      "": { title: "Quick Center", back: back},
    };

    // Set exit gesture
    mainmenu["Exit Gesture: " + exitGesture] = function () {
      E.showMenu(exitGestureMenu);
    };

    // Set Timeout
    mainmenu["Timeout: " + (settings.timeout ? (settings.timeout+"s") : "Off")] = function () {
      E.showMenu(timeoutMenu);
    };

    //List all pinned apps, redirecting to menu with options to unpin and reorder
    pinnedApps.forEach((app, i) => {
      mainmenu[app.name] = function () {
        E.showMenu({
          "": { title: app.name, back: showMainMenu },
          "Unpin": () => {
            pinnedApps.splice(i, 1);
            save("pinnedApps", pinnedApps);
            showMainMenu();
          },
          "Move Up": () => {
            if (i > 0) {
              pinnedApps.splice(i - 1, 0, pinnedApps.splice(i, 1)[0]);
              save("pinnedApps", pinnedApps);
              showMainMenu();
            }
          },
          "Move Down": () => {
            if (i < pinnedApps.length - 1) {
              pinnedApps.splice(i + 1, 0, pinnedApps.splice(i, 1)[0]);
              save("pinnedApps", pinnedApps);
              showMainMenu();
            }
          },
        });
      };
    });

    // Show pin app menu, or show alert if max amount of apps are pinned
    mainmenu["Pin App"] = function () {
      if (pinnedApps.length < 6) {
        E.showMenu(pinAppMenu);
      } else {
        E.showAlert("Max apps pinned").then(showMainMenu);
      }
    };

    return E.showMenu(mainmenu);
  }

  // menu for adding apps to the quick launch menu, listing all apps
  var pinAppMenu = {
    "": { title: "Add App", back: showMainMenu }
  };
  apps.forEach((a) => {
    pinAppMenu[a.name] = function () {
      // strip unncecessary properties
      delete a.type;
      delete a.sortorder;
      pinnedApps.push(a);
      save("pinnedApps", pinnedApps);
      showMainMenu();
    };
  });

  // menu for setting exit gesture
  var exitGestureMenu = {
    "": { title: "Exit Gesture", back: showMainMenu }
  };
  exitGestureMenu["Swipe Up"] = function () {
    exitGesture = "swipeup";
    save("exitGesture", "swipeup");
    showMainMenu();
  };
  exitGestureMenu["Swipe Down"] = function () {
    exitGesture = "swipedown";
    save("exitGesture", "swipedown");
    showMainMenu();
  };
  exitGestureMenu["Swipe Left"] = function () {
    exitGesture = "swipeleft";
    save("exitGesture", "swipeleft");
    showMainMenu();
  };
  exitGestureMenu["Swipe Right"] = function () {
    exitGesture = "swiperight";
    save("exitGesture", "swiperight");
    showMainMenu();
  };

  // menu for setting timeout
  var timeoutMenu = {
    "": { title: "Timeout", back: showMainMenu }
  };
  timeoutMenu["Off"] = function () {
    save("timeout", 0);
    showMainMenu();
  };
  let timeoutvalues = [10,20,30,60];
  for (const c in timeoutvalues){
    let v = timeoutvalues[c];
    timeoutMenu[v+"s"] = function () {
      save("timeout", v);
      showMainMenu();
    };
  }

  showMainMenu();
})
