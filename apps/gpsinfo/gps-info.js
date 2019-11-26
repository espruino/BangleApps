var img = require("heatshrink").decompress(atob("mEwghC/AH4AKg9wC6t3u4uVC6wWBI6t3uJeVuMQCqcBLisAi4XLxAABFxAXKgc4DBAuBRhQXEDAq7MmYXEwBHEXZYXFGAOqAAKDMmczC4mIC62CC50PC4JIBkQABiIvRmURAAUSjQXSFwMoxGKC6CRFwUSVYgXLPIgXXwMYegoXLJAYXCGBnzGA0hPQIwMgYwGC6gwCC4ZIMC4gYBC604C4ZISmcRVgapQAAMhC6GIJIwXCMBcIxGDDBAuLC4IwGAARGMAAQWGmAXPJQoWMC4pwCCpoXJAB4XXAH4A/ABQA="))

Bangle.setGPSPower(1);
Bangle.setLCDMode("doublebuffered");

var lastFix = {
  fix: 0,
  alt: 0,
  lat: 0,
  lon: 0,
  time: 0,
  satellites: 0
};

function formatTime(now) {
  var fd = now.toUTCString().split(" ");
  var time = fd[4].substr(0, 5);
  var date = [fd[0], fd[1], fd[2]].join(" ");
  var year = now.getFullYear();
  return time + " - " + date;
}

function onGPS(fix) {
  lastFix = fix;
  g.clear();
  g.setFontAlign(-1, -1);
  g.drawImage(img, 30, -6);
  g.setFont("6x8");
  g.setFontVector(22);
  g.drawString("GPS Info", 80, 6);
  if (fix.fix) {
    var alt = fix.alt;
    var lat = fix.lat;
    var lon = fix.lon;
    var time = formatTime(fix.time);
    var satellites = fix.satellites;

    var s = 12;
    g.setFontVector(s+4);
    g.drawString("Altitude: "+alt+" m",0,60);
    g.setFontVector(s);
    g.drawString("Lat: "+lat, 0, 60+20+s/2);
    g.drawString("Lon: "+lon,0,60+40+s/2);
    g.drawString("Time: "+time, 0, 60+60+s/2);
    g.drawString("Satellites: "+satellites,0,60+80+s/2);

  } else {
    g.setFontAlign(0, 1);
    g.setFont("6x8", 2);
    g.drawString("Waiting for GPS", 120, 80);
  }
  g.flip();
}

Bangle.on('GPS', onGPS);
