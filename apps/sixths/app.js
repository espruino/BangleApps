const W = g.getWidth();
const H = g.getHeight();

var cx = 100; cy = 105; sc = 70;
var buzz = "", msg = "";
temp = 0; alt = 0; bpm = 0;
var buzz = "", msg = "", inm = "", l = "", note = "(NOTEHERE)";
var mode = 0, mode_time = 0; // 0 .. normal, 1 .. note

var gps_on = 0, last_fix = 0, last_restart = 0, last_pause = 0, last_fstart = 0; // utime
var gps_needed = 0, gps_limit = 0; // seconds
var prev_fix = null;
var gps_dist = 0;

var is_active = false;
var cur_altitude = 0, cur_temperature = 0, alt_adjust = 0;
const rest_altitude = 354;

function toMorse(x) {
  r = "";
  for (var i = 0; i < x.length; i++) {
    c = x[i];
    if (c == " ") {
      r += " ";
      continue;
    }
    r += asciiToMorse(c) + " ";
  }
  return r;
}

function aload(s) {
  buzz += toMorse(' E');
  load(s);
}

function gpsRestart() {
  print("gpsRestart");
  Bangle.setGPSPower(1, "sixths");
  last_restart = getTime();
  last_pause = 0;
  last_fstart = 0;
}

function gpsPause() {
  print("gpsPause");
  Bangle.setGPSPower(0, "sixths");
  last_restart = 0;
  last_pause = getTime();
}

function gpsOn() {
  gps_on = getTime();
  gps_needed = 1000;
  gps_limit = 60*60*4;
  last_fix = 0;
  prev_fix = null;
  gps_dist = 0;
  gpsRestart();
}

function gpsOff() {
  Bangle.setGPSPower(0, "sixths");
  gps_on = 0;
}

function inputHandler(s) {
  print("Ascii: ", s);
  if (mode == 1) {
    note = note + s;
    mode_time = getTime();
    return;
  }
  switch(s) {
    case 'B':
      s = ' B';
      bat = E.getBattery();
      if (bat > 45)
        s += 'E';
      else
        s = s+(bat/5);
      buzz += toMorse(s);
      break;
    case 'F': gpsOff(); break;
    case 'G': gpsOn(); break;
    case 'L': aload("altimeter.app.js"); break;
    case 'N': mode = 1; note = ">"; mode_time = getTime(); break;
    case 'O': aload("orloj.app.js"); break;
    case 'T':
      s = ' T';
      d = new Date();
      s += d.getHours() % 10;
      s += add0(d.getMinutes());
      buzz += toMorse(s);
      break;
    case 'R': aload("run.app.js"); break;
  }
}

const morseDict = {
    '.-': 'A',
    '-...': 'B',
    '-.-.': 'C',
    '-..': 'D',
    '.': 'E',
    '..-.': 'F',
    '--.': 'G',
    '....': 'H',
    '..': 'I',
    '.---': 'J',
    '-.-': 'K',
    '.-..': 'L',
    '--': 'M',
    '-.': 'N',
    '---': 'O',
    '.--.': 'P',
    '--.-': 'Q',
    '.-.': 'R',
    '...': 'S',
    '-': 'T',
    '..-': 'U',
    '...-': 'V',
    '.--': 'W',
    '-..-': 'X',
    '-.--': 'Y',
    '--..': 'Z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '----.': '9',
    '---..': '8',
    '--...': '7',
    '-....': '6',
    '-----': '0',
  };

let asciiDict = {};

for (let k in morseDict) {
  print(k, morseDict[k]);
  asciiDict[morseDict[k]] = k;
}


function morseToAscii(morse) {
  return morseDict[morse];
}

function asciiToMorse(char) {
  return asciiDict[char];
}

function morseHandler() {
  inputHandler(morseToAscii(inm));
  inm = "";
  l = "";
}

function touchHandler(d) {
  let x = Math.floor(d.x);
  let y = Math.floor(d.y);

  g.setColor(0.25, 0, 0);
  g.fillCircle(W-x, W-y, 5);

  if (d.b) {
  if (x < W/2 && y < H/2 && l != ".u") {
    inm = inm + ".";
    l = ".u";
  }
  if (x > W/2 && y < H/2 && l != "-u") {
    inm = inm + "-";
    l = "-u";
  }
  if (x < W/2 && y > H/2 && l != ".d") {
    inm = inm + ".";
    l = ".d";
  }
  if (x > W/2 && y > H/2 && l != "-d") {
    inm = inm + "-";
    l = "-d";
  }

  } else
    morseHandler();

  print(inm, "drag:", d);
}

function add0(i) {
  if (i > 9) {
    return ""+i;
  } else {
    return "0"+i;
  }
}

var lastHour = -1, lastMin = -1;

function logstamp(s) {
    logfile.write("utime=" + getTime() + " " + s + "\n");
}

function loggps(fix) {
  logfile.write(fix.lat + " " + fix.lon + " ");
  logstamp("");
}

function hourly() {
  print("hourly");
  s = ' T';
  if (is_active)
    buzz += toMorse(s);
  logstamp("");
}

function fivemin() {
  print("fivemin");
  s = ' B';
  bat = E.getBattery();
  if (bat < 45) {
      s = s+(bat/5);
      if (is_active)
        buzz += toMorse(s);
  }
  if (0)
    Bangle.getPressure().then((x) => { cur_altitude = x.altitude;
                                     cur_temperature = x.temperature; },
                                 print)
      .catch(print);
}

function every(now) {
  if ((mode > 0) && (mode_time - getTime() > 60)) {
    if (mode == 1) {
      logstamp(">" + note);
    }
    mode = 0;
  }
  if (gps_on && getTime() - gps_on > gps_limit) {
    Bangle.setGPSPower(0, "sixths");
    gps_on = 0;
  }

  if (lastHour != now.getHours()) {
    lastHour = now.getHours();
    hourly();
  }
  if (lastMin / 5 != now.getMinutes() / 5) {
    lastMin = now.getMinutes();
    fivemin();
  }

}

// distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
// https://www.movable-type.co.uk/scripts/latlong.html
// (Equirectangular approximation)
function calcDistance(a,b) {
  function radians(a) { return a*Math.PI/180; }
  var x = radians(b.lon-a.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.sqrt(x*x + y*y) * 6371000;
}

function draw() {
  g.setColor(1, 1, 1);
  g.fillRect(0, 25, W, H);
  g.setFont('Vector', 60);

  g.setColor(0, 0, 0);
  g.setFontAlign(-1, 1);
  let now = new Date();
  g.drawString(now.getHours() + ":" + add0(now.getMinutes()), 10, 90);

  every(now);

  let km = 0.001 * 0.719 * Bangle.getHealthStatus("day").steps;

  g.setFont('Vector', 26);

  const weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  g.drawString(weekday[now.getDay()] + "" + now.getDate() + ". " + km.toFixed(1) + "km", 10, 115);

  if (gps_on) {
    if (!last_restart) {
      d = (getTime()-last_pause);
      if (last_fix)
          msg = "PL"+ (getTime()-last_fix).toFixed(0);
      else
          msg = "PN"+ (getTime()-gps_on).toFixed(0);

      print("gps on, paused ", d, gps_needed);
      if (d > gps_needed * 2) {
        gpsRestart();
      }
    } else {
      fix = Bangle.getGPSFix();
      if (fix.fix && fix.lat) {
        if (!prev_fix) {
          prev_fix = fix;
        }
        msg = fix.speed.toFixed(1) + " km/h";
        if (!last_fstart)
          last_fstart = getTime();
        last_fix = getTime();
        gps_needed = 60;
        loggps(fix);
        print("GPS FIX", msg);
        d = calcDistance(fix, prev_fix);
        if (d > 30) {
          prev_fix = fix;
          gps_dist += d/1000;
        }
      } else {
        if (last_fix)
          msg = "L"+ (getTime()-last_fix).toFixed(0);
        else
          msg = "N"+ (getTime()-gps_on).toFixed(0);
      }

      d = (getTime()-last_restart);
      d2 = (getTime()-last_fstart);
      print("gps on, restarted ", d, gps_needed, d2, fix.lat);
      if (d > gps_needed || (last_fstart && d2 > 10)) {
        gpsPause();
        gps_needed = gps_needed * 1.5;
        print("Pausing, next try", gps_needed);
      }
    }
    msg += " "+gps_dist.toFixed(1)+"km";
  } else {
    msg = note;
  }
  g.drawString(msg, 10, 145);
  if (is_active) {
    g.drawString("act " + (cur_altitude - alt_adjust).toFixed(0), 10, 175);
  } else {
    alt_adjust = cur_altitude - rest_altitude;
    g.drawString(alt_adjust.toFixed(0) + "m " + cur_temperature.toFixed(1)+"C", 10, 175);
  }
  queueDraw();
}

function draw_all() {
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, W, H);
  g.setFont('Vector', 36);

  g.setColor(1, 1, 1);
  g.setFontAlign(-1, 1);
  let now = new Date();
  g.drawString(now.getHours() + ":" + add0(now.getMinutes()) + ":" + add0(now.getSeconds()), 10, 40);

  acc = Bangle.getAccel();
  let ax = 0 + acc.x, ay = 0.75 + acc.y, az = 0.75 + acc.y;
  let diff = ax * ax + ay * ay + az * az;
  diff = diff * 3;
  if (diff > 1)
    diff = 1;

  co = Bangle.getCompass();
  step = Bangle.getStepCount();
  bat = E.getBattery();
  Bangle.getPressure().then((x) => { alt = x.altitude; temp = x.temperature; },
                                 print);

  g.setColor(0, 1, 0);
  g.drawCircle(cx, cy, sc);

  if (0) {
    g.setColor(0, 0.25, 0);
    g.fillCircle(cx + sc * acc.x, cy + sc * acc.y, 5);
    g.setColor(0, 0, 0.25);
    g.fillCircle(cx + sc * acc.x, cy + sc * acc.z, 5);
  }
  if (0) {
    print(co.dx, co.dy, co.dz);
    g.setColor(0, 0.25, 0);
    g.fillCircle(cx + sc * co.dx / 300, cy + sc * co.dy / 1500, 5);
    g.setColor(0, 0, 0.25);
    g.fillCircle(cx + sc * co.dx / 300, cy + sc * co.dz / 400, 5);
  }
  if (1) {
    h = co.heading / 360 * 2 * Math.PI;
    g.setColor(0, 0, 0.5);
    g.fillCircle(cx + sc * Math.sin(h), cy + sc * Math.cos(h), 5);
  }

  g.setColor(1, 1, 1);

  g.setFont('Vector', 22);
  g.drawString(now.getDate()+"."+(now.getMonth()+1)+" "+now.getDay(), 3, 60);
  g.drawString(msg, 3, 80);
  g.drawString("S" + step + " B" + Math.round(bat/10) + (Bangle.isCharging()?"c":""), 3, 100);
  g.drawString("A" + Math.round(alt) + " T" + Math.round(temp), 3, 120);
  g.drawString("C" + Math.round(co.heading) + " B" + bpm, 3, 140);

  queueDraw();
}

function accelTask() {
  tm = 100;
  acc = Bangle.getAccel();
  en = !Bangle.isLocked();
  if (en && acc.z < -0.95) {
    msg = "Level";
    buzz = ".-..";
    tm = 3000;
  }
  if (en && acc.x < -0.80) {
    msg = "Down";
    buzz = "-..";
    tm = 3000;
  }
  if (en && acc.x > 0.95) {
    msg = "Up";
    buzz = "..-";
    tm = 3000;
  }

  setTimeout(accelTask, tm);
}

function buzzTask() {
  if (buzz != "") {
    now = buzz[0];
    buzz = buzz.substring(1);
    dot = 100;
    if (now == " ") {
      setTimeout(buzzTask, 300);
    } else if (now == ".") {
      Bangle.buzz(dot, 1);
      setTimeout(buzzTask, 2*dot);
    } else if (now == "-") {
      Bangle.buzz(3*dot, 1);
      setTimeout(buzzTask, 4*dot);
    } else if (now == "/") {
      setTimeout(buzzTask, 6*dot);
    } else print("Unknown character -- ", now, buzz);
  } else
  setTimeout(buzzTask, 60000);
}

function aliveTask() {
  function cmp(s) {
    let d = acc[s] - last_acc[s];
    return d < -0.03 || d > 0.03;
  }
  // HRM seems to detect hand quite nicely
  acc = Bangle.getAccel();
  is_active = false;
  if (cmp("x") || cmp("y") || cmp("z")) {
    print("active");
    is_active = true;
  }
  last_acc = acc;

  setTimeout(aliveTask, 60000);
}

var drawTimeout;

function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  if (0) // FIXME
    next = 60000;
  else
    next =  1000;
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, next - (Date.now() % next));

}

function start() {
  Bangle.on("drag", touchHandler);
  if (0)
    Bangle.on("accel", accelHandler);
  if (0) {
    Bangle.setCompassPower(1, "sixths");
    Bangle.setBarometerPower(1, "sixths");
    Bangle.setHRMPower(1, "sixths");
    Bangle.setGPSPower(1, "sixths");
    Bangle.on("HRM", (hrm) => { bpm = hrm.bpm; } );
  }

  draw();
  buzzTask();
  //accelTask();

  if (1) {
    last_acc = Bangle.getAccel();
    aliveTask();
  }
}

g.reset();
Bangle.setUI();
Bangle.loadWidgets();
Bangle.drawWidgets();
let logfile = require("Storage").open("sixths.egt", "a");

start();
