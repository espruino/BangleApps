var loc = require("locale");

var waypoints = require("Storage").readJSON("waypoints.json")||[{name:"NONE"}];
var wp = waypoints[0];
var wp_bearing = 0;
var candraw = true;

var direction = 0;
var dist = 0;

var savedfix;

var previous = {
  dst: '',
  wp_name: '',
  course: 180,
  selected: false,
};

/*** Drawing ***/

var pal_by = new Uint16Array([0x0000,0xFFC0],0,1); // black, yellow
var pal_bw = new Uint16Array([0x0000,0xffff],0,1);  // black, white
var pal_bb = new Uint16Array([0x0000,0x07ff],0,1); // black, blue
var pal_br = new Uint16Array([0x0000,0xf800],0,1); // black, red
var pal_compass = pal_by;

var buf = Graphics.createArrayBuffer(160,160,1, {msb:true});
var arrow_img = require("heatshrink").decompress(atob("vF4wJC/AEMYBxs8Bxt+Bxv/BpkB/+ABxcD//ABxcH//gBxcP//wBxcf//4Bxc///8Bxd///+OxgABOxgABPBR2BAAJ4KOwIABPBR2BAAJ4KOwIABPBR2BAAJ4KOwIABPBQNCPBR2DPBR2DPBR2DPBR2DPBR2DPBR2DPBR2DPBQNEPBB2FPBB2FPBB2FPBB2FPBB2FPBB2FPBB2FPBANGPAx2HPAx2HPAx2HPAx2HPAx2HPAx2HeJTeJB34O/B34O/B34O/B34O/B34O/B34O/B34O/B34OTAH4AT"));

function flip1(x,y,palette) {
  g.drawImage({width:160,height:160,bpp:1,buffer:buf.buffer, palette:palette},x,y);
  buf.clear();
}

function flip2_bw(x,y) {
  g.drawImage({width:160,height:40,bpp:1,buffer:buf.buffer, palette:pal_bw},x,y);
  buf.clear();
}

function flip2_bb(x,y) {
  g.drawImage({width:160,height:40,bpp:1,buffer:buf.buffer, palette:pal_bb},x,y);
  buf.clear();
}

function drawCompass(course) {
  if (!candraw) return;

  previous.course = course;

  buf.setColor(1);
  buf.fillCircle(80,80, 79);
  buf.setColor(0);
  buf.fillCircle(80,80, 69);
  buf.setColor(1);
  buf.drawImage(arrow_img, 80, 80, {rotate:radians(course)} );
  var palette = pal_br;
  if (savedfix !== undefined && savedfix.fix !== 0) palette = pal_compass;
  flip1(40, 30, palette);
}

function drawN(force){
  if (!candraw) return;

  buf.setFont("Vector",24);
  var dst = loc.distance(dist);

  // distance on left
  if (force || previous.dst !== dst) {
    previous.dst = dst;
    buf.setColor(1);
    buf.setFontAlign(-1, -1);
    buf.setFont("Vector",40);
    buf.drawString(dst,0,0);
    flip2_bw(8, 200);
  }

  // waypoint name on right
  if (force || previous.wp_name !== wp.name) {
    previous.wp_name = wp.name;
    buf.setColor(1);
    buf.setFontAlign(1, -1);
    buf.setFont("Vector", 15);
    buf.drawString(wp.name, 80, 0);
    flip2_bw(160, 220);
  }
}

function drawAll(force) {
  if (!candraw) return;

  g.setColor(1,1,1);
  drawN(force);
  drawCompass(direction);
}

/*** Heading ***/

var heading = 0;
function newHeading(m,h){
    var s = Math.abs(m - h);
    var delta = (m>h)?1:-1;
    if (s>=180){s=360-s; delta = -delta;}
    if (s<2) return h;
    var hd = h + delta*(1 + Math.round(s/5));
    if (hd<0) hd+=360;
    if (hd>360)hd-= 360;
    return hd;
}

var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;

function tiltfixread(O,S){
  var start = Date.now();
  var m = Bangle.getCompass();
  var g = Bangle.getAccel();
  m.dx =(m.x-O.x)*S.x; m.dy=(m.y-O.y)*S.y; m.dz=(m.z-O.z)*S.z;
  var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
  if (d<0) d+=360;
  var phi = Math.atan(-g.x/-g.z);
  var cosphi = Math.cos(phi), sinphi = Math.sin(phi);
  var theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
  var costheta = Math.cos(theta), sintheta = Math.sin(theta);
  var xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
  var yh = m.dz*sinphi - m.dx*cosphi;
  var psi = Math.atan2(yh,xh)*180/Math.PI;
  if (psi<0) psi+=360;
  return psi;
}

function read_heading() {
  if (savedfix !== undefined && !isNaN(savedfix.course)) {
    Bangle.setCompassPower(0);
    heading = savedfix.course;
    pal_compass = pal_bw;
  } else {
    var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
    Bangle.setCompassPower(1);
    heading = newHeading(d,heading);
    pal_compass = pal_by;
  }

  direction = wp_bearing - heading;
  if (direction < 0) direction += 360;
  if (direction > 360) direction -= 360;
  drawCompass(direction);
}


/*** Maths ***/

function radians(a) {
  return a*Math.PI/180;
}

function degrees(a) {
  var d = a*180/Math.PI;
  return (d+360)%360;
}

function bearing(a,b){
  var delta = radians(b.lon-a.lon);
  var alat = radians(a.lat);
  var blat = radians(b.lat);
  var y = Math.sin(delta) * Math.cos(blat);
  var x = Math.cos(alat)*Math.sin(blat) -         Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
}

function distance(a,b){
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.round(Math.sqrt(x*x + y*y) * 6371000);
}

/*** Waypoints ***/

function addCurrentWaypoint() {
  var wpnum = 0;
  var ok = false;
  // XXX: O(n^2) search for lowest unused WP number
  while (!ok) {
    ok = true;
    for (var i = 0; i < waypoints.length && ok; i++) {
      if (waypoints[i].name == ("WP"+wpnum)) {
        wpnum++;
        ok = false;
      }
    }
  }

  waypoints.push({
    name: "WP" + wpnum,
    lat: savedfix.lat,
    lon: savedfix.lon,
  });
  wp = waypoints[waypoints.length-1];
  saveWaypoints();
}

function saveWaypoints() {
  require("Storage").writeJSON("waypoints.json", waypoints);
}

function deleteWaypoint(w) {
  for (var i = 0; i < waypoints.length; i++) {
    if (waypoints[i] == w) {
      waypoints.splice(i, 1);
      saveWaypoints();
      wp = {name:"NONE"};
    }
  }
}

/*** Setup ***/

function onGPS(fix) {
  savedfix = fix;

  if (fix !== undefined && fix.fix == 1){
    dist = distance(fix, wp);
    if (isNaN(dist)) dist = 0;
    wp_bearing = bearing(fix, wp);
    if (isNaN(wp_bearing)) wp_bearing = 0;
    drawN();
  }
}

function startTimers() {
  setInterval(function() {
    Bangle.setLCDPower(1);
    read_heading();
  }, 500);
}

function addWaypointToMenu(menu, i) {
  menu[waypoints[i].name] = function() {
    wp = waypoints[i];
    mainScreen();
  };
}

function mainScreen() {
  E.showMenu();
  candraw = true;
  drawAll(true);

  Bangle.setUI("updown", function(v) {
    if (v === undefined) {
      candraw = false;
      var menu = {
        "": { "title": "-- Waypoints --" },
      };
      for (let i = 0; i < waypoints.length; i++) {
        addWaypointToMenu(menu, i);
      }
      menu["+ Here"] = function() {
        addCurrentWaypoint();
        mainScreen();
      };
      menu["< Back"] = mainScreen;
      E.showMenu(menu);
    } else {
      candraw = false;
      E.showPrompt("Delete waypoint: " + wp.name + "?").then(function(confirmed) {
        var name = wp.name;
        if (confirmed) {
          deleteWaypoint(wp);
          E.showAlert("Waypoint deleted: " + name).then(mainScreen);
        } else {
          mainScreen();
        }
      });
    }
  });
}

Bangle.on('kill',()=>{
  Bangle.setCompassPower(0);
  Bangle.setGPSPower(0);
});

g.clear();
Bangle.setLCDBrightness(1);
Bangle.setGPSPower(1);
startTimers();
Bangle.on('GPS', onGPS);
mainScreen();
