const h = g.getHeight();
const w = g.getWidth();
let geo = require("geotools");
let last_fix;
let listennerCount = 0;

function log_debug(o) {
  //console.log(o);
}

function resetLastFix() {
  last_fix = {
    fix: 0,
    alt: 0,
    lat: 0,
    lon: 0,
    speed: 0,
    time: 0,
    course: 0,
    satellites: 0
  };
}

function processFix(fix) {
  last_fix.time = fix.time;
  log_debug(fix);

  if (fix.fix) {
    if (!last_fix.fix) {
      // we dont need to suppress this in quiet mode as it is user initiated
      Bangle.buzz(1500); // buzz on first position
    }
    last_fix = fix;
  }
}

function draw() {
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0,5);
  var hh = da[4].substr(0,2);
  var mm = da[4].substr(3,2);

  g.reset();
  drawTop(d,hh,mm);
  drawInfo();
}

function drawTop(d,hh,mm) {
  g.setFont("Vector", w/3);
  g.setFontAlign(0, 0);
  g.setColor(g.theme.bg);
  g.fillRect(0, 24, w, ((h-24)/2) + 24);
  g.setColor(g.theme.fg);

  g.setFontAlign(1,0);  // right aligned
  g.drawString(hh, (w/2) - 6, ((h-24)/4) + 24);
  g.setFontAlign(-1,0); // left aligned
  g.drawString(mm, (w/2) + 6, ((h-24)/4) + 24);

  // for the colon
  g.setFontAlign(0,0); // centre aligned
  if (d.getSeconds()&1) g.drawString(":", w/2, ((h-24)/4) + 24);
}

function drawInfo() {
  if (infoData[infoMode] && infoData[infoMode].calc) {
    g.setFont("Vector", w/7);
    g.setFontAlign(0, 0);

    if (infoData[infoMode].get_color)
      g.setColor(infoData[infoMode].get_color());
    else
      g.setColor("#0ff");
    g.fillRect(0, ((h-24)/2) + 24 + 1, w, h);

    if (infoData[infoMode].is_control)
      g.setColor("#fff");
    else
      g.setColor("#000");

    g.drawString((infoData[infoMode].calc()), w/2, (3*(h-24)/4) + 24);
  }
}

const infoData = {
  ID_LAT: {
    calc: () => 'Lat: ' + last_fix.lat.toFixed(4),
  },
  ID_LON: {
    calc: () => 'Lon: ' + last_fix.lon.toFixed(4),
  },
  ID_SPEED: {
    calc: () => 'Speed: ' + last_fix.speed.toFixed(1),
  },
  ID_ALT: {
    calc: () => 'Alt: ' + last_fix.alt.toFixed(0),
  },
  ID_COURSE: {
    calc: () => 'Course: '+ last_fix.course.toFixed(0),
  },
  ID_SATS: {
    calc: () => 'Satelites: ' + last_fix.satellites,
  },
  ID_TIME: {
    calc: () => formatTime(last_fix.time),
  },
  OS_REF: {
    calc: () => !last_fix.fix ? "OO 000 000" : geo.gpsToOSMapRef(last_fix),
  },
  GPS_POWER: {
    calc: () => (Bangle.isGPSOn()) ? 'GPS On' : 'GPS Off',
    action: () => toggleGPS(),
    get_color: () => Bangle.isGPSOn() ? '#f00' : '#00f',
    is_control: true,
  },
  GPS_LOGGER: {
    calc: () => 'Logger ' + loggerStatus(),
    action: () => toggleLogger(),
    get_color: () => loggerStatus() == "ON" ? '#f00' : '#00f',
    is_control: true,
  },
};

function toggleGPS() {
  if (loggerStatus() == "ON")
    return;

  Bangle.setGPSPower(Bangle.isGPSOn() ? 0 : 1, 'gpstouch');
  // add or remove listenner
  if (Bangle.isGPSOn()) {
    if (listennerCount == 0) {
      Bangle.on('GPS', processFix);
      listennerCount++;
      log_debug("listennerCount=" + listennerCount);
    }
  } else {
    if (listennerCount > 0) {
      Bangle.removeListener("GPS", processFix);
      listennerCount--;
      log_debug("listennerCount=" + listennerCount);
    }
  }
  resetLastFix();
}

function loggerStatus() {
  var settings = require("Storage").readJSON("gpsrec.json",1)||{};
  if (settings == {}) return "Install";
  return settings.recording ? "ON" : "OFF";
}

function toggleLogger() {
  var settings = require("Storage").readJSON("gpsrec.json",1)||{};
  if (settings == {}) return;

  settings.recording = !settings.recording;
  require("Storage").write("gpsrec.json", settings);

  if (WIDGETS["gpsrec"])
    WIDGETS["gpsrec"].reload();

  if (settings.recording && listennerCount == 0) {
    Bangle.on('GPS', processFix);
    listennerCount++;
    log_debug("listennerCount=" + listennerCount);
  }
}

function formatTime(now) {
  try {
    var fd = now.toUTCString().split(" ");
    return fd[4];
  } catch (e) {
    return "00:00:00";
  }
}

const infoList = Object.keys(infoData).sort();
let infoMode = infoList[0];

function nextInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === infoList.length - 1) infoMode = infoList[0];
    else infoMode = infoList[idx + 1];
  }
}

function prevInfo() {
  let idx = infoList.indexOf(infoMode);
  if (idx > -1) {
    if (idx === 0) infoMode = infoList[infoList.length - 1];
    else infoMode = infoList[idx - 1];
  }
}

Bangle.on('swipe', dir => {
  if (dir == 1) prevInfo(); else nextInfo();
  draw();
});

let prevTouch = 0;

Bangle.on('touch', function(button, xy) {
  let dur = 1000*(getTime() - prevTouch);
  prevTouch = getTime();

  if (dur <= 1000 && xy.y < h/2 && infoData[infoMode].is_control) {
    Bangle.buzz();
    if (infoData[infoMode] && infoData[infoMode].action) {
      infoData[infoMode].action();
      draw();
    }
  }
});

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (secondInterval)
    clearInterval(secondInterval);
  secondInterval = undefined;
  if (on)
    secondInterval = setInterval(draw, 1000);
  draw();
});

resetLastFix();

// add listenner if already powered on, plus tag app
if (Bangle.isGPSOn() || loggerStatus() == "ON") {
  Bangle.setGPSPower(1, 'gpstouch');
  if (listennerCount == 0) {
    Bangle.on('GPS', processFix);
    listennerCount++;
    log_debug("listennerCount=" + listennerCount);
  }
}

g.clear();
var secondInterval = setInterval(draw, 1000);
draw();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
