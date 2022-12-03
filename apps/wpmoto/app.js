var loc = require("locale");

var waypoints = require("waypoints").load();
var wp = waypoints[0];
if (wp == undefined) wp = {name:"NONE"};
var wp_bearing = 0;
var routeidx = 0;
var candraw = true;

const ROUTE_STEP = 50; // metres
const EPSILON = 1; // degrees

var direction = 0;
var dist = 0;

var savedfix;

var previous = {
  dst: '',
  wp_name: '',
  course: 180,
  selected: false,
  routeidx: -1,
};

/*** Drawing ***/

var W = g.getWidth();
var H = g.getHeight();
// layout (XXX: this should probably use the Layout library instead)
var L = { // banglejs1
  arrow: {
    x: 120,
    y: 80,
    r1: 79,
    r2: 69,
    bufh: 160,
    bufy: 40,
  },
  text: {
    bufh: 40,
    bufy: 200,
    largesize: 40,
    smallsize: 15,
    waypointy: 20,
  },
};
if (W == 176) {
  L = { // banglejs2
    arrow: {
      x: 88,
      y: 70,
      r1: 70,
      r2: 62,
      bufh: 160,
      bufy: 0,
    },
    text: {
      bufh: 40,
      bufy: 142,
      largesize: 40,
      smallsize: 14,
      waypointy: 20,
    },
  };
}

var pal_by = new Uint16Array([0x0000,0xffc0],0,1); // black, yellow
var pal_bw = new Uint16Array([0x0000,0xffff],0,1); // black, white
var pal_br = new Uint16Array([0x0000,0xf800],0,1); // black, red

var buf = Graphics.createArrayBuffer(240,160, 1, {msb:true});
var arrow_img = require("heatshrink").decompress(atob("vF4wJC/AEMYBxs8Bxt+Bxv/BpkB/+ABxcD//ABxcH//gBxcP//wBxcf//4Bxc///8Bxd///+OxgABOxgABPBR2BAAJ4KOwIABPBR2BAAJ4KOwIABPBR2BAAJ4KOwIABPBQNCPBR2DPBR2DPBR2DPBR2DPBR2DPBR2DPBR2DPBQNEPBB2FPBB2FPBB2FPBB2FPBB2FPBB2FPBB2FPBANGPAx2HPAx2HPAx2HPAx2HPAx2HPAx2HeJTeJB34O/B34O/B34O/B34O/B34O/B34O/B34O/B34OTAH4AT"));

function flip(y,h,palette) {
  g.drawImage({width:240,height:h,bpp:1,buffer:buf.buffer, palette:palette},0,y);
  buf.clear();
}

function draw(force) {
  if (!candraw) return;

  var course = direction;
  var dst = loc.distance(dist);

  if (force || previous.dst !== dst || previous.wp_name !== wp.name || previous.routeidx !== routeidx || Math.abs(course-previous.course)>EPSILON) {
    previous.course = course;

    var palette = pal_br;
    if (savedfix !== undefined && savedfix.fix !== 0)
      palette = isNaN(savedfix.course) ? pal_by : pal_bw;

    buf.setColor(1);
    buf.fillCircle(L.arrow.x,L.arrow.y, L.arrow.r1);
    buf.setColor(0);
    buf.fillCircle(L.arrow.x,L.arrow.y, L.arrow.r2);
    buf.setColor(1);
    buf.drawImage(arrow_img, L.arrow.x, L.arrow.y, {rotate:radians(course)} );
    flip(L.arrow.bufy,L.arrow.bufh,palette);

    // distance on left
    previous.dst = dst;
    previous.wp_name = wp.name;
    previous.routeidx = routeidx;

    buf.setColor(1);
    buf.setFontAlign(-1, -1);
    buf.setFont("Vector",L.text.largesize);
    buf.drawString(dst,0,0);

    // waypoint name on right
    buf.setColor(1);
    buf.setFontAlign(1, -1);
    buf.setFont("Vector", L.text.smallsize);
    buf.drawString(wp.name, W, L.text.waypointy);

    // if this is a route, draw the step name above the route name
    if (wp.route) {
      buf.drawString((wp.route[routeidx].name||'') + " " + (routeidx+1) + "/" + wp.route.length, W, 0);
    }

    flip(L.text.bufy,L.text.bufh,pal_bw);
  }
}

/*** Heading ***/

var heading = 0;
function read_heading() {
  if (savedfix !== undefined && savedfix.satellites > 0 && !isNaN(savedfix.course)) {
    Bangle.setCompassPower(0);
    heading = savedfix.course;
  } else {
    Bangle.setCompassPower(1);
    var d = 0;
    var m = Bangle.getCompass();
    if (!isNaN(m.heading)) d = m.heading;
    heading = d;
  }

  direction = wp_bearing - heading;
  if (direction < 0) direction += 360;
  if (direction > 360) direction -= 360;
  draw();
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
  require("waypoints").save(waypoints);
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
    if (wp.route) {
      while (true) {
        dist = distance(fix, wp.route[routeidx]);
        // step to next point if we're within ROUTE_STEP metres
        if (!isNaN(dist) && dist < ROUTE_STEP && routeidx < wp.route.length-1)
          routeidx++;
        else
          break;
      }
    } else {
      dist = distance(fix, wp);
    }
    if (isNaN(dist)) dist = 0;

    if (wp.route) {
      wp_bearing = bearing(fix, wp.route[routeidx]);
    } else {
      wp_bearing = bearing(fix, wp);
    }
    if (isNaN(wp_bearing)) wp_bearing = 0;
    draw();
  }
}

function startTimers() {
  setInterval(function() {
    if (W==240) Bangle.setLCDPower(1); // keep banglejs1 display on
    read_heading();
  }, 250);
}

function addWaypointToMenu(menu, i) {
  menu[waypoints[i].name + (waypoints[i].route ? " (R)" : "")] = function() {
    wp = waypoints[i];
    mainScreen();
  };
}

function mainScreen() {
  E.showMenu();
  candraw = true;
  g.setColor(0,0,0);
  g.fillRect(0,0,W,H);
  draw(true);

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
      var thing = wp.route ? "route" : "waypoint";
      E.showPrompt("Delete " + thing + ": " + wp.name + "?").then(function(confirmed) {
        var name = wp.name;
        if (confirmed) {
          var thing = wp.route ? "Route" : "Waypoint";
          deleteWaypoint(wp);
          E.showAlert(thing + " deleted: " + name).then(mainScreen);
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
Bangle.setGPSPower(1);
startTimers();
Bangle.on('GPS', onGPS);
mainScreen();
