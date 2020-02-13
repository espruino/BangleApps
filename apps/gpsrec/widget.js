(() => {
  // add the width
  var xpos = WIDGETPOS.tl;
  WIDGETPOS.tl += 24;/* the widget width plus some extra pixel to keep distance to others */;
  var settings = {};
  var hasFix = false;
  var fixToggle = false; // toggles once for each reading
  var gpsTrack; // file for GPS track
  var periodCtr = 0;

  // draw your widget at xpos
  function draw() {
    g.reset();
    g.setFont("4x6");
    g.setFontAlign(0,0);
    g.clearRect(xpos,0,xpos+23,23);

    if (!settings.recording) {
      g.setColor("#606060");
    } else {
      g.setColor("#ff0000");
      if (hasFix) {
        if (fixToggle) {
          g.fillCircle(xpos+11,11,9);
          g.setColor("#000000");
        } else
          g.drawCircle(xpos+11,11,9);
      } else {
        g.setColor(fixToggle ? "#ff0000" : "#7f0000");
        g.drawString("NO",xpos+12,5);
        g.drawString("FIX",xpos+12,19);
      }
    }
    g.drawString("GPS",xpos+12,12);
    g.setColor(-1); // change color back to be nice to other apps
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

  // Called by the GPS app to reload settings and decide what's
  function reload() {
    settings = require("Storage").readJSON("@gpsrec")||{};
    settings.period = settings.period||1;
    settings.file |= 0;

    Bangle.removeListener('GPS',onGPS);
    if (settings.recording) {
      Bangle.on('GPS',onGPS);
      Bangle.setGPSPower(1);
      var n = settings.file.toString(36);
      gpsTrack = require("Storage").open(".gpsrc"+n,"a");
    } else {
      Bangle.setGPSPower(0);
      gpsTrack = undefined;
    }
    draw();
  }
  reload();
  // add the widget
  WIDGETS["gpsrec"]={draw:draw,reload:reload};
})()
