<<<<<<< HEAD
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
    g.drawString(".".repeat(nofix) + " ".repeat(4-nofix), 120, 120);
    // Show number of satellites:
    g.setFontAlign(0,0);
    g.setFont("6x8");
    g.drawString(fix.satellites+" satellites", 120, 100);
  }
  g.flip();
}

Bangle.on('GPS', onGPS);
=======
function satelliteImage() {
  return require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AH4AGnE4F1wvsF34wgFldcLdyMYsoACF1WJF4YxPFzOtF4wxNFzAvKSiIvU1ovIGAkJAAQucF5QxCFwYwbF4QwLrwvjYIVfrwABrtdq9Wqwvkq4oCAAtXmYvi1teE4NXrphCrxoCGAbvdSIoAHNQNeFzQvGeRQvCsowrYYNfF8YwHZQQFCF8QwGF4owjeYovBroHEMERhEF8IwNrtWryYFF8YwCq4vhGBeJF5AwaxIwKwVXFwwvandfMJeJF8M6nZiLGQIvdstfGAVlGBZkCxJeZJQIwCGIRjMFzYACGIc6r/+FsIvGGIYABEzYvPGQYvusovkAH4A/AH4A/ACo="));
}

var Layout = require("Layout");
var layout;
Bangle.setGPSPower(1, "app");
E.showMessage("Loading..."); // avoid showing rubbish on screen

var lastFix = {
  fix: -1,
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
  var t = lon/20;
  fLon = Math.floor(t);
  t = (t % fLon)*10;
  sqLon = Math.floor(t);
  t = (t-sqLon)*24;
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
  if (lastFix.fix != fix.fix) {
    // if fix is different, change the layout
    if (fix.fix) {
      layout = new Layout( {
        type:"v", c: [
          {type:"txt", font:"6x8:2", label:"GPS Info" },
          {type:"img", src:satelliteImage, pad:4 },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"alt"  },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"lat" },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"lon" },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"speed" },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"time" },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"sat" },
          {type:"txt", font:"6x8", label:"", fillx:true, id:"maidenhead" },
        ]},{lazy:true});
    } else {
      layout = new Layout( {
        type:"v", c: [
          {type:"txt", font:"6x8:2", label:"GPS Info" },
          {type:"img", src:satelliteImage, pad:4 },
          {type:"txt", font:"6x8", label:"Waiting for GPS" },
          {type:"h", c: [
            {type:"txt", font:"10%", label:fix.satellites, pad:2, id:"sat" },
            {type:"txt", font:"6x8", pad:3, label:"Satellites" }
          ]},
          {type:"txt", font:"6x8", label:"", id:"progress" }
        ]},{lazy:true});
    }
    g.clearRect(0,24,g.getWidth(),g.getHeight());
    layout.render();
  }
  lastFix = fix;
  if (fix.fix) {
    nofix = 0;
    var locale = require("locale");
    var satellites = fix.satellites;
    var maidenhead = getMaidenHead(fix.lat,fix.lon);
    layout.alt.label = "Altitude: "+locale.distance(fix.alt);
    layout.lat.label = "Lat: "+fix.lat.toFixed(6);
    layout.lon.label = "Lon: "+fix.lon.toFixed(6);
    layout.speed.label = "Speed: "+locale.speed(fix.speed);
    layout.time.label = "Time: "+formatTime(fix.time);
    layout.sat.label = "Satellites: "+satellites;
    layout.maidenhead.label = "Maidenhead: "+maidenhead;
  } else {
    layout.sat.label = fix.satellites;
    nofix = (nofix+1) % 4;
    layout.progress.label = ".".repeat(nofix) + " ".repeat(4-nofix);
  }
  layout.render();
}

Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.on('GPS', onGPS);
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
