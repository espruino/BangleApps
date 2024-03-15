var candraw = true;
var brg = 0;
var wpindex = 0;
var locindex = 0;
const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
var loc = {
  speed: [
    require("locale").speed,
    (kph) => {
      return (kph / 1.852).toFixed(1) + "kn ";
    }
  ],
  distance: [
    require("locale").distance,
    (m) => {
      return (m / 1852).toFixed(3) + "nm ";
    }
  ]
};


function drawCompass(course) {
  if (!candraw) return;
  g.reset().clearRect(0, 24, 175, 71);
  g.setFont("Vector", 18);
  var start = course - 90;
  if (start < 0) start += 360;
  g.fillRect(14, 67, 162, 71);
  var xpos = 16;
  var frag = 15 - start % 15;
  if (frag < 15) xpos += Math.floor((frag * 4) / 5);
  else frag = 0;
  for (var i = frag; i <= 180 - frag; i += 15) {
    var res = start + i;
    if (res % 90 == 0) {
      g.drawString(labels[Math.floor(res / 45) % 8], xpos - 6, 28);
      g.fillRect(xpos - 2, 47, xpos + 2, 67);
    } else if (res % 45 == 0) {
      g.drawString(labels[Math.floor(res / 45) % 8], xpos - 9, 28);
      g.fillRect(xpos - 2, 52, xpos + 2, 67);
    } else if (res % 15 == 0) {
      g.fillRect(xpos, 58, xpos + 1, 67);
    }
    xpos += 12;
  }
  if (wpindex >= 0) {
    var bpos = brg - course;
    if (bpos > 180) bpos -= 360;
    if (bpos < -180) bpos += 360;
    bpos = Math.round((bpos * 4) / 5) + 88;
    if (bpos < 16) bpos = 7;
    if (bpos > 160) bpos = 169;
    g.setColor(g.theme.bgH);
    g.fillCircle(bpos, 63, 8);
  }
}

//displayed heading
var heading = 0;

function newHeading(m, h) {
  var s = Math.abs(m - h);
  var delta = (m > h) ? 1 : -1;
  if (s >= 180) {
    s = 360 - s;
    delta = -delta;
  }
  if (s < 2) return h;
  var hd = h + delta * (1 + Math.round(s / 5));
  if (hd < 0) hd += 360;
  if (hd > 360) hd -= 360;
  return hd;
}

var course = 0;
var speed = 0;
var satellites = 0;
var wp;
var dist = 0;

function radians(a) {
  return a * Math.PI / 180;
}

function degrees(a) {
  var d = a * 180 / Math.PI;
  return (d + 360) % 360;
}

function bearing(a, b) {
  var delta = radians(b.lon - a.lon);
  var alat = radians(a.lat);
  var blat = radians(b.lat);
  var y = Math.sin(delta) * Math.cos(blat);
  var x = Math.cos(alat) * Math.sin(blat) -
    Math.sin(alat) * Math.cos(blat) * Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
}

function distance(a, b) {
  var x = radians(a.lon - b.lon) * Math.cos(radians((a.lat + b.lat) / 2));
  var y = radians(b.lat - a.lat);
  return Math.round(Math.sqrt(x * x + y * y) * 6371000);
}

var selected = false;

function drawN() {
  g.reset().clearRect(0, 89, 175, 175);
  var txt = loc.speed[locindex](speed);
  g.setFont("6x8", 2);
  g.drawString("o", 68, 87);
  g.setFont("6x8", 1);
  g.drawString(txt.substring(txt.length - 3), 156, 119);
  g.setFont("Vector", 36);
  var cs = course.toString().padStart(3, "0");
  g.drawString(cs, 2, 89);
  g.drawString(txt.substring(0, txt.length - 3), 92, 89);
  g.setFont("Vector", 18);
  var bs = brg.toString().padStart(3, "0");
  g.drawString("Brg:", 1, 128);
  g.drawString("Dist:", 1, 148);
  g.setColor(selected ? g.theme.bgH : g.theme.bg);
  g.fillRect(90, 127, 175, 143);
  g.setColor(selected ? g.theme.fgH : g.theme.fg);
  g.drawString(wp.name, 92, 128);
  g.setColor(g.theme.fg);
  g.drawString(bs, 42, 128);
  g.drawString(loc.distance[locindex](dist), 42, 148);
  g.setFont("6x8", 0.5);
  g.drawString("o", 75, 127);
  g.setFont("6x8", 1);
  g.setColor(satellites ? g.theme.bg : g.theme.bgH);
  g.fillRect(0, 167, 75, 175);
  g.setColor(satellites ? g.theme.fg : g.theme.fgH);
  g.drawString("Sats:", 1, 168);
  g.drawString(satellites.toString(), 42, 168);
}

var savedfix;

function onGPS(fix) {
  savedfix = fix;
  if (fix !== undefined) {
    course = isNaN(fix.course) ? course : Math.round(fix.course);
    speed = isNaN(fix.speed) ? speed : fix.speed;
    satellites = fix.satellites;
  }
  if (candraw) {
    if (fix !== undefined && fix.fix == 1) {
      dist = distance(fix, wp);
      if (isNaN(dist)) dist = 0;
      brg = bearing(fix, wp);
      if (isNaN(brg)) brg = 0;
    }
    drawN();
  }
}

var intervalRef;

function stopdraw() {
  candraw = false;
  if (intervalRef) {
    clearInterval(intervalRef);
  }
}

function startTimers() {
  candraw = true;
  /*intervalRefSec =*/ setInterval(function() {
    heading = newHeading(course, heading);
    if (course != heading) drawCompass(heading);
  }, 200);
}

function drawAll() {
  g.setColor(1, 0, 0);
  g.fillPoly([88, 71, 78, 88, 98, 88]);
  drawN();
  drawCompass(heading);
}

function startdraw() {
  g.clear();
  Bangle.drawWidgets();
  startTimers();
  drawAll();
}

function setButtons() {
  Bangle.setUI("leftright", btn => {
    if (!btn) {
      doselect();
    } else {
      nextwp(btn);
    }
  });
}

var SCREENACCESS = {
  withApp: true,
  request: function() {
    this.withApp = false;
    stopdraw();
    clearWatch();
  },
  release: function() {
    this.withApp = true;
    startdraw();
    setButtons();
  }
};

Bangle.on('lcdPower', function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});

var waypoints = require("waypoints").load();
wp = waypoints[0];

function nextwp(inc) {
  if (selected) {
    wpindex += inc;
    if (wpindex >= waypoints.length) wpindex = 0;
    if (wpindex < 0) wpindex = waypoints.length - 1;
    wp = waypoints[wpindex];
    drawN();
  } else {
    locindex = inc > 0 ? 1 : 0;
    drawN();
  }
}

function doselect() {
  if (selected && wpindex >= 0 && waypoints[wpindex].lat === undefined && savedfix.fix) {
    waypoints[wpindex] = {
      name: "@" + wp.name,
      lat: savedfix.lat,
      lon: savedfix.lon
    };
    wp = waypoints[wpindex];
    require("waypoints").save(waypoints);
  }
  selected = !selected;
  print("selected = " + selected);
  drawN();
}

g.clear();
Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
// load widgets can turn off GPS
Bangle.setGPSPower(1);
drawAll();
startTimers();
Bangle.on('GPS', onGPS);
// Toggle selected
setButtons();
