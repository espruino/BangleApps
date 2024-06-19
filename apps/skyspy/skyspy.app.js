/* Sky spy */

let libgps = {
  state: {},
  /* 0 .. DD.ddddd
     1 .. DD MM.mmm'
     2 .. DD MM'ss"
   */
  mode: 1,
  format: function(x) {
    switch (this.mode) {
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
    if (0) Bangle.getGPSFix();
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
  }
};

var display = 0;

var debug = 0;

var cancel_gps, gps_start;
var cur_altitude;

var wi = 24;
var h = 176-wi, w = 176;

var fix;

function radA(p) { return p*(Math.PI*2); }
function radD(d) { return d*(h/2); }
function radX(p, d) {
  let a = radA(p);
  return w/2 + Math.sin(a)*radD(d);
}
function radY(p, d) {
  let a = radA(p);
  return h/2 - Math.cos(a)*radD(d) + wi;
}

var qalt = -1;
function resetAlt() {
  min_dalt = 9999; max_dalt = -9999; step = 0;
}
resetAlt();

function calcAlt(alt, cur_altitude) {
    let dalt = alt - cur_altitude;

    if (min_dalt > dalt)
      min_dalt = dalt;
    if (max_dalt < dalt)
      max_dalt = dalt;

    let ddalt = max_dalt - min_dalt;
    return ddalt;
}
function updateGps() {
  let /*have = false,*/ lat = "lat", lon = "lon", alt = "alt",
      speed = "speed", hdop = "hdop"; // balt = "balt";

  if (cancel_gps)
    return;
  fix = libgps.getGPSFix();

  try {
    Bangle.getPressure().then((x) => {
      cur_altitude = x.altitude;
    }, print);
  } catch (e) {
    print("Altimeter error", e);
  }

  speed = getTime() - gps_start;

  print(fix);
  if (fix && fix.fix && fix.lat) {
    lat = "" + libgps.format(fix.lat);
    lon = "" + libgps.format(fix.lon);
    alt = "" + fix.alt.toFixed(1);
    speed = "" + fix.speed.toFixed(1);
    hdop = "" + fix.hdop.toFixed(1);
    //have = true;
  }

  let ddalt = calcAlt(alt, cur_altitude);
  if (display == 1)
    g.reset().setFont("Vector", 20)
    .setColor(1,1,1)
    .fillRect(0, wi, 176, 176)
    .setColor(0,0,0)
    .drawString("Acquiring GPS", 0, 30)
    .drawString(lat, 0, 50)
    .drawString(lon, 0, 70)
    .drawString("alt "+alt, 0, 90)
    .drawString("speed "+speed, 0, 110)
    .drawString("hdop "+hdop, 0, 130)
    .drawString("balt" + cur_altitude, 0, 150);

  if (display == 2) {
    g.reset().setFont("Vector", 20)
    .setColor(1,1,1)
    .fillRect(0, wi, 176, 176)
    .setColor(0,0,0)
    .drawString("GPS status", 0, 30)
    .drawString("speed "+speed, 0, 50)
    .drawString("hdop "+hdop, 0, 70)
    .drawString("dd "+qalt.toFixed(0) + " (" + ddalt.toFixed(0) + ")", 0, 90)
    .drawString("alt "+alt, 0, 110)
    .drawString("balt " + cur_altitude, 0, 130)
    .drawString(step, 0, 150);
    step++;
    if (step == 10) {
      qalt = max_dalt - min_dalt;
      resetAlt();
    }
  }

  if (debug > 0)
    print(fix);
  setTimeout(updateGps, 1000);
}

function radLine(a1, d1, a2, d2) {
  g.drawLine(radX(a1, d1), radY(a1, d1), radX(a2, d2), radY(a2, d2));
}
function radCircle(d) {
  let step = 0.05;
  for (let i=0; i<1; i+=0.05) {
    radLine(i-step, d, i, d);
  }
  //g.flip();
}
function drawGrid() {
  g.setColor(0,0,0);
  radLine(0, 1, 0.5, 1);
  radLine(0.25, 1, 0.75, 1);
  radCircle(0.5);
  radCircle(1.0);
}
function drawSat(s) {
  let a = s.azi / 360;
  let e = ((90 - s.ele) / 90);
  let x = radX(a, e);
  let y = radY(a, e);

  if (s.snr == "")
    g.setColor(1, 0.25, 0.25);
  else {
    //let snr = 1*s.snr;
    g.setColor(0, 0, 0);
    //sats_receiving ++;
  }
  g.drawString(s.id, x, y);

}

// Should correspond to view from below.
// https://in-the-sky.org//satmap_radar.php?year=2023&month=10&day=24&skin=1
function drawSats(sats) {
  //sats_receiving = 0;
  g.reset().setFont("Vector", 20)
    .setColor(1,1,1)
    .fillRect(0, 30, 176, 176);

  drawGrid();
  for (var s of sats) {
    if (debug > 1)
      print(s.ele, s.azi, s.snr);
    drawSat(s);
  }
  if (fix && fix.fix && fix.lat) {
    g.setColor(0, 0, 0);
    g.drawString(fix.satellites + "/" + fix.hdop, 10, 150);
  }
}

var sats = [];
var snum = 0;
//var sats_receiving = 0;

function parseRaw(msg, lost) {
  if (lost)
    print("## data lost");
  let s = msg.split(",");
  if (s[0] != "$GPGSV")
    return;
  //print("Message", s[2], s[1]);
  if (debug > 0)
    print(msg);

  if (s[2] == "1") {
    snum = 0;
    sats = [];
  }

  let view = 1 * s[3];

  // s[3] -- sats in view.
  // id, ele, azi, snr
  if (debug > 0)
    print("in view:", view);
  let i = 4;
  let k = 4;
  if (view - snum < k)
    k = view - snum;
  for (let j=0; j<k; j++) {
    let sat = {};
    sat.id = s[i++];
    sat.ele = 1*s[i++];
    sat.azi = 1*s[i++];
    sat.snr = s[i++];
    if (debug > 0)
      print("  ", sat);
    sats[snum++] = sat;
  }
  if (debug > 1)
    print("Checksum:", s[i]);
  if (s[1] == s[2]) {
    print("Complete...");
    //print(sats);
    if (display == 0)
      drawSats(sats);
  }
}

function stopGps() {
  cancel_gps=true;
  Bangle.setGPSPower(0, "skyspy");
}

function markGps() {
  cancel_gps = false;
  Bangle.setGPSPower(1, "skyspy");
  Bangle.on('GPS-raw', parseRaw);
  gps_start = getTime();
  updateGps();
}

function drawBusy() {
  g.reset().setFont("Vector", 20)
    .setColor(1,1,1)
    .fillRect(0, wi, 176, 176)
    .setColor(0,0,0)
    .drawString(".oO busy", 0, 30);

}

function onSwipe(dir) {
  display = display + 1;
  if (display == 3)
    display = 0;
  drawBusy();
}

Bangle.setUI({
  mode : "custom",
  swipe : onSwipe,
  clock : 0
});
Bangle.loadWidgets();
Bangle.drawWidgets();
drawBusy();
markGps();
