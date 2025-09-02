var DEBUG = false;

var storage = require("Storage");

var showMainMenu = () => {
  log("loading patterns");
  var storedPatterns = storage.readJSON("ptlaunch.patterns.json", 1) || {};

  var mainmenu = {
    "": {
      title: "Pattern Launcher",
      back: () => {
        log("showMainMenu cancel");
        load();
      }
    },
    "Add Pattern": () => {
      log("creating pattern");
      recognizeAndDrawPattern().then((pattern) => {
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
    "Manage Patterns": () => {
      log("selecting pattern through app");
      showScrollerContainingAppsWithPatterns().then((selected) => {
        var pattern = selected.pattern;
        var appName = selected.appName;
        if (pattern === "back") {
          showMainMenu();
        } else {
          E.showPrompt(appName + "\n\npattern:\n" + pattern, {
            title: "Delete?",
            buttons: { Yes: true, No: false },
          }).then((confirm) => {
            if (confirm) {
              E.showMessage("Deleting...");
              delete storedPatterns[pattern];
              storage.writeJSON("ptlaunch.patterns.json", storedPatterns);
              showMainMenu();
            } else {
              showMainMenu();
            }
          });
        }
      });
    },
    Settings: () => {
      var settings = storedPatterns.settings || {};

      var settingsmenu = {
        "": {
          title: "Pattern Settings",
          back: () => {
            log("settings cancel");
            showMainMenu();
          },
        }
      };

      if (settings.lockDisabled) {
        settingsmenu["Enable lock"] = () => {
          settings.lockDisabled = false;
          storedPatterns.settings = settings;
          Bangle.setOptions({ lockTimeout: 1000 * 30 });
          storage.writeJSON("ptlaunch.patterns.json", storedPatterns);
          showMainMenu();
        };
      } else {
        settingsmenu["Disable lock"] = () => {
          settings.lockDisabled = true;
          storedPatterns.settings = settings;
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

var recognizeAndDrawPattern = () => {
  return new Promise((resolve) => {
    var pattern = [];
    var isFinished = false;
    var finishHandler = () => {
      if (pattern.length === 0 || isFinished) {
        return;
      }
      log("Pattern is finished.");
      isFinished = true;
      g.clear();
      require("widget_utils").show();
      Bangle.setUI();
      resolve(pattern.join(""));
    };

    var positions = [];
    var getPattern = (positions) => { "ram";/*faster*/
      var circles = [
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
      return positions.reduce((pattern, p, i, arr) => {
        var idx = circles.findIndex((c) => {
          var dx = p.x - c.x, dy = p.y - c.y;
          return dx*dx + dy*dy <= CIRCLE_RADIUS_2;
        });
        if (idx >= 0) {
          pattern += circles[idx].i;
          circles.splice(idx, 1);
        }
        if (circles.length === 0) {
          arr.splice(1);
        }
        return pattern;
      }, "");
    };
    var dragHandler = (position) => {
      positions.push(position);
      if (position.b === 0 || positions.length >= 200) {
        pattern = getPattern(positions).split("");
        g.clear();
        drawCirclesWithPattern(pattern);
        positions = [];
      }
    };
    require("widget_utils").hide();
    g.clear();
    drawCirclesWithPattern([]);
    Bangle.setUI({mode:"custom", drag:dragHandler, btn :finishHandler});
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
  E.showMessage(/*LANG*/"Loading apps...");
  return new Promise((resolve) => {
    var selectAppMenu = {
      "": {
        title: /*LANG*/"Select App",
      },
      "< Cancel": () => {
        log("getSelectedApp cancel");
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

//////
// manage pattern related variables and functions
// - draws all saved patterns and their linked app names
// - uses the scroller to allow the user to browse through them
//////

var scrollerFont = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";

var drawBackButton = (r) => {
  g.clearRect(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);
  g.setFont(scrollerFont)
    .setFontAlign(-1, 0)
    .drawString("< Back", 64, r.y + 32);
};

var drawAppWithPattern = (i, r, storedPatterns) => {
  log("draw app with pattern");
  log({ i: i, r: r, storedPatterns: storedPatterns });
  var storedPattern = storedPatterns[i];
  var pattern = storedPattern.pattern;
  var app = storedPattern.app;

  g.clearRect(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);

  g.drawLine(r.x, r.y, 176, r.y);

  drawCirclesWithPattern(pattern, {
    enableCaching: true,
    scale: 0.33,
    offset: { x: 1, y: 3 + r.y },
  });

  if (!storedPattern.wrappedAppName) {
    storedPattern.wrappedAppName = g
      .wrapString(app.name, g.getWidth() - 64)
      .join("\n");
  }
  log(g.getWidth());
  log(storedPattern.wrappedAppName);
  g.setFont(scrollerFont)
    .setFontAlign(-1, 0)
    .drawString(storedPattern.wrappedAppName, 64, r.y + 32);
};

var showScrollerContainingAppsWithPatterns = () => {
  var storedPatternsArray = getStoredPatternsArray();
  if (!storedPatternsArray.length)
    return E.showAlert(/*LANG*/"No Patterns",{title:/*LANG*/"Patterns"}).then(() => ({ pattern: "back", appName:"" }));
  log("drawing scroller for stored patterns");
  log(storedPatternsArray);
  log(storedPatternsArray.length);

  g.clear();

  var c = Math.max(storedPatternsArray.length + 1, 3);

  return new Promise((resolve) => {
    E.showScroller({
      h: 64,
      c: c,
      draw: (i, r) => {
        log("draw");
        log({ i: i, r: r });
        if (i <= 0) {
          drawBackButton(r);
        } else if (i <= storedPatternsArray.length) {
          drawAppWithPattern(i - 1, r, storedPatternsArray);
        }
      },
      select: (i) => {
        log("selected: " + i);
        var pattern = "back";
        var appName = "";
        if (i > 0) {
          var storedPattern = storedPatternsArray[i - 1];
          pattern = storedPattern.pattern.join("");
          appName = storedPattern.app.name;
        }
        clearCircleDrawingCache();
        resolve({ pattern: pattern, appName: appName });
      },
    });
  });
};

//////
// storage related functions:
// - stored patterns
// - stored settings
//////

var getStoredPatternsMap = () => {
  log("loading stored patterns map");
  var storedPatternsMap = storage.readJSON("ptlaunch.patterns.json", 1) || {};
  delete storedPatternsMap.settings;
  log(storedPatternsMap);
  return storedPatternsMap;
};

var getStoredPatternsArray = () => {
  var storedPatternsMap = getStoredPatternsMap();
  log("converting stored patterns map to array");
  var patterns = Object.keys(storedPatternsMap);
  var storedPatternsArray = [];
  for (var i = 0; i < patterns.length; i++) {
    var pattern = "" + patterns[i];
    storedPatternsArray.push({
      pattern: pattern
        .split("")
        .map((circleIndex) => parseInt(circleIndex, 10)),
      app: storedPatternsMap[pattern].app,
    });
  }
  log(storedPatternsArray);
  return storedPatternsArray;
};

//////
// circle related variables and functions:
// - the circle array itself
// - the radius and the squared radius of the circles
// - circle draw function
//////

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

var drawCircle = (circle, drawBuffer, scale) => {
  if (!drawBuffer) {
    drawBuffer = g;
  }
  if (!scale) {
    scale = 1;
  }

  var x = circle.x * scale;
  var y = circle.y * scale;
  var r = CIRCLE_RADIUS * scale;

  log("drawing circle");
  log({ x: x, y: y, r: r });

  drawBuffer.setColor(0);
  drawBuffer.fillCircle(x, y, r);
};

var cachedCirclesDrawings = {};

var clearCircleDrawingCache = () => {
  cachedCirclesDrawings = {};
};

var drawCirclesWithPattern = (pattern, options) => {
  if (!pattern || pattern.length === 0) {
    pattern = [];
  }
  if (!options) {
    options = {};
  }
  var enableCaching = options.enableCaching;
  var scale = options.scale;
  var offset = options.offset;
  if (!enableCaching) {
    enableCaching = false;
  }
  if (!scale) {
    scale = 1;
  }
  if (!offset) {
    offset = { x: 0, y: 0 };
  }

  log("drawing circles with pattern, scale and offset");
  log(pattern);
  log(scale);
  log(offset);

  // cache drawn patterns. especially useful for the manage pattern menu
  var image = cachedCirclesDrawings[pattern.join("")];
  if (!image) {
    log("circle image not cached");
    var drawBuffer = Graphics.createArrayBuffer(
      g.getWidth() * scale,
      g.getHeight() * scale,
      1,
      { msb: true }
    );

    drawBuffer.setColor(1);
    drawBuffer.fillRect(0, 0, drawBuffer.getWidth(), drawBuffer.getHeight());

    CIRCLES.forEach((circle) => drawCircle(circle, drawBuffer, scale));
    drawBuffer.setColor(1);
    drawBuffer.setFontAlign(0, 0);
    drawBuffer.setFont("Vector", 40 * scale);
    pattern.forEach((circleIndex, patternIndex) => {
      var circle = CIRCLES[circleIndex];
      drawBuffer.drawString(
        patternIndex + 1,
        (circle.x + (scale === 1 ? 1 : 5)) * scale,
        circle.y * scale
      );
    });
    image = {
      width: drawBuffer.getWidth(),
      height: drawBuffer.getHeight(),
      bpp: 1,
      buffer: drawBuffer.buffer,
      palette: new Uint16Array([g.theme.fg, g.theme.bg], 0, 1),
    };

    if (enableCaching) {
      cachedCirclesDrawings[pattern.join("")] = image;
    }
  } else {
    log("using cached circle image");
  }

  g.drawImage(image, offset.x, offset.y);
};

//////
// misc lib functions
//////

var log = (message) => {
  if (DEBUG) {
    console.log(JSON.stringify(message));
  }
};

//////
// run main function
//////

Bangle.loadWidgets();
Bangle.drawWidgets();
showMainMenu();