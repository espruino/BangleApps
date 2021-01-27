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
function getMaidenHead(param1,param2){
  var lat=-100.0;
  var lon=0.0;
  var U = 'ABCDEFGHIJKLMNOPQRSTUVWX';
  var L = U.toLowerCase();

  lat = param1;
  lon = param2;

  lon = lon + 180;
  t = lon/20;
  fLon = Math.floor(t);
  t = (t % fLon)*10;
  sqLon = Math.floor(t);
  t=(t-sqLon)*24;
  subLon = Math.floor(t);
  extLon = Math.floor((t-subLon)*10);
  
  lat = lat + 90;
  t = lat/10;
  fLat = Math.floor(t);
  t = (t % fLat)*10;
  sqLat = Math.floor(t);
  t=(t-sqLat)*24;
  subLat = Math.floor(t);
  extLat = Math.floor((t-subLat)*10);

  return U[fLon]+U[fLat]+sqLon+sqLat+L[subLon]+L[subLat]+extLon+extLat;
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
    var maidenhead = getMaidenHead(lat,lon);
    var s = 15;
    g.setFontVector(s);
    g.drawString("Altitude: "+alt+" m",10,36);
    g.drawString("Lat: "+lat,10,54);
    g.drawString("Lon: "+lon,10,72);
    g.drawString("Speed: "+speed.toFixed(1)+" km/h",10,90);
    g.drawString("Time: "+time,10,108);
    g.drawString("Satellites: "+satellites,10,126);
    g.drawString("Maidenhead: "+maidenhead,10,144);
  } else {
    g.setFontAlign(0, 1);
    g.setFont("6x8", 2);
    g.drawString("Waiting for GPS", 120, 80);
    nofix = (nofix+1) % 4;
    g.drawString(".".repeat(nofix) + " ".repeat(4-nofix), 120, 120);
    // Show number of satellites:
    g.setFontAlign(0,0);
    g.setFont("6x8");
    g.drawString(fix.satellites+" satellites", 120, 100);
  }
  g.flip();
}

Bangle.on('GPS', onGPS);
