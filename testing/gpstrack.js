// unfinished GPS Track recorder
g.clear();
var gpsTrack = require("Storage").open(".track","w");
var gpsTrackLen = 0;
var recording = false;
var inMenu = false;
var currentFix;

function drawIcons() {
  g.clearRect(220,110,240,130);
  if (recording) {
    g.fillRect(225,115,235,125);
  } else {
    g.setColor(1,0,0);
    g.fillCircle(230,120,10);
    g.setColor(1,1,1);
  }
  g.setFont("6x8");
  g.setFontAlign(0,0);
  g.drawString("X",230,220);
}

setWatch(() => {
  if (inMenu) return;
  recording = !recording;
  drawIcons();
}, BTN2, {repeat:true});
setWatch(() => {
  if (inMenu) return;
  inMenu = true;
  g.flip();
  E.showPrompt("Erase GPS Trace?").then(r=>{
    inMenu = false;
    if (r) {
      gpsTrack.erase();
      gpsTrack = require("Storage").open(".track","w");
      gpsTrackLen = 0;
    }
  });
}, BTN3, {repeat:true});

function onGPS(fix) {
  currentFix = fix;
  if (!inMenu) {
    g.setFont("6x8");
    g.setFontAlign(0,0);
    g.drawString(" "+fix.satellites+" Satellites ",120,4,true/*solid bg*/);
    g.drawString(fix.fix ? "FIX Acquired":"     NO FIX    ",120,12,true/*solid bg*/);
    drawIcons();
  }
  if (!fix.fix) return;
  if (recording) {
    gpsTrack.write([
      fix.time.toISOString().slice(0,-5),
      fix.lat.toFixed(5),
      fix.lon.toFixed(5),
      fix.alt
    ].join(",")+"\n");
    gpsTrackLen++;
  }
  if (!inMenu) {
    g.drawString("  TRACK LENGTH "+gpsTrackLen+" ",120,236,true/*solid bg*/);
  }
  // TODO: Use Bangle.project to map this out onto the Screen?
}

Bangle.on('GPS',onGPS);
Bangle.setGPSPower(true);

// Write the contents of the track out to the console
function dumpTrack() {
  var f = require("Storage").open(".track","r");
  var l;
  do {
    l = f.readLine();
    if (l) console.log(l);
  } while (l);
}
