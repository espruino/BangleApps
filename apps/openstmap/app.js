var m = require("openstmap");
var HASWIDGETS = true;
var R;
var fix = {};
var mapVisible = false;
var hasScrolled = false;

// Redraw the whole page
function redraw() {
  g.setClipRect(R.x,R.y,R.x2,R.y2);
  m.draw();
  drawMarker();
  if (HASWIDGETS && WIDGETS["gpsrec"] && WIDGETS["gpsrec"].plotTrack) {
    g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
    WIDGETS["gpsrec"].plotTrack(m);
  }
  if (HASWIDGETS && WIDGETS["recorder"] && WIDGETS["recorder"].plotTrack) {
    g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
    WIDGETS["recorder"].plotTrack(m);
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}

// Draw the marker for where we are
function drawMarker() {
  if (!fix.fix) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  g.setColor(1,0,0);
  g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
}

Bangle.on('GPS',function(f) {
  fix=f;
  if (HASWIDGETS) WIDGETS["sats"].draw(WIDGETS["sats"]);
  if (mapVisible) drawMarker();
});
Bangle.setGPSPower(1, "app");

if (HASWIDGETS) {
  Bangle.loadWidgets();
  WIDGETS["sats"] = { area:"tl", width:48, draw:w=>{
    var txt = (0|fix.satellites)+" Sats";
    if (!fix.fix) txt += "\nNO FIX";
      g.reset().setFont("6x8").setFontAlign(0,0)
        .drawString(txt,w.x+24,w.y+12);
    }
  };
  Bangle.drawWidgets();
}
R = Bangle.appRect;

function showMap() {
  mapVisible = true;
  g.reset().clearRect(R);
  redraw();
  Bangle.setUI({mode:"custom",drag:e=>{
    if (e.b) {
      g.setClipRect(R.x,R.y,R.x2,R.y2);
      g.scroll(e.dx,e.dy);
      m.scroll(e.dx,e.dy);
      g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
      hasScrolled = true;
    } else if (hasScrolled) {
      hasScrolled = false;
      redraw();
    }
  }, btn: btn=>{
    mapVisible = false;
    var menu = {"":{title:"Map"},
    "< Back": ()=> showMap(),
    /*LANG*/"Zoom In": () =>{
      m.scale /= 2;
      showMap();
    },
    /*LANG*/"Zoom Out": () =>{
      m.scale *= 2;
      showMap();
    },
    /*LANG*/"Center Map": () =>{
      m.lat = m.map.lat;
      m.lon = m.map.lon;
      m.scale = m.map.scale;
      showMap();
    }};
    if (fix.fix) menu[/*LANG*/"Center GPS"]=() =>{
      m.lat = fix.lat;
      m.lon = fix.lon;
      showMap();
    };
    E.showMenu(menu);
  }});
}

showMap();
