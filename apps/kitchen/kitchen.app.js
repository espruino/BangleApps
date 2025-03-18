// read in the faces
var FACES = [];
var STOR = require("Storage");
STOR.list(/\.kit\.js$/).forEach(face=>FACES.push(eval(require("Storage").read(face))));
var iface = STOR.list(/\.kit\.js$/).indexOf("stepo2.kit.js");
var face = FACES[iface]();
var firstPress
var pressTimer;

function stopdraw() {
  face.stopTimer();
}

function startdraw() {
  Bangle.drawWidgets();
  face.startTimer();
}

function nextFace(){
  stopdraw();
  face.freeResources();

  iface += 1
  iface = iface % FACES.length;
  face = FACES[iface]();

  g.clear();
  g.reset();
  face.init(gpsObj, swObj, hrmObj, tripObject);
  startdraw();
}

// when you feel the buzzer you know you have done a long press
function longPressCheck() {
  Bangle.buzz();
  debug_log("BUZZ, long press");
  if (pressTimer) {
    clearInterval(pressTimer);
    debug_log("CLEAR pressTimer 2");
    pressTimer = undefined;
  }
}

// start a timer and buzz when held long enough
function buttonPressed(btn) {
  if (btn === 3) {
    nextFace();
  } else {
    firstPress = getTime();
    if (pressTimer) {
      debug_log("CLEAR pressTimer 1");
      clearInterval(pressTimer);
    }
    debug_log("SET pressTimer 1");
    pressTimer = setInterval(longPressCheck, 1500);
  }
}

// if you release too soon there is no buzz as timer is cleared
function buttonReleased(btn) {
  var dur = getTime() - firstPress;
  if (pressTimer) {
    debug_log("CLEAR pressTimer 3");
    clearInterval(pressTimer);
    pressTimer = undefined;
  }

  if ( dur >= 1.5 ) {
    switch(btn) {
    case 1:
      face.onButtonLong(btn);
      break;
    case 2:
      face.onButtonLong(btn);
      //Bangle.showLauncher();
      break;
    case 3:
      // do nothing
      break;
    }
    return;
  }

  if (btn !== 3) face.onButtonShort(btn);
}

function setButtons(){
  setWatch(buttonPressed.bind(null,1), BTN1, {repeat:true,edge:"rising"});
  setWatch(buttonPressed.bind(null,2), BTN2, {repeat:true,edge:"rising"});
  setWatch(nextFace, BTN3, {repeat:true,edge:"rising"});

  setWatch(buttonReleased.bind(null,1), BTN1, {repeat:true,edge:"falling"});
  setWatch(buttonReleased.bind(null,2), BTN2, {repeat:true,edge:"falling"});
  // BTN 3 long press should always reset the bangle
}

Bangle.on('kill',()=>{
  Bangle.setCompassPower(0,'kitchen');
  Bangle.setGPSPower(0,'kitchen');
});

Bangle.on('lcdPower',function(on) {
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});

/*****************************************************************************

Start of GPS object code so we can share it between faces

******************************************************************************/


function log_debug(o) {
  //console.log(o);
}

function radians(a) {
  return a*Math.PI/180;
}

function degrees(a) {
  var d = a*180/Math.PI;
  return (d+360)%360;
}

function GPS() {
  this.wp;
  this.wp_index = 0;
  this.wp_current = undefined;
  this.GPS_OFF = 0;
  this.GPS_TIME = 1;
  this.GPS_SATS = 2;
  this.GPS_RUNNING = 3;
  this.gpsState = this.GPS_OFF;
  this.gpsPowerState = false;
  this.last_fix = {
    fix: 0,
    alt: 0,
    lat: 0,
    lon: 0,
    speed: 0,
    time: 0,
    satellites: 0
  };
  this.listenerCount = 0;
  this.loadFirstWaypoint();
}

GPS.prototype.log_debug = function(o) {
  //console.log(o);
};

GPS.prototype.getState = function() {
  return this.gpsState;
}

GPS.prototype.getLastFix = function() {
  return this.last_fix;
}

GPS.prototype.determineGPSState = function() {
  this.log_debug("determineGPSState");
  gpsPowerState = Bangle.isGPSOn();

  //this.log_debug("last_fix.fix " + this.last_fix.fix);
  //this.log_debug("gpsPowerState " + this.gpsPowerState);
  //this.log_debug("last_fix.satellites " + this.last_fix.satellites);

  if (!gpsPowerState) {
    this.gpsState = this.GPS_OFF;
    this.resetLastFix();
  } else if (this.last_fix.fix && this.gpsPowerState && this.last_fix.satellites > 0) {
    this.gpsState = this.GPS_RUNNING;
  } else {
    this.gpsState = this.GPS_SATS;
  }

  this.log_debug("gpsState=" + this.gpsState);

  if (this.gpsState !== this.GPS_OFF) {
    if (this.listenerCount === 0) {
      Bangle.on('GPS', processFix);
      this.listenerCount++;
      this.log_debug("listener added " + this.listenerCount);
    }
  } else {
    if (this.listenerCount > 0) {
      Bangle.removeListener("GPS", processFix);
      this.listenerCount--;
      this.log_debug("listener removed " + this.listenerCount);
    }
  }
};

GPS.prototype.getGPSTime = function() {
  var time;

  if (this.last_fix !== undefined && this.last_fix.time !== undefined && this.last_fix.time.toUTCString !== undefined &&
      (this.gpsState == this.GPS_SATS || this.gpsState == this.GPS_RUNNING)) {
    time = this.last_fix.time.toUTCString().split(" ");
    return time[4];
  } else {
    var d = new Date();
    var da = d.toString().split(" ");
    time = da[4].substr(0,5);
    return time;
  }
};

GPS.prototype.toggleGPSPower = function() {
  this.log_debug("toggleGPSPower()");
  this.gpsPowerState = Bangle.isGPSOn();
  this.gpsPowerState = !this.gpsPowerState;
  Bangle.setGPSPower((this.gpsPowerState ? 1 : 0), 'kitchen');

  this.resetLastFix();
  this.determineGPSState();

  // poke the gps widget indicator to change
  if (WIDGETS.gps !== undefined) {
    WIDGETS.gps.draw();
  }
};

GPS.prototype.resetLastFix = function() {
  this.last_fix = {
    fix: 0,
    alt: 0,
    lat: 0,
    lon: 0,
    speed: 0,
    time: 0,
    satellites: 0
  };
};

function processFix(fix) {
  //log_debug("processFix()");
  gpsObj.processFix(fix);
}

GPS.prototype.processFix = function(fix) {
  //this.log_debug("GPS:processFix()");
  //this.log_debug(fix);
  this.last_fix.time = fix.time;

  if (this.gpsState == this.GPS_TIME) {
    this.gpsState = this.GPS_SATS;
  }

  if (fix.fix) {
    //this.log_debug("Got fix - setting state to GPS_RUNNING");
    this.gpsState = this.GPS_RUNNING;
    if (!this.last_fix.fix && !(require("Storage").readJSON("setting.json", 1) || {}).quiet) {
      Bangle.buzz(); // buzz on first position
      debug_log("BUZZ - gps fix");
    }
    this.last_fix = fix;
  }
};

GPS.prototype.formatTime = function(now) {
  var fd = now.toUTCString().split(" ");
  return fd[4];
};

GPS.prototype.timeSince = function(t) {
  var hms = t.split(":");
  var now = new Date();

  var sn = 3600*(now.getHours()) + 60*(now.getMinutes()) + 1*(now.getSeconds());
  var st = 3600*(hms[0]) + 60*(hms[1]) + 1*(hms[2]);

  return (sn - st);
};

GPS.prototype.getOsRef = function() {
  let os = OsGridRef.latLongToOsGrid(this.last_fix);
  let ref = to_map_ref(6, os.easting, os.northing);
  return ref;
};

GPS.prototype.calcBearing = function(a,b) {
  var delta = radians(b.lon-a.lon);
  var alat = radians(a.lat);
  var blat = radians(b.lat);
  var y = Math.sin(delta) * Math.cos(blat);
  var x = Math.cos(alat)*Math.sin(blat) -
      Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
}

GPS.prototype.calcDistance = function(a,b) {
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.round(Math.sqrt(x*x + y*y) * 6371000);
}

GPS.prototype.getWPdistance = function() {
  //log_debug(this.last_fix);
  //log_debug(this.wp_current);

  if (this.wp_current.name === "E-WPT" || this.wp_current.name === "NONE" || this.wp_current.lat === undefined || this.wp_current.lat === 0)
    return 0;
  else
    return this.calcDistance(this.last_fix, this.wp_current);
}

GPS.prototype.getWPbearing = function() {
  //log_debug(this.last_fix);
  //log_debug(this.wp_current);

  if (this.wp_current.name === "E-WPT" || this.wp_current.name === "NONE" || this.wp_current.lat === undefined || this.wp_current.lat === 0)
    return 0;
  else
    return this.calcBearing(this.last_fix, this.wp_current);
}

GPS.prototype.loadFirstWaypoint = function() {
  var waypoints = require("waypoints").load();
  this.wp_index = 0;
  this.wp_current = waypoints[this.wp_index];
  log_debug(this.wp_current);
  return this.wp_current;
}

GPS.prototype.getCurrentWaypoint = function() {
  return this.wp_current;
}

GPS.prototype.waypointHasLocation = function() {
  if (this.wp_current.name === "E-WPT" || this.wp_current.name === "NONE" || this.wp_current.lat === undefined || this.wp_current.lat === 0)
    return false;
  else
    return true;
}

GPS.prototype.markWaypoint = function() {

  if(this.wp_current.name === "E-WPT" || this.wp_current.name === "NONE")
    return;

  log_debug("GPS::markWaypoint()");

  var waypoints = require("waypoints").load();
  this.wp_current = waypoints[this.wp_index];

  if (this.waypointHasLocation()) {
     waypoints[this.wp_index] = {name:this.wp_current.name, lat:0, lon:0};
  } else {
     waypoints[this.wp_index] = {name:this.wp_current.name, lat:this.last_fix.lat, lon:this.last_fix.lon};
  }

  this.wp_current = waypoints[this.wp_index];
  require("waypoints").save(waypoints);
  log_debug("GPS::markWaypoint() written");
}

GPS.prototype.nextWaypoint = function(inc) {
  var waypoints = require("waypoints").load();
  this.wp_index+=inc;
  if (this.wp_index>=waypoints.length) this.wp_index=0;
  if (this.wp_index<0) this.wp_index = waypoints.length-1;
  this.wp_current = waypoints[this.wp_index];
  log_debug(this.wp_current);
  return this.wp_current;
}

GPS.prototype.toggleGpsLogging = function() {
  var settings = require("Storage").readJSON("gpsrec.json",1)||{};
  if (settings == {}) return false;

  settings.recording = !settings.recording;
  require("Storage").write("gpsrec.json", settings);

  if (WIDGETS["gpsrec"])
    WIDGETS["gpsrec"].reload();

  return true;
}

GPS.prototype.loggingStatus = function() {
  var settings = require("Storage").readJSON("gpsrec.json",1)||{};
  if (settings == {}) return "E-LOG";
  if (settings.recording) return "ON";
  return "OFF";
}

var gpsObj = new GPS();


/*****************************************************************************

Start of OS lat lon to grid ref code

******************************************************************************/

Number.prototype.toRad = function() { return this*Math.PI/180; };
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Ordnance Survey Grid Reference functions  (c) Chris Veness 2005-2014                          */
/*   - www.movable-type.co.uk/scripts/gridref.js                                                  */
/*   - www.movable-type.co.uk/scripts/latlon-gridref.html                                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
function OsGridRef(easting, northing) {
  this.easting = 0|easting;
  this.northing = 0|northing;
}

OsGridRef.latLongToOsGrid = function(point) {
  var lat = point.lat.toRad();
  var lon = point.lon.toRad();

  var a = 6377563.396, b = 6356256.909;          // Airy 1830 major & minor semi-axes
  var F0 = 0.9996012717;                         // NatGrid scale factor on central meridian
  var lat0 = (49).toRad(), lon0 = (-2).toRad();  // NatGrid true origin is 49Ã¯Â¿Â½N,2Ã¯Â¿Â½W
  var N0 = -100000, E0 = 400000;                 // northing & easting of true origin, metres
  var e2 = 1 - (b*b)/(a*a);                      // eccentricity squared
  var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;

  var cosLat = Math.cos(lat), sinLat = Math.sin(lat);
  var nu = a*F0/Math.sqrt(1-e2*sinLat*sinLat);              // transverse radius of curvature
  var rho = a*F0*(1-e2)/Math.pow(1-e2*sinLat*sinLat, 1.5);  // meridional radius of curvature
  var eta2 = nu/rho-1;

  var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (lat-lat0);
  var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(lat-lat0) * Math.cos(lat+lat0);
  var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(lat-lat0)) * Math.cos(2*(lat+lat0));
  var Md = (35/24)*n3 * Math.sin(3*(lat-lat0)) * Math.cos(3*(lat+lat0));
  var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

  var cos3lat = cosLat*cosLat*cosLat;
  var cos5lat = cos3lat*cosLat*cosLat;
  var tan2lat = Math.tan(lat)*Math.tan(lat);
  var tan4lat = tan2lat*tan2lat;

  var I = M + N0;
  var II = (nu/2)*sinLat*cosLat;
  var III = (nu/24)*sinLat*cos3lat*(5-tan2lat+9*eta2);
  var IIIA = (nu/720)*sinLat*cos5lat*(61-58*tan2lat+tan4lat);
  var IV = nu*cosLat;
  var V = (nu/6)*cos3lat*(nu/rho-tan2lat);
  var VI = (nu/120) * cos5lat * (5 - 18*tan2lat + tan4lat + 14*eta2 - 58*tan2lat*eta2);

  var dLon = lon-lon0;
  var dLon2 = dLon*dLon, dLon3 = dLon2*dLon, dLon4 = dLon3*dLon, dLon5 = dLon4*dLon, dLon6 = dLon5*dLon;

  var N = I + II*dLon2 + III*dLon4 + IIIA*dLon6;
  var E = E0 + IV*dLon + V*dLon3 + VI*dLon5;

  return new OsGridRef(E, N);
};

/*
 * converts northing, easting to standard OS grid reference.
 *
 * [digits=10] - precision (10 digits = metres)
 *   to_map_ref(8, 651409, 313177); => 'TG 5140 1317'
 *   to_map_ref(0, 651409, 313177); => '651409,313177'
 *
 */
function to_map_ref(digits, easting, northing) {
  if (![ 0,2,4,6,8,10,12,14,16 ].includes(Number(digits))) throw new RangeError(`invalid precision '${digits}'`);

  let e = easting;
  let n = northing;

  // use digits = 0 to return numeric format (in metres) - note northing may be >= 1e7
  if (digits == 0) {
    const format = { useGrouping: false,  minimumIntegerDigits: 6, maximumFractionDigits: 3 };
    const ePad = e.toLocaleString('en', format);
    const nPad = n.toLocaleString('en', format);
    return `${ePad},${nPad}`;
  }

  // get the 100km-grid indices
  const e100km = Math.floor(e / 100000), n100km = Math.floor(n / 100000);

  // translate those into numeric equivalents of the grid letters
  let l1 = (19 - n100km) - (19 - n100km) % 5 + Math.floor((e100km + 10) / 5);
  let l2 = (19 - n100km) * 5 % 25 + e100km % 5;

  // compensate for skipped 'I' and build grid letter-pairs
  if (l1 > 7) l1++;
  if (l2 > 7) l2++;
  const letterPair = String.fromCharCode(l1 + 'A'.charCodeAt(0), l2 + 'A'.charCodeAt(0));

  // strip 100km-grid indices from easting & northing, and reduce precision
  e = Math.floor((e % 100000) / Math.pow(10, 5 - digits / 2));
  n = Math.floor((n % 100000) / Math.pow(10, 5 - digits / 2));

  // pad eastings & northings with leading zeros
  e = e.toString().padStart(digits/2, '0');
  n = n.toString().padStart(digits/2, '0');

  return `${letterPair} ${e} ${n}`;
}


/*****************************************************************************

Stopwatch Class Code

******************************************************************************/


function STOPWATCH() {
  this.tTotal = Date.now();
  this.tStart = Date.now();
  this.tCurrent = Date.now();
  this.running = false;
  this.timeY = 45;
  this.TtimeY = 75;
  this.lapTimes = [];
  this.displayInterval;
  this.redrawButtons = true;
  this.redrawLaps = true;
  this.redrawTime = true;
}

STOPWATCH.prototype.log_debug = function(o) {
  //console.log(o);
}

STOPWATCH.prototype.timeToText = function(t) {
  let hrs = Math.floor(t/3600000);
  let mins = Math.floor(t/60000)%60;
  let secs = Math.floor(t/1000)%60;
  let text;

  if (hrs === 0)
    text = ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);
  else
    text = (""+hrs) + ":" + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);

  this.log_debug(text);
  return text;
}

STOPWATCH.prototype.getLapTimesArray = function() {
  this.lapTimes.push(tCurrent-tTotal);
  return this.lapTimes.map(timeToText).reverse();
}

STOPWATCH.prototype.stopStart = function() {
  this.log_debug("stopStart()");
  this.running = !this.running;

  if (this.running)
    this.tStart = Date.now() + this.tStart - this.tCurrent;

  this.tTotal = Date.now() + this.tTotal - this.tCurrent;
  this.tCurrent = Date.now();
  this.redrawButtons = true;
  this.redrawLaps = true;
  this.redrawTime = true;
  this.draw();
}

STOPWATCH.prototype.lap = function() {
  this.log_debug("lap()");
  if (this.running) {
    this.tCurrent = Date.now();
    this.lapTimes.unshift(this.tCurrent - this.tStart);
    log_debug(this.tCurrent - this.tStart);
  }

  this.tStart = this.tCurrent;
  this.redrawButtons = true;
  this.redrawLaps = true;
  this.draw();
}

STOPWATCH.prototype.reset = function() {
  this.log_debug("reset()");
  if (this.running === false) {
    this.tStart = this.tCurrent = this.tTotal = Date.now();
    this.lapTimes = [];
  }
  g.clear();
  this.draw();
}

// lap or reset
STOPWATCH.prototype.lapOrReset = function() {
  this.redrawButtons = true;
  this.redrawLaptimes = true;
  this.redrawTime = true;

  this.log_debug("lapReset()");
  if (this.running)
    this.lap()
  else
    this.reset();
}

STOPWATCH.prototype.draw = function() {
  if (this.running) this.tCurrent = Date.now();
  this.log_debug("draw()" + getTime());

  g.setColor(1,1,1);
  if (this.redrawButtons) this.drawButtons();
  if (this.running || this.redrawTime) this.drawTime();
  if (this.redrawLaps) this.drawLaptimes();
}

STOPWATCH.prototype.drawButtons = function() {
  this.log_debug("drawButtons()");

  g.clearRect(0,23,g.getWidth()-1,g.getHeight()-24);
  g.setColor(1,1,1);
  g.setFont("Vector", 20);
  g.setFontAlign(0,0,3);
  g.drawString(this.running? "STOP" : "GO",    230, 50); // BTN1
  g.drawString(this.running? "LAP"  : "RESET", 230, 120); // BTN2
  this.redrawButtons = false;
}

STOPWATCH.prototype.drawLaptimes = function() {
  g.setFont("Vector",24);
  g.setFontAlign(-1,-1);
  g.clearRect(4, 205, 239, 229); // clear the last line of the lap times

  let laps = 0;
  for (let i in this.lapTimes) {
    g.drawString(this.lapTimes.length-i + ": " + this.timeToText(this.lapTimes[i]), 4, this.timeY + 40 + i*24);
    if (++laps > 5) break;
  }
  this.redrawLaps = false;
}

STOPWATCH.prototype.drawTime = function() {
  this.log_debug("drawTime()");
  let tLap = this.tCurrent - this.tStart;
  let tTotal = this.tCurrent - this.tTotal;
  let txtLap = this.timeToText(tLap);
  let txtTotal = this.timeToText(tTotal);
  let xTotal = 100;
  let xLap = 125;

  // total time
  g.setFont("Vector",38);
  g.setFontAlign(0,0);
  g.clearRect(0, this.timeY-21, 200, this.timeY+21);
  g.setColor(0xFFC0);
  g.drawString(txtTotal, xTotal, this.timeY);

  // current lap time
  g.setFont("Vector", 20);
  g.clearRect(0, this.TtimeY-7, 200, this.TtimeY+7);
  g.setColor(1,1,1);
  g.drawString(txtLap, xLap, this.TtimeY);

  this.redrawTime = false;
}

STOPWATCH.prototype.startTimer = function() {
  this.log_debug("startTimer()");
  this.redrawButtons = true;
  this.redrawLaps = true;
  this.redrawTime = true;
  this.draw();
  this.displayInterval = setInterval(stopwatchDraw, 1000);
}

STOPWATCH.prototype.stopTimer = function() {
  this.log_debug("stopTimer()");
  if (this.displayInterval) {
    clearInterval(this.displayInterval);
    this.displayInterval = undefined;
  }
}

let swObj = new STOPWATCH();

function stopwatchDraw() {
  swObj.draw();
}


/*****************************************************************************

Heart Rate Monitor

******************************************************************************/

function HRM() {
  this.bpm = 0;
  this.confidence = 0;
}

HRM.prototype.log_debug = function(o) {
  //console.log(o);
}

HRM.prototype.toggleHRMPower = function() {
  this.log_debug("HRM.toggleHRMPower()");
  if (!Bangle.isHRMOn) return; // old firmware

  if (!Bangle.isHRMOn()) {
    this.log_debug("HRM.toggleHRMPower(powerOn)");
    Bangle.removeListener('HRM', onHRM);
    Bangle.setHRMPower(1);
    Bangle.on('HRM', onHRM);
  } else {
    this.log_debug("HRM.toggleHRMPower(powerOff)");
    Bangle.removeListener('HRM', onHRM);
    Bangle.setHRMPower(0);
  }

  // poke the hrt widget indicator to change
  if (WIDGETS.widhrt !== undefined) {
    WIDGETS.widhrt.draw();
  }
}

HRM.prototype.getBpm = function() {
  return this.bpm;
}

HRM.prototype.getConfidence = function() {
  return this.confidence;
}

HRM.prototype.onHRM = function(hrm) {
  this.bpm = hrm.bpm;
  this.confidence = hrm.confidence;
  this.log_debug("onHRM:(bpm)" + this.bpm);
  this.log_debug("onHRM:(conf) " + this.confidence);
}

let hrmObj = new HRM();

function onHRM(hrm) {
  hrmObj.onHRM(hrm);
}


/*****************************************************************************

Trip Counter

******************************************************************************/

function TRIP() {
  this.showTrip = false;
  this.tripStart = 0;
}

TRIP.prototype.resetTrip = function(steps) {
  this.tripStart = (0 + steps);
  log_debug("resetTrip starting=" + this.tripStart);
}

TRIP.prototype.getTrip = function(steps) {
  let tripSteps = (0 + steps) - this.tripStart;
  log_debug("getTrip steps=" + steps);
  log_debug("getTrip tripStart=" + this.tripStart);
  log_debug("getTrip=" + tripSteps);
  return tripSteps;
}

TRIP.prototype.getTripState = function() {
  return this.showTrip;
}

TRIP.prototype.setTripState = function(t) {
  this.showTrip = t;
}

let tripObject = new TRIP();

/*****************************************************************************

Debug Object

******************************************************************************/

function DEBUG() {
  this.logfile = require("Storage").open("debug.log","a");
}

DEBUG.prototype.log = function(msg) {
  let timestamp = new Date().toString().split(" ")[4];
  let line = timestamp + ", " + msg + "\n";
  this.logfile.write(line);
}

debugObj = new DEBUG();

function debug_log(m) {
  //debugObj.log(m);
}

/*****************************************************************************

Start App

******************************************************************************/

g.clear();
Bangle.loadWidgets();
face.init(gpsObj,swObj, hrmObj, tripObject);
startdraw();
setButtons();
