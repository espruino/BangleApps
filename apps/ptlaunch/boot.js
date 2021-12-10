var DEBUG = true;
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

var storedPatterns;
var positions = [];
var dragHandler = (position) => {
  positions.push(position);

  debounce().then(() => {
    log(positions.length);

    var circlesClone = cloneCirclesArray();
    var pattern = [];

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
    positions = [];

    pattern = pattern.join("");

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
  });
};

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

(function () {
  var sui = Bangle.setUI;
  Bangle.setUI = function (mode, cb) {
    sui(mode, cb);
    if (!mode) {
      Bangle.removeListener("drag", dragHandler);
      storedPatterns = {};
      return;
    }
    if (!mode.startsWith("clock")) {
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
