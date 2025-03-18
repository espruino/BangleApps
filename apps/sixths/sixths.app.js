// Sixth sense
/* eslint-disable no-unused-vars */

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

/* sun version 0.0.2 */
let sun	= {
  SunCalc: null,
  lat: 50,
  lon: 14,
  rise: 0,  /* Unix time of sunrise/sunset */
  set: 0,
  init: function() {  
    try {
      this.SunCalc = require("suncalc"); // from modules folder
    } catch (e) {
      print("Require error", e);
    }
    print("Have suncalc: ", this.SunCalc);
  },
  sunPos: function() {
    let d = new Date();
    let sun = this.SunCalc.getPosition(d, this.lat, this.lon);
    print(sun.azimuth, sun.altitude);
    return sun;
  },
  sunTime: function() {
    let d = new Date();
    let sun = this.SunCalc.getTimes(d, this.lat, this.lon);
    return sun;
  },
  adj: function (x) {
    if (x < 0)
      return x + 24*60*60;
    return x;
  },
  toSunrise: function () {
    return this.adj(this.rise - getTime());
  },
  toSunset: function () {
    return this.adj(this.set - getTime());
  },
  update: function () {
    if (this.SunCalc) {
      let t = this.sunTime();
      this.rise = t.sunrise.getTime() / 1000;
      this.set  = t.sunset.getTime() / 1000;
      return;
    }
    this.rise = getTime() - 4*3600;
    this.set = getTime() + 4*3600;
  },
  // < 0 : next is sunrise, in abs(ret) seconds
  // > 0 
  getNext: function () {
    let rise = this.toSunrise();
    let set = this.toSunset();
    if (rise < set) {
      return -rise;
    }
    return set;
 //   set = set / 60;
 //   return s + (set / 60).toFixed(0) + ":" + (set % 60).toFixed(0);
  },
};

sun.init();
fmt.init();
gps.init();

var location;

const W = g.getWidth();
const H = g.getHeight();

var cx = 100, cy = 105, sc = 70, temp = 0, alt = 0, bpm = 0;
var buzz = "",      /* Set this to transmit morse via vibrations */
    inm = "", l = "", /* For incoming morse handling */
    in_str = "",
    note = "",
    debug = "v0.10.2", debug2 = "(otherdb)", debug3 = "(short)";
var note_limit = 0;
var mode = 0, mode_time = 0; // 0 .. normal, 1 .. note, 2.. mark name
var disp_mode = 0;  // 0 .. normal, 1 .. small time

var state = {
  gps_limit: 0, // timeout -- when to stop recording
  gps_speed_limit: 0,
  prev_fix: null,
  gps_dist: 0,

  // Marks
  cur_mark: null,
};

// GPS handling
var gps_on = 0, // time GPS was turned on
    last_fix = 0, // time of last fix
    last_restart = 0, last_pause = 0, // utime
    last_fstart = 0; // utime, time of start of last fix
var gps_needed = 0, // how long to wait for a fix
    keep_fix_for = 30;

var mark_heading = -1;

// Is the human present?
var is_active = false, last_active = getTime() - 14*60, last_unlocked = getTime();
var draw_dot = false;
var is_level = false;

// For altitude handling.
var cur_altitude = -1;
var cur_temperature = 0;
var night_pressure = 0;

function toMorse(x) {
  let r = "";
  for (var i = 0; i < x.length; i++) {
    let c = x[i];
    if (c == " ") {
      r += " ";
      continue;
    }
    r += asciiToMorse(c) + " ";
  }
  return r;
}
function doBuzz(s) {
  if (buzz == "") {
    buzz = s;
    buzzTask();
  } else
    buzz += s;
}
function aload(s) {
  doBuzz(toMorse(' E'));
  load(s);
}
function gpsRestart() {
  print("gpsRestart");
  Bangle.setGPSPower(1, "sixths");
  last_restart = getTime();
  last_pause = 0;
  last_fstart = 0;
}
function gpsPause() {
  print("gpsPause");
  Bangle.setGPSPower(0, "sixths");
  last_restart = 0;
  last_pause = getTime();
}
function gpsReset() {
  state.prev_fix = null;
  state.gps_dist = 0;
}
function gpsOn() {
  gps_on = getTime();
  gps_needed = 1000;
  last_fix = 0;
  gpsRestart();
}
function gpsOff() {
  Bangle.setGPSPower(0, "sixths");
  gps_on = 0;
}
function gpsHandleFix(fix) {
  if (!state.prev_fix) {
    showMsg("GPS acquired", 10);
    doBuzz(" .");
    state.prev_fix = fix;
  }
  if (0) {
    /* Display error between GPS and system time */
    let now1 = Date();
    let now2 = fix.time;
    let n1 = now1.getMinutes() * 60 + now1.getSeconds();
    let n2 = now2.getMinutes() * 60 + now2.getSeconds();
    debug2 = "te "+(n2-n1)+"s";
  }
  loggps(fix);
  let d = fmt.distance(fix, state.prev_fix);
  if (d > 30) {
    state.prev_fix = fix;
    state.gps_dist += d/1000;
  }
}
function gpsHandle() {
  let msg = "";
  debug2 = "Ne" + gps_needed;
  debug3 = "Ke" + keep_fix_for;
  if (!last_restart) {
      let d = (getTime()-last_pause);
      if (last_fix)
          msg = "PL"+ fmt.fmtTimeDiff(getTime()-last_fix);
      else
          msg = "PN"+ fmt.fmtTimeDiff(getTime()-gps_on);

      print("gps on, paused ", d, gps_needed);
      if (d > gps_needed * 2) {
        gpsRestart();
      }
    } else {
      let fix = gps.getGPSFix();
      if (fix && fix.fix && fix.lat) {
        gpsHandleFix(fix);
        msg = "";
        if (Math.abs(fix.alt - cur_altitude) > 20)
          msg += "!";
        if (Math.abs(fix.alt - cur_altitude) > 80)
          msg += "!";
        if (Math.abs(fix.alt - cur_altitude) > 320)
          msg += "!";
        msg += fmt.fmtSpeed(fix.speed);

        if (!last_fstart)
          last_fstart = getTime();
        last_fix = getTime();
        keep_fix_for = (last_fstart - last_restart) / 1.5;
        if (keep_fix_for < 20)
          keep_fix_for = 20;
        if (keep_fix_for > 6*60)
          keep_fix_for = 6*60;
        gps_needed = 60;
      } else {
        if (last_fix)
          msg = "L"+ fmt.fmtTimeDiff(getTime()-last_fix);
        else {
          msg = "N"+ fmt.fmtTimeDiff(getTime()-gps_on);
          if (0 && fix) {
            msg += " " + fix.satellites + "sats";
          }
        }
      }

      let d = (getTime()-last_restart);
      let d2 = (getTime()-last_fstart);
      print("gps on, restarted ", d, gps_needed, d2);
      if (getTime() > state.gps_speed_limit &&
          ((d > gps_needed && !last_fstart) || (last_fstart && d2 > keep_fix_for))) {
        gpsPause();
        gps_needed = gps_needed * 1.5;
        print("Pausing, next try", gps_needed);
      }
    }
  msg += " "+fmt.fmtDist(state.gps_dist);
  return msg;
}
function markNew() {
  let r = {};
  r.time = getTime();
  r.fix = state.prev_fix;
  r.steps = Bangle.getHealthStatus("day").steps;
  r.gps_dist = state.gps_dist;
  r.altitude = cur_altitude;
  r.name = "auto";
  return r;
}
function markHandle() {
  let m = state.cur_mark;
  let msg = m.name + ">";
  if (m.time) {
    msg += fmt.fmtTimeDiff(getTime()- m.time);
  }
  if (state.prev_fix && state.prev_fix.fix && m.fix && m.fix.fix) {
    let s = fmt.fmtDist(fmt.distance(m.fix, state.prev_fix)/1000) + fmt.icon_km;
    msg += " " + s;
    debug = "wp>" + s;
    mark_heading = 180 + fmt.bearing(m.fix, state.prev_fix);
    debug2 = "wp>" + mark_heading;
  } else {
    msg += " w" + fmt.fmtDist(state.gps_dist - m.gps_dist);
  }
  return msg;
}
function entryDone() {
  showMsg(":" + in_str);
  doBuzz(" .");
  switch (mode) {
  case 1: logstamp(">" + in_str); break;
  case 2: state.cur_mark.name = in_str; break;
  }
  in_str = 0;
  mode = 0;
}
var waypoints = [], sel_wp = 0;
function loadWPs() {
  waypoints = require("Storage").readJSON(`waypoints.json`)||[{}];
  print("Have waypoints", waypoints);
}
function saveWPs() {
  require("Storage").writeJSON(`waypoints.json`,waypoints);
}
function selectWP(i) {
  sel_wp += i;
  if (sel_wp < 0)
    sel_wp = 0;
  if (sel_wp >= waypoints.length)
    sel_wp = waypoints.length - 1;
  if (sel_wp < 0) {
    showMsg("No WPs", 60);
  }
  let wp = waypoints[sel_wp];
  state.cur_mark = {};
  state.cur_mark.name = wp.name;
  state.cur_mark.gps_dist = 0; /* HACK */
  state.cur_mark.fix = {};
  state.cur_mark.fix.fix = 1;
  state.cur_mark.fix.lat = wp.lat;
  state.cur_mark.fix.lon = wp.lon;
  showMsg("WP:"+wp.name, 60);
  print("Select waypoint: ", state.cur_mark);
}
function ack(cmd) {
  showMsg(cmd, 3);
  doBuzz(' .');
}
function inputHandler(s) {
  print("Ascii: ", s, s[0], s[1]);
  if (s[0] == '^') {
    switch (s[1]) {
    case 'E': mode = 0; break;
    case 'T': entryDone(); break;
    }
    return;
  }
  if ((mode == 1) || (mode == 2)){
    in_str = in_str + s;
    showMsg(">"+in_str, 10);
    mode_time = getTime();
    return;
  }
  switch(s) {
    case 'B': {
      s = ' B';
      let bat = E.getBattery();
      if (bat > 45)
        s += 'E';
      else
        s = s+(bat/5);
      doBuzz(toMorse(s));
      showMsg("Bat "+bat+"%", 60);
      break;
    }
    case 'D': doBuzz(' .'); selectWP(1); break;
    case 'F': gpsOff(); ack("GPS off"); break;
    case 'T': gpsOn(); state.gps_limit = getTime() + 60*60*4; ack("GPS on"); break;
    case 'I':
      doBuzz(' .');
      disp_mode += 1;
      if (disp_mode == 2) {
        disp_mode = 0;
      }
      break;
    case 'L': aload("altimeter.app.js"); break;
    case 'M': doBuzz(' .'); mode = 2; showMsg("M>", 10); state.cur_mark = markNew(); mode_time = getTime(); break;
    case 'N': doBuzz(' .'); mode = 1; showMsg(">", 10); mode_time = getTime(); break;
    case 'O': aload("orloj.app.js"); break;
    case 'R': gpsReset(); ack("GPS reset"); break;
    case 'P': aload("runplus.app.js"); break;
    case 'S': gpsOn(); state.gps_limit = getTime() + 60*30; state.gps_speed_limit = state.gps_limit; ack("GPS speed"); break;
    case 'G': {
      s = ' T';
      let d = new Date();
      s += d.getHours() % 10;
      s += fmt.add0(d.getMinutes());
      doBuzz(toMorse(s));
      break;
    }
    case 'U': doBuzz(' .'); selectWP(-1); break;
    case 'Y': ack('Compass reset'); Bangle.resetCompass(); break;
    default: doBuzz(' ..'); showMsg("Unknown "+s, 5); break;
  }
}
const morseDict = {
    '.-': 'A',
    '-...': 'B',
    '-.-.': 'C',
    '-..': 'D',
    '.': 'E',
    '..-.': 'F',
    '--.': 'G',
    '....': 'H',
    '..': 'I',
    '.---': 'J',
    '-.-': 'K',
    '.-..': 'L',
    '--': 'M',
    '-.': 'N',
    '---': 'O',
    '.--.': 'P',
    '--.-': 'Q',
    '.-.': 'R',
    '...': 'S',
    '-': 'T',
    '..-': 'U',
    '...-': 'V',
    '.--': 'W',
    '-..-': 'X',
    '-.--': 'Y',
    '--..': 'Z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '----.': '9',
    '---..': '8',
    '--...': '7',
    '-....': '6',
    '-----': '0',
  };
let asciiDict = {};
for (let k in morseDict) {
  print(k, morseDict[k]);
  asciiDict[morseDict[k]] = k;
}
function morseToAscii(morse) {
  return morseDict[morse];
}
function asciiToMorse(char) {
  return asciiDict[char];
}
function morseHandler() {
  if (inm[0] == "^") {
    inputHandler("^"+morseToAscii(inm.substr(1)));
  } else {
    inputHandler(morseToAscii(inm));
  }

  inm = "";
  l = "";
}
function touchHandler(d) {
  let x = Math.floor(d.x);
  let y = Math.floor(d.y);

  if (1) { /* Just a debugging feature */
    g.setColor(0.25, 0, 0);
    if (0)
      g.fillCircle(W-x, W-y, 5);
    else
      g.fillCircle(x, y, 5);
  }
  if (!d.b) {
    morseHandler();
    l = "";
    return;
  }
  if (y > H/2 && l == "") {
    inm = "^";
  }
  if (x < W/2 && y < H/2 && l != ".u") {
    inm = inm + ".";
    l = ".u";
  }
  if (x > W/2 && y < H/2 && l != "-u") {
    inm = inm + "-";
    l = "-u";
  }
  if (x < W/2 && y > H/2 && l != ".d") {
    inm = inm + ".";
    l = ".d";
  }
  if (x > W/2 && y > H/2 && l != "-d") {
    inm = inm + "-";
    l = "-d";
  }

  //print(inm, "drag:", d);
}
var lastHour = -1, lastMin = -1;
function logstamp(s) {
  logfile.write("utime=" + getTime() +
                " bele=" + cur_altitude +
                " batperc=" + E.getBattery() +
                " " + s + "\n");
}
function loggps(fix) {
  logfile.write(fix.lat + " " + fix.lon + " ele=" + fix.alt + " ");
  logstamp("");
}
function hourly() {
  print("hourly");
  let s = ' T';
  let bat = E.getBattery();
  if (bat < 25) {
      s = ' B';
      showMsg("Bat "+bat+"%", 60);
  }
  if (is_active)
    doBuzz(toMorse(s));
  sun.update();
  //logstamp("");
}
function showMsg(msg, timeout) {
  note_limit = getTime() + timeout;
  note = msg;
}

var prev_step = -1, this_step = -1;

function fivemin() {
  print("fivemin");
  let s = ' B';
  try {
    Bangle.getPressure().then((x) => { cur_altitude = x.altitude;
                                     cur_temperature = x.temperature; },
                              print);
  } catch (e) {
    print("Altimeter error", e);
  }
  prev_step = this_step;
  this_step = Bangle.getStepCount();
}
function every(now) {
  if ((mode > 0) && (getTime() - mode_time > 10)) {
    if (mode == 1) {
      entryDone();
    }
    mode = 0;
  }
  if (gps_on && getTime() > state.gps_limit && getTime() > state.gps_speed_limit) {
    Bangle.setGPSPower(0, "sixths");
    gps_on = 0;
  }

  if (lastHour != now.getHours()) {
    lastHour = now.getHours();
    hourly();
  }
  if (lastMin / 5 != now.getMinutes() / 5) { // fixme, trunc?
    lastMin = now.getMinutes();
    fivemin();
  }
}

function testBearing() {
  let p1 = {}, p2 = {};
  p1.lat = 40; p2.lat = 50;
  p1.lon = 14; p2.lon = 14;
  print("bearing = ", fmt.bearing(p1, p2));
}

function radA(p) { return p*(Math.PI*2); }
function radD(d) { return d*(H/2); }
function radX(p, d) {
  let a = radA(p);
  return H/2 + Math.sin(a)*radD(d);
}
function radY(p, d) {
  let a = radA(p);
  return W/2 - Math.cos(a)*radD(d);
}
function drawDot(h, d, s) {
  let x = radX(h/360, d);
  let y = radY(h/360, d);
  g.fillCircle(x,y, 10);
}
function drawBackground() {
  let acc = Bangle.getAccel();
  is_level = (acc.z < -0.95);
  Bangle.setCompassPower(!!is_level, "sixths");
  if (is_level) {
    let obj = Bangle.getCompass();
    if (obj) {
      let h = 360-obj.heading;
      print("Compass", h);
      g.setColor(0.5, 0.5, 1);
      drawDot(h, 0.7, 10);
    }
  }
  if (state.prev_fix && state.prev_fix.fix) {
    g.setColor(0.5, 1, 0.5);
    drawDot(state.prev_fix.course, 0.5, 6);
  }
  if (mark_heading != -1) {
    g.setColor(1, 0.5, 0.5);
    drawDot(mark_heading, 0.6, 8);
  }
}
function drawTime(now) {
  if (disp_mode == 0)
    g.setFont('Vector', 60);
  else
    g.setFont('Vector', 26);
  g.setFontAlign(1, -1);
  draw_dot = !draw_dot;
  let dot = ":";
  if (!draw_dot)
    dot = ".";
  let s = "";
  if (disp_mode == 1)
    s = debug;
  g.drawString(s + now.getHours() + dot + fmt.add0(now.getMinutes()), W, 28);
}

var base_alt = -1, ext_alt = -1, tot_down = 0, tot_up = 0;

function walkHandle() {
  let msg = "";
  let step = Bangle.getStepCount();
  let cur = cur_altitude;
  if (base_alt == -1) {
    base_alt = cur;
    ext_alt = cur;
  }
  if (this_step - prev_step > 100
      || 1
      || step - this_step > 100) {
    //msg += fmt.fmtSteps((this_step - prev_step) * 12);

    let dir = ext_alt > base_alt; /* 1.. climb */
    if (!dir) dir = -1;
    let hyst = 2;
    if (Math.abs(cur - base_alt) > hyst) {
      if (cur*dir > ext_alt*dir) {
        ext_alt = cur;
      }
    }
    let diff = ext_alt - base_alt;
      if (cur*dir < (ext_alt - hyst*dir)*dir) {
        if (1 == dir) {
          tot_up += diff; 
        }
        if (-1 == dir) {
          tot_down += -diff; 
        }
        base_alt = ext_alt;
        ext_alt = cur;
      }
    let tmp_down = tot_down, tmp_up = tot_up;
        if (1 == dir) {
          tmp_up += diff; 
        }
        if (-1 == dir) {
          tmp_down += -diff; 
        }

    msg += " " + fmt.fmtAlt(tmp_down) + " " + fmt.fmtAlt(tmp_up);

    return msg + "\n";
  }
  return "";
}

function draw() {
  if (disp_mode == 2) {
    draw_all();
    return;
  }
  g.setColor(1, 1, 1);
  g.fillRect(0, 24, W, H);

  if (0) {
    g.setColor(0.25, 1, 1);
    g.fillPoly([ W/2, 24, W, 80, 0, 80 ]);
  }
  drawBackground();

  let now = new Date();
  g.setColor(0, 0, 0);
  drawTime(now);

  every(now);

  //let km = 0.001 * 0.719 * Bangle.getHealthStatus("day").steps;

  // 33 still fits
  g.setFont('Vector', 30);

  const weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  let msg = weekday[now.getDay()] + "" + now.getDate() + ". "
        + fmt.fmtSteps(Bangle.getHealthStatus("day").steps) + "\n";

  if (gps_on) {
    msg += gpsHandle() + "\n";
  }

  if (state.cur_mark) {
    msg += markHandle() + "\n";
  }
  
  {
    let set = sun.getNext();
    if ((set > -12*60*60 && set < 4*60*60)) {
      if (set < 0) {
        msg += "^";
        set = -set;
      } else msg += "v";
      set = Math.floor(set / 60);
      msg += (set / 60).toFixed(0) + ":" + fmt.add0(set % 60);
      msg += "\n";
    }
  }

  if (note != "") {
    if (getTime() > note_limit)
      note = "";
    else
      msg += note + "\n";
  }
  
  msg += walkHandle();

  if (getTime() - last_active > 15*60) {
    let alt_adjust = cur_altitude - location.alt;
    let abs = Math.abs(alt_adjust);
    print("adj", alt_adjust);
    let o = Bangle.getOptions();
    if (abs > 10 && abs < 150) {
      let a = 0.01;
      // FIXME: draw is called often compared to alt reading
      if (cur_altitude > location.alt)
        a = -a;
      o.seaLevelPressure = o.seaLevelPressure + a;
      Bangle.setOptions(o);
    }
    let pr = o.seaLevelPressure;
    if (pr)
      msg += fmt.fmtPress(pr);
    else
      msg += "emu?";
  } else {
    msg += fmt.fmtAlt(cur_altitude);
  }

  msg = msg + " " + fmt.fmtTemp(cur_temperature) + "\n";

  {
    let o = Bangle.getOptions();
    let pr = o.seaLevelPressure;

    if (now.getHours() < 6)
      night_pressure = pr;
    if (night_pressure)
      msg += (pr-night_pressure).toFixed(1) + fmt.icon_hpa + " ";
    if (pr)
      msg += fmt.fmtPress(pr) + "\n";
  }
  g.setFontAlign(-1, -1);
  if (disp_mode == 0)
    g.drawString(msg, 10, 85);
  else
    g.drawString(msg, 10, 60);

  if (0 && disp_mode == 1) {
    g.setFont('Vector', 21);
    g.drawString(debug + "\n" + debug2 + "\n" + debug3, 10, 20);
  }

  queueDraw();
}
function draw_all() {
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, W, H);
  g.setFont('Vector', 36);

  g.setColor(1, 1, 1);
  g.setFontAlign(-1, 1);
  let now = new Date();
  g.drawString(now.getHours() + ":" + fmt.add0(now.getMinutes()) + ":" + fmt.add0(now.getSeconds()), 10, 40);

  let acc = Bangle.getAccel();
  let ax = 0 + acc.x, ay = 0.75 + acc.y, az = 0.75 + acc.y;
  let diff = ax * ax + ay * ay + az * az;
  diff = diff * 3;
  if (diff > 1)
    diff = 1;

  let co = Bangle.getCompass();
  let step = Bangle.getStepCount();
  let bat = E.getBattery();
  Bangle.getPressure().then((x) => { alt = x.altitude; temp = x.temperature; },
                                 print);

  g.setColor(0, 1, 0);
  g.drawCircle(cx, cy, sc);

  if (0) {
    g.setColor(0, 0.25, 0);
    g.fillCircle(cx + sc * acc.x, cy + sc * acc.y, 5);
    g.setColor(0, 0, 0.25);
    g.fillCircle(cx + sc * acc.x, cy + sc * acc.z, 5);
  }
  if (0) {
    print(co.dx, co.dy, co.dz);
    g.setColor(0, 0.25, 0);
    g.fillCircle(cx + sc * co.dx / 300, cy + sc * co.dy / 1500, 5);
    g.setColor(0, 0, 0.25);
    g.fillCircle(cx + sc * co.dx / 300, cy + sc * co.dz / 400, 5);
  }
  if (1) {
    let h = co.heading / 360 * 2 * Math.PI;
    g.setColor(0, 0, 0.5);
    g.fillCircle(cx + sc * Math.sin(h), cy + sc * Math.cos(h), 5);
  }

  g.setColor(1, 1, 1);

  g.setFont('Vector', 22);
  g.drawString(now.getDate()+"."+(now.getMonth()+1)+" "+now.getDay(), 3, 60);
  g.drawString("(message here)", 3, 80);
  g.drawString("S" + step + " B" + Math.round(bat/10) + (Bangle.isCharging()?"c":""), 3, 100);
  g.drawString("A" + Math.round(alt) + " T" + Math.round(temp), 3, 120);
  g.drawString("C" + Math.round(co.heading) + " B" + bpm, 3, 140);

  queueDraw();
}
function accelTask() {
  let tm = 100;
  let acc = Bangle.getAccel();
  let en = !Bangle.isLocked();
  let msg = "";
  if (en && acc.z < -0.95) {
    msg = "Level";
    doBuzz(".-..");
    tm = 3000;
  }
  if (en && acc.x < -0.80) {
    msg = "Down";
    doBuzz("-..");
    tm = 3000;
  }
  if (en && acc.x > 0.95) {
    msg = "Up";
    doBuzz("..-");
    tm = 3000;
  }
  print(msg);
  setTimeout(accelTask, tm);
}
function buzzTask() {
  if (buzz != "") {
    let now = buzz[0];
    buzz = buzz.substring(1);
    let dot = 100;
    if (now == " ") {
      setTimeout(buzzTask, 300);
    } else if (now == ".") {
      Bangle.buzz(dot, 1);
      setTimeout(buzzTask, 2*dot);
    } else if (now == "-") {
      Bangle.buzz(3*dot, 1);
      setTimeout(buzzTask, 4*dot);
    } else if (now == "/") {
      setTimeout(buzzTask, 6*dot);
    } else print("Unknown character -- ", now, buzz);
  }
}
var last_acc;
function aliveTask() {
  function cmp(s) {
    let d = acc[s] - last_acc[s];
    return d < -0.03 || d > 0.03;
  }
  // HRM seems to detect hand quite nicely
  let acc = Bangle.getAccel();
  is_active = false;
  if (cmp("x") || cmp("y") || cmp("z")) {
    print("active");
    is_active = true;
    last_active = getTime();
  }
  last_acc = acc;

  setTimeout(aliveTask, 60000);
}
function lockHandler(locked) {
  if (!locked) {
    last_unlocked = getTime();
    draw();
  }
}

function queueDraw() {
  let next;
  if ((getTime() - last_unlocked > 3*60) &&
      (getTime() > state.gps_limit))
    next = 60000;
  else
    next =  1000;
  setTimeout(draw, next - (Date.now() % next));
}
function start() {
  g.reset();
  Bangle.setUI({
    mode : "clock"
  });
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  Bangle.on("drag", touchHandler);
  Bangle.on("lock", lockHandler);
  if (0) {
    Bangle.setCompassPower(1, "sixths");
    Bangle.setBarometerPower(1, "sixths");
  }
  if (0) {
    Bangle.setHRMPower(1, "sixths");
    Bangle.setGPSPower(1, "sixths");
    Bangle.on("HRM", (hrm) => { bpm = hrm.bpm; } );
  }

  draw();
  location = require("Storage").readJSON("mylocation.json",1)||{"lat":50,"lon":14.45,"alt":354,"location":"Woods"};
  state = require("Storage").readJSON("sixths.json",1)||state;
  loadWPs();
  buzzTask();
  if (0)
      accelTask();

  if (1) {
    last_acc = Bangle.getAccel();
    aliveTask();
  }
}

let logfile = require("Storage").open("sixths.egt", "a");

if (0) {
  testBearing();
} else
  start();
