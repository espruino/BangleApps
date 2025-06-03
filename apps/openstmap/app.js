var m = require("openstmap");
var R;
var fix = {};
var mapVisible = false;
var settings = require("Storage").readJSON("openstmap.json",1)||{};
var HASWIDGETS = !settings.noWidgets;
var plotTrack;
let checkMapPos = false; // Do we need to check the if the coordinates we have are valid
var startDrag = undefined; //< to detect a short tap when zooming
var hasRecorder = require("Storage").read("recorder")!=undefined; // do we have the recorder library?
var hasWaypoints = require("Storage").read("waypoints")!=undefined; // do we have the recorder library?
var labelFont = g.getFonts().includes("17")?"17":"6x8:2";
var imgLoc, ovLoc, ovSize = 30; /*Math.ceil(Math.sqrt(imgLoc[0]*imgLoc[0]+imgLoc[1]*imgLoc[1]))*/
var locOnscreen = undefined; // is the GPS location currently onscreen?

if (Bangle.setLCDOverlay) {
  // Icon for current location + direction (icon_gps.png, 2 bit bw, transparent)
  imgLoc = atob("EBiCAVVQBVVVU8VVVVPFVVVDwVVVT/FVVU/xVVUP8FVVP/xVVT/8VVQ//BVU//8VVP//FVD//wVT///FU///xUP//8FP///xD/AP8D/BQ/w/BVD8PxVU/AAVVABVVVVVVVVVVQ==");
  // overlay buffer for current location, a bit bigger then image so we can rotate
  ovLoc = Graphics.createArrayBuffer(ovSize,ovSize,2,{msb:true});
}

if (settings.lat !== undefined && settings.lon !== undefined && settings.scale !== undefined) {
  // restore last view
  m.lat = settings.lat;
  m.lon = settings.lon;
  m.scale = settings.scale;
  checkMapPos = true;
}
if (settings.dirSrc === undefined) {
  settings.dirSrc = 1; // Default=GPS
}

// Redraw the whole page
function redraw() {
  // ensure we do cancel track drawing
  if (plotTrack && plotTrack.stop)
    plotTrack.stop();
  // set clip rect so we don't overwrite widgets
  g.setClipRect(R.x,R.y,R.x2,R.y2);
  const count = m.draw();
  if (checkMapPos && count === 0) {
    // no map at these coordinates, lets try again with first map
    m.lat = m.map.lat;
    m.lon = m.map.lon;
    m.scale = m.map.scale;
    m.draw();
  }
  checkMapPos = false;
  drawPOI();
  drawMarker();
  drawLocation();
  // if track drawing is enabled...
  if (settings.drawTrack) {
    if (HASWIDGETS && WIDGETS["gpsrec"] && WIDGETS["gpsrec"].plotTrack) {
      g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
      WIDGETS["gpsrec"].plotTrack(m);
    }
    if (hasRecorder) {
      g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
      plotTrack = require("recorder").plotTrack(m, { async : true, callback : function() {
        plotTrack = undefined;
      }});
    }
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}

// Draw the POIs
function drawPOI() {
  if (!hasWaypoints) return;
  let waypoints;
  try {
    waypoints = require("waypoints").load();
  } catch (ex) {
    // Waypoints module not available.
    return;
  }
  if (!waypoints) return;
  g;
   var img = atob("ERnCAQD4/////x8AVWqqVVWoAKlVoAAClaAAAClgAqACaAJWAKgCVWAKAJVYAoAlVgCoAlYApgAqACVgAAApWAAACVWAAApVYAACVVYAApVVgACVVVgApVVWACVVVeAtVVXcDdVV3s7dVd3i3dVd3t3VVd3d1UA="); // icon_place.png optimal 2 bit + transparent
  g.setFont(labelFont).setFontAlign(-1,0);
  waypoints.forEach((wp, idx) => {
    if (wp.lat === undefined || wp.lon === undefined) return;
    var p = m.latLonToXY(wp.lat, wp.lon);
    g.setColor("#fff").drawImage(img, p.x-8, p.y-22);
    g.setColor(0).drawString(wp.name, p.x+8, p.y);
  });
}

function isInside(rect, e, w, h) {
  return e.x-w/2>=rect.x && e.x+w/2<rect.x+rect.w
    && e.y-h/2>=rect.y && e.y+h/2<=rect.y+rect.h;
}

// Draw the location & direction marker for where we are
function drawMarker() {
  if (!fix.fix || !settings.drawMarker) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  if (isInside(R, p, 4, 4)) { // avoid drawing over widget area
    g.setColor(1,0,0);
    g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
  }
}

// Draw current location+direction with LCD Overlay (Bangle.js 2 only)
function drawLocation() {
  if (!Bangle.setLCDOverlay) {
    return; // Overlay not supported
  }

  if (!fix.fix || !mapVisible || settings.dirSrc === 0) {
    if (this.hasOverlay) {
      Bangle.setLCDOverlay(); // clear if map is not visible or no fix
      this.hasOverlay = false;
    }
    return;
  }

  var p = m.latLonToXY(fix.lat, fix.lon);
  ovLoc.setBgColor(1/*transparent*/).clear().setBgColor(0);
  locOnscreen = isInside(R, p, ovSize, ovSize);
  if (locOnscreen) { // if we're onscreen, draw the course
    const angle = settings.dirSrc === 1 ? fix.course : Bangle.getCompass().heading;
    if (isNaN(angle)) {
      ovLoc.fillCircle(ovSize/2,ovSize/2,8);
    } else {
      ovLoc.drawImage(imgLoc, ovSize/2, ovSize/2, {rotate: angle*Math.PI/180});
    }
  } else { // if off-screen, draw a blue circle on the edge
    var mx = R.w/2, my = R.h/2;
    var dy = p.y - (R.y+my), dx = p.x - mx;
    ovLoc.fillCircle(ovSize/2,ovSize/2,13);
    if (Math.abs(dx)>Math.abs(dy)) {
      dy = my * dy / Math.abs(dx);
      dx = mx * Math.sign(dx);
    } else {
      if (dy<0) ovLoc.setBgColor(1/*transparent*/).clearRect(0,0,ovSize, (ovSize/2)-1); // so we don't overlap widgets!
      dx = mx * dx / Math.abs(dy);
      dy = my * Math.sign(dy);
    }
    p.x = mx+dx;
    p.y = R.y+my+dy;
  }
  Bangle.setLCDOverlay({width:ovSize, height:ovSize,
          bpp:ovLoc.getBPP(), transparent:1,
          palette:new Uint16Array([g.toColor("#FFF"), 0, 0, g.toColor("#00F")]),
          buffer:ovLoc.buffer
        }, p.x-ovSize/2, p.y-ovSize/2);

  this.hasOverlay = true;
}

Bangle.on('GPS',function(f) {
  fix=f;
  if (HASWIDGETS && WIDGETS["sats"]) WIDGETS["sats"].draw(WIDGETS["sats"]);
  if (mapVisible) { // could be in settings
    // Automatically scroll if GPS is going offscreen and not dragging
    if (settings.autoscroll && fix.fix && startDrag===undefined) {
      if (locOnscreen) { // if we were onscreen last time we drew the location
        var p = m.latLonToXY(fix.lat, fix.lon); // where are we onscreen?
        var sx=0,sy=0;
        if (p.x<R.x+32) sx = 1;
        if (p.y<R.y+32) sy = 1;
        if (p.x>R.x2-32) sx = -1;
        if (p.y>R.y2-32) sy = -1;
        if (sx||sy) {
          scroll(sx*80,sy*80);
          redraw();
        }
      }
    }
    drawMarker();
    drawLocation();
  }
});
Bangle.setGPSPower(1, "app");
Bangle.setCompassPower(settings.dirSrc === 2, "openstmap");

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
  /*LANG*/"Hide Widgets": {
    value : !!settings.noWidgets,
    onchange : v => { settings.noWidgets=v; writeSettings(); load("openstmap.app.js"); }
  },
  /*LANG*/"Autoscroll": {
    value : !!settings.autoscroll,
    onchange : v => { settings.autoscroll=v; writeSettings(); }
  },
  });


  if (Bangle.setLCDOverlay) {
    menu[/*LANG*/"Direction source"] = {
      value: settings.dirSrc,
      min: 0, max: 2,
      format: v => [/*LANG*/"None", /*LANG*/"GPS", /*LANG*/"Compass"][v],
      onchange: v => {
        settings.dirSrc = v;
        Bangle.setCompassPower(settings.dirSrc === 2, "openstmap");
        writeSettings();
      }
    };
    menu[/*LANG*/"Reset compass"] = () => {
      Bangle.resetCompass();
      showMap();
    };
  }

  menu[/*LANG*/"Center Map"] = () =>{
    m.lat = m.map.lat;
    m.lon = m.map.lon;
    m.scale = m.map.scale;
    showMap();
  };

  // If we have the recorder widget, add a menu item to start/stop recording
  if (hasRecorder) {
    menu[/*LANG*/"Record"] = {
      value : require("recorder").isRecording(),
      onchange : isOn => {
        E.showMessage(/*LANG*/"Please Wait...");
        require("recorder").setRecording(isOn).then(showMap);
      }
    };
  }
  menu[/*LANG*/"Exit"] = () => load();
  E.showMenu(menu);
}

function scroll(sx,sy) {
  g.setClipRect(R.x,R.y,R.x2,R.y2);
  g.scroll(sx,sy);
  m.scroll(sx,sy);
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1); // restore cliprect
}

function showMap() {
  mapVisible = true;
  g.reset().clearRect(R);
  redraw();
  Bangle.setUI({mode:"custom",drag:e=>{
    if (plotTrack && plotTrack.stop) plotTrack.stop();
    if (e.b) {
      if (startDrag===undefined)
        startDrag = getTime();
      if (e.dx || e.dy) {
        scroll(e.dx,e.dy);
      }
      drawLocation();
    } else if (startDrag!==undefined) {
      const delta = getTime() - startDrag;
      startDrag = undefined;
      if (delta < 0.2) { // short tap?
        if (e.y > g.getHeight() - 32) { // at bottom egde?
          if (e.x < 32) { // zoom in/out
            m.scale /= 2;
            g.reset().clearRect(R);
          }
          if (e.x > g.getHeight() - 32) {
            m.scale *= 2;
            g.reset().clearRect(R);
          }
        }
      }
      redraw();
    }
  }, btn: () => showMenu() });
}


if (m.maps.length === 0) {
  E.showPrompt(/*LANG*/'Please upload a map first.', {buttons : {/*LANG*/"Ok":true}}).then(v => load());
} else {
  showMap();
}

// Write settings on exit via button
setWatch(() => writeSettings(), BTN, { repeat: true, edge: "rising" });
