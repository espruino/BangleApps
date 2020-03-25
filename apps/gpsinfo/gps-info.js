var img = require("heatshrink").decompress(atob("mEwghC/AH4AKg9wC6t3u4uVC6wWBI6t3uJeVuMQCqcBLisAi4XLxAABFxAXKgc4DBAuBRhQXEDAq7MmYXEwBHEXZYXFGAOqAAKDMmczC4mIC62CC50PC4JIBkQABiIvRmURAAUSjQXSFwMoxGKC6CRFwUSVYgXLPIgXXwMYegoXLJAYXCGBnzGA0hPQIwMgYwGC6gwCC4ZIMC4gYBC604C4ZISmcRVgapQAAMhC6GIJIwXCMBcIxGDDBAuLC4IwGAARGMAAQWGmAXPJQoWMC4pwCCpoXJAB4XXAH4A/ABQA="))

Bangle.setGPSPower(1);
Bangle.setLCDMode("doublebuffered");
E.showMessage("Loading..."); // avoid showing rubbish on screen

var lastFix = {
  fix: 0,
  alt: 0,
  lat: 0,
  lon: 0,
  speed: 0,
  time: 0,
  satellites: 0
};
var nofix = 0;

function formatTime(now) {
  var fd = now.toUTCString().split(" ");
  var time = fd[4].substr(0, 5);
  var date = [fd[0], fd[1], fd[2]].join(" ");
  return time + " - " + date;
}

function onGPS(fix) {
  lastFix = fix;
  g.clear();
  g.setFontAlign(-1, -1);
  g.drawImage(img, 20, -12);
  g.setFont("6x8");
  g.setFontVector(22);
  g.drawString("GPS Info", 70, 0);
  if (fix.fix) {
    nofix = 0;
    var alt = fix.alt;
    var lat = fix.lat;
    var lon = fix.lon;
    var speed = fix.speed;
    var time = formatTime(fix.time);
    var satellites = fix.satellites;

    var s = 15;
    g.setFontVector(s);
    g.drawString("Altitude: "+alt+" m",10,44);
    g.drawString("Lat: "+lat,10,44+20);
    g.drawString("Lon: "+lon,10,44+40);
    g.drawString("Speed: "+speed.toFixed(1)+" km/h",10,44+60);
    g.drawString("Time: "+time,10,44+80);
    g.drawString("Satellites: "+satellites,10,44+100);
  } else {
    g.setFontAlign(0, 1);
    g.setFont("6x8", 2);
    g.drawString("Waiting for GPS", 120, 80);
    nofix = (nofix+1) % 4;
    g.drawString(".".repeat(nofix) + " ".repeat(4-nofix), 120, 120)
  }
  g.flip();
}

Bangle.on('GPS', onGPS);
