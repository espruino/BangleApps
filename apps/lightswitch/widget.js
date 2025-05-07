(function() {
  // load settings
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
    tOut: 3000,
    value: 1,
    isOn: true
  }, require("Storage").readJSON("lightswitch.json", true) || {});

  // write widget with loaded settings
  WIDGETS.lightswitch = Object.assign(settings, {

    // set area, sortorder, width and dragStatus
    area: "tr",
    sortorder: 10,
    width: 23,
    dragStatus: "off",

    // internal function //
    // write settings to storage
    writeSettings: function(changes) {
      // define variables
      var filename = "lightswitch.json";
      var storage = require("Storage");

      // write changes into json file
      storage.writeJSON(filename, Object.assign(
        storage.readJSON(filename, true) || {}, changes
      ));

      // clear variables
      filename = undefined;
      storage = undefined;
    },

    // internal function //
    // draw inner bulb circle
    drawInnerBulb: function(value) {
      // check if active or value is set
      if (value || this.isOn) {
        // use set value or load from widget
        value = value || this.value;
        // calculate color
        g.setColor(
          value * this.colors[0],
          value * this.colors[1],
          value * this.colors[2]
        );
      } else {
        // backlight off
        g.setColor(0);
      }
      // draw circle
      g.drawImage(atob("CwuBAB8H8f9/////////f8fwfAA="), this.x + 6, this.y + 6);
    },

    // internal function //
    // draw widget icon
    drawIcon: function(locked) {
      // define icons
      var icons = {
        bulb: "DxSBAAAAD4BgwYDCAIgAkAEgAkAEgAiAIYDBgwH8A/gH8A/gH8AfABwA",
        shine: "FxeBAAgQIAgggBBBABAECAAALAABhAAEAAAAAAAAAAAAAAAHAABwAAAAAAAAAAAAAAAQABDAABoAAAgQBABABACACAIACAA=",
        lock: "DxCBAAAAH8B/wMGBgwMGBgwf/H/8+Pnx8/fn78/fn/8f/A==",
        image: "DxSBAA/gP+Dg4YDDAYYDDAYYDH/9////////////////////////+//g"
      };
      // read images
      var images = require("Storage").readJSON("lightswitch.images.json", true) || false;

      // select image if images are found
      var image = (!images || image === "default") ? false :
        (function(i) {
          if (i === "random") {
            i = Object.keys(images);
            i = i[parseInt(Math.random() * i.length)];
          }
          return images[i];
        })(this.image);

      // clear widget area
      g.reset().clearRect(this.x, this.y, this.x + this.width, this.y + 23);

      // draw shine if backlight is active
      if (this.isOn) g.drawImage(atob(icons.shine), this.x, this.y);

      // draw icon depending on lock status and image
      g.drawImage(atob(!locked ? icons.bulb : image ? icons.image : icons.lock), this.x + 4, this.y + 4);

      // draw image on lock
      if (locked && image) g.drawImage(atob(image.str), this.x + image.x, this.y + image.y);

      // draw bulb color depending on backlight status
      if (!locked) this.drawInnerBulb();

      // clear variables
      icons = undefined;
      images = undefined;
      image = undefined;
    },

    // internal function //
    // change or switch backlight and icon and write to storage if not skipped
    changeValue: function(value, skipWrite) {
      // check value
      if (value) {
        // set new value
        this.value = value;
        // check backlight status
        if (this.isOn) {
          // redraw only inner bulb circle
          this.drawInnerBulb();
        } else {
          // activate backlight
          this.isOn = true;
          Bangle.setLCDPower(true);
          // redraw complete widget icon
          this.drawIcon(false);
        }
      } else {
        // switch backlight status
        this.isOn = !this.isOn;
        // redraw widget icon
        this.drawIcon(false);
      }
      // set brightness
      Bangle.setLCDBrightness(this.isOn ? this.value : 0);
      // write changes to storage if not skipped
      if (!skipWrite) this.writeSettings({
        isOn: this.isOn,
        value: this.value
      });
    },

    // listener function //
    // drag listener for brightness change mode
    dragListener: function(event) {
      // setup shortcut to this widget
      var w = WIDGETS.lightswitch;

      // first drag recognised
      if (event.b && typeof w.dragStatus === "number") {
        // reset drag timeout
        clearTimeout(w.dragStatus);
        // change drag status to indicate ongoing drag action
        w.dragStatus = "ongoing";
        // feedback for brightness change mode
        Bangle.buzz(50);
      }

      // read y position, pleasant usable area 20-170
      var y = event.y;
      y = y < 20 ? 0 : y > 170 ? 150 : y - 20;
      // calculate brightness respecting minimal value in settings
      var value = (1 - Math.round(y / 1.5) / 100) * (1 - w.minValue) + w.minValue;

      // change brigthness value, skip write to storage while still touching
      w.changeValue(value, event.b);

      // masks this drag event by messing up the event handler
      E.stopEventPropagation&&E.stopEventPropagation();

      // on touch release remove drag listener and reset drag status to indicate stopped drag action
      if (!event.b) {
        Bangle.removeListener("drag", w.dragListener);
        Bangle.removeListener("swipe", w.swipeListener);
        w.dragStatus = "off";
      }

      // clear variables
      w = undefined;
      y = undefined;
      value = undefined;
    },

    swipeListener: function(_,__) {
      // masks this swipe event by messing up the event handler
      E.stopEventPropagation&&E.stopEventPropagation();
    },

    // listener function //
    // touch listener for light control
    touchListener: function(button, cursor) {
      // setup shortcut to this widget
      var w = WIDGETS.lightswitch;

      // skip all if drag action ongoing
      if (w.dragStatus === "off") {

        // check if inside widget area
        if (!(!w || cursor.x < w.x - w.oversize || cursor.x > w.x + w.width + w.oversize ||
            cursor.y < w.y - w.oversize || cursor.y > w.y + 23 + w.oversize)) {
          // first touch feedback
          Bangle.buzz(25);
          // check if drag is disabled
          if (w.dragDelay) {
            // add drag and swipe listeners at respective first position
            Bangle["#ondrag"] = [w.dragListener].concat(Bangle["#ondrag"]);
            Bangle["#onswipe"] = [w.swipeListener].concat(Bangle["#onswipe"]);
            // set drag timeout
            w.dragStatus = setTimeout((w) => {
              // remove drag and swipe listeners
              Bangle.removeListener("drag", w.dragListener);
              Bangle.removeListener("swipe", w.swipeListener);
              // clear drag timeout
              if (typeof w.dragStatus === "number") clearTimeout(w.dragStatus);
              // reset drag status to indicate stopped drag action
              w.dragStatus = "off";
            }, w.dragDelay, w);
          }
          if (w.tapToLock) {
            Bangle.setLocked(true);
          } else {
            // switch backlight
            w.changeValue();
          }
          // masks this touch event by messing up the event handler
          // see https://github.com/espruino/Espruino/issues/2151
          Bangle.removeListener("touch", w.touchListener);
          Bangle["#ontouch"] = [w.touchListener].concat(Bangle["#ontouch"]);
        }

      }

      // clear variable
      w = undefined;
    },

    // main widget function //
    // display and setup/reset function
    draw: function() {
      // setup shortcut to this widget
      var w = WIDGETS.lightswitch;

      // read lock status
      var locked = Bangle.isLocked();

      // remove listeners to prevent uncertainties
      Bangle.removeListener("touch", w.touchListener);
      Bangle.removeListener("tap", require("lightswitch.js").tapListener);

      // draw widget icon
      w.drawIcon(locked);

      // add touch listener to control the light depending on settings at first position
      if (w.touchOn === "always" || !global.__FILE__ ||
        w.touchOn.includes(__FILE__) ||
        w.touchOn.includes(require("Storage").readJSON(__FILE__.replace("app.js", "info")).type))
        Bangle["#ontouch"] = [w.touchListener].concat(Bangle["#ontouch"]);

      // add tap listener to unlock and/or flash backlight
      if (w.unlockSide || w.tapSide) Bangle.on("tap", require("lightswitch.js").tapListener);

      // clear variables
      w = undefined;
    }
  });

  Bangle.on("lock", locked => {
    var w = WIDGETS.lightswitch;
    // set lcd brightness on unlocking
    // all other cases are catched by the boot file
    if (locked === false) Bangle.setLCDBrightness(w.isOn ? w.value : 0);
    w.draw()
  });

  // clear variable
  delete settings;
})()
