// "Rail trail"? "Trail rail"!

/* fmt library v0.2.2 */
let fmt = {
  icon_alt : "\0\x08\x1a\1\x00\x00\x00\x20\x30\x78\x7C\xFE\xFF\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_m : "\0\x08\x1a\1\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_km : "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_kph : "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\xFF\x00\xC3\xC3\xFF\xC3\xC3",
  icon_c : "\0\x08\x1a\1\x00\x00\x60\x90\x90\x60\x00\x7F\xFF\xC0\xC0\xC0\xC0\xC0\xFF\x7F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_hpa : "\x00\x08\x16\x01\x00\x80\xb0\xc8\x88\x88\x88\x00\xf0\x88\x84\x84\x88\xf0\x80\x8c\x92\x22\x25\x19\x00\x00",
  icon_9 : "\x00\x08\x16\x01\x00\x00\x00\x00\x38\x44\x44\x4c\x34\x04\x04\x38\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00",
  icon_10 : "\x00\x08\x16\x01\x00\x08\x18\x28\x08\x08\x08\x00\x00\x18\x24\x24\x24\x24\x18\x00\x00\x00\x00\x00\x00\x00",

  /* 0 .. DD.ddddd
     1 .. DD MM.mmm'
     2 .. DD MM'ss"
  */
  geo_mode : 1,

  init: function() {},
  fmtDist: function(km) {
    if (km >= 1.0) return km.toFixed(1) + this.icon_km;
    return (km*1000).toFixed(0) + this.icon_m;
  },
  fmtSteps: function(n) { return this.fmtDist(0.001 * 0.719 * n); },
  fmtAlt: function(m) { return m.toFixed(0) + this.icon_alt; },
  fmtTemp: function(c) { return c.toFixed(1) + this.icon_c; },
  fmtPress: function(p) { 
    if (p < 900 || p > 1100)
      return p.toFixed(0) + this.icon_hpa; 
    if (p < 1000) {
      p -= 900;
      return this.icon_9 + this.add0(p.toFixed(0)) + this.icon_hpa;
    }
    p -= 1000;
    return this.icon_10 + this.add0(p.toFixed(0)) + this.icon_hpa;
  },
  draw_dot : 1,
  add0: function(i) {
    if (i > 9) {
      return ""+i;
    } else {
      return "0"+i;
    }
  },
  fmtTOD: function(now) {
    this.draw_dot = !this.draw_dot;
    let dot = ":";
    if (!this.draw_dot)
      dot = ".";
    return now.getHours() + dot + this.add0(now.getMinutes());
  },
  fmtNow: function() { return this.fmtTOD(new Date()); },
  fmtTimeDiff: function(d) {
    if (d < 180)
      return ""+d.toFixed(0);
    d = d/60;
    return ""+d.toFixed(0)+"m";
  },
  fmtAngle: function(x) {
    switch (this.geo_mode) {
    case 0:
      return "" + x;
    case 1: {
      let d = Math.floor(x);
      let m = x - d;
      m = m*60;
      return "" + d + " " + m.toFixed(3) + "'";
    }
    case 2: {
      let d = Math.floor(x);
      let m = x - d;
      m = m*60;
      let mf = Math.floor(m);
      let s = m - mf;
      s = s*60;
      return "" + d + " " + mf + "'" + s.toFixed(0) + '"';
    }
    }
    return "bad mode?";
  },
  fmtPos: function(pos) {
    let x = pos.lat;
    let c = "N";
    if (x<0) {
      c = "S";
      x = -x;
    }
    let s = c+this.fmtAngle(x) + "\n";
    c = "E";
    if (x<0) {
      c = "W";
      x = -x;
    }
    return s + c + this.fmtAngle(x);
  },
  fmtFix: function(fix, t) {
    if (fix && fix.fix && fix.lat) {
      return this.fmtSpeed(fix.speed) + " " +
        this.fmtAlt(fix.alt);
    } else {
      return "N/FIX " + this.fmtTimeDiff(t);
    }
  },
  fmtSpeed: function(kph) {
    return kph.toFixed(1) + this.icon_kph;
  },
  radians: function(a) { return a*Math.PI/180; },
  degrees: function(a) { return a*180/Math.PI; },
  // distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
  // https://www.movable-type.co.uk/scripts/latlong.html
  // (Equirectangular approximation)
  // returns value in meters
  distance: function(a,b) {
    var x = this.radians(b.lon-a.lon) * Math.cos(this.radians((a.lat+b.lat)/2));
    var y = this.radians(b.lat-a.lat);
    return Math.sqrt(x*x + y*y) * 6371000;
  },
  // thanks to waypointer
  bearing: function(a,b) {
    var delta = this.radians(b.lon-a.lon);
    var alat = this.radians(a.lat);
    var blat = this.radians(b.lat);
    var y = Math.sin(delta) * Math.cos(blat);
    var x = Math.cos(alat) * Math.sin(blat) -
        Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
    return Math.round(this.degrees(Math.atan2(y, x)));
  },
};

/* gps library v0.1.2 */
let gps = {
  emulator: -1,
  init: function(x) {
    this.emulator = (process.env.BOARD=="EMSCRIPTEN" 
                     || process.env.BOARD=="EMSCRIPTEN2")?1:0;
  },
  state: {},
  on_gps: function(f) {
    let fix = this.getGPSFix();
    f(fix);

    /*
      "lat": number,      // Latitude in degrees
      "lon": number,      // Longitude in degrees
      "alt": number,      // altitude in M
      "speed": number,    // Speed in kph
      "course": number,   // Course in degrees
      "time": Date,       // Current Time (or undefined if not known)
      "satellites": 7,    // Number of satellites
      "fix": 1            // NMEA Fix state - 0 is no fix
      "hdop": number,     // Horizontal Dilution of Precision
    */
    this.state.timeout = setTimeout(this.on_gps, 1000, f);
  },
  off_gps: function() {
    clearTimeout(this.state.timeout);
  },
  getGPSFix: function() {
    if (!this.emulator)
      return Bangle.getGPSFix();
    let fix = {};
    fix.fix = 1;
    fix.lat = 50;
    fix.lon = 14-(getTime()-this.gps_start) / 1000; /* Go West! */
    fix.alt = 200;
    fix.speed = 5;
    fix.course = 30;
    fix.time = Date();
    fix.satellites = 5;
    fix.hdop = 12;
    return fix;
  },
  gps_start : -1,
  start_gps: function() {
    Bangle.setGPSPower(1, "libgps");
    this.gps_start = getTime();
  },
  stop_gps: function() {
    Bangle.setGPSPower(0, "libgps");
  },
};

/* ui library 0.1.2 */
let ui = {
  display: 0,
  numScreens: 2,
  drawMsg: function(msg) {
    g.reset().setFont("Vector", 35)
      .setColor(1,1,1)
      .fillRect(0, this.wi, 176, 176)
      .setColor(0,0,0)
      .drawString(msg, 5, 30)
      .flip();
  },
  drawBusy: function() {
    this.drawMsg("\n.oO busy");
  },
  nextScreen: function() {
    print("nextS");
    this.display = this.display + 1;
    if (this.display == this.numScreens)
      this.display = 0;
    this.drawBusy();
  },
  prevScreen: function() {
    print("prevS");
    this.display = this.display - 1;
    if (this.display < 0)
      this.display = this.numScreens - 1;
    this.drawBusy();
  },
  onSwipe: function(dir) {
    this.nextScreen();
  },
  h: 176,
  w: 176,
  wi: 32,
  last_b: 0,
  touchHandler: function(d) {
    let x = Math.floor(d.x);
    let y = Math.floor(d.y);
    
    if (d.b != 1 || this.last_b != 0) {
      this.last_b = d.b;
      return;
    }
    
    print("touch", x, y, this.h, this.w);

    /*
      if ((x<this.h/2) && (y<this.w/2)) {
      }
      if ((x>this.h/2) && (y<this.w/2)) {
      }
    */

    if ((x<this.h/2) && (y>this.w/2)) {
      print("prev");
      this.prevScreen();
    }
    if ((x>this.h/2) && (y>this.w/2)) {
      print("next");
      this.nextScreen();
    }
  },
  init: function() {
    this.drawBusy();
  }
};

/* egt 0.0.1 */
let egt = {
  init: function() {
  },
  parse: function(l) {
    let r = {};
    let s = l.split(' ');
    
    if (s === undefined)
      return r;
    
    if (s[1] === undefined)
      return r;
    
    if (s[1].split('=')[1] === undefined) {
      r.lat = 1 * s[0];
      r.lon = 1 * s[1];
    }

    for (let fi of s) {
      let f = fi.split('=');
      if (f[0] == "utime") {
        r.utime = 1 * f[1];
      }
    }

    return r;
  },
};

function toCartesian(v) {
  const R = 6371; // Poloměr Země v km
  const latRad = v.lat * Math.PI / 180;
  const lonRad = v.lon * Math.PI / 180;

  const x = R * lonRad * Math.cos(latRad);
  const y = R * latRad;

  return { x, y };
}

function distSegment(x1, x2, xP) {
  // Převod zeměpisných souřadnic na kartézské souřadnice
  const p1 = toCartesian(x1);
  const p2 = toCartesian(x2);
  const p = toCartesian(xP);

  // Vektor p1p2
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Projekce bodu p na přímku definovanou body p1 a p2
  const dot = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / (dx * dx + dy * dy);

  // Určení bodu na přímce, kde leží projekce
  let closestX, closestY;
  if (dot < 0) {
    closestX = p1.x;
    closestY = p1.y;
  } else if (dot > 1) {
    closestX = p2.x;
    closestY = p2.y;
  } else {
    closestX = p1.x + dot * dx;
    closestY = p1.y + dot * dy;
  }

  // Vzdálenost mezi bodem p a nejbližším bodem na úsečce
  const distance = Math.sqrt((p.x - closestX) * (p.x - closestX) + (p.y - closestY) * (p.y - closestY));

  return distance * 1000;
}

function angleDifference(angle1, angle2) {
  // Compute the difference
  let difference = angle2 - angle1;

  // Normalize the difference to be within the range -180° to 180°
  while (difference > 180) difference -= 360;
  while (difference < -180) difference += 360;

  return difference;
}

function drawThickLine(x1, y1, x2, y2, thickness) {
  // Calculate the perpendicular offset for the line thickness
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const offsetX = (dy / length) * (thickness / 2);
  const offsetY = (dx / length) * (thickness / 2);

  // Draw multiple lines to simulate thickness
  for (let i = -thickness / 2; i <= thickness / 2; i++) {
    g.drawLine(
      x1 + offsetX * i,
      y1 - offsetY * i,
      x2 + offsetX * i,
      y2 - offsetY * i
    );
  }
}

function toxy(pp, p) {
  let r = {};
  let d = fmt.distance(pp, p);
  let h = fmt.radians(fmt.bearing(pp, p) - pp.course);
  let x = pp.x, y = pp.y;
  x += d * pp.ppm * Math.sin(h);
  y -= d * pp.ppm * Math.cos(h);
  r.x = x;
  r.y = y;
  return r;
}

function paint(pp, p1, p2, thick) {
  let d1 = toxy(pp, p1);
  let d2 = toxy(pp, p2);
  drawThickLine(d1.x, d1.y, d2.x, d2.y, thick);
}

var destination = {}, num = 0, dist = 0;

function read(pp, n) {
  g.reset().clear();
  let f = require("Storage").open(n+".st", "r");
  let l = f.readLine();
  let prev = 0;
  while (l!==undefined) {
    num++;
    l = ""+l;
    //print(l);
    let p = egt.parse(l);
    if (p.lat) {
      if (prev) {
        dist += fmt.distance(prev, p);
        //paint(pp, prev, p);
      }
      prev = p;
    }
    l = f.readLine();
    if (!(num % 100)) {
      ui.drawMsg(num + "\n" + fmt.fmtDist(dist / 1000));
      print(num, "points");
    }
  }
  ui.drawMsg(num + "\n" + fmt.fmtDist(dist / 1000));
  destination = prev;
}

function time_read(n) {
  print("Converting...");
  to_storage(n);
  print("Running...");
  let v1 = getTime();
  let pp = {};
  pp.lat = 50;
  pp.lon = 14.75;
  pp.ppm = 0.08; /* Pixels per meter */
  pp.course = 270;
  read(pp, n);
  let v2 = getTime();
  print("Read took", (v2-v1), "seconds");
  step_init();
  print(num, "points", dist, "distance");
  setTimeout(step, 1000);
}

var track_name = "", inf, point_num, track = [], track_points = 30, north = {};

function step_init() {
  inf = require("Storage").open(track_name + ".st", "r");
  north = {};
  north.lat = 89.9;
  north.lon = 0;
  point_num = 0;
  track = [];
}

function load_next() {
  while (track.length < track_points) {
    let l = inf.readLine();
    if (l === undefined) {
      print("End of track");
      ui.drawMsg("End of track");
      break;
    }
    let p = egt.parse(l);
    if (!p.lat) {
      print("No latitude?");
      continue;
    }
    p.point_num = point_num++;
    p.passed = 0;
    print("Loading ", p.point_num);
    track.push(p);
  }
}

function paint_all(pp) {
  let prev = 0;
  let mDist = 99999999999, m = 0;
  const fast = 0;

  g.setColor(1, 0, 0);
  for (let i = 1; i < track.length; i++) {
    let p = track[i];
    prev = track[i-1];
    if (0 && fmt.distance(p, pp) < 100)
      p.passed = 1;
    if (!fast) {
      let d = distSegment(prev, p, pp);
      if (d < mDist) {
        mDist = d;
        m = i;
      } else {
        g.setColor(0, 0, 0);
      }
    }
    paint(pp, prev, p, 3);
  }
  if (fast)
    return { quiet: 0, offtrack : 0 };
  print("Best segment was", m, "dist", mDist);
  let ahead = 0, a = fmt.bearing(track[m-1], track[m]), quiet = -1;
  for (let i = m+1; i < track.length; i++) {
    let a2 = fmt.bearing(track[i-1], track[i]);
    let ad = angleDifference(a, a2);
    if (Math.abs(ad) > 20) {
      if (quiet == -1)
        quiet = ahead + fmt.distance(pp, track[i-1]);
      print("...straight", ahead);
      a = a2;
    }
    ahead += fmt.distance(track[i-1], track[i]);
  }
  print("...see", ahead);
  return { quiet: quiet, offtrack: mDist };
}

function step_to(pp, pass_all) {
  pp.x = ui.w/2;
  pp.y = ui.h*0.66;
  
  g.setColor(0.5, 0.5, 1);
  let sc = 2.5;
  g.fillPoly([ pp.x, pp.y, pp.x - 5*sc, pp.y + 12*sc, pp.x + 5*sc, pp.y + 12*sc ]);
  
  if (0) {
    g.setColor(0.5, 0.5, 1);
    paint(pp, pp, destination, 1);
  
    g.setColor(1, 0.5, 0.5);
    paint(pp, pp, north, 1);
  }
  
  let quiet = paint_all(pp);
  
  if ((pass_all || track[0].passed) && distSegment(track[0], track[1], pp) > 150) {
    print("Dropping ", track[0].point_num);
    track.shift();
  }
  return quiet;
}

var demo_mode = 0;

function step() {
  const fast = 0;
  let v1 = getTime();
  g.reset().clear();

  let fix = gps.getGPSFix();

  load_next();
  
  let pp = fix;
  pp.ppm = 0.08 * 3; /* Pixels per meter */

  if (!fix.fix) {
    let i = 2;
    pp.lat = track[i].lat;
    pp.lon = track[i].lon;
    pp.course = fmt.bearing(track[i], track[i+1]);
  }

  let quiet = step_to(pp, 1);

  if (!fast) {
    g.setFont("Vector", 31);
    g.setFontAlign(-1, -1);
    let msg = "\noff " + fmt.fmtDist(quiet.offtrack/1000);
    g.drawString(fmt.fmtFix(fix, getTime()-gps.gps_start) + msg, 3, 3);
  }
  if (!fast) {
    g.setFont("Vector", 23);
    g.setColor(0, 0, 0);
    g.setFontAlign(-1, 1);
    g.drawString(fmt.fmtNow(), 3, ui.h);
    g.setFontAlign(1, 1);
    g.drawString(fmt.fmtDist(quiet.quiet/1000), ui.w-3, ui.h);
  }

  if (quiet < 200)
    Bangle.setLCDPower(1);

  if (demo_mode)
    track.shift();
  let v2 = getTime();
  print("Step took", (v2-v1), "seconds");
  setTimeout(step, 100);
}

function recover() {
  ui.drawMsg("Recover...");
  step_init();
  let fix = gps.getGPSFix();
  let pp = fix;
  pp.ppm = 0.08 * 3; /* Pixels per meter */
  if (!fix.fix) {
    print("Can't recover with no fix\n");
    fix.lat = 50.0122;
    fix.lon = 14.7780;
  }
  load_next();
  load_next();
  while(1) {
    let d = distSegment(track[0], track[1], pp);
    print("Recover, d", d);
    if (d < 400)
      break;
    track.shift();
    if (0)
      step_to(pp, 1);
    load_next();
    ui.drawMsg("Recover\n" + fmt.fmtDist(d / 1000));
  }
}

function to_storage(n) {
  let f2 = require("Storage").open(n+".st", "w");
  let pos = 0;
  let size = 1024;
  while (1) {
    let d = require("Storage").read(n, pos, size);
    if (!d)
      break;
    f2.write(d);
    pos += size;
    print("Copy ", pos);
  }
}

ui.init();
fmt.init();
egt.init();
gps.init();
gps.start_gps();

const st = require('Storage');

let l = /^t\..*\.egt$/;
l = st.list(l, {sf:false});

print(l);

function load_track(x) {
  print("Loading", x);
  Bangle.buzz(50, 1); // Won't happen because load() is quicker
  g.reset().clear()
    .setFont("Vector", 40)
    .drawString("Loading", 0, 30)
    .drawString(x, 0, 80);
  g.flip();
  track_name = x;
  time_read(x);
  
  Bangle.setUI("clockupdown", btn => {
    print("Button", btn);
    if (btn == -1) {
      recover();
    }
    if (btn == 1) {
      demo_mode = 1;
    }
  });
}

var menu = {
    "< Back" : Bangle.load
};
if (l.length==0) menu["No tracks"] = ()=>{};
else for (let id in l) {
    let i = id;
    menu[l[id]]=()=>{ load_track(l[i]); };
}

g.clear();
E.showMenu(menu);

