/* Sky spy */

/* fmt library v0.2.3 */
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
    x = pos.lon;
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

/* gps library v0.1.4 */
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

/* ui library 0.1.3 */
let ui = {
  display: 0,
  numScreens: 2,
  drawMsg: function(msg) {
    g.reset().setFont("Vector", 35)
      .setColor(1, 1, 1)
      .fillRect(0, this.wi, this.w, this.y2)
      .setColor(0, 0, 0)
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
  wi: 24,
  y2: 176,
  h: 152,
  w: 176,
  last_b: 0,
  topLeft: function() { this.drawMsg("Unimpl"); },
  topRight: function() { this.drawMsg("Unimpl"); },
  touchHandler: function(d) {
    let x = Math.floor(d.x);
    let y = Math.floor(d.y);
    
    if (d.b != 1 || this.last_b != 0) {
      this.last_b = d.b;
      return;
    }
    
    print("touch", x, y, this.h, this.w);

    if ((x<this.w/2) && (y<this.y2/2))
      this.topLeft();
    if ((x>this.w/2) && (y<this.y2/2))
      this.topRight();
    if ((x<this.w/2) && (y>this.y2/2)) {
      print("prev");
      this.prevScreen();
    }
    if ((x>this.w/2) && (y>this.y2/2)) {
      print("next");
      this.nextScreen();
    }
  },
  init: function() {
    this.h = this.y2 - this.wi;
    this.drawBusy();
  }
};


var debug = 0;
var cur_altitude;
var fix;
var adj_time = 0, adj_alt = 0;

/* radial angle -- convert 0..1 to 0..2pi */
function radA(p) { return p*(Math.PI*2); }
/* radial distance -- convert 0..1 to something that fits on screen */
function radD(d) { return d*(ui.h/2); }
/* given angle/distance, get X coordinate */
function radX(p, d) {
  let a = radA(p);
  return ui.w/2 + Math.sin(a)*radD(d);
}
/* given angle/distance, get Y coordinate */
function radY(p, d) {
  let a = radA(p);
  return ui.h/2 - Math.cos(a)*radD(d) + ui.wi;
}

let gps_quality = {
  min_dalt: 9999,
  max_dalt: -9999,
  step: 0,

  resetAlt: function() {
    this.min_dalt = 9999;
    this.max_dalt = -9999;
    this.step = 0;
  },

  calcAlt: function(alt, cur_altitude) {
    let dalt = alt - cur_altitude;
    if (this.min_dalt > dalt) this.min_dalt = dalt;
    if (this.max_dalt < dalt) this.max_dalt = dalt;
    return this.max_dalt - this.min_dalt;
  }
};

var qalt = 9999; /* global, altitude quality */

let gps_display = {
  updateGps: function() {
    let lat = "lat ", alt = "?", speed = "speed ", hdop = "?",
        adelta = "adelta ", tdelta = "tdelta ";

    fix = gps.getGPSFix();
    if (adj_time) {
      print("Adjusting time");
      setTime(fix.time.getTime()/1000);
      adj_time = 0;
    }
    if (adj_alt) {
      print("Adjust altitude");
      gps_display.adjustAltitude();
    }

    gps_display.updateAltitude();
    gps_display.displayData(lat, alt, speed, hdop, adelta, tdelta);

    setTimeout(gps_display.updateGps, 1000);
  },

  adjustAltitude: function() {
    if (qalt < 5) {
      let rest_altitude = fix.alt;
      let alt_adjust = cur_altitude - rest_altitude;
      let abs = Math.abs(alt_adjust);
      print("adj", alt_adjust);
      let o = Bangle.getOptions();
      if (abs > 10 && abs < 150) {
        let a = 0.01;
        if (cur_altitude > rest_altitude) a = -a;
        o.seaLevelPressure = o.seaLevelPressure + a;
        Bangle.setOptions(o);
      }
      print(o.seaLevelPressure.toFixed(1) + "hPa");
    }
  },

  updateAltitude: function() {
    try {
      Bangle.getPressure().then((x) => {
        cur_altitude = x.altitude;
      }, print);
    } catch (e) {}
  },

  displayData: function(lat, alt, speed, hdop, adelta, tdelta) {
    if (fix && fix.time) {
      tdelta = "" + (getTime() - fix.time.getTime()/1000).toFixed(0);
    }
    if (fix && fix.fix && fix.lat) {
      lat = "" + fmt.fmtPos(fix);
      alt = "" + fix.alt.toFixed(0);
      adelta = "" + (cur_altitude - fix.alt).toFixed(0);
      speed = "" + fix.speed.toFixed(1);
      hdop = "" + fix.hdop.toFixed(0);
    } else {
      lat = "NO FIX\n" + (getTime() - gps.gps_start).toFixed(0) + "s " 
            + sky.sats_used + "/" + sky.snum;
      if (cur_altitude) adelta = "" + cur_altitude.toFixed(0);
    }

    let ddalt = gps_quality.calcAlt(alt, cur_altitude);
    let msg = this.formatDisplayMessage(lat, alt, speed, hdop, adelta, ddalt, tdelta);

    if (ui.display > 0) {
      g.reset().setFont("Vector", 31)
        .setColor(1,1,1).fillRect(0, ui.wi, ui.w, ui.y2)
        .setColor(0,0,0).drawString(msg, 3, 25);
    }
    if (debug > 0) print(fix);
  },

  formatDisplayMessage: function(lat, alt, speed, hdop, adelta, ddalt, tdelta) {
    let msg = "";
    if (ui.display == 1) {
      msg = lat + "\ne" + hdop + "m " + tdelta + "s\n" + 
            speed + "km/h\n" + alt + "m+" + adelta + "\nmsghere";
    } else if (ui.display == 2) {
      msg = speed + "km/h\n" + "e" + hdop + "m" + "\ndd " +
            qalt.toFixed(0) + "\n(" + gps_quality.step + "/" + 
            ddalt.toFixed(0) + ")" + "\n" + alt + "m+" + adelta;
    }
    gps_quality.step++;
    if (gps_quality.step == 10) {
      qalt = gps_quality.max_dalt - gps_quality.min_dalt;
      gps_quality.resetAlt();
    }
    return msg;
  }
};

/* sky library v0.0.1 */
let sky = {
  sats: [],
  snum: 0,
  sats_used: 0,

  drawGrid: function() {
    g.setColor(0,0,0);
    this.radLine(0, 1, 0.5, 1);
    this.radLine(0.25, 1, 0.75, 1);
    this.radCircle(0.5);
    this.radCircle(1.0);
  },

  radLine: function(a1, d1, a2, d2) {
    g.drawLine(radX(a1, d1), radY(a1, d1), radX(a2, d2), radY(a2, d2));
  },

  radCircle: function(d) {
    /* FIXME: .. should do real circle */
    g.drawCircle(radX(0, 0), radY(0, 0), radD(d));
    if (1)
      return;
    let step = 0.05;
    for (let i = 0; i < 1; i += 0.05) {
      this.radLine(i - step, d, i, d);
    }
  },

  drawSat: function(s) {
    let a = s.azi / 360;
    let e = ((90 - s.ele) / 90);
    let x = radX(a, e);
    let y = radY(a, e);

    g.setColor(s.snr === "" ? 1 : 0, s.snr === "" ? 0.25 : 0, s.snr === "" ? 0.25 : 0);
    g.drawString(s.id, x, y);
  },

  // Should correspond to view from below.
  // https://in-the-sky.org//satmap_radar.php?year=2023&month=10&day=24&skin=1
  drawSats: function(sats) {
    g.reset()
      .setColor(1, 1, 1)
      .fillRect(0, ui.wi, ui.w, ui.y2)
      .setFont("Vector", 20)
      .setFontAlign(0, 0);
    this.drawGrid();
    sats.forEach(s => this.drawSat(s));

    if (fix && fix.fix && fix.lat) {
      g.setColor(0, 0, 0)
       .setFontAlign(-1, 1);
      g.drawString(fix.satellites + "/" + fix.hdop, 5, ui.y2);
    }
  },
  parseRaw: function(msg, lost) {
    if (ui.display != 0)
      return;
    if (lost) print("## data lost");
    let s = msg.split(",");
    if (s[0] !== "$GPGSV") return;

    if (s[2] === "1") {
      this.snum = 0;
      this.sats = [];
      this.sats_used = 0;
    }

    let view = 1 * s[3];
    let k = Math.min(4, view - this.snum);
    for (let i = 4, j = 0; j < k; j++) {
      let sat = { id: s[i++], ele: 1 * s[i++], azi: 1 * s[i++], snr: s[i++] };
      if (sat.snr !== "") this.sats_used++;
      this.sats[this.snum++] = sat;
    }

    if (s[1] === s[2]) sky.drawSats(this.sats);
  }
};

function markGps() {
  gps.start_gps();
  Bangle.on('GPS-raw', sky.parseRaw);
  gps_display.updateGps();
}

ui.init();
ui.numScreens = 3;
gps.init();
gps_quality.resetAlt();
fmt.init();

ui.topLeft = () => { ui.drawMsg("Clock\nadjust"); adj_time = 1; };
ui.topRight = () => { ui.drawMsg("Alt\nadjust"); adj_alt = 1; };

Bangle.on("drag", (b) => ui.touchHandler(b));
Bangle.setUI({
  mode : "custom",
  clock : 0
});

Bangle.loadWidgets();
Bangle.drawWidgets();
markGps();
