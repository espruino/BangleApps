var m = require("openstmap");
var HASWIDGETS = true;
var R;
var fix = {};
var mapVisible = false;
var hasScrolled = false;
var settings = require("Storage").readJSON("openstmap.json",1)||{};
var plotTrack;
let checkMapPos = false; // Do we need to check the if the coordinates we have are valid

if (settings.lat !== undefined && settings.lon !== undefined && settings.scale !== undefined) {
  // restore last view
  m.lat = settings.lat;
  m.lon = settings.lon;
  m.scale = settings.scale;
  checkMapPos = true;
}

// Redraw the whole page
function redraw() {
  g.setClipRect(R.x,R.y,R.x2,R.y2);
  const count = m.draw();
  if (checkMapPos && count === 0) {
    // no map at these coordinates, lets try again with first map
    m.lat = m.map.lat;
    m.lon = m.map.lon;
    m.scale = m.map.scale;
    checkMapPos = false;
    m.draw();
  }
  drawPOI();
  drawMarker();
  drawLocation();
  // if track drawing is enabled...
  if (settings.drawTrack) {
    if (HASWIDGETS && WIDGETS["gpsrec"] && WIDGETS["gpsrec"].plotTrack) {
      g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
      WIDGETS["gpsrec"].plotTrack(m);
    }
    if (HASWIDGETS && WIDGETS["recorder"] && WIDGETS["recorder"].plotTrack) {
      g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
      plotTrack = WIDGETS["recorder"].plotTrack(m, { async : true, callback : function() {
        plotTrack = undefined;
      }});
    }
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}

// Draw the POIs
function drawPOI() {
  try {
    var waypoints = require("waypoints").load();
  } catch (ex) {
    // Waypoints module not available.
    return;
  }
  g.setFont("Vector", 18);
  waypoints.forEach((wp, idx) => {
    var p = m.latLonToXY(wp.lat, wp.lon);
    var sz = 2;
    g.setColor(0,0,0);
    g.fillRect(p.x-sz, p.y-sz, p.x+sz, p.y+sz);
    g.setColor(0,0,0);
    g.drawString(wp.name, p.x, p.y);
    //print(wp.name);
  })
}

// Draw the marker for where we are
function drawMarker() {
  if (!fix.fix || !settings.drawMarker) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  g.setColor(1,0,0);
  g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
}

// Draw current location with LCD Overlay (Bangle.js 2 only)
function drawLocation() {
  if (!Bangle.setLCDOverlay) {
    return; // Overlay not supported
  }

  if (!fix.fix || !mapVisible) {
    if (this.hasOverlay) {
      Bangle.setLCDOverlay(); // clear if map is not visible or no fix
      this.hasOverlay = false;
    }
    return;
  }

  const icon = require("heatshrink").decompress(atob("jEYwYPMyVJkgHEkgICyAHCgIIDyQIChIIEoAIDC4IIEBwOAgEEyVIBAY4DBD4sGHxBQIMRAIIPpAyCHAYILUJEAiVJkAIFgVJXo5fCABQA==")); // 24x24px
  var p = m.latLonToXY(fix.lat, fix.lon);
  Bangle.setLCDOverlay(icon, p.x-24/2, p.y-24);
  this.hasOverlay = true;
}

Bangle.on('GPS',function(f) {
  fix=f;
  if (HASWIDGETS && WIDGETS["sats"]) WIDGETS["sats"].draw(WIDGETS["sats"]);
  if (mapVisible) {
    drawMarker();
    drawLocation();
  }
});
Bangle.setGPSPower(1, "app");

if (HASWIDGETS) {
  Bangle.loadWidgets();
  if (!WIDGETS["gps"]) { // one GPS Widget is enough
    WIDGETS["sats"] = { area:"tl", width:24, draw:w=>{
      var sats = 0|fix.satellites;
      g.reset().clearRect(w.x,w.y,w.x+23,w.y+23).           drawImage(atob("EhPCAP//vmU0Cv++BUAAAANVQAAANVUAAANVVSoA/VVWqA/VqqqA/1VVoA/9VVkAP/VVlAP/1VVAP/9VVQD//WVUA//2VUA//9VUAX//1UBV///0BVX//ABVVAAABVVAAAA="), w.x,w.y+5); // 18x19
      if (fix.fix) g.setFont("6x8").setFontAlign(1,-1).drawString(sats,w.x+23,w.y);
      else g.setFont("4x6:2").setColor("#f00").setFontAlign(1,-1).drawString("X",w.x+23,w.y);
    }};
  }
  Bangle.drawWidgets();
}
R = Bangle.appRect;

function writeSettings() {
  settings.lat = m.lat;
  settings.lon = m.lon;
  settings.scale = m.scale;
  require("Storage").writeJSON("openstmap.json",settings);
}

function showMenu() {
  if (plotTrack && plotTrack.stop)
    plotTrack.stop();
  mapVisible = false;
  drawLocation();
  var menu = {
    "":{title:/*LANG*/"Map"},
    "< Back": ()=> showMap(),
  };
  // If we have a GPS fix, add a menu item to center it
  if (fix.fix) menu[/*LANG*/"Center GPS"]=() =>{
    m.lat = fix.lat;
    m.lon = fix.lon;
    showMap();
  };
  menu = Object.assign(menu, {
  /*LANG*/"Zoom In": () =>{
    m.scale /= 2;
    showMap();
  },
  /*LANG*/"Zoom Out": () =>{
    m.scale *= 2;
    showMap();
  },
  /*LANG*/"Draw Track": {
    value : !!settings.drawTrack,
    onchange : v => { settings.drawTrack=v; writeSettings(); }
  },
  /*LANG*/"Draw cont. position": {
    value : !!settings.drawMarker,
    onchange : v => { settings.drawMarker=v; writeSettings(); }
  },
  /*LANG*/"Center Map": () =>{
    m.lat = m.map.lat;
    m.lon = m.map.lon;
    m.scale = m.map.scale;
    showMap();
  }
  });
  // If we have the recorder widget, add a menu item to start/stop recording
  if (WIDGETS.recorder) {
    menu[/*LANG*/"Record"] = {
      value : WIDGETS.recorder.isRecording(),
      onchange : isOn => {
        E.showMessage(/*LANG*/"Please Wait...");
        WIDGETS.recorder.setRecording(isOn).then(showMap);
      }
    };
  }
  menu[/*LANG*/"Exit"] = () => load();
  E.showMenu(menu);
}

function showMap() {
  mapVisible = true;
  g.reset().clearRect(R);
  redraw();
  Bangle.setUI({mode:"custom",drag:e=>{
    if (plotTrack && plotTrack.stop) plotTrack.stop();
    if (e.b) {
      g.setClipRect(R.x,R.y,R.x2,R.y2);
      g.scroll(e.dx,e.dy);
      m.scroll(e.dx,e.dy);
      g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
      hasScrolled = true;
      drawLocation();
    } else if (hasScrolled) {
      hasScrolled = false;
      redraw();
    }
  }, btn: () => showMenu() });
}

showMap();

// Write settings on exit via button
setWatch(() => writeSettings(), BTN, { repeat: true, edge: "rising" });
