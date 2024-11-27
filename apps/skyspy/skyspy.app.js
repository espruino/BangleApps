/* Sky spy */

/*
   Four phases of GPS acquision:

   search for sky -- not enough sattelites
   wait for signal -- have 5 sattelites with good SNR
   2D fix
   3D fix

   How to tell good signal
   # satelites
   hdop
   diff to barometer altitude
   variations in diff to barometer altitude

*/

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

/* gps library v0.1.4 (bad changes, revert!) */
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
  fix_start : -1,
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

function log2(x) {
  return Math.log(x) / Math.log(2);
}

/* pie library v0.0.1 */
pie = {
  radians: function(a) { return a*Math.PI/180; },

  // Function to draw a filled arc (pie slice)
  fillArc: function(g, centerX, centerY, radius, startAngle, endAngle) {
    const points = [];
    points.push(centerX, centerY); // Start at the center
    
    // Step through angles to create points on the arc
    for (let angle = startAngle; angle <= endAngle; angle += 5) {
      const x = centerX + Math.cos(this.radians(angle)) * radius;
      const y = centerY + Math.sin(this.radians(angle)) * radius;
      points.push(x, y);
    }
    
    // Add the final point at the end angle
    points.push(centerX + Math.cos(this.radians(endAngle)) * radius);
    points.push(centerY + Math.sin(this.radians(endAngle)) * radius);
    
    g.fillPoly(points); // Draw the arc as a polygon
  },

  // Function to draw the pie chart
  drawPieChart1: function(g, centerX, centerY, radius, data, colors) {
    let startAngle = 0;
    
    // Loop through the data to draw each segment
    for (let i = 0; i < data.length; i++) {
      const angle = data[i];         // Get the angle for the current section
      const endAngle = startAngle + angle; // Calculate the end angle
      
      g.setColor(colors[i]);  // Set the fill color
      this.fillArc(g, centerX, centerY, radius, startAngle, endAngle, colors[i]); // Draw the arc
      startAngle = endAngle; // Update the start angle for the next segment
    }

    g.flip(); // Update the screen
  },
  altDelta: function(centerX, centerY, radius, altitude, altChange) {
    // Altitude range and mapping to a logarithmic scale
    const altitudeMin = -1000, altitudeMax = 1000;
    const altitudeLog = log2(Math.abs(altitude) + 1) * Math.sign(altitude); // Logarithmic scaling
    const altitudeAngle = E.clip((altitudeLog - log2(1)) / (log2(1001) - log2(1)), -1, 1) * 180;

    // Altitude Change (linear scale)
    const altChangeMin = -30, altChangeMax = 30;
    const altChangeAngle = E.clip((altChange - altChangeMin) / (altChangeMax - altChangeMin), 0, 1) * 360;
    
    this.twoPie(centerX, centerY, radius, altitudeAngle, altChangeAngle);
  },
  
  twoPie: function(centerX, centerY, radius, altitudeAngle, altChangeAngle) {
    // Outer Ring (Altitude Change) - Draw a segment based on altitude change

    g.setColor(0, 0, 0.5); // Set a color for the outer ring
    this.fillArc(g,
                 centerX, centerY,
                 radius, // Define the thickness of the outer ring
                 0, altChangeAngle // Draw based on altitude change
                );
    
    // Inner Ring (Altitude) - Draw a segment based on altitude angle
    const innerRadius = radius * 0.6; // Inner ring size
    g.setColor(0, 0.5, 0); // Set a color for the inner ring
    this.fillArc(g,
                 centerX, centerY,
                 innerRadius, // Define thickness of inner ring
                 0, altitudeAngle // Draw based on altitude
                );

    // Draw the baseline circle for reference
    g.setColor(0, 0, 0); // Gray for baseline
    g.drawCircle(centerX, centerY, innerRadius); // Inner circle (reference)
    g.drawCircle(centerX, centerY, radius); // Outer circle (reference)

    // Render the chart
    g.flip();
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

let quality = {
  min_dalt: 9999,
  max_dalt: -9999,
  step: 0,
  dalt: 0,
  fix_start: -1,
  f3d_start: -1,

  resetAlt: function() {
    this.min_dalt = 9999;
    this.max_dalt = -9999;
    this.step = 0;
  },

  calcAlt: function(alt, cur_altitude) {
    let dalt = alt - cur_altitude;
    this.dalt = dalt;
    if (this.min_dalt > dalt) this.min_dalt = dalt;
    if (this.max_dalt < dalt) this.max_dalt = dalt;
    return this.max_dalt - this.min_dalt;
  },

  updateGps: function() {
    let lat = "lat ", alt = "?", speed = "speed ", hdop = "?",
        adelta = "adelta ", tdelta = "tdelta ";

    fix = gps.getGPSFix();
    if (!fix.fix || !fix.lat) {
      print("...no fix\n");
      quality.fix_start = getTime();
    }
    //print("fix: ", fix);
    //print("qalt: ", qalt);
    if (qalt < 0 || qalt > 10)
      quality.f3d_start = getTime();

    if (adj_time) {
      print("Adjusting time");
      setTime(fix.time.getTime()/1000);
      adj_time = 0;
    }
    if (adj_alt) {
      print("Adjust altitude");
      quality.adjustAltitude();
    }

    quality.updateAltitude();
    quality.displayData(lat, alt, speed, hdop, adelta, tdelta);

    setTimeout(quality.updateGps, 1000); // FIXME: this is likely a problem
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

    let ddalt = quality.calcAlt(alt, cur_altitude);
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
            qalt.toFixed(0) + "\n(" + quality.step + "/" + 
            ddalt.toFixed(0) + ")" + "\n" + alt + "m+" + adelta;
    } else {
      let t = getTime();
      //print(t, this.fix_start);
      msg = "St: " + fmt.fmtTimeDiff(t-gps.gps_start) + "\n";
      msg += "Sky: " + fmt.fmtTimeDiff(t-sky.sky_start) + "\n";
      msg += "2D: " + fmt.fmtTimeDiff(t-quality.fix_start) + "\n";
      msg += "3D: " + fmt.fmtTimeDiff(t-quality.f3d_start) + "\n";
    }
    quality.step++;
    if (quality.step == 10) {
      qalt = quality.max_dalt - quality.min_dalt;
      quality.resetAlt();
    }
    return msg;
  }
};

var qalt = 9999; /* global, altitude quality */

/* sky library v0.0.2 */
let sky = {
  sats: [],
  snum: 0,
  sats_used: 0,
  sky_start: -1,
  this_usable: 0,

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

    if (s.snr === "")
      g.setColor(1, 0.25, 0.25);  
    else
      g.setColor(0, 0, 0);
    g.drawString(s.id, x, y);
  },

  // Should correspond to view from below.
  // https://in-the-sky.org//satmap_radar.php?year=2023&month=10&day=24&skin=1
  decorate: function() {},
  drawSats: function(sats) {
    if (ui.display != 0)
      return;
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
    this.decorate();
  },
  parseSats: function(s) {
    let view = 1 * s[3];
    let k = Math.min(4, view - this.snum);
    for (let i = 4, j = 0; j < k; j++) {
      let sat = { id: s[i++], ele: 1 * s[i++], azi: 1 * s[i++], snr: s[i++] };
      if (sat.snr !== "") this.sats_used++;
      this.sats[this.snum++] = sat;
    }
  },
  parseRaw: function(msg, lost) {
    if (lost) print("## data lost");
    let s = msg.split(",");
    if (s[0] === "$GNGGA") {
      this.drawSats(this.sats);
      if (this.sats_used < 5)
        this.sky_start = getTime();
      this.snum = 0;
      this.sats = [];
      this.sats_used = 0;
      return;
    }
    if (s[0] === "$GPGSV") { this.parseSats(s); return; }
    if (s[0] === "$GLGSV") { this.parseSats(s); return; }
    if (s[0] === "$BDGSV") { this.parseSats(s); return; }
  }
};

function markGps() {
  gps.start_gps();
  Bangle.on('GPS-raw', (msg, lost) => sky.parseRaw(msg, lost));
  quality.updateGps();
}

ui.init();
ui.numScreens = 4;
gps.init();
quality.resetAlt();
fmt.init();

sky.decorate = () => { 
  let p = 15;
  return;
  pie.twoPie(p, p+ui.wi, p, quality.dalt, qalt);
};
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
