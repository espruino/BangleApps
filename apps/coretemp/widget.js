// TODO Change to generic multiple sensor
(() => {
  var settings = {};
  var count = 0;

  var img0 = {
    width : 24,
    height : 24,
    bpp : 4,
    transparent : 0,
    buffer :
        require("heatshrink")
            .decompress(atob(
                "AA0IxGIBAtms0ABQOIwAKFsAWCDAkGBYQUCBwIKEBYgmBBYoHBC4oKDBAILECwRSFDQQLBsBLDBYg4CNYoKBwALGDQYLCQpALaF45jBBZBfJMIZ3GZgwkGZYibCDIMGWoILDWYbBDd4gMFWoTvFYYgAFEYYHDA=="))
  };
  var img1 = {
    width : 24,
    height : 24,
    bpp : 3,
    transparent : 0,
    buffer :
        require("heatshrink")
            .decompress(atob(
                "AAkCpMgAwYFBiVJkgHCAoMAyQIBwAIBAoMEyEABAUkBAkEBAdICIkBBAIdBBAcJEwo1BBAI4EAoJBEKAMAiAIEAAIvBLgosBBCYjFJQIIFKwJHFBARZFBwRrCNAKbCC4J0CpApFR4REGBAWShIxDPQSSCYogvEA="))
  };

  // draw your widget
  function draw() {
    if (!settings.enabled)
      return;
    g.reset();
    g.setFontAlign(0, 0);
    g.clearRect(this.x, this.y, this.x + 23, this.y + 23);
    g.drawImage((count & 1) ? img1: img0, this.x, this.y);
  }

  // Set a listener to 'blink'
  function onTemp(temp) {
    count = count + 1;
    WIDGETS["coretemp"].draw();
  }

  // Called by sensor app to update status
  function reload() {
    settings = require("Storage").readJSON("coretemp.json", 1) || {};

    Bangle.removeListener('CoreTemp', onTemp);

    if (settings.enabled) {
      WIDGETS["coretemp"].width = 24;
      Bangle.on('CoreTemp', onTemp);
    } else {
      WIDGETS["coretemp"].width = 0;
      count = 0;
    }
  }
  // add the widget
  WIDGETS["coretemp"] = {
    area : "tl",
    width : 24,
    draw : draw,
    reload : function() {
      reload();
      Bangle.drawWidgets(); // relayout all widgets
    }
  };
  // load settings, set correct widget width
  reload();
})()
