(() => {
  var settings = {};
  var hasFix = false;
  var fixToggle = false; // toggles once for each reading
  var gpsTrack; // file for GPS track
  var periodCtr = 0;

  // draw your widget
  function draw() {
    if (!settings.recording) return;
    g.reset();
    g.setFont("4x6");
    g.setFontAlign(0,0);
    g.clearRect(this.x,this.y,this.x+23,this.y+23);
    g.setColor("#ff0000");
    if (hasFix) {
      if (fixToggle) {
        g.fillCircle(this.x+11,this.y+11,9);
        g.setColor("#000000");
      } else
        g.drawCircle(this.x+11,this.y+11,9);
    } else {
      g.drawString("NO",this.x+12,this.y+5);
      g.drawString("FIX",this.x+12,this.y+19);
    }
    g.drawString("GPS",this.x+12,this.y+12);
  }

  function onGPS(fix) {
    hasFix = fix.fix;
    fixToggle = !fixToggle;
    draw();
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
    settings.period = settings.period||1;
    settings.file |= 0;

    Bangle.removeListener('GPS',onGPS);
    if (settings.recording) {
      WIDGETS["gpsrec"].width = 24;
      Bangle.on('GPS',onGPS);
      Bangle.setGPSPower(1);
      var n = settings.file.toString(36);
      gpsTrack = require("Storage").open(".gpsrc"+n,"a");
    } else {
      WIDGETS["gpsrec"].width = 0;
      Bangle.setGPSPower(0);
      gpsTrack = undefined;
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
