var m = require("openseachart");
var HASWIDGETS = true;
var y1,y2;
var fix = {};
var last_course = -1;
var cur_course = -1;
var course_marker_len = g.getWidth()/4;

var settings = require("Storage").readJSON('openseacsettings.json', 1) || {};

function redraw() {
  g.setClipRect(0,y1,g.getWidth()-1,y2);
  m.draw();
  drawMarker();
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
  if (settings.drawcourse && cur_course!=-1) drawCourseMarker(cur_course);
}

function drawMarker() {
  if (!fix.fix) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  g.setColor(1,0,0);
  g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
}

function drawCourseMarker(c) {
  var p = m.latLonToXY(fix.lat, fix.lon);
  var dx = -Math.sin(Math.PI*(c+180)/180.0)*course_marker_len*m.map.dlonpx/m.map.dlatpx;
  var dy = Math.cos(Math.PI*(c+180)/180.0)*course_marker_len;
  g.setColor(1,0,0);
  g.drawLine(p.x, p.y, p.x+dx, p.y+dy);
}

var fix;
Bangle.on('GPS',function(f) {
  fix=f;
  g.reset().clearRect(0,y1,g.getWidth()-1,y1+8).setFont("6x8").setFontAlign(0,0);
  var txt = fix.satellites+" satellites";
  if (!fix.fix)
    txt += " - NO FIX";
  else {
    if (fix.satellites>3 && fix.speed>2) { // only uses fixes w/ more than 3 sats and speed > 2kph
      cur_course = fix.course;
      if (Math.abs(cur_course-last_course)>10 && Math.abs(cur_course-last_course)<350) {
	      last_course = cur_course;
	      redraw();
      }
    }
  }
  g.drawString(txt,g.getWidth()/2,y1 + 4);
  drawMarker();
  if (settings.autocenter) recenter();
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
