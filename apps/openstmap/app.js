var m = require("openstmap");
var R;
var fix = {};
var mapVisible = false;
var settings = require("Storage").readJSON("openstmap.json",1)||{};
var HASWIDGETS = !settings.noWidgets;
var plotTrack;
let checkMapPos = false; // Do we need to check the if the coordinates we have are valid
var startDrag = 0; //< to detect a short tap when zooming
var hasRecorder = require("Storage").read("recorder")!=undefined; // do we have the recorder library?
var hasWaypoints = require("Storage").read("waypoints")!=undefined; // do we have the recorder library?
var labelFont = g.getFonts().includes("17")?"17":"6x8:2";
var imgLoc, ovLoc, ovSize = 34; /*Math.ceil(Math.sqrt(imgLoc[0]*imgLoc[0]+imgLoc[1]*imgLoc[1]))*/

if (Bangle.setLCDOverlay) {
  // Icon for current location+direction: https://icons8.com/icon/11932/gps 24x24, 1 Bit + transparency + inverted
  imgLoc = require("heatshrink").decompress(atob("jEYwINLAQk8AQl+AQn/AQcB/+AAQUD//AAQUH//gAQUP//wAQUf//4j8AvA9IA=="));
  // overlay buffer for current location, a bit bigger then image so we can rotate
  ovLoc = Graphics.createArrayBuffer(ovSize,ovSize,imgLoc[2] & 0x7f,{msb:true});
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
   var img = atob("DRXCAP//APgfAAAAAFVAAVVVAVVVUFUBVFUAFVVABVVQAVRVAVQVVVUBVVUAVVVABVVAAVVQABVQAAVUAABUAACVgACJiACISIAIiIAAiIAA");
  g.setFont(labelFont).setFontAlign(-1,0);
  waypoints.forEach((wp, idx) => {
    if (wp.lat === undefined || wp.lon === undefined) return;
    var p = m.latLonToXY(wp.lat, wp.lon);
    g.setColor("#fff").drawImage(img, p.x-6, p.y-18);
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
  // TODO: if this is getting off the screen, we could adjust the map over? Also show marker to show what direction we're offscreen

  ovLoc.clear();

  if (isInside(R, p, ovLoc.getWidth(), ovLoc.getHeight())) { // avoid drawing over widget area
    const angle = settings.dirSrc === 1 ? fix.course : Bangle.getCompass().heading;
    if (!isNaN(angle)) {
      ovLoc.drawImage(imgLoc, ovLoc.getWidth()/2, ovLoc.getHeight()/2, {rotate: angle*Math.PI/180});
    }
  } else { // if off-screen, draw a blue dot on the edge
    var mx = (R.x+R.x2)/2, my = (R.y+R.y2)/2;
    var dy = p.y - mx, dx = p.x - my;
    if (Math.abs(dx)>Math.abs(dy)) {
      dy = mx * dy / Math.abs(dx);
      dx = mx * Math.sign(dx);
    } else {
      dx = my * dx / Math.abs(dy);
      dy = my * Math.sign(dy);
    }
    p.x = mx+dx;
    p.y = my+dy;
    ovLoc.fillCircle(ovSize/2,ovSize/2,16);
  }
  Bangle.setLCDOverlay({width:ovSize, height:ovSize,
          bpp:ovLoc.getBPP(), transparent:0,
          palette:new Uint16Array([0, g.toColor("#00F")]),
          buffer:ovLoc.buffer
        }, p.x-ovSize/2, p.y-ovSize/2);

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

function showMap() {
  mapVisible = true;
  g.reset().clearRect(R);
  redraw();
  Bangle.setUI({mode:"custom",drag:e=>{
    if (plotTrack && plotTrack.stop) plotTrack.stop();
    if (e.b) {
      if (!startDrag)
        startDrag = getTime();
      if (e.dx || e.dy) {
        g.setClipRect(R.x,R.y,R.x2,R.y2);
        g.scroll(e.dx,e.dy);
        m.scroll(e.dx,e.dy);
        g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
      }
      drawLocation();
    } else if (startDrag) {
      const delta = getTime() - startDrag;
      startDrag = 0;
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
