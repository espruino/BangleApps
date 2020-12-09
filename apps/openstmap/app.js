var m = require("openstmap");
var HASWIDGETS = true;
var y1,y2;
var fix = {};

function redraw() {
  g.setClipRect(0,y1,g.getWidth()-1,y2);
  m.draw();
  drawMarker();
  if (WIDGETS["gpsrec"] && WIDGETS["gpsrec"].plotTrack) {
    g.setColor(0.75,0.2,0);
    WIDGETS["gpsrec"].plotTrack(m);
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}

function drawMarker() {
  if (!fix.fix) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  g.setColor(1,0,0);
  g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
}

var fix;
Bangle.on('GPS',function(f) {
  fix=f;
  g.clearRect(0,y1,240,y1+8);
  g.setColor(1,1,1);
  g.setFont("6x8");
  g.setFontAlign(0,0);
  var txt = fix.satellites+" satellites";
  if (!fix.fix)
    txt += " - NO FIX";
  g.drawString(txt,120,y1 + 4);
  drawMarker();
});
Bangle.setGPSPower(1);

if (HASWIDGETS) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  y1 = 24;
  var hasBottomRow = Object.keys(WIDGETS).some(w=>WIDGETS[w].area[0]=="b");
  y2 = g.getHeight() - (hasBottomRow ? 24 : 1);
} else {
  y1=0;
  y2=g.getHeight()-1;
}

redraw();

setWatch(function() {
  if (!fix.fix) return;
  m.lat = fix.lat;
  m.lon = fix.lon;
  redraw();
}, BTN2, {repeat:true});
