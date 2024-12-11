/* Space race */

/* 

Performance Assessment of GNSS Signals in
terms of Time to First Fix for
Cold, Warm and Hot Start
Matteo Paonni, Marco Anghileri, Stefan Wallner, José-Ángel Ávila-Rodríguez, Bernd Eissfeller
Institute of Geodesy and Navigation, University FAF Munich, Germany

=> 22 to 26 dB -- long time / no fix / ...
=> 26db + -- basically strength no longer matters

apps/assistedgps/custom.html

https://github.com/espruino/EspruinoDocs/blob/master/info/Bangle.js2%20Technical.md#gps

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

let fix = {}; /* Global for sky library */

/* sky library v0.1.0 */
let sky = {
  sats: [],
  snum: 0,
  sats_used: 0,
  sky_start: -1,
  this_usable: 0,

  drawGrid: function() {
    g.setColor(0,0,0);
    ui.radLine(0, 1, 0.5, 1);
    ui.radLine(0.25, 1, 0.75, 1);
    ui.radCircle(0.5);
    ui.radCircle(1.0);
  },

  snrLim: 28,
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
      if (sat.snr === "")
        sat.snr = 0;
      if (sat.snr >= this.snrLim) {
        this.sats_used++;
        print(sat.id, sat.snr);
      }
      this.sats[this.snum++] = sat;
    }
  },

  old_msg: {},
  msg: {},
  tof: function(v) { let i = (1*v); return i.toFixed(0); },
  fmtSys: function(sys) {
    if (sys && sys.sent !== undefined && sys.d23 !== undefined)
      return sys.sent + "." + sys.d23 + "D "+ this.tof(sys.pdop) + " " + this.tof(sys.vdop) + "\n";
    else
      return "(no data)\n";
  },
  display: function() {
    if (ui.display != 1)
      return;
    let m = this.old_msg;
    let msg = "" + this.tof(m.time) + "\n" + 
        "q" + m.quality + " " + m.in_view + " " + m.hdop + "\n" +
        "gp"+ this.fmtSys(m.gp) +
        "bd" + this.fmtSys(m.bd)  +
        "gl" + this.fmtSys(m.gl);
    if (this.msg.finished != 1)
      msg += "!";
    g.reset().clear().setFont("Vector", 30)
      .setColor(0, 0, 0)
      .setFontAlign(-1, -1)
      .drawString(msg, 0, 0);
  },
  parseRaw: function(msg, lost) {
    if (lost) print("## data lost");
    let s = msg.split(",");
    let cmd = s[0].slice(3);
    //print("cmd", cmd);
    if (cmd === "GGA") {
      this.old_msg = this.msg;
      this.msg = {};
      this.msg.time = s[1];
      this.msg.quality = s[6];
      this.msg.in_view = s[7];
      this.msg.hdop = s[8];
      this.msg.gp = {};
      this.msg.bd = {};
      this.msg.gl = {};
      print("-----------------------------------------------");
      print("GGA Time", s[1], "fix quality", s[4], "sats in view ", s[5]);
      this.drawSats(this.sats);
      if (this.sats_used < 5)
        this.sky_start = getTime();
      this.snum = 0;
      this.sats = [];
      this.sats_used = 0;
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
      /* FIXME -- should really add to the sentence */
      if (sys == 1) { this.msg.gp = add; }
      else if (sys == 2) { this.msg.gl = add; }
      else if (sys == 4) { this.msg.bd = add; }
      else print("GSA Unknown system\n");
      
      print(msg);
      return;
    }
    if (s[0] === "$GPGSV") {
      print("Have gps sentences", s[1], "/", s[2]);
      this.parseSats(s);
      this.msg.gp.sent = ""+s[2];
      return;
    }
    if (s[0] === "$BDGSV") {
      print("Have baidu sentences", s[1], "/", s[2]);
      this.parseSats(s);
      this.msg.bd.sent = ""+s[2];
      return;
    }
    if (s[0] === "$GLGSV") {
      print("Have glonass sentences", s[1], "/", s[2]);
      this.parseSats(s);
      this.msg.gl.sent = ""+s[2];
      return;
    }
    if (cmd === "RMC") return; /* Repeat of position/speed/course */
    if (cmd === "VTG") return; /* Speeds in knots/kph */
    if (cmd === "ZDA") return; /* Time + timezone */
    if (cmd === "TXT") {
      this.msg.finished = 1;
      return; /* Misc text? antena open */    
    }

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
  Bangle.on('GPS-raw', function(a, b) { sky.parseRaw(a, b); });
  setTimeout(function() {
    Bangle.removeAllListeners('GPS-raw');
  }, 1000000);
  setInterval(function() { sky.display(); }, 1000);
}

// CASIC_CMD("$PCAS06,0"); /* Query product information */
setTimeout(() => sky.casic_cmd("$PCAS04,7"), 1000); /* Enable gps + beidou + glonass */
setTimeout(() => sky.casic_cmd("$PCAS03,1,1,1,1,1,1,1,1"), 1000); /* Enable gps + beidou + glonass */

//setTimeout(() => sky.casic_cmd("$PCAS10,2"), 1200); /* 2: cold start, 1 warm start, 0: hot start */

ui.init();
ui.topLeft = () => sky.selectSpace();
Bangle.on("drag", (b) => ui.touchHandler(b));
start();
