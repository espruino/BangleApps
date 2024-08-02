/* Ded Reckon */
/* eslint-disable no-unused-vars */

/* fmt library v0.1.3 */
let fmt = {
    icon_alt : "\0\x08\x1a\1\x00\x00\x00\x20\x30\x78\x7C\xFE\xFF\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
    icon_m : "\0\x08\x1a\1\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
    icon_km : "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00",
    icon_kph : "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\xFF\x00\xC3\xC3\xFF\xC3\xC3",
    icon_c : "\0\x08\x1a\1\x00\x00\x60\x90\x90\x60\x00\x7F\xFF\xC0\xC0\xC0\xC0\xC0\xFF\x7F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00",

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
};

/* gps library v0.1.1 */
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

/* ui library 0.1 */
let ui = {
  display: 0,
  numScreens: 2,
  drawMsg: function(msg) {
  g.reset().setFont("Vector", 35)
    .setColor(1,1,1)
    .fillRect(0, this.wi, 176, 176)
    .setColor(0,0,0)
    .drawString(msg, 5, 30);
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
  }
};

var last_steps = Bangle.getStepCount(), last_time = getTime(), speed = 0, step_phase = 0;

var mpstep = 0.719 * 1.15;

function updateSteps() {
  if (step_phase ++ > 9) {
    step_phase =0;
    let steps = Bangle.getStepCount();
    let time = getTime();
    
    speed = 3.6 * mpstep * ((steps-last_steps) / (time-last_time));
    last_steps = steps;
    last_time = time;
  }
  return "" + fmt.fmtSpeed(speed) + " " + step_phase + "\n" + fmt.fmtDist(log_dist/1000) + " " + fmt.fmtDist(log_last/1000);
}

/* compensated compass */
var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;
const tiltfixread = require("magnav").tiltfixread;
var heading;


var cancel_gps = false;

function drawStats() {
  let fix = gps.getGPSFix();

  let msg = fmt.fmtFix(fix, getTime() - gps.gps_start);
  
  msg += "\n" + fmt.fmtDist(gps_dist/1000) + " " + fmt.fmtDist(gps_last/1000) + "\n" + updateSteps();
  let c = Bangle.getCompass();
  if (c) msg += "\n" + c.heading.toFixed(0) + "/" + heading.toFixed(0) + "deg " + log.length + "\n";

  g.reset().clear().setFont("Vector", 31)
    .setColor(1,1,1)
    .fillRect(0, 24, 176, 100)
    .setColor(0,0,0)
    .drawString(msg, 3, 25);
}

function updateGps() {
  if (cancel_gps)
    return;
  heading = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
  if (ui.display == 0) {
    setTimeout(updateGps, 1000);
    drawLog();
    drawStats();
  }
  if (ui.display == 1) {
    setTimeout(updateGps, 1000);
    drawLog();
  }
}

function stopGps() {
  cancel_gps=true;
  gps.stop_gps();
}

var log = [], log_dist = 0, gps_dist = 0;
var log_last = 0, gps_last = 0;

function logEntry() {
  let e = {};
  e.time =  getTime();
  e.fix = gps.getGPSFix();
  e.steps = Bangle.getStepCount();
  if (0) {
    let c = Bangle.getCompass();
    if (c)
      e.dir = c.heading;
    else
      e.dir = -1;
  } else {
    e.dir = heading;
  }
  return e;
}

function onTurn() {
    let e = logEntry();
    log.push(e);
}

function radians(a) { return a*Math.PI/180; }
function degrees(a) { return a*180/Math.PI; }
// distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
// https://www.movable-type.co.uk/scripts/latlong.html
// (Equirectangular approximation)
function calcDistance(a,b) {
  var x = radians(b.lon-a.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.sqrt(x*x + y*y) * 6371000;
}

var dn, de;
function initConv(fix) {
    let n = { lat: fix.lat+1, lon: fix.lon };
    let e = { lat: fix.lat, lon: fix.lon+1 };
    
    dn = calcDistance(fix, n);
    de = calcDistance(fix, e);
    print("conversion is ", dn, 108000, de, 50000);
}
function toM(start, fix) {
    return { x: (fix.lon - start.lon) * de, y: (fix.lat - start.lat) * dn };
}
var mpp = 4;
function toPix(q) {
    let p = { x: q.x, y: q.y };
    p.x /= mpp; /* 10 m / pix */
    p.y /= -mpp;
    p.x += 85;
    p.y += 85;
    return p;
}

function drawLog() {
  let here = logEntry();
  if (!here.fix.lat) {
    here.fix.lat = 50;
    here.fix.lon = 14;
  }
  initConv(here.fix);
  log.push(here);
  let l = log;
  log_dist = 0;
  log_last = -1;
  gps_last = -1;

  g.reset().clear();
  g.setColor(0, 0, 1);
  let last = { x: 0, y: 0 };
  for (let i = l.length - 2; i >= 0; i--) {
    let next = {};
    let m = (l[i+1].steps - l[i].steps) * mpstep;
    let dir = radians(180 + l[i].dir);
    next.x = last.x + m * Math.sin(dir);
    next.y = last.y + m * Math.cos(dir);
    print(dir, m, last, next);
    let lp = toPix(last);
    let np = toPix(next);
    g.drawLine(lp.x, lp.y, np.x, np.y);
    g.drawCircle(np.x, np.y, 3);
    last = next;
    if (log_last == -1)
      log_last = m;
    log_dist += m;
  }
  g.setColor(0, 1, 0);
  last = { x: 0, y: 0 };
  gps_dist = 0;
  for (let i = l.length - 2; i >= 0; i--) {
    let fix = l[i].fix;
    if (fix.fix && fix.lat) {
      let next = toM(here.fix, fix);
      let lp = toPix(last);
      let np = toPix(next);
      let d = Math.sqrt((next.x-last.x)*(next.x-last.x)+(next.y-last.y)*(next.y-last.y));
      if (gps_last == -1)
        gps_last = d;
      gps_dist += d;
      g.drawLine(lp.x, lp.y, np.x, np.y);
      g.drawCircle(np.x, np.y, 3);
      last = next;
    }
  }
  log.pop();
}

function testPaint() {
  let pos = gps.getGPSFix();
  log = [];
  let e = { fix: pos, steps: 100, dir: 0 };
  log.push(e);
  e = { fix: pos, steps: 200, dir: 90 };
  log.push(e);
  e = { fix: pos, steps: 300, dir: 0 };
  log.push(e);
  print(log, log.length, log[0], log[1]);
  drawLog();
}

function touchHandler(d) {
  let x = Math.floor(d.x);
  let y = Math.floor(d.y);
  
  if (d.b != 1 || ui.last_b != 0) {
    ui.last_b = d.b;
    return;
  }

  
  if ((x<ui.h/2) && (y<ui.w/2)) {
    ui.drawMsg("Turn");
    onTurn();
  }
  if ((x>ui.h/2) && (y<ui.w/2)) {
    ui.drawMsg("Writing");
    require('Storage').writeJSON("speedstep."+getTime()+".json", log);
    ui.drawMsg("Wrote");
  }
  ui.touchHandler(d);
}


fmt.init();
gps.init();
ui.init();
ui.drawBusy();
gps.start_gps();
Bangle.setCompassPower(1, "speedstep");
Bangle.on("drag", touchHandler);
Bangle.setUI({
  mode : "custom",
  swipe : (s) => ui.onSwipe(s),
  clock : 0
});

if (0)
  testPaint();
if (1) {
  g.reset();
  updateGps();
}
