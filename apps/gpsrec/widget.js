(() => {
  var settings = {};
  var hasFix = false;
  var fixToggle = false; // toggles once for each reading
  var gpsTrack; // file for GPS track
  var gpsOn = false;
  var lastFixTime = Date.now();

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
      if (fix.time===undefined) fix.time = new Date(); // Bangle.js 2 can provide a fix before time it seems
      var period = fix.time.getTime() - lastFixTime;
      if (period+500 > settings.period*1000) { // round up
        lastFixTime = fix.time.getTime();
        try {
          if (gpsTrack) gpsTrack.write([
            fix.time.getTime(),
            fix.lat.toFixed(6),
            fix.lon.toFixed(6),
            fix.alt
          ].join(",")+"\n");
        } catch(e) {
          // If storage.write caused an error, disable
          // GPS recording so we don't keep getting errors!
          console.log("gpsrec: write error", e);
          settings.recording = false;
          require("Storage").write("gpsrec.json", settings);
          reload();
        }
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
      Bangle.setGPSPower(gOn,"gpsrec");
      gpsOn = gOn;
    }
  }
  // add the widget
  WIDGETS["gpsrec"]={area:"tl",width:24,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  },plotTrack:function(m) { // m=instance of openstmap module
    // if we're here, settings was already loaded
    var n = settings.file.toString(36);
    var f = require("Storage").open(".gpsrc"+n,"r");
    var l = f.readLine(f);
    if (l===undefined) return;
    var c = l.split(",");
    var mp = m.latLonToXY(+c[1], +c[2]);
    g.moveTo(mp.x,mp.y);
    l = f.readLine(f);
    while(l!==undefined) {
      c = l.split(",");
      mp = m.latLonToXY(+c[1], +c[2]);
      g.lineTo(mp.x,mp.y);
      g.fillCircle(mp.x,mp.y,2); // make the track more visible
      l = f.readLine(f);
    }
  }};
  // load settings, set correct widget width
  reload();
})()
