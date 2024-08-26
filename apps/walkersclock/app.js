/*
 * Walkers clock, hugh barney AT googlemail DOT com
 *
 * A clock that has the following features
 *  - displays the time in large font
 *  - uses BTN1 to select modeline display (eg battery status or switch between setting when in a function mode
 *  - uses BTN3 to select the function mode (eg turn on/off GPS, or change GPS display)
 *    - two function menus at present
 *      GPS Power   = On/Off
 *      GPS Display = Grid | Speed Alt
 *      when the modeline in CYAN use button BTN1 to switch between options
 *  - display the current steps if one of the steps widgets is installed
 *  - ensures that BTN2 requires a 1.5 second press in order to switch to the launcher
 *    this is so you dont accidently switch out of the GPS/watch display with you coat sleeve
 *  - displays the timestamp of the last GPS fix when the GPS is on
 *  - buzzes when the GPS aquires a positional satellite fix
 *  - displays the current OS map grid reference in a large font
 *  - displays the age of the current GPS position fix in seconds
 *  - works in tandem with the GPS setup app so that you can reduce the power consumption of the GPS
 *
 */

const INFO_NONE = "none";
const INFO_BATT = "batt";
const INFO_STEPS = "step";

const FN_MODE_OFF = "fn_mode_off";
const FN_MODE_GPS = "fn_mode_gps";
const FN_MODE_GDISP = "fn_mode_gdisp";

const GPS_OFF = "gps_off";
const GPS_TIME = "gps_time";
const GPS_SATS = "gps_sats";
const GPS_RUNNING = "gps_running";

const GDISP_OS = "g_osref";
const GDISP_LATLN = "g_latln";
const GDISP_SPEED = "g_speed";
const GDISP_ALT = "g_alt";
const GDISP_COURSE = "g_course";

const Y_TIME = 40;
const Y_ACTIVITY = 120;
const Y_MODELINE = 200;

let gpsState = GPS_OFF;
let gpsPowerState = false;
let infoMode = INFO_NONE;
let functionMode = FN_MODE_OFF;
let gpsDisplay = GDISP_OS;
let prevInfoStr = "clear";
let prevSteps = "clear";
let clearActivityArea = true;

let last_steps = undefined;
let firstPress = 0;

let last_fix = {
  fix: 0,
  alt: 0,
  lat: 0,
  lon: 0,
  speed: 0,
  time: 0,
  satellites: 0
};

function drawTime() {
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0,5);

  g.reset();
  g.clearRect(0,Y_TIME, 239, Y_ACTIVITY - 1);

  g.setColor(1,1,1);  // white
  g.setFontAlign(0, -1);

  if (gpsState == GPS_SATS || gpsState == GPS_RUNNING) {
    time = last_fix.time.toUTCString().split(" ");
    time = time[4];
    g.setFont("Vector", 56);
  } else {
    g.setFont("Vector", 80);
  }

  g.drawString(time, g.getWidth()/2, Y_TIME);
}

function drawActivity() {
  var steps = getSteps();
  if (!gpsPowerState && steps != prevSteps)
    clearActivityArea = true;

  prevSteps = steps;

  if (clearActivityArea) {
    g.clearRect(0, Y_ACTIVITY, 239, Y_MODELINE - 1);
    clearActivityArea = false;
  }

  if (!gpsPowerState) {
    g.setColor(0,255,0);  // green
    g.setFont("Vector", 60);
    g.drawString(getSteps(), g.getWidth()/2, Y_ACTIVITY);
    return;
  }

  g.setFont("6x8", 3);
  g.setColor(1,1,1);
  g.setFontAlign(0, -1);

  if (gpsState == GPS_TIME) {
    g.drawString("Waiting for", g.getWidth()/2, Y_ACTIVITY);
    g.drawString("GPS", g.getWidth()/2, Y_ACTIVITY + 30);
    return;
  }

  if (gpsState == GPS_SATS) {
    g.drawString("Satellites", g.getWidth()/2, Y_ACTIVITY);
    g.drawString(last_fix.satellites, g.getWidth()/2, Y_ACTIVITY + 30);
    return;
  }

  if (gpsState == GPS_RUNNING) {
    //console.log("Draw GPS Running");
    let time = formatTime(last_fix.time);
    let age = timeSince(time);
    let os = OsGridRef.latLongToOsGrid(last_fix);
    let ref = to_map_ref(6, os.easting, os.northing);
    let speed;
    let activityStr = "";

    if (age < 0) age = 0;
    g.setFontVector(40);
    g.setColor(0xFFC0);

    switch(gpsDisplay) {
    case GDISP_OS:
      activityStr = ref;
      break;
    case GDISP_LATLN:
      g.setFontVector(26);
      activityStr = last_fix.lat.toFixed(4) + ", " + last_fix.lon.toFixed(4);
      break;
    case GDISP_SPEED:
      speed = last_fix.speed;
      speed = speed.toFixed(1);
      activityStr = speed + "kph";
      break;
    case GDISP_ALT:
      activityStr = last_fix.alt + "m";
      break;
    case GDISP_COURSE:
      activityStr = last_fix.course;
      break;
    }

    g.clearRect(0, Y_ACTIVITY, 239, Y_MODELINE - 1);
    g.drawString(activityStr, 120, Y_ACTIVITY);
    g.setFont("6x8",2);
    g.setColor(1,1,1);
    g.drawString(age, 120, Y_ACTIVITY + 46);
  }
}

function onTick() {
  if (!Bangle.isLCDOn())
    return;

  if (gpsPowerState) {
    drawAll();
    return;
  }

  if (last_steps != getSteps()) {
    last_steps = getSteps();
    drawAll();
    return;
  }

  var t = new Date();

  if (t.getSeconds() === 0 && !gpsPowerState) {
    drawAll();
  }
}

function drawAll(){
  drawTime();
  drawActivity();  // steps, hrt or gps
  drawInfo();
}

function drawInfo() {
  let str = "";
  let col = 0x07E0; // green

  switch(functionMode) {
  case FN_MODE_OFF:
    break;
  case FN_MODE_GPS:
    col = 0x07FF; // cyan
    str = "GPS: " + (gpsPowerState ? "ON" : "OFF");
    drawModeLine(str,col);
    return;
  case FN_MODE_GDISP:
    col = 0x07FF; // cyan
    switch(gpsDisplay) {
    case GDISP_OS:
      str = "GPS: Grid";
      break;
    case GDISP_LATLN:
      str = "GPS: Lat,Lon";
      break;
    case GDISP_SPEED:
      str = "GPS: Speed";
      break;
    case GDISP_ALT:
      str = "GPS: Alt";
      break;
    case GDISP_COURSE:
      str = "GPS: Course";
      break;
    }
    drawModeLine(str,col);
    return;
  }

  switch(infoMode) {
  case INFO_NONE:
    col = 0x0000;
    str = "";
    break;
  case INFO_STEPS:
    str = "Steps: " + getSteps();
    break;
  case INFO_BATT:
  default:
    str = "Battery: " + E.getBattery() + "%";
  }

  drawModeLine(str,col);
}

function drawModeLine(str,col) {
  // check if we need to draw, avoid flicker
  if (str == prevInfoStr)
    return;

  prevInfoStr = str;
  drawModeLine(str,col);
  g.setFont("6x8", 3);
  g.setColor(col);
  g.fillRect(0, Y_MODELINE - 3, 239, Y_MODELINE + 25);
  g.setColor(0,0,0);
  g.setFontAlign(0, -1);
  g.drawString(str, g.getWidth()/2, Y_MODELINE);
}

function changeInfoMode() {
  switch(functionMode) {
  case FN_MODE_OFF:
    break;
  case FN_MODE_GPS:
    gpsPowerState = !gpsPowerState;
    Bangle.buzz();
    Bangle.setGPSPower(gpsPowerState ? 1 : 0);
    if (gpsPowerState) {
      gpsState = GPS_TIME; // waiting first response so we can display time
      Bangle.on('GPS', processFix);
    } else {
      Bangle.removeListener("GPS", processFix);
      gpsState = GPS_OFF;
    }
    resetLastFix();

    // poke the gps widget indicator to change
    if (WIDGETS.gps !== undefined) {
      WIDGETS.gps.draw();
    }
    functionMode = FN_MODE_OFF;
    infoMode = INFO_NONE;
    clearActivityArea = true;
    return;

  case FN_MODE_GDISP:
    switch (gpsDisplay) {
    case GDISP_OS:
      gpsDisplay = GDISP_SPEED;
      break;
    case GDISP_SPEED:
      gpsDisplay = GDISP_ALT;
      break;
    case GDISP_ALT:
      gpsDisplay = GDISP_COURSE;
      break;
    case GDISP_COURSE:
      gpsDisplay = GDISP_LATLN;
      break;
    case GDISP_LATLN:
    default:
      gpsDisplay = GDISP_OS;
      break;
    }
  }

  switch(infoMode) {
  case INFO_NONE:
    if (stepsWidget() !== undefined)
      infoMode = INFO_STEPS;
    else
      infoMode = INFO_BATT;
    break;
  case INFO_STEPS:
    infoMode = INFO_BATT;
    break;
  case INFO_BATT:
  default:
    infoMode = INFO_NONE;
  }

  clearActivityArea = true;
}

function changeFunctionMode() {
  //console.log("changeFunctionMode()");

  if (gpsState != GPS_RUNNING) {
    switch(functionMode) {
    case FN_MODE_OFF:
      functionMode = FN_MODE_GPS;
      break;
    case FN_MODE_GPS:
    default:
      functionMode = FN_MODE_OFF;
      break;
    }
  } else {
    // if GPS is RUNNING then we want the GPS display options first
    switch(functionMode) {
    case FN_MODE_OFF:
      functionMode = FN_MODE_GDISP;
      break;
    case FN_MODE_GDISP:
      functionMode = FN_MODE_GPS;
      break;
    case FN_MODE_GPS:
    default:
      functionMode = FN_MODE_OFF;
      break;
    }
  }

  infoMode = INFO_NONE; // function mode overrides info mode
}

function resetLastFix() {
  last_fix = {
    fix: 0,
    alt: 0,
    lat: 0,
    lon: 0,
    speed: 0,
    time: 0,
    satellites: 0
  };
}

function processFix(fix) {
  last_fix.time = fix.time;

  if (gpsState == GPS_TIME) {
    gpsState = GPS_SATS;
    clearActivityArea = true;
  }

  if (fix.fix) {
    if (!last_fix.fix) {
      if (!(require('Storage').readJSON('setting.json',1)||{}).quiet) {
        Bangle.buzz(); // buzz on first position
      }
      clearActivityArea = true;
    }
    gpsState = GPS_RUNNING;
    last_fix = fix;
  }
}

function getSteps() {
  if (stepsWidget() !== undefined)
    return stepsWidget().getSteps();
  return "-";
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}


/*************     GPS  / OSREF Code **************************/

function formatTime(now) {
  var fd = now.toUTCString().split(" ");
  return fd[4];
}

function timeSince(t) {
  var hms = t.split(":");
  var now = new Date();

  var sn = 3600*(now.getHours()) + 60*(now.getMinutes()) + 1*(now.getSeconds());
  var st = 3600*(hms[0]) + 60*(hms[1]) + 1*(hms[2]);

  return (sn - st);
}

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

// start a timer and buzz whenn held long enough
function firstPressed() {
  firstPress = getTime();
  pressTimer = setInterval(longPressCheck, 1500);
}

// if you release too soon there is no buzz as timer is cleared
function thenReleased() {
  var dur = getTime() - firstPress;
  if (pressTimer) {
    clearInterval(pressTimer);
    pressTimer = undefined;
  }
  if ( dur >= 1.5 ) Bangle.showLauncher();
}

// when you feel the buzzer you know you have done a long press
function longPressCheck() {
  Bangle.buzz();
  if (pressTimer) {
    clearInterval(pressTimer);
    pressTimer = undefined;
  }
}

var pressTimer;

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawAll();

Bangle.on('lcdPower',function(on) {
  functionMode = FN_MODE_OFF;
  infoMode = INFO_NONE;
  if (on) {
    prevInfoStr = "on"; // forces are redraw
    drawAll();
  } else {
    prevInfoStr = "off"; // forces are redraw
    drawInfo();
  }
});

setInterval(onTick, 5000);

setWatch(() => { changeInfoMode(); drawAll(); }, BTN1, {repeat: true});
setWatch(() => { changeFunctionMode(); drawAll(); }, BTN3, {repeat: true});

// make BTN require a long press (1.5 seconds) to switch to launcher
setWatch(firstPressed, BTN2,{repeat:true,edge:"rising"});
setWatch(thenReleased, BTN2,{repeat:true,edge:"falling"});

