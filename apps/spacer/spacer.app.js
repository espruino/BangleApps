/* Space race */

/*
gsa mi rika 2d/3d fix, a taky pdop/vdop/hdop

CFG-NAVX z CASIC_en -- umoznuje nastavit chodec / auto / letadlo

MON-VER -- vrati version stringy

CFG-PMS z gpssetup to zda se neumi?

2.11.5 CFG-RATE (0x06 0x04)
*/

/* ui library 0.1.4 */
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

/* sky library v0.2.3
   needs ui */

let fix = {}; /* Global for sky library */

let skys = {
  sats: [],
  snum: 0,
  sats_used: 0,
  sky_start: -1,

  reset: function() {
    this.snum = 0;
    this.sats = [];
    this.sats_used = 0;
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
    if (this.sats_used < 5)
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
  split: 1,

  init: function () {
    if (this.split) {
      this.s_gp = deepCopy(skys);
      this.s_gl = deepCopy(skys);
      this.s_bd = deepCopy(skys);
    }
  },

  drawGrid: function() {
    g.setColor(0,0,0);
    ui.radLine(0, 1, 0.5, 1);
    ui.radLine(0.25, 1, 0.75, 1);
    ui.radCircle(0.5);
    ui.radCircle(1.0);
  },

  /* 18.. don't get reliable fix in 40s */
  snrLim: 22,
  drawSat: function(s) {
    let a = s.azi / 360;
    let e = ((90 - s.ele) / 90);
    let x = ui.radX(a, e);
    let y = ui.radY(a, e);

    if (s.snr == 0)
      g.setColor(1, 0.25, 0.25);
    else if (s.snr < this.snrLim)
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
      .setColor(0, 0, 0)
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

function start() {
  Bangle.setGPSPower(1);
  Bangle.on('GPS-raw', (a, b) => sky.parseRaw(a, b));
  setTimeout(function() {
    Bangle.removeAllListeners('GPS-raw');
  }, 1000000);
}

function onMessage() {
  /* quality.updateGps(); /* FIXME -- for skyspy
  if (ui.display == 4)
  sky.drawEstimates();
  */
  if (ui.display == 0)
    sky.drawSats(sky.all.sats);
  if (ui.display == 1)
    sky.drawRace();
}

// CASIC_CMD("$PCAS06,0"); /* Query product information */
setTimeout(() => sky.casic_cmd("$PCAS04,7"), 1000); /* Enable gps + beidou + glonass */
setTimeout(() => sky.casic_cmd("$PCAS03,1,1,1,1,1,1,1,1"), 1500); /* Enable all messages */

//setTimeout(() => sky.casic_cmd("$PCAS10,2"), 1200); /* 2: cold start, 1 warm start, 0: hot start */

ui.init();
ui.topLeft = () => sky.selectSpace();
Bangle.on("drag", (b) => ui.touchHandler(b));
sky.onMessageEnd = onMessage;
sky.init();
start();
