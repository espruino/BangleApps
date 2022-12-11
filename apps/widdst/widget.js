(() => {

  // our setTimeout() return value for the function that periodically check the status of DST
  var check_timeout = undefined;

  // Called by draw() when we are not in DST or when we are not displaying the icon
  function clear() {
    if (this.width) {
      this.width = 0;
      Bangle.drawWidgets();
    }
  }

  // draw, or erase, our little "dst" icon in the widgets area
  function draw() {
    var dstSettings = require('Storage').readJSON('widdst.json',1)||{};
    if ((dstSettings.has_dst) && (dstSettings.show_icon)) {
      var now = new Date();
      if (now.getIsDST()) {
        if (this.width) {
          g.drawImage(
            {
              width : 24, height : 24, bpp : 1, palette: new Uint16Array([g.theme.bg, g.theme.fg]),
              buffer : atob("AAAAAAAAPAAAIgAAIQAAIQAAIQAAIQAAIngAPIQAAIAAAPAAAAwAAAQAAIX8AHggAAAgAAAgAAAgAAAgAAAgAAAgAAAAAAAA")
            }, this.x, this.y
          );
        } else {
          this.width = 24;
          Bangle.drawWidgets();
        }
      } else {
        clear();
      }
      if (check_timeout) clearTimeout(check_timeout);
      check_timeout = setTimeout( function() {
        check_timeout = undefined;
        draw();
      }, 3600000 - (now.getTime() % 3600000)); // Check every hour.
    } else {
      clear();
    }
  }

  // Register ourselves
  if (E.setDST) {
    WIDGETS["widdst"] = {
      area: "tl",
      width: 0,
      draw: draw
    };
  } else {
    E.showAlert("Firmware update needed to support Daylight Saving Time");
  }

})()
