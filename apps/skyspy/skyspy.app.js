 /* Sky spy */

let libgps = {
  emulator: -1,
  init: function(x) {
    this.emulator = (process.env.BOARD=="EMSCRIPTEN" 
                     || process.env.BOARD=="EMSCRIPTEN2")?1:0;
  },
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
  }
};

var display = 0;
var debug = 0;
var cancel_gps, gps_start;
var cur_altitude;
var wi = 24;
var h = 176-wi, w = 176;
var fix;
var adj_time = 0;

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
  let have = false, lat = "lat ", lon = "lon ", alt = "?",
      speed = "speed ", hdop = "?", adelta = "adelta ",
      tdelta = "tdelta ";

  if (cancel_gps)
    return;
  fix = libgps.getGPSFix();
  if (adj_time) {
    print("Adjusting time");
    setTime(fix.time.getTime()/1000);
    drawMsg("Time\nadjusted");
    adj_time = 0;
  }

  try {
    Bangle.getPressure().then((x) => {
      cur_altitude = x.altitude;
    }, print);
  } catch (e) {
    //print("Altimeter error", e);
  }


  //print(fix);
  if (fix && fix.time) {
    tdelta = "" + (getTime() - fix.time.getTime()/1000).toFixed(0);
  }
  if (fix && fix.fix && fix.lat) {
    lat = "" + libgps.format(fix.lat);
    lon = "" + libgps.format(fix.lon);
    alt = "" + fix.alt.toFixed(0);
    adelta = "" + (cur_altitude - fix.alt).toFixed(0);
    speed = "" + fix.speed.toFixed(1);
    hdop = "" + fix.hdop.toFixed(0);
    have = true;
  } else {
    lat = "NO FIX ";
    lon = "" + (getTime() - gps_start).toFixed(0) + "s " 
          + sats_used + "/" + snum;
    if (cur_altitude)
      adelta = "" + cur_altitude.toFixed(0);
  }

  let ddalt = calcAlt(alt, cur_altitude);
  let msg = "";
  if (display == 1) {
    msg = lat + "\n" + lon + 
         "\ne" + hdop + "m "+tdelta+"s\n" + 
         speed + "km/h\n"+ alt + "m+" + adelta + "\nmsghere";
  }
  if (display == 2) {
    msg = speed + "km/h\n" +
      "e"+hdop + "m/"+step
      +"\ndd "+qalt.toFixed(0) + "\n(" + ddalt.toFixed(0) + ")" +
      "\n"+alt + "m+" + adelta;
    step++;
    if (step == 10) {
      qalt = max_dalt - min_dalt;
      resetAlt();
    }
  }
  if (display > 0) {
    g.reset().setFont("Vector", 31)
    .setColor(1,1,1)
    .fillRect(0, wi, 176, 176)
    .setColor(0,0,0)
    .drawString(msg, 3, 25);
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
var sats_used = 0;

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
    sats_used = 0;
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
    if (sat.snr != "")
      sats_used++;
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
function drawMsg(msg) {
  g.reset().setFont("Vector", 35)
    .setColor(1,1,1)
    .fillRect(0, wi, 176, 176)
    .setColor(0,0,0)
    .drawString(msg, 5, 30);
}
function drawBusy() {
  drawMsg("\n.oO busy");
}

function nextScreen() {
    display = display + 1;
  if (display == 3)
    display = 0;
  drawBusy();

}

function onSwipe(dir) {
  nextScreen();
}

var last_b = 0;
function touchHandler(d) {
  let x = Math.floor(d.x);
  let y = Math.floor(d.y);
  
  if (d.b != 1 || last_b != 0) {
    last_b = d.b;
    return;
  }
  last_b = d.b;

  if ((x<h/2) && (y<w/2))
    adj_time = 1;

  if ((x>h/2) && (y>w/2))
    nextScreen();
}

libgps.init();

Bangle.on("drag", touchHandler);
Bangle.setUI({
  mode : "custom",
  swipe : onSwipe,
  clock : 0
});

Bangle.loadWidgets();
Bangle.drawWidgets();
drawBusy();
markGps();
