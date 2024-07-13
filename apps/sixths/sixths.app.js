// Sixth sense
/* eslint-disable no-unused-vars */

// Options you'll want to edit
const rest_altitude = 354;

const W = g.getWidth();
const H = g.getHeight();

var cx = 100, cy = 105, sc = 70, temp = 0, alt = 0, bpm = 0;
var buzz = "",      /* Set this to transmit morse via vibrations */
    inm = "", l = "", /* For incoming morse handling */
    in_str = "",
    note = "",
    debug = "v0.04.1", debug2 = "(otherdb)", debug3 = "(short)";
var mode = 0, mode_time = 0; // 0 .. normal, 1 .. note, 2.. mark name
var disp_mode = 0;  // 0 .. normal, 1 .. small time

// GPS handling
var gps_on = 0, // time GPS was turned on
    last_fix = 0, // time of last fix
    last_restart = 0, last_pause = 0, last_fstart = 0; // utime
var gps_needed = 0, // how long to wait for a fix
    gps_limit = 0, // timeout -- when to stop recording
    gps_speed_limit = 0;
var prev_fix = null;
var gps_dist = 0;

var mark_heading = -1;

// Is the human present?
var is_active = false, last_active = getTime() - 14*60, last_unlocked = getTime();
var draw_dot = false;
var is_level = false;

// For altitude handling.
var cur_altitude = 0;
var cur_temperature = 0;

// Marks
var cur_mark = null;

// Icons

var icon_alt = "\0\x08\x1a\1\x00\x00\x00\x20\x30\x78\x7C\xFE\xFF\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00";
//var icon_m = "\0\x08\x1a\1\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00";
var icon_km = "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\x00\x00\x00\x00\x00\x00\x00";
var icon_kph = "\0\x08\x1a\1\xC3\xC6\xCC\xD8\xF0\xD8\xCC\xC6\xC3\x00\xC3\xE7\xFF\xDB\xC3\xC3\xC3\xC3\x00\xFF\x00\xC3\xC3\xFF\xC3\xC3";
var icon_c = "\0\x08\x1a\1\x00\x00\x60\x90\x90\x60\x00\x7F\xFF\xC0\xC0\xC0\xC0\xC0\xFF\x7F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00";

function toMorse(x) {
  let r = "";
  for (var i = 0; i < x.length; i++) {
    let c = x[i];
    if (c == " ") {
      r += " ";
      continue;
    }
    r += asciiToMorse(c) + " ";
  }
  return r;
}
function doBuzz(s) {
  if (buzz == "") {
    buzz = s;
    buzzTask();
  } else
    buzz += s;
}
function aload(s) {
  doBuzz(toMorse(' E'));
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
  last_fix = 0;
  prev_fix = null;
  gps_dist = 0;
  gpsRestart();
}
function gpsOff() {
  Bangle.setGPSPower(0, "sixths");
  gps_on = 0;
}
function fmtDist(km) { return km.toFixed(1) + icon_km; }
function fmtSteps(n) { return fmtDist(0.001 * 0.719 * n); }
function fmtAlt(m) { return m.toFixed(0) + icon_alt; }
function fmtTimeDiff(d) {
  if (d < 180)
    return ""+d.toFixed(0);
  d = d/60;
  return ""+d.toFixed(0)+"m";
}
function gpsHandleFix(fix) {
  if (!prev_fix) {
    show("GPS acquired", 10);
    doBuzz(" .");
    prev_fix = fix;
  }
  if (1) {
    let now1 = Date();
    let now2 = fix.time;
    let n1 = now1.getMinutes() * 60 + now1.getSeconds();
    let n2 = now2.getMinutes() * 60 + now2.getSeconds();
    debug2 = "te "+(n2-n1)+"s";
  }
  loggps(fix);
  let d = calcDistance(fix, prev_fix);
  if (d > 30) {
    prev_fix = fix;
    gps_dist += d/1000;
  }
}
function gpsHandle() {
  let msg = "";
  if (!last_restart) {
      let d = (getTime()-last_pause);
      if (last_fix)
          msg = "PL"+ fmtTimeDiff(getTime()-last_fix);
      else
          msg = "PN"+ fmtTimeDiff(getTime()-gps_on);

      print("gps on, paused ", d, gps_needed);
      if (d > gps_needed * 2) {
        gpsRestart();
      }
    } else {
      let fix = Bangle.getGPSFix();
      if (fix && fix.fix && fix.lat) {
        gpsHandleFix(fix);
        msg = fix.speed.toFixed(1) + icon_kph;
        print("GPS FIX", msg);

        if (!last_fstart)
          last_fstart = getTime();
        last_fix = getTime();
        gps_needed = 60;
      } else {
        if (last_fix)
          msg = "L"+ fmtTimeDiff(getTime()-last_fix);
        else {
          msg = "N"+ fmtTimeDiff(getTime()-gps_on);
          if (fix) {
            msg += " " + fix.satellites + "sats";
          }
        }
      }

      let d = (getTime()-last_restart);
      let d2 = (getTime()-last_fstart);
      print("gps on, restarted ", d, gps_needed, d2, fix.lat);
      if (getTime() > gps_speed_limit &&
          (d > gps_needed || (last_fstart && d2 > 10))) {
        gpsPause();
        gps_needed = gps_needed * 1.5;
        print("Pausing, next try", gps_needed);
      }
    }
  msg += " "+gps_dist.toFixed(1)+icon_km;
  return msg;
}
function markNew() {
  let r = {};
  r.time = getTime();
  r.fix = prev_fix;
  r.steps = Bangle.getHealthStatus("day").steps;
  r.gps_dist = gps_dist;
  r.altitude = cur_altitude;
  r.name = "auto";
  return r;
}
function markHandle() {
  let m = cur_mark;
  let msg = m.name + ">";
  if (m.time) {
    msg += fmtTimeDiff(getTime()- m.time);
  }
  if (prev_fix && prev_fix.fix && m.fix && m.fix.fix) {
    let s = fmtDist(calcDistance(m.fix, prev_fix)/1000) + icon_km;
    msg += " " + s;
    debug = "wp>" + s;
    mark_heading = 180 + calcBearing(m.fix, prev_fix);
    debug2 = "wp>" + mark_heading;
  } else {
    msg += " w" + fmtDist(gps_dist - m.gps_dist);
  }
  return msg;
}
function entryDone() {
  show(":" + in_str);
  doBuzz(" .");
  switch (mode) {
  case 1: logstamp(">" + in_str); break;
  case 2: cur_mark.name = in_str; break;
  }
  in_str = 0;
  mode = 0;
}
var waypoints = [], sel_wp = 0;
function loadWPs() {
  waypoints = require("Storage").readJSON(`waypoints.json`)||[{}];
  print("Have waypoints", waypoints);
}
function saveWPs() {
  require("Storage").writeJSON(`waypoints.json`,waypoints);
}
function selectWP(i) {
  sel_wp += i;
  if (sel_wp < 0)
    sel_wp = 0;
  if (sel_wp >= waypoints.length)
    sel_wp = waypoints.length - 1;
  if (sel_wp < 0) {
    show("No WPs", 60);
  }
  let wp = waypoints[sel_wp];
  cur_mark = {};
  cur_mark.name = wp.name;
  cur_mark.gps_dist = 0; /* HACK */
  cur_mark.fix = {};
  cur_mark.fix.fix = 1;
  cur_mark.fix.lat = wp.lat;
  cur_mark.fix.lon = wp.lon; 
  show("WP:"+wp.name, 60);
  print("Select waypoint: ", cur_mark);
}
function inputHandler(s) {
  print("Ascii: ", s, s[0], s[1]);
  if (s[0] == '^') {
    switch (s[1]) {
    case 'E': mode = 0; break;
    case 'T': entryDone(); break;
    }
    return;
  }
  if ((mode == 1) || (mode == 2)){
    in_str = in_str + s;
    show(">"+in_str, 10);
    mode_time = getTime();
    return;
  }
  switch(s) {
    case 'B': {
      s = ' B';
      let bat = E.getBattery();
      if (bat > 45)
        s += 'E';
      else
        s = s+(bat/5);
      doBuzz(toMorse(s));
      show("Bat "+bat+"%", 60);
      break;
    }
    case 'D': selectWP(1); break;
    case 'F': gpsOff(); show("GPS off", 3); break;
    case 'G': gpsOn(); gps_limit = getTime() + 60*60*4; show("GPS on", 3); break;
    case 'I':
      disp_mode += 1;
      if (disp_mode == 2) {
        disp_mode = 0;
      }
      break;
    case 'L': aload("altimeter.app.js"); break;
    case 'M': mode = 2; show("M>", 10); cur_mark = markNew(); mode_time = getTime(); break;
    case 'N': mode = 1; show(">", 10); mode_time = getTime(); break;
    case 'O': aload("orloj.app.js"); break;
    case 'R': aload("runplus.app.js"); break;
    case 'S': gpsOn(); gps_limit = getTime() + 60*30; gps_speed_limit = gps_limit; show("GPS on", 3); break;
    case 'T': {
      s = ' T';
      let d = new Date();
      s += d.getHours() % 10;
      s += add0(d.getMinutes());
      doBuzz(toMorse(s));
      break;
    }
    case 'U': selectWP(-1); break;
    case 'Y': doBuzz(buzz); Bangle.resetCompass(); break;
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
  if (inm[0] == "^") {
    inputHandler("^"+morseToAscii(inm.substr(1)));
  } else {
    inputHandler(morseToAscii(inm));
  }

  inm = "";
  l = "";
}
function touchHandler(d) {
  let x = Math.floor(d.x);
  let y = Math.floor(d.y);

  if (1) { /* Just a debugging feature */
    g.setColor(0.25, 0, 0);
    if (0)
      g.fillCircle(W-x, W-y, 5);
    else
      g.fillCircle(x, y, 5);
  }
  if (!d.b) {
    morseHandler();
    l = "";
    return;
  }
  if (y > H/2 && l == "") {
    inm = "^";
  }
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

  //print(inm, "drag:", d);
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
  let s = ' T';
  let bat = E.getBattery();
  if (bat < 25) {
      s = ' B';
      show("Bat "+bat+"%", 60);
  }
  if (is_active)
    doBuzz(toMorse(s));
  //logstamp("");
}
function show(msg, timeout) {
  note = msg;
}
function fivemin() {
  print("fivemin");
  let s = ' B';
  try {
    Bangle.getPressure().then((x) => { cur_altitude = x.altitude;
                                     cur_temperature = x.temperature; },
                              print);
  } catch (e) {
    print("Altimeter error", e);
  }

}
function every(now) {
  if ((mode > 0) && (getTime() - mode_time > 10)) {
    if (mode == 1) {
      entryDone();
    }
    mode = 0;
  }
  if (gps_on && getTime() > gps_limit && getTime() > gps_speed_limit) {
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

function radians(a) { return a*Math.PI/180; }
function degrees(a) { return a*180/Math.PI; }
// distance between 2 lat and lons, in meters, Mean Earth Radius = 6371km
// https://www.movable-type.co.uk/scripts/latlong.html
// (Equirectangular approximation)
function calcDistance(a,b) {
  var x = radians(b.lon-a.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.sqrt(x*x + y*y) * 6371000;
}
// thanks to waypointer
function calcBearing(a,b){
  var delta = radians(b.lon-a.lon);
  var alat = radians(a.lat);
  var blat = radians(b.lat);
  var y = Math.sin(delta) * Math.cos(blat);
  var x = Math.cos(alat)*Math.sin(blat) -
        Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
}
function testBearing() {
  let p1 = {}, p2 = {};
  p1.lat = 40; p2.lat = 50;
  p1.lon = 14; p2.lon = 14;
  print("bearing = ", calcBearing(p1, p2));
}

function radA(p) { return p*(Math.PI*2); }
function radD(d) { return d*(H/2); }
function radX(p, d) {
  let a = radA(p);
  return H/2 + Math.sin(a)*radD(d);
}
function radY(p, d) {
  let a = radA(p);
  return W/2 - Math.cos(a)*radD(d);
}
function drawDot(h, d, s) {
  let x = radX(h/360, d);
  let y = radY(h/360, d);
  g.fillCircle(x,y, 10);
}
function drawBackground() {
  let acc = Bangle.getAccel();
  is_level = (acc.z < -0.95);
  Bangle.setCompassPower(!!is_level, "sixths");
  if (is_level) {
    let obj = Bangle.getCompass();
    if (obj) {
      let h = 360-obj.heading;
      print("Compass", h);
      g.setColor(0.5, 0.5, 1);
      drawDot(h, 0.7, 10);
    }
  }
  if (prev_fix && prev_fix.fix) {
    g.setColor(0.5, 1, 0.5);
    drawDot(prev_fix.course, 0.5, 6);
  }
  if (mark_heading != -1) {
    g.setColor(1, 0.5, 0.5);
    drawDot(mark_heading, 0.6, 8);
  }
}
function drawTime(now) {
  if (disp_mode == 0)
    g.setFont('Vector', 60);
  else
    g.setFont('Vector', 26);
  g.setFontAlign(1, 1);
  draw_dot = !draw_dot;
  let dot = ":";
  if (!draw_dot)
    dot = ".";
  g.drawString(now.getHours() + dot + add0(now.getMinutes()), W, 90);
}
function draw() {
  if (disp_mode == 2) {
    draw_all();
    return;
  }
  g.setColor(1, 1, 1);
  g.fillRect(0, 24, W, H);

  if (0) {
    g.setColor(0.25, 1, 1);
    g.fillPoly([ W/2, 24, W, 80, 0, 80 ]);
  }
  let msg = "";
  if (gps_on) {
    msg = gpsHandle();
  } else {
    let o = Bangle.getOptions();
    msg = o.seaLevelPressure.toFixed(1) + "hPa";
    if (note != "") {
      msg = note;
    }
  }
  drawBackground();

  let now = new Date();
  g.setColor(0, 0, 0);
  drawTime(now);

  every(now);

  //let km = 0.001 * 0.719 * Bangle.getHealthStatus("day").steps;

  g.setFontAlign(-1, 1);
  g.setFont('Vector', 26);

  const weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  g.drawString(weekday[now.getDay()] + "" + now.getDate() + ". "
               + fmtSteps(Bangle.getHealthStatus("day").steps), 10, 115);

  g.drawString(msg, 10, 145);

  if (getTime() - last_active > 15*60) {
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
  } else {
    msg = fmtAlt(cur_altitude);
  }
  msg = msg + " " + cur_temperature.toFixed(1)+icon_c;
  if (cur_mark) {
    msg = markHandle();
  }
  g.drawString(msg, 10, 175);

  if (disp_mode == 1) {
    g.drawString(debug, 10, 45);
    g.drawString(debug2, 10, 65);
    g.drawString(debug3, 10, 85);
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

  let acc = Bangle.getAccel();
  let ax = 0 + acc.x, ay = 0.75 + acc.y, az = 0.75 + acc.y;
  let diff = ax * ax + ay * ay + az * az;
  diff = diff * 3;
  if (diff > 1)
    diff = 1;

  let co = Bangle.getCompass();
  let step = Bangle.getStepCount();
  let bat = E.getBattery();
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
    let h = co.heading / 360 * 2 * Math.PI;
    g.setColor(0, 0, 0.5);
    g.fillCircle(cx + sc * Math.sin(h), cy + sc * Math.cos(h), 5);
  }

  g.setColor(1, 1, 1);

  g.setFont('Vector', 22);
  g.drawString(now.getDate()+"."+(now.getMonth()+1)+" "+now.getDay(), 3, 60);
  g.drawString("(message here)", 3, 80);
  g.drawString("S" + step + " B" + Math.round(bat/10) + (Bangle.isCharging()?"c":""), 3, 100);
  g.drawString("A" + Math.round(alt) + " T" + Math.round(temp), 3, 120);
  g.drawString("C" + Math.round(co.heading) + " B" + bpm, 3, 140);

  queueDraw();
}
function accelTask() {
  let tm = 100;
  let acc = Bangle.getAccel();
  let en = !Bangle.isLocked();
  let msg = "";
  if (en && acc.z < -0.95) {
    msg = "Level";
    doBuzz(".-..");
    tm = 3000;
  }
  if (en && acc.x < -0.80) {
    msg = "Down";
    doBuzz("-..");
    tm = 3000;
  }
  if (en && acc.x > 0.95) {
    msg = "Up";
    doBuzz("..-");
    tm = 3000;
  }
  print(msg);
  setTimeout(accelTask, tm);
}
function buzzTask() {
  if (buzz != "") {
    let now = buzz[0];
    buzz = buzz.substring(1);
    let dot = 100;
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
  }
}
var last_acc;
function aliveTask() {
  function cmp(s) {
    let d = acc[s] - last_acc[s];
    return d < -0.03 || d > 0.03;
  }
  // HRM seems to detect hand quite nicely
  let acc = Bangle.getAccel();
  is_active = false;
  if (cmp("x") || cmp("y") || cmp("z")) {
    print("active");
    is_active = true;
    last_active = getTime();
  }
  last_acc = acc;

  setTimeout(aliveTask, 60000);
}
function lockHandler(locked) {
  if (!locked) {
    last_unlocked = getTime();
    draw();
  }
}

function queueDraw() {
  let next;
  if (getTime() - last_unlocked > 3*60)
    next = 60000;
  else
    next =  1000;
  setTimeout(draw, next - (Date.now() % next));
}
function start() {
  g.reset();
  Bangle.setUI({
    mode : "clock"
  });
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  Bangle.on("drag", touchHandler);
  Bangle.on("lock", lockHandler);
  if (0) {
    Bangle.setCompassPower(1, "sixths");
    Bangle.setBarometerPower(1, "sixths");
  }
  if (0) {
    Bangle.setHRMPower(1, "sixths");
    Bangle.setGPSPower(1, "sixths");
    Bangle.on("HRM", (hrm) => { bpm = hrm.bpm; } );
  }

  draw();
  loadWPs();
  buzzTask();
  if (0)
      accelTask();

  if (1) {
    last_acc = Bangle.getAccel();
    aliveTask();
  }
}

let logfile = require("Storage").open("sixths.egt", "a");

if (0) {
  testBearing();
} else
  start();
