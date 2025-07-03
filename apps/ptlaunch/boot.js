(function () {
  var DEBUG = false;
  var log = (message) => {
    if (DEBUG) {
      console.log(JSON.stringify(message));
    }
  };

  var storedPatterns;
  var CIRCLE_RADIUS = 25;
  var CIRCLE_RADIUS_2 = Math.pow(CIRCLE_RADIUS, 2);
  var positions = [];
  var getPattern = (positions) => {
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
      var pattern = getPattern(positions);
      log(pattern);

      if (pattern) {
        if (storedPatterns[pattern]) {
          var app = storedPatterns[pattern].app;
          if (!!app && !!app.src) {
            if (storedPatterns.settings) {
              if (storedPatterns.settings.lockDisabled) {
                Bangle.setLCDPower(true);
              }
            }

            Bangle.removeListener("drag", dragHandler);
            load(app.src);
          }
        }
      }

      positions = [];
    }
  };

  var sui = Bangle.setUI;
  Bangle.setUI = function (mode, cb) {
    sui(mode, cb);
    if (typeof mode === "object") mode = (mode.clock ? "clock" : "") + mode.mode;
    if (!mode || !mode.startsWith("clock")) {
      storedPatterns = {};
      Bangle.removeListener("drag", dragHandler);
      return;
    }

    var storage = require("Storage");
    storedPatterns = storage.readJSON("ptlaunch.patterns.json", 1) || {};
    if (Object.keys(storedPatterns).length > 0) {
      Bangle.on("drag", dragHandler);
      if (storedPatterns.settings) {
        if (storedPatterns.settings.lockDisabled) {
          Bangle.setOptions({ lockTimeout: 1000 * 60 * 60 * 24 * 365 });
        }
      }
    }
  };
})();
