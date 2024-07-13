/* Sky spy */

/* fmt library v0.1 */
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
    fmtSteps: function(n) { return this.fmtDist(0.001 * 0.719 * n); },
    fmtAlt: function(m) { return m.toFixed(0) + this.icon_alt; },
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
        let s = c+this.fmtAngle(pos.lat) + "\n";
        c = "E";
        if (x<0) {
            c = "W";
            x = -x;
        }
        return s + c + this.fmtAngle(pos.lon);
    },
};

/* gps library v0.1 */
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
var gps_start;
var cur_altitude;
var wi = 24;
var h = 176-wi, w = 176;
var fix;
var adj_time = 0, adj_alt = 0;

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

var qalt = -1, min_dalt, max_dalt, step;
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
  let lat = "lat ", alt = "?",
      speed = "speed ", hdop = "?", adelta = "adelta ",
      tdelta = "tdelta ";

  fix = gps.getGPSFix();
  if (adj_time) {
    print("Adjusting time");
    setTime(fix.time.getTime()/1000);
    adj_time = 0;
  }
  if (adj_alt) {
      print("Adjust altitude");
      if (qalt < 5) {
          let rest_altitude = fix.alt;
          let alt_adjust = cur_altitude - rest_altitude;
          let abs = Math.abs(alt_adjust);
          print("adj", alt_adjust);
          let o = Bangle.getOptions();
          if (abs > 10 && abs < 150) {
              let a = 0.01;
              // FIXME: draw is called often compared to alt reading
              if (cur_altitude > rest_altitude)
                  a = -a;
              o.seaLevelPressure = o.seaLevelPressure + a;
              Bangle.setOptions(o);
          }
          msg = o.seaLevelPressure.toFixed(1) + "hPa";
          print(msg);
      }
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
    lat = "" + fmt.fmtPos(fix);
    alt = "" + fix.alt.toFixed(0);
    adelta = "" + (cur_altitude - fix.alt).toFixed(0);
    speed = "" + fix.speed.toFixed(1);
    hdop = "" + fix.hdop.toFixed(0);
  } else {
    lat = "NO FIX\n"
       + "" + (getTime() - gps_start).toFixed(0) + "s " 
          + sats_used + "/" + snum;
    if (cur_altitude)
      adelta = "" + cur_altitude.toFixed(0);
  }

  let ddalt = calcAlt(alt, cur_altitude);
  let msg = "";
  if (display == 1) {
    msg = lat +
         "\ne" + hdop + "m "+tdelta+"s\n" + 
         speed + "km/h\n"+ alt + "m+" + adelta + "\nmsghere";
  }
  if (display == 2) {
    /* qalt is altitude quality estimate -- over ten seconds,
       computes differences between GPS and barometric altitude.
       The lower the better.
       
       ddalt is just a debugging -- same estimate, but without
       waiting 10 seconds, so will be always optimistic at start
       of the cycle */
    msg = speed + "km/h\n" +
      "e"+hdop + "m"
      +"\ndd "+qalt.toFixed(0) + "\n(" + step + "/" + ddalt.toFixed(0) + ")" +
      "\n"+alt + "m+" + adelta;
  }
    step++;
    if (step == 10) {
      qalt = max_dalt - min_dalt;
      resetAlt();
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

function markGps() {
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

var numScreens = 3;

function nextScreen() {
    display = display + 1;
    if (display == numScreens)
        display = 0;
    drawBusy();
}

function prevScreen() {
    display = display - 1;
    if (display < 0)
        display = numScreens - 1;
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

    if ((x<h/2) && (y<w/2)) {
        drawMsg("Clock\nadjust");
        adj_time = 1;
    }
    if ((x>h/2) && (y<w/2)) {
        drawMsg("Alt\nadjust");
        adj_alt = 1;
    }

    if ((x<h/2) && (y>w/2))
        prevScreen();
    if ((x>h/2) && (y>w/2))
        nextScreen();
}

gps.init();
fmt.init();

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
