(() => {
  var settings = {};
  var hasFix = false;
  var fixToggle = false; // toggles once for each reading
  var gpsTrack; // file for GPS track
  var periodCtr = 0;
  var gpsOn = false;

  // draw your widget
  function draw() {
    if (!settings.recording) return;
    g.reset();
    g.drawImage(atob("GBgCAAAAAAAAAAQAAAAAAD8AAAAAAP/AAAAAAP/wAAAAAH/8C9AAAB/8L/QAAAfwv/wAAAHS//wAAAAL//gAAAAf/+AAAAAf/4AAAAL//gAAAAD/+DwAAAB/Uf8AAAAfA//AAAACAf/wAAAAAH/0AAAAAB/wAAAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),this.x,this.y);
    if (hasFix) {
      g.setColor("#00FF00");
      g.drawImage(fixToggle ? atob("CgoCAAAAA0AAOAAD5AAPwAAAAAAAAAAAAAAAAA==") : atob("CgoCAAABw0AcOAHj5A8PwHwAAvgAB/wABUAAAA=="),this.x,this.y+14);
    } else {
      g.setColor("#0000FF");
      if (fixToggle)
        g.setFont("6x8").drawString("?",this.x,this.y+14);
    }
  }

  function onGPS(fix) {
    hasFix = fix.fix;
    fixToggle = !fixToggle;
    WIDGETS["gpsrec"].draw();
    if (hasFix) {
      periodCtr--;
      if (periodCtr<=0) {
        periodCtr = settings.period;
        if (gpsTrack) gpsTrack.write([
          fix.time.getTime(),
          fix.lat.toFixed(5),
          fix.lon.toFixed(5),
          fix.alt
        ].join(",")+"\n");
      }
    }
  }

  // Called by the GPS app to reload settings and decide what to do
  function reload() {
    settings = require("Storage").readJSON("gpsrec.json",1)||{};
    settings.period = settings.period||10;
    settings.file |= 0;

    Bangle.removeListener('GPS',onGPS);
    var gOn = false;
    if (settings.recording) {
      WIDGETS["gpsrec"].width = 24;
      Bangle.on('GPS', onGPS);
      var n = settings.file.toString(36);
      gpsTrack = require("Storage").open(".gpsrc"+n,"a");
      gOn = true;
    } else {
      WIDGETS["gpsrec"].width = 0;
      gpsTrack = undefined;
    }
    if (gOn != gpsOn) {
      Bangle.setGPSPower(gOn);
      gpsOn = gOn;
    }
  }
  // add the widget
  WIDGETS["gpsrec"]={area:"tl",width:24,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  }};
  // load settings, set correct widget width
  reload();
})()
