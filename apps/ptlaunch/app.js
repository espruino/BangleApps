var storage = require("Storage");

var DEBUG = false;
var log = (message) => {
  if (DEBUG) {
    console.log(JSON.stringify(message));
  }
};

var CIRCLE_RADIUS = 25;
var CIRCLE_RADIUS_2 = CIRCLE_RADIUS * CIRCLE_RADIUS;

var CIRCLES = [
  { x: 25, y: 25, i: 0 },
  { x: 87, y: 25, i: 1 },
  { x: 150, y: 25, i: 2 },
  { x: 25, y: 87, i: 3 },
  { x: 87, y: 87, i: 4 },
  { x: 150, y: 87, i: 5 },
  { x: 25, y: 150, i: 6 },
  { x: 87, y: 150, i: 7 },
  { x: 150, y: 150, i: 8 },
];

var showMainMenu = () => {
  log("loading patterns");
  var storedPatterns = storage.readJSON("ptlaunch.patterns.json", 1) || {};

  var mainmenu = {
    "": {
      title: "Pattern Launcher",
    },
    "< Back": () => {
      log("cancel");
      load();
    },
    "Add Pattern": () => {
      log("creating pattern");
      createPattern().then((pattern) => {
        log("got pattern");
        log(pattern);
        log(pattern.length);

        var confirmPromise = new Promise((resolve) => resolve(true));

        if (storedPatterns[pattern]) {
          log("pattern already exists. show confirmation prompt");
          confirmPromise = E.showPrompt("Pattern already exists\nOverwrite?", {
            title: "Confirm",
            buttons: { Yes: true, No: false },
          });
        }

        confirmPromise.then((confirm) => {
          log("confirmPromise resolved: " + confirm);
          if (!confirm) {
            showMainMenu();
            return;
          }

          log("selecting app");
          getSelectedApp().then((app) => {
            E.showMessage("Saving...");
            log("got app");
            log("saving pattern");

            storedPatterns[pattern] = {
              app: { name: app.name, src: app.src },
            };
            storage.writeJSON("ptlaunch.patterns.json", storedPatterns);
            showMainMenu();
          });
        });
      });
    },
    "Remove Pattern": () => {
      log("selecting pattern through app");
      getStoredPatternViaApp(storedPatterns).then((pattern) => {
        E.showMessage("Deleting...");
        delete storedPatterns[pattern];
        storage.writeJSON("ptlaunch.patterns.json", storedPatterns);
        showMainMenu();
      });
    },
    Settings: () => {
      var settings = storedPatterns["settings"] || {};

      var settingsmenu = {
        "": {
          title: "Pattern Settings",
        },
        "< Back": () => {
          log("cancel");
          load();
        },
      };

      if (settings.lockDisabled) {
        settingsmenu["Enable lock"] = () => {
          settings.lockDisabled = false;
          storedPatterns["settings"] = settings;
          Bangle.setOptions({ lockTimeout: 1000 * 30 });
          storage.writeJSON("ptlaunch.patterns.json", storedPatterns);
          showMainMenu();
        };
      } else {
        settingsmenu["Disable lock"] = () => {
          settings.lockDisabled = true;
          storedPatterns["settings"] = settings;
          storage.writeJSON("ptlaunch.patterns.json", storedPatterns);
          Bangle.setOptions({ lockTimeout: 1000 * 60 * 60 * 24 * 365 });
          showMainMenu();
        };
      }

      E.showMenu(settingsmenu);
    },
  };
  E.showMenu(mainmenu);
};

var drawCircle = (circle) => {
  g.fillCircle(circle.x, circle.y, CIRCLE_RADIUS);
};

var positions = [];
var createPattern = () => {
  return new Promise((resolve) => {
    E.showMenu();
    g.clear();
    g.setColor(0, 0, 0);
    CIRCLES.forEach((circle) => drawCircle(circle));

    var pattern = [];

    var isFinished = false;
    var finishHandler = () => {
      if (pattern.length === 0 || isFinished) {
        return;
      }
      log("Pattern is finished.");
      isFinished = true;
      Bangle.removeListener("drag", dragHandler);
      Bangle.removeListener("tap", finishHandler);
      resolve(pattern.join(""));
    };
    setWatch(() => finishHandler(), BTN);
    setTimeout(() => Bangle.on("tap", finishHandler), 250);

    var dragHandler = (position) => {
      positions.push(position);

      debounce().then(() => {
        if (isFinished) {
          return;
        }
        E.showMessage("Calculating...");
        var t0 = Date.now();

        log(positions.length);

        var circlesClone = cloneCirclesArray();
        pattern = [];

        var step = Math.floor(positions.length / 100) + 1;

        var p, a, b, circle;

        for (var i = 0; i < positions.length; i += step) {
          p = positions[i];

          circle = circlesClone[0];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(0, 1);
            }
          }

          circle = circlesClone[1];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(1, 1);
            }
          }

          circle = circlesClone[2];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(2, 1);
            }
          }

          circle = circlesClone[3];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(3, 1);
            }
          }

          circle = circlesClone[4];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(4, 1);
            }
          }

          circle = circlesClone[5];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(5, 1);
            }
          }

          circle = circlesClone[6];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(6, 1);
            }
          }
          circle = circlesClone[7];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(7, 1);
            }
          }

          circle = circlesClone[8];
          if (circle) {
            a = p.x - circle.x;
            b = p.y - circle.y;
            if (CIRCLE_RADIUS_2 - (a * a + b * b) >= 0) {
              pattern.push(circle.i);
              circlesClone.splice(8, 1);
            }
          }
        }
        var tx = Date.now();
        log(tx - t0);
        positions = [];
        var t1 = Date.now();
        log(t1 - t0);

        log("pattern:");
        log(pattern);

        log("redrawing");
        g.clear();
        g.setColor(0, 0, 0);
        CIRCLES.forEach((circle) => drawCircle(circle));

        g.setColor(1, 1, 1);
        g.setFontAlign(0, 0);
        g.setFont("6x8", 4);
        pattern.forEach((circleIndex, patternIndex) => {
          var circle = CIRCLES[circleIndex];
          g.drawString(patternIndex + 1, circle.x, circle.y);
        });
        var t2 = Date.now();
        log(t2 - t0);
      });
    };

    Bangle.on("drag", dragHandler);
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

var getSelectedApp = () => {
  E.showMessage("Loading apps...");
  return new Promise((resolve) => {
    var selectAppMenu = {
      "": {
        title: "Select App",
      },
      "< Cancel": () => {
        log("cancel");
        showMainMenu();
      },
    };

    var appList = getAppList();
    appList.forEach((app) => {
      selectAppMenu[app.name] = () => {
        log("app selected");
        log(app);
        resolve(app);
      };
    });

    E.showMenu(selectAppMenu);
  });
};

var getStoredPatternViaApp = (storedPatterns) => {
  E.showMessage("Loading patterns...");
  log("getStoredPatternViaApp");
  return new Promise((resolve) => {
    var selectPatternMenu = {
      "": {
        title: "Select App",
      },
      "< Cancel": () => {
        log("cancel");
        showMainMenu();
      },
    };

    log(storedPatterns);
    var patterns = Object.keys(storedPatterns);
    log(patterns);

    patterns.forEach((pattern) => {
      if (pattern) {
        if (storedPatterns[pattern]) {
          var app = storedPatterns[pattern].app;
          if (!!app && !!app.name) {
            var appName = app.name;
            var i = 0;
            while (appName in selectPatternMenu[app.name]) {
              appName = app.name + i;
              i++;
            }
            selectPatternMenu[appName] = () => {
              log("pattern via app selected");
              log(pattern);
              log(app);
              resolve(pattern);
            };
          }
        }
      }
    });

    E.showMenu(selectPatternMenu);
  });
};

showMainMenu();

//////
// lib functions
//////

var debounceTimeoutId;
var debounce = (delay) => {
  if (debounceTimeoutId) {
    clearTimeout(debounceTimeoutId);
  }

  return new Promise((resolve) => {
    debounceTimeoutId = setTimeout(() => {
      debounceTimeoutId = undefined;
      resolve();
    }, delay || 500);
  });
};

var cloneCirclesArray = () => {
  var circlesClone = Array(CIRCLES.length);

  for (var i = 0; i < CIRCLES.length; i++) {
    circlesClone[i] = CIRCLES[i];
  }

  return circlesClone;
};
