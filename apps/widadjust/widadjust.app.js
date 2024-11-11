/* Widadjust auto adjuster */

/* fmt library v0.1.2 */
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
  fmtDist: function(km) { return km.toFixed(1) + this.icon_km; },
  fmtSteps: function(n) { return fmtDist(0.001 * 0.719 * n); },
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
    clearTimeout(gps_state.timeout);
  },
  getGPSFix: function() {
    if (!this.emulator)
      return Bangle.getGPSFix();
    let fix = {};
    fix.fix = 1;
    fix.lat = 50;
    fix.lon = 14;
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

var start_time = -5, start_delta;

function updateTime(fix, now) {
  let s = fmt.fmtNow() + "\n";
  if (!fix.time)
    return s + "???";

  let delta = (now - fix.time.getTime()/1000);
  let tdelta = "" + delta.toFixed(4);

  let is_fix = 1;
  // = fix.fix

  if (start_time < -1) {
    start_time ++;
  }

  if (is_fix && start_time == -1) {
    start_time = now;
    start_delta = delta;
  }

  if (!is_fix)
    return s + "e " + tdelta + "s";	

  let ppm = (delta - start_delta) / (now - start_time);
  let pd = ppm * (3600*24);
  ppm *= 1000000;
  return s + "ppm " + ppm.toFixed(1)
    + "\n" + pd.toFixed(1) + "s/day"
    + "\ne " + tdelta + "s";
}

var cancel_gps = 0;

function on_gps(fix) {
  // Do this first so that we don't get extra jitter
  let now = getTime();
  let have = false, lat = "lat ", alt = "?",
      speed = "speed ", hdop = "?", adelta = "adelta ",
      tdelta = "tdelta ";

  if (cancel_gps)
    return;

  let msg = "";
  if (fix && fix.fix && fix.lat) {
    msg = "" + fix.speed.toFixed(1) + "km/h " +
      fix.alt.toFixed(0) + "m";
  } else {
    msg = "N/FIX "
      + (getTime() - gps.gps_start).toFixed(0) + "s";
  }

  msg += "\n" + updateTime(fix, now);

  g.reset().clear().setFont("Vector", 31)
    .setColor(1,1,1)
    .fillRect(0, 24, 176, 100)
    .setColor(0,0,0)
    .drawString(msg, 3, 25);
}

function stopGps() {
  cancel_gps=true;
  gps.stop_gps();
}

fmt.init();
gps.init();
gps.start_gps();
Bangle.on('GPS', on_gps);

g.reset();
