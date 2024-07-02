function satelliteImage() {
  return require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AH4AGnE4F1wvsF34wgFldcLdyMYsoACF1WJF4YxPFzOtF4wxNFzAvKSiIvU1ovIGAkJAAQucF5QxCFwYwbF4QwLrwvjYIVfrwABrtdq9Wqwvkq4oCAAtXmYvi1teE4NXrphCrxoCGAbvdSIoAHNQNeFzQvGeRQvCsowrYYNfF8YwHZQQFCF8QwGF4owjeYovBroHEMERhEF8IwNrtWryYFF8YwCq4vhGBeJF5AwaxIwKwVXFwwvandfMJeJF8M6nZiLGQIvdstfGAVlGBZkCxJeZJQIwCGIRjMFzYACGIc6r/+FsIvGGIYABEzYvPGQYvusovkAH4A/AH4A/ACo="));
}

var Layout = require("Layout");
var layout;
//Bangle.setGPSPower(1, "app");
E.showMessage(/*LANG*/"Waiting for GNS data..."); // avoid showing rubbish on screen

var lastFix = {
  fix: -1,
  alt: 0,
  lat: 0,
  lon: 0,
  speed: 0,
  time: 0,
  satellites: 0
};
var SATinView = 0, lastSATinView = -1, nofGP = 0, nofBD = 0, nofGL = 0;
const leaveNofixLayout = 1;  // 0 = stay on initial screen for debugging (default = 1)
var listenerGPSraw = 0;
var dataCounter = 0;

function formatTime(now) {
  if (now == undefined) {
    return "no GPS time available";
  } else {
    var fd = now.toUTCString().split(" ");
    var time = fd[4].substr(0, 5);
    var date = [fd[0], fd[1], fd[2]].join(" ");
    return time + " - " + date;
  }
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
  const fLon = Math.floor(t);
  t = (t % fLon)*10;
  const sqLon = Math.floor(t);
  t = (t-sqLon)*24;
  const subLon = Math.floor(t);
  const extLon = Math.floor((t-subLon)*10);

  lat = lat + 90;
  t = lat/10;
  const fLat = Math.floor(t);
  t = (t % fLat)*10;
  const sqLat = Math.floor(t);
  t=(t-sqLat)*24;
  const subLat = Math.floor(t);
  const extLat = Math.floor((t-subLat)*10);

  return U[fLon]+U[fLat]+sqLon+sqLat+L[subLon]+L[subLat]+extLon+extLat;
}
function onGPS(fix) {
  dataCounter++;
  if (lastFix.fix != fix.fix) {
    // if fix is different, change the layout
    if (fix.fix && leaveNofixLayout) {
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
          {type:"txt", font:"6x8", label:"Waiting for GPS fix" },
          {type:"h", c: [
            {type:"txt", font:"10%", label:fix.satellites, pad:2, id:"sat" },
            {type:"txt", font:"6x8", pad:3, label:"Satellites used" }
          ]},
          {type:"h", c: [
            {type:"txt", font:"10%", label:dataCounter, pad:2, id:"dataCounter" },
            {type:"txt", font:"6x8", pad:3, label:"packets received" }
          ]},
          {type:"txt", font:"6x8", label:"", fillx:true, id:"progress" }
        ]},{lazy:false});
    }
    g.clearRect(0,24,g.getWidth(),g.getHeight());
    layout.render();
  }
  if (fix.fix && leaveNofixLayout) {
    if (listenerGPSraw == 1) {
      Bangle.removeListener('GPS-raw', onGPSraw);
      listenerGPSraw = 0;
      lastSATinView = -1;
      Bangle.buzz(50);
    }
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
    layout.render();
  } else {
    if (fix.satelites != lastFix.satelites) {
      layout.clear(layout.sat);
      layout.sat.label = fix.satellites;
      layout.render(layout.sat);
    }
    if (SATinView != lastSATinView) {
      if (!leaveNofixLayout) SATinView = -1;
      lastSATinView = SATinView;
      layout.clear(layout.progress);
      layout.progress.label = "in view GP/BD/GL: " + nofGP + " " + nofBD + " " + nofGL;
      // console.log("in view GP/BD/GL: " + nofGP + " " + nofBD + " " + nofGL);
      layout.render(layout.progress);
    }
    layout.clear(layout.dataCounter);
    layout.dataCounter.label = dataCounter;
    layout.render(layout.dataCounter);
  }

  if (listenerGPSraw == 0 && !fix.fix) {
    setTimeout(() => Bangle.on('GPS-raw', onGPSraw), 10);
    listenerGPSraw = 1;
  }
  lastFix = fix;
}

function onGPSraw(nmea) {
  if (nmea.slice(3,6) == "GSV") {
    // console.log(nmea.slice(1,3) + "  " + nmea.slice(11,13));
    if (nmea.slice(0,7) == "$GPGSV,") nofGP = Number(nmea.slice(11,13));
    if (nmea.slice(0,7) == "$BDGSV,") nofBD = Number(nmea.slice(11,13));
    if (nmea.slice(0,7) == "$GLGSV,") nofGL = Number(nmea.slice(11,13));
    SATinView = nofGP + nofBD + nofGL;
  }
}


Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.on('GPS', onGPS);
//Bangle.on('GPS-raw', onGPSraw);
Bangle.setGPSPower(1, "app");


function  exitApp() {
  load();
}

setWatch(_=>exitApp(), BTN1);
if (global.BTN2) {
  setWatch(_=>exitApp(), BTN2);
  setWatch(_=>exitApp(), BTN3);
}
