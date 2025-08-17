// from boot accassible functions
exports = {
  // listener function //
  // tap listener to flash backlight
  tapListener: function(data) {
    // check for double tap and direction
    if (data.double) {
      // setup shortcut to this widget or load from storage
      var w = global.WIDGETS && WIDGETS.lightswitch || Object.assign({
        unlockSide: "",
        tapSide: "right",
        tapOn: "always",
        isOn: true
      }, require("Storage").readJSON("lightswitch.json", true) || {});

      // cache lock status
      var locked = Bangle.isLocked();

      // check to unlock
      if (locked && data.dir === w.unlockSide) {
        Bangle.setLocked();
        if (w.isOn) Bangle.setLCDPower(true);
      }

      // check to flash
      if (data.dir === w.tapSide && (w.tapOn === "always" || locked === (w.tapOn === "locked"))) require("lightswitch.js").flash();

      // clear variables
      w = undefined;
      locked = undefined;
    }
  },

  // external function //
  // function to flash backlight
  flash: function(tOut) {
    // setup shortcut to this widget or load from storage
    var w = global.WIDGETS && WIDGETS.lightswitch || Object.assign({
      tOut: 3000,
      minFlash: 0.2,
      value: 1,
      isOn: true
    }, require("Storage").readJSON("lightswitch.json", true) || {});

    // check if locked, backlight off or actual value lower then minimal flash value
    if (Bangle.isLocked() || !w.isOn || w.value < w.minFlash) {

      // set inner bulb and brightness
      var setBrightness = function(w, value) {
        if (w.drawInnerBulb) w.drawInnerBulb(value);
        Bangle.setLCDBrightness(value);
        Bangle.setLCDPower(true);
      };

      // override timeout if defined
      if (!tOut) tOut = w.tOut;

      // check lock state
      if (Bangle.isLocked()) {
        // cache options
        var options = Bangle.getOptions();
        // set shortened lock and backlight timeout
        Bangle.setOptions({
          lockTimeout: tOut,
          backlightTimeout: tOut
        });
        // unlock
        Bangle.setLocked(false);
        // set timeout to reset options
        setTimeout(Bangle.setOptions, tOut + 100, options);

        // clear variable
        options = undefined;
      } else {
        // set timeout to reset backlight
        setTimeout((w, funct) => {
          if (!Bangle.isLocked()) funct(w, w.isOn ? w.value : 0);
        }, tOut, w, setBrightness);
      }

      // enable backlight
      setTimeout((w, funct) => {
        funct(w, w.value < w.minFlash ? w.minFlash : w.value);
      }, 10, w, setBrightness);

      // clear variable
      setBrightness = undefined;
    }

    // clear variable
    w = undefined;
  },

  // external access to internal function //
  // refference to widget function or set backlight and write to storage if not skipped
  changeValue: function(value, skipWrite) {
    // check if widgets are loaded
    if (global.WIDGETS) {
      // execute inside widget
      WIDGETS.lightswitch.changeValue(value, skipWrite);
    } else {
      // load settings from storage
      var filename = "lightswitch.json";
      var storage = require("Storage");
      var settings = Object.assign({
        value: 1,
        isOn: true
      }, storage.readJSON(filename, true) || {});

      // check value
      if (value) {
        // set new value
        settings.value = value;
      } else {
        // switch backlight status
        settings.isOn = !settings.isOn;
      }
      // set brightness
      Bangle.setLCDBrightness(settings.isOn ? settings.value : 0);
      // write changes to storage if not skipped
      if (!skipWrite) storage.writeJSON(filename, settings);

      // clear variables
      filename = undefined;
      storage = undefined;
      settings = undefined;
    }
  }
};
