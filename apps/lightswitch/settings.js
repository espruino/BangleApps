(function(back) {
  var filename = "lightswitch.json";

  // set Storage and load settings
  var storage = require("Storage");
  var settings = Object.assign({
    colors: "011",
    image: "default",
    touchOn: "always",
    oversize: 20,
    dragDelay: 500,
    minValue: 0.1,
    tapToLock: false,
    unlockSide: "",
    tapSide: "right",
    tapOn: "always",
    tOut: 2000,
    minFlash: 0.2
  }, storage.readJSON(filename, true) || {});
  var images = storage.readJSON(filename.replace(".", ".images."), true) || false;

  // write change to storage and widget
  function writeSetting(key, value, drawWidgets) {
    // reread settings to only change key
    settings = Object.assign(settings, storage.readJSON(filename, true) || {});
    // change the value of key
    settings[key] = value;
    // write to storage
    storage.writeJSON(filename, settings);
    // check if widgets are loaded
    if (global.WIDGETS) {
      // setup shortcut to the widget
      var w = WIDGETS.lightswitch;
      // assign changes to widget
      w = Object.assign(w, settings);
      // redraw widgets if necessary
      if (drawWidgets) Bangle.drawWidgets();
    }
  }

  // generate entry for circulating values
  function getEntry(key) {
    var entry = entries[key];
    // check for existing titles to decide value type
    if (entry.value) {
      // return entry for string value
      return {
        value: entry.value.indexOf(settings[key]),
        min: 0,
        max: entry.value.length - 1,
        wrap: true,
        format: v => entry.title ? entry.title[v] : entry.value[v],
        onchange: function(v) {
          writeSetting(key, entry.value[v], entry.drawWidgets);
          if (entry.exec) entry.exec(entry.value[v]);
        }
      };
    } else {
      // return entry for numerical value
      return {
        value: settings[key] * entry.factor,
        min: entry.min,
        max: entry.max,
        step: entry.step,
        wrap: true,
        format: v => v > 0 ? v + entry.unit : "off",
        onchange: function(v) {
          writeSetting(key, v / entry.factor, entry.drawWidgets);
        },
      };
    }
  }

  // define menu entries with circulating values
  var entries = {
    colors: {
      title: ["red", "yellow", "green", "cyan", "blue", "magenta"],
      value: ["100", "110", "010", "011", "001", "101"],
      drawWidgets: true
    },
    image: {
      title: images ? undefined : ["no found"],
      value: images ? ["default", "random"].concat(Object.keys(images)) : ["default"],
      exec: function(value) {
        // draw selected image in upper right corner
        var x = 152,
          y = 26,
          i = images ? images[value] : false;
        g.reset();
        if (!i) g.setColor(g.theme.bg);
        g.drawImage(atob("Dw+BADAYYDDAY//v////////////////////////3/8A"), x + 4, y);
        if (i) g.drawImage(atob(i.str), x + i.x, y - 9 + i.y);
        i = undefined;
      }
    },
    touchOn: {
      title: ["on def clk", "on all clk", "clk+launch", "clk+setting", "except apps", "always on"],
      value: ["", "clock", "clock,setting.app.js", "clock,launch", "clock,setting.app.js,launch", "always"],
      drawWidgets: true
    },
    oversize: {
      factor: 1,
      unit: "px",
      min: 0,
      max: 50,
      step: 1,
      drawWidgets: true
    },
    dragDelay: {
      factor: 1,
      unit: "ms",
      min: 0,
      max: 1000,
      step: 50
    },
    minValue: {
      factor: 100,
      unit: "%",
      min: 1,
      max: 100,
      step: 1
    },
    tapToLock: {
      title: ["on", "off"],
      value: [true, false],
      drawWidgets: false
    },
    unlockSide: {
      title: ["off", "left", "right", "top", "bottom", "front", "back"],
      value: ["", "left", "right", "top", "bottom", "front", "back"]
    },
    tapOn: {
      title: ["on locked", "on unlocked", "always on"],
      value: ["locked", "unlocked", "always"]
    },
    tOut: {
      factor: 0.001,
      unit: "s",
      min: 0.5,
      max: 10,
      step: 0.5
    }
  };
  // copy duplicated entries
  entries.tapSide = entries.unlockSide;
  entries.minFlash = entries.minValue;

  // show main menu
  function showMain() {
    E.showMenu({
      "": {
        title: "Light Switch"
      },
      "< Back": () => back(),
      "-- Widget": {},
      "Bulb col": getEntry("colors"),
      "Image": getEntry("image"),
      "-- Control": {},
      "Touch": getEntry("touchOn"),
      "Oversize": getEntry("oversize"),
      "Drag Delay": getEntry("dragDelay"),
      "Min Value": getEntry("minValue"),
      "Tap to lock": getEntry("tapToLock"),
      "-- Unlock": {},
      "TapSide": getEntry("unlockSide"),
      "-- Flash": {},
      "TapSide ": getEntry("tapSide"),
      "Tap": getEntry("tapOn"),
      "Timeout": getEntry("tOut"),
      "Min Value ": getEntry("minFlash")
    });
  }

  // draw main menu
  showMain();
})
