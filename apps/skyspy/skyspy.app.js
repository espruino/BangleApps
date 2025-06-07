/* Sky spy */

/*
   Four phases of GPS acquision:

   search for sky -- not enough sattelites
   wait for signal -- have 5 sattelites with good SNR
     .. good snr is like 26, with maybe 24 time goes up twice, maybe 22 for three times, less than that and many times more
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

/* ui library 0.1.5, dirty, bad, revert! */
let ui = {
  display: 0,
  numScreens: 2,
  clear: function() {
    g.reset()
      .setColor(g.theme.bg)
      .fillRect(0, this.wi, this.w, this.y2)
      .setColor(g.theme.fg);
  },
  drawMsg: function(msg) {
    g.reset().setFont("Vector", 35)
      .setColor(g.theme.bg)
      .fillRect(0, this.wi, this.w, this.y2)
      .setColor(g.theme.fg)
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
  },
  /* radial angle -- convert 0..1 to 0..2pi */
  radA: function(p) { return p*(Math.PI*2); },
  /* radial distance -- convert 0..1 to something that fits on screen */
  radD: function(d) { return d*(ui.h/2); },

  /* given angle/distance, get X coordinate */
  radX: function(p, d) {
    let a = this.radA(p);
    return this.w/2 + Math.sin(a)*this.radD(d);
  },
  /* given angle/distance, get Y coordinate */
  radY: function(p, d) {
    let a = this.radA(p);
    return this.h/2 - Math.cos(a)*this.radD(d) + this.wi;
  },
  radLine: function(a1, d1, a2, d2) {
    g.drawLine(this.radX(a1, d1), this.radY(a1, d1), this.radX(a2, d2), this.radY(a2, d2));
  },
  radCircle: function(d) {
    g.drawCircle(this.radX(0, 0), this.radY(0, 0), this.radD(d));
    if (1)
      return;
    let step = 0.05;
    for (let i = 0; i < 1; i += 0.05) {
      this.radLine(i - step, d, i, d);
    }
  },
};

/* pie library v0.0.4 */
let pie = {
  radians: function(a) { return a*Math.PI/180; },

  // Function to draw a filled arc (pie slice)
  fillArc: function(g, centerX, centerY, radius, startAngle, endAngle) {
    const points = [];
    points.push(centerX, centerY); // Start at the center
    
    // Step through angles to create points on the arc
    for (let angle = startAngle; angle <= endAngle; angle += 15) {
      const x = centerX + Math.sin(this.radians(angle)) * radius;
      const y = centerY - Math.cos(this.radians(angle)) * radius;
      points.push(x, y);
    }
    
    // Add the final point at the end angle
    points.push(centerX + Math.sin(this.radians(endAngle)) * radius);
    points.push(centerY - Math.cos(this.radians(endAngle)) * radius);
    
    g.fillPoly(points); // Draw the arc as a polygon
  },

  // Function to draw the pie chart
  drawPieChart1: function(g, centerX, centerY, radius, data, colors) {
    let startAngle = data[0];
    
    // Loop through the data to draw each segment
    for (let i = 1; i < data.length; i++) {
      const angle = data[i];         // Get the angle for the current section
      const endAngle = angle; // Calculate the end angle
      
      g.setColor(colors[i]);  // Set the fill color
      this.fillArc(g, centerX, centerY, radius, startAngle, endAngle, colors[i]); // Draw the arc
      startAngle = angle; // Update the start angle for the next segment
    }
  },
};

let gpsg = {
  cx: ui.w/2,
  cy: ui.wi+ui.h/2,
  s: ui.h/2 - 1,
  sats: 4,  /* Number of sats with good enough snr */
  sats_bad: 0, /* Sattelites visible but with low snr */
  view_t: getTime(), /* When sky became visible */
  start_t: getTime(), /* When we started acquiring fix */
  dalt: 30, /* Altitude error between barometer and gps */
  fix: {},
  
  init : function() {
  },
  drawCorner(h, v) {
    let cx = this.cx;
    let cy = this.cy;
    let s = this.s;
    let st = 48;
    let a = [cx+h*s, cy+v*s, cx+h*s - h*st, cy+v*s, cx+h*s, cy+v*s - v*st];
    g.fillPoly(a);
  },
  clamp: function(low, v, high) {
    if (v < low)
      v = low;
    if (v > high)
      v = high;
    return [ low, v, high ];
  },
  draw : function() {
    let cx = this.cx;
    let cy = this.cy;
    let s = this.s;
    ui.clear();
    g.fillCircle(cx, cy, s);
    if (!this.fix.fix)
      this.drawCorner(1, -1);
    if (this.fix.hdop > 10)
      this.drawCorner(1, 1);
    if (this.fix.satellites < 4)
      this.drawCorner(-1, 1);
    if (this.sats < 4)
      this.drawCorner(-1, -1);
    
    g.setColor(1, 1, 1);
    let t = getTime();
    if (this.fix.fix) { /* Have speed */
      let data = this.clamp(210, 210 + (360*this.fix.speed) / 20, 210+360);
      let colors = [ "ign", "#000", "#fff" ];
      pie.drawPieChart1(g, cx, cy, s * 1, data, colors);
    } else {
      let data = this.clamp(0, (360*(t - this.start_t)) / 600, 360);
      let colors = [ "ign", "#888", "#000" ];
      pie.drawPieChart1(g, cx, cy, s * 1, data, colors);
    }
    if (this.fix.fix) {
      let data = this.clamp(90, 90 + (360*this.dalt) / 200, 90+360);
      let colors = [ "ign", "#000", "#fff" ];
      pie.drawPieChart1(g, cx, cy, s * 0.6, data, colors);
    } else { /* Still waiting for fix */
      let data = this.clamp(0, (360*(t - this.view_t)) / 120, 360);
      let colors = [ "ign", "#888", "#000" ];
      pie.drawPieChart1(g, cx, cy, s * 0.6, data, colors);
    }
    if (this.fix.fix) {
      let slice = 360 / 8;   
      let sats = this.fix.satellites;
      let data = this.clamp( 0, slice * sats, 360 );
      let colors = [ "ign", "#fff", "#000" ];
      pie.drawPieChart1(g, cx, cy, s * 0.3, data, colors);
    } else {
      let slice = 360 / 8;   
      let sats = this.sats;
      let red = sats + this.sats_bad;
      if (sats > 8)
        sats = 8;
      if (red > 8)
        red = 8;      
      let data = [ 0, slice * sats, slice * red, 360 ];
      let colors = [ "ign", "#888", "#800", "#000" ];
      pie.drawPieChart1(g, cx, cy, s * 0.3, data, colors);
    }
  },
};

var debug = 0;
var cur_altitude;
var adj_time = 0, adj_alt = 0;

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

    if (msg != "") {
      g.reset().setFont("Vector", 31)
        .setColor(g.theme.bg).fillRect(0, ui.wi, ui.w, ui.y2)
        .setColor(g.theme.fb).drawString(msg, 3, 25);
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
    } else if (ui.display == 3) {
      let t = getTime();
      //print(t, this.fix_start);
      msg = "St: " + fmt.fmtTimeDiff(t-gps.gps_start) + "\n";
      msg += "Sky: " + fmt.fmtTimeDiff(t-skys.sky_start) + "\n";
      msg += "2D: " + fmt.fmtTimeDiff(t-quality.fix_start) + "\n";
      msg += "3D: " + fmt.fmtTimeDiff(t-quality.f3d_start) + "\n";
    } else if (ui.display == 5) {
      gpsg.start_t = gps.gps_start;
      gpsg.view_t = skys.sky_start;
      gpsg.sats = skys.sats_used;
      gpsg.sats_bad = skys.sats_weak;
      gpsg.fix = fix;
      gpsg.dalt = Math.abs(adelta);
      gpsg.draw();
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

/* sky library v0.2.3
   needs ui */

let fix = {}; /* Global for sky library */

let skys = {
  sats: [],
  snum: 0,
  sats_used: 0,
  sats_weak: 0,
  sky_start: -1,
  /* 18.. don't get reliable fix in 40s */
  /* 25.. seems to be good limit for clear sky. ~60 seconds.
     .. maybe better 26? */
  snrLim: 25,

  reset: function() {
    this.snum = 0;
    this.sats = [];
    this.sats_used = 0;
    this.sats_weak = 0;
  },
  parseSats: function(s) {
    let view = 1 * s[3];
    let k = Math.min(4, view - this.snum);
    for (let i = 4, j = 0; j < k; j++) {
      let sat = { id: s[i++], ele: 1 * s[i++], azi: 1 * s[i++], snr: s[i++] };
      if (sat.snr === "")
        sat.snr = 0;
      if (sat.snr >= this.snrLim) {
        this.sats_used++;
        print(sat.id, sat.snr);
      }
      if (sat.snr > 0) {
        this.sats_weak++;
      }
      this.sats[this.snum++] = sat;
    }
  },

  snrSort: function() {
    return this.sats.slice(0, this.snum).sort((a, b) => b.snr - a.snr);
  },
  getSatSNR: function(n) { /* Get n-th strongest sat */
    if (n <= 0 || n > this.sats.length)
      return -1;

    // Sort the satellites by snr in descending order
    let sortedSats = this.snrSort();

    // Return the SNR of the n-th strongest satellite
    return sortedSats[n - 1].snr;
  },
  qualest: function() {
    // Sort the satellites by snr in descending order
    let sortedSats = this.snrSort();
    if (sortedSats[4] && sortedSats[4].snr) {
      return "" + sortedSats[4].snr + "dB";
    }
    for (let i=4; i>=0; i--) {
      if (sortedSats[i] && sortedSats[i].snr)
        return "S" + (i+1);
    }
    return "U" + this.snum;
  },
  satVisibility: [],
  trackSatelliteVisibility: function() {
    const threshold = this.snrLim; // SNR threshold
    const now = getTime();
    let newVisibility = [];
    //this.satVisibility = [];
    for (let i = 0; i < this.snum; i++) {
      let sat = this.sats[i];
      let existingSat = this.satVisibility[sat.id];
      if (sat.snr >= threshold) {
        if (!existingSat) {
          // New satellite starts visibility
          newVisibility[sat.id] = { start: now, visible: true };
        } else
          newVisibility[sat.id] = this.satVisibility[sat.id];
      }
    }
    this.satVisibility = newVisibility;
  },
  getnthLowestStartTimeSat: function(n) {
    // Collect all satellites from visibility
    let satellites = Object.values(this.satVisibility);

    // Ensure we have at least 5 satellites
    if (satellites.length < n)
      return -1;

    // Sort satellites by start time in ascending order
    satellites.sort((a, b) => a.start - b.start);

    // Return the satellite with the 5th lowest start time
    return satellites[n-1]; // 0-based index, so 5th is index 4
  },
  goodest: function () {
    let s = this.getnthLowestStartTimeSat(5);
    if (s==-1)
      return "";
    let t = getTime() - s.start;
    return "" + t + "s";
  },
  summary: function () {
    let s = this.goodest();
    if (s != "")
      return s;
    return this.qualest();
  },
  onEnd: function () {
    this.trackSatelliteVisibility();
    if (this.sats_used < 4)
      this.sky_start = getTime();
    this.reset();
  },
};

function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj; // Return primitive values as-is
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy); // Handle arrays recursively
  }

  const copy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]); // Recursively copy properties
    }
  }
  return copy;
}

let sky = {
  this_usable: 0,
  debug: 0,
  all: skys,  /* Sattelites from all systems */
  split: 0,

  init: function () {
    if (this.split) {
      this.s_gp = deepCopy(skys);
      this.s_gl = deepCopy(skys);
      this.s_bd = deepCopy(skys);
    }
  },

  drawGrid: function() {
    g.setColor(g.theme.fg);
    ui.radLine(0, 1, 0.5, 1);
    ui.radLine(0.25, 1, 0.75, 1);
    ui.radCircle(0.5);
    ui.radCircle(1.0);
  },

  drawSat: function(s) {
    let a = s.azi / 360;
    let e = ((90 - s.ele) / 90);
    let x = ui.radX(a, e);
    let y = ui.radY(a, e);

    if (s.snr == 0)
      g.setColor(1, 0.25, 0.25);
    else if (s.snr < this.all.snrLim)
      g.setColor(0.25, 0.5, 0.25);
    else
      g.setColor(0, 0, 0);
    g.drawString(s.id, x, y);
  },

  // Should correspond to view from below.
  // https://in-the-sky.org//satmap_radar.php?year=2023&month=10&day=24&skin=1
  decorate: function() {},
  drawSats: function(sats) {
    g.reset()
      .setColor(g.theme.bg)
      .fillRect(0, ui.wi, ui.w, ui.y2)
      .setFont("Vector", 20)
      .setFontAlign(0, 0);
    this.drawGrid();
    sats.forEach(s => this.drawSat(s));

    if (fix && fix.fix && fix.lat) {
      g.setColor(g.theme.fg)
        .setFontAlign(-1, 1);
      g.drawString(fix.satellites + "/" + fix.hdop, 5, ui.y2);
    }
    this.decorate();
  },

  old_msg: {},
  msg: {},
  tof: function(v, n) { let i = (1*v); return i.toFixed(n); },
  tof0: function(v) { return this.tof(v, 0); },
  tof1: function(v) { return this.tof(v, 1); },
  fmtSys: function(sys, sats) {
    if (!sys.sent)
      return " off\n";
    let r = sys.sent + " ";
    // r+= sys.d23 + "D ";
    if (sats)
      //  r +=  sats.sats_used + "/" + sats.snum;
      r += sats.summary();
    return r + "\n";
  },
  drawRace: function() {
    let m = this.old_msg;
    let msg = "gmt" + this.tof0(m.time) + "\n" +
        "q" + m.quality + " S" + m.in_view + " h" + this.tof0(m.hdop) + "m\n" +
        /*        "v" + this.tof0(m.vdop) + "m " + "p" + this.tof0(m.pdop) + "m\n" +  */
        this.all.summary() + "\n" +
        "gp"+ this.fmtSys(m.gp, this.s_gp) +
        "bd" + this.fmtSys(m.bd, this.s_bd)  +
        "gl" + this.fmtSys(m.gl, this.s_gl);
    if (this.msg.finished != 1)
      msg += "!";
    g.reset().clear().setFont("Vector", 30)
      .setColor(g.theme.fg)
      .setFontAlign(-1, -1)
      .drawString(msg, 0, 0);
  },
  drawEstimates: function() {
    /*
       Performance Assessment of GNSS Signals in terms of Time to
       First Fix for Cold, Warm and Hot Start Matteo Paonni, Marco Anghileri,
       Stefan Wallner, José-Ángel Ávila-Rodríguez, Bernd Eissfeller Institute
       of Geodesy and Navigation, University FAF Munich, Germany

       => 22 to 26 dB -- long time / no fix / ...
       => 26db + -- basically strength no longer matters
    */
    let r = this.all.qualest();
    let r1 = this.all.goodest();
    print(r, r1, this.old_msg.hdop, this.old_msg.quality);
    ui.drawMsg(r + "\n" + r1 + "\n" + this.old_msg.hdop + "-" + this.old_msg.quality + "d\n" + (getTime() - this.all.sky_start));
  },
  onMessageEnd: function() {},
  messageEnd: function() {
    this.old_msg = this.msg;
    this.msg = {};
    this.msg.gp = {};
    this.msg.bd = {};
    this.msg.gl = {};
    this.onMessageEnd();
    //print(this.sats);
    this.all.onEnd();
    if (this.split) {
      this.s_gp.onEnd();
      this.s_gl.onEnd();
      this.s_bd.onEnd();
    }
  },
  parseRaw: function(msg, lost) {
    //print(msg);
    if (lost) print("## data lost");
    let s = msg.split(",");
    //    print(getTime(), s[0]);
    //return;
    let cmd = s[0].slice(3);
    //print("cmd", cmd);
    if (cmd === "RMC") {
      /* Repeat of position/speed/course */
      this.messageEnd();
      return;
    }
    if (cmd === "GGA") {
      this.msg.time = s[1];
      this.msg.quality = s[6];
      this.msg.in_view = s[7];
      this.msg.hdop = s[8];

      if (this.debug > 0) {
        print("-----------------------------------------------");
        print("GGA Time", s[1], "fix quality", s[4], "sats in view ", s[5]);
      }
      return;
    }
    if (cmd === "GLL") return; /* Position lat/lon */
    if (cmd === "GSA") {
      /*
        $GNGSA,A,1,,,,,,,,,,,,,25.5,25.5,25.5,4*04
        0      1 2             15   16   17   18
      */
      /* Satelites used, fix type! INTERESTING */
      let sys = s[18];
      let add = {};
      add.d23 = s[2];
      add.pdop = s[15];
      add.hdop = s[16];
      add.vdop = s[17];
      sys = sys[0];
      /* FIXME -- should really add to the sentence */
      if (sys == 1) { this.msg.gp = add; }
      else if (sys == 2) { this.msg.gl = add; }
      else if (sys == 4) { this.msg.bd = add; }
      else {
        print("GSA Unknown system -- ", sys, "\n");
        print(msg);
      }
      return;
    }
    if (s[0] === "$GPGSV") {
      if (this.debug > 0)
        print("Have gps sentences", s[1], "/", s[2]);
      this.all.parseSats(s);
      if (this.split)      
        this.s_gp.parseSats(s);
      this.msg.gp.sent = ""+s[2];
      return;
    }
    if (s[0] === "$BDGSV") {
      if (this.debug > 0)
        print("Have baidu sentences", s[1], "/", s[2]);
      this.all.parseSats(s);
      if (this.split)      
        this.s_bd.parseSats(s);
      this.msg.bd.sent = ""+s[2];
      return;
    }
    if (s[0] === "$GLGSV") {
      if (this.debug > 0)
        print("Have glonass sentences", s[1], "/", s[2]);
      this.all.parseSats(s);
      if (this.split)
        this.s_gl.parseSats(s);
      this.msg.gl.sent = ""+s[2];
      return;
    }
      
    if (cmd === "VTG") return; /* Speeds in knots/kph */
    if (cmd === "ZDA") return; /* Time + timezone */
    if (cmd === "TXT") return; /* Misc text? antena open */
    print(msg);
  },
  casic_cmd: function (cmd) {
    var cs = 0;
    for (var i=1;i<cmd.length;i++)
      cs = cs ^ cmd.charCodeAt(i);
    Serial1.println(cmd+"*"+cs.toString(16).toUpperCase().padStart(2, '0'));
  },
  sys: 3,
  selectSpace: function () {
    this.sys += 1;
    if (this.sys == 4)
      this.sys = 0;
    let val = 7;
    if (this.sys)
      val = 1 << (this.sys - 1);
    this.casic_cmd("$PCAS04,"+val);
    ui.drawMsg("Sys "+val);
  }
};

function markGps() {
  gps.start_gps();
  Bangle.on('GPS-raw', (msg, lost) => sky.parseRaw(msg, lost));
}

function onMessage() {
  quality.updateGps();
  if (ui.display == 4)
    sky.drawEstimates();
  
  if (ui.display == 0)
    sky.drawSats(sky.all.sats);
  /*
  if (ui.display == 1)
    sky.drawRace();
    */
}


ui.init();
ui.numScreens = 6;
/* 0.. sat drawing
   1.. position, basic data
   2.. fix quality esitmation
   3.. times from ...
   4.. time to fix experiment
   5.. gps graph
*/
gps.init();
quality.resetAlt();
fmt.init();
sky.onMessageEnd = onMessage;
sky.init();
gpsg.init();

sky.decorate = () => { 
  let p = 15;
  if (0)
    pie.twoPie(p, p+ui.wi, p, quality.dalt, qalt);
};
ui.topLeft = () => { ui.drawMsg("Clock\nadjust"); adj_time = 1; };
ui.topRight = () => { ui.drawMsg("Alt\nadjust"); adj_alt = 1; };

setTimeout(() => sky.casic_cmd("$PCAS04,7"), 1000); /* Enable gps + beidou + glonass */
setTimeout(() => sky.casic_cmd("$PCAS03,1,1,1,1,1,1,1,1"), 1000); 

Bangle.on("drag", (b) => ui.touchHandler(b));
Bangle.setUI({
  mode : "custom",
  clock : 0
});

Bangle.loadWidgets();
Bangle.drawWidgets();
markGps();
