/* -> space race ! */

/* 

apps/assistedgps/custom.html

https://github.com/espruino/EspruinoDocs/blob/master/info/Bangle.js2%20Technical.md#gps

gsa mi rika 2d/3d fix, a taky pdop/vdop/hdop

CFG-NAVX z CASIC_en -- umoznuje nastavit chodec / auto / letadlo

MON-VER -- vrati version stringy

CFG-PMS z gpssetup to zda se neumi?

2.11.5 CFG-RATE (0x06 0x04)
*/

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

let graw = {
  old_msg: {},
  msg: {},
  tof: function(v) { let i = (1*v); return i.toFixed(0); },
  fmtSys: function(sys) {
    return sys.sent + "." + sys.d23 + "D "+ this.tof(sys.pdop) + " " + this.tof(sys.vdop) + "\n";
  },
  display: function() {
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
  on_raw: function(msg, lost) {
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
      this.msg.gp.sent = ""+s[2];
      return;
    }
    if (s[0] === "$BDGSV") {
      print("Have baidu sentences", s[1], "/", s[2]);
      this.msg.bd.sent = ""+s[2];
      return;
    }
    if (s[0] === "$GLGSV") {
      print("Have glonass sentences", s[1], "/", s[2]);
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
    val = 7;
    if (this.sys)
      val = 1 << (this.sys - 1);
    this.casic_cmd("$PCAS04,"+val);
    ui.drawMsg("Sys "+val);
  }
};

function start() {
  Bangle.setGPSPower(1);
  Bangle.on('GPS-raw', function(a, b) { graw.on_raw(a, b); });
  setTimeout(function() {
    Bangle.removeAllListeners('GPS-raw');
  }, 1000000);
  setInterval(function() { graw.display(); }, 1000);
}

// CASIC_CMD("$PCAS06,0"); /* Query product information */
setTimeout(() => graw.casic_cmd("$PCAS04,7"), 1000); /* Enable gps + beidou + glonass */
//setTimeout(() => graw.casic_cmd("$PCAS10,2"), 1200); /* 2: cold start, 1 warm start, 0: hot start */

ui.init();
ui.topLeft = () => graw.selectSpace();
Bangle.on("drag", (b) => ui.touchHandler(b));
start();
