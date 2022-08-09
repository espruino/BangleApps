var m = require("openstmap");
var HASWIDGETS = true;
var y1,y2;
var fix = {};

function redraw() {
  g.setClipRect(0,y1,g.getWidth()-1,y2);
  m.draw();
  if (fix.fix) drawMarker(fix,"#f00");
  if (WIDGETS["gpsrec"] && WIDGETS["gpsrec"].plotTrack) {
    g.flip(); // force immediate draw on double-buffered screens - track will update later
    g.setColor(0.75,0.2,0);
    WIDGETS["gpsrec"].plotTrack(m);
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}

function drawMarker(pt, col) {
  var p = m.latLonToXY(pt.lat, pt.lon);
  g.setColor(col).fillRect(p.x-3, p.y-3, p.x+3, p.y+3);
}

var fix;
Bangle.on('GPS',function(f) {
  fix=f;
  g.reset().clearRect(0,y1,g.getWidth()-1,y1+8).setFont("6x8").setFontAlign(0,0);
  var txt = fix.satellites+" satellites";
  if (!fix.fix)
    txt += " - NO FIX";
  g.drawString(txt,g.getWidth()/2,y1 + 4);
  if (fix.fix) drawMarker(fix,"#f00");
  if (fix.fix) {
    var fdata = new Float32Array([f.lat,f.lon]);
    NRF.setAdvertising({},{
      phy:"coded",
      connectable:false,
      scannable:false,
      showName:false,
      manufacturer:0x0590,
      manufacturerData:fdata.buffer
    });
  }
});
Bangle.setGPSPower(1, "app");

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

function recenter() {
  if (!fix.fix) return;
  m.lat = fix.lat;
  m.lon = fix.lon;
  redraw();
}

setWatch(recenter, global.BTN2?BTN2:BTN1, {repeat:true});

var hasScrolled = false;
Bangle.on('drag',e=>{
  if (e.b) {
    g.setClipRect(0,y1,g.getWidth()-1,y2);
    g.scroll(e.dx,e.dy);
    m.scroll(e.dx,e.dy);
    g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
    hasScrolled = true;
  } else if (hasScrolled) {
    hasScrolled = false;
    redraw();
  }
});

// Start scanning
NRF.setScan(function(d) {
  var latLon = new Float32Array(d.manufacturerData);
  drawMarker({lat:latLon[0], lon:latLon[1]},"#0f0");
},{phy:"coded",filters: [{ manufacturerData:{0x0590:{}} }]});
// Set transmit power to max
NRF.setTxPower(8);

// when leaving the app, reset the advertising to default so we can reconnect!
Bangle.on('kill', function() {
  NRF.setAdvertising({},{});
});
