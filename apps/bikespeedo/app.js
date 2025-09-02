// Bike Speedometer by https://github.com/HilmarSt
// Big parts of this software are based on https://github.com/espruino/BangleApps/tree/master/apps/speedalt
// Compass and Compass Calibration based on https://github.com/espruino/BangleApps/tree/master/apps/magnav

const BANGLEJS2 = 1;
const screenH  = g.getHeight();
const screenYstart = 24; // 0..23 for widgets
const screenY_Half        = screenH / 2     + screenYstart;
const screenW  = g.getWidth();
const screenW_Half        = screenW / 2;
const fontFactorB2 = 2/3;
const colfg=g.theme.fg, colbg=g.theme.bg;
const col1=colfg, colUncertain="#88f"; // if (lf.fix) g.setColor(col1); else g.setColor(colUncertain);

var altiBaro=0;
var hdngGPS=0, hdngCompass=0, calibrateCompass=false;

/*kalmanjs, Wouter Bulten, MIT, https://github.com/wouterbulten/kalmanjs */
var KalmanFilter = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
  * KalmanFilter
  * @class
  * @author Wouter Bulten
  * @see {@link http://github.com/wouterbulten/kalmanjs}
  * @version Version: 1.0.0-beta
  * @copyright Copyright 2015-2018 Wouter Bulten
  * @license MIT License
  * @preserve
  */
  var KalmanFilter =
  /*#__PURE__*/
  function () {
    /**
    * Create 1-dimensional kalman filter
    * @param  {Number} options.R Process noise
    * @param  {Number} options.Q Measurement noise
    * @param  {Number} options.A State vector
    * @param  {Number} options.B Control vector
    * @param  {Number} options.C Measurement vector
    * @return {KalmanFilter}
    */
    function KalmanFilter() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$R = _ref.R,
          R = _ref$R === void 0 ? 1 : _ref$R,
          _ref$Q = _ref.Q,
          Q = _ref$Q === void 0 ? 1 : _ref$Q,
          _ref$A = _ref.A,
          A = _ref$A === void 0 ? 1 : _ref$A,
          _ref$B = _ref.B,
          B = _ref$B === void 0 ? 0 : _ref$B,
          _ref$C = _ref.C,
          C = _ref$C === void 0 ? 1 : _ref$C;

      _classCallCheck(this, KalmanFilter);

      this.R = R; // noise power desirable

      this.Q = Q; // noise power estimated

      this.A = A;
      this.C = C;
      this.B = B;
      this.cov = NaN;
      this.x = NaN; // estimated signal without noise
    }
    /**
    * Filter a new value
    * @param  {Number} z Measurement
    * @param  {Number} u Control
    * @return {Number}
    */


    _createClass(KalmanFilter, [{
      key: "filter",
      value: function filter(z) {
        var u = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        if (isNaN(this.x)) {
          this.x = 1 / this.C * z;
          this.cov = 1 / this.C * this.Q * (1 / this.C);
        } else {
          // Compute prediction
          var predX = this.predict(u);
          var predCov = this.uncertainty(); // Kalman gain

          var K = predCov * this.C * (1 / (this.C * predCov * this.C + this.Q)); // Correction

          this.x = predX + K * (z - this.C * predX);
          this.cov = predCov - K * this.C * predCov;
        }

        return this.x;
      }
      /**
      * Predict next value
      * @param  {Number} [u] Control
      * @return {Number}
      */

    }, {
      key: "predict",
      value: function predict() {
        var u = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return this.A * this.x + this.B * u;
      }
      /**
      * Return uncertainty of filter
      * @return {Number}
      */

    }, {
      key: "uncertainty",
      value: function uncertainty() {
        return this.A * this.cov * this.A + this.R;
      }
      /**
      * Return the last filtered measurement
      * @return {Number}
      */

    }, {
      key: "lastMeasurement",
      value: function lastMeasurement() {
        return this.x;
      }
      /**
      * Set measurement noise Q
      * @param {Number} noise
      */

    }, {
      key: "setMeasurementNoise",
      value: function setMeasurementNoise(noise) {
        this.Q = noise;
      }
      /**
      * Set the process noise R
      * @param {Number} noise
      */

    }, {
      key: "setProcessNoise",
      value: function setProcessNoise(noise) {
        this.R = noise;
      }
    }]);

    return KalmanFilter;
  }();

  return KalmanFilter;

}());


//==================================== MAIN ====================================

var lf = {fix:0,satellites:0};
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.
var sec; // actual seconds for testing purposes

var max = {};
max.spd = 0;
max.alt = 0;
max.n = 0;    // counter. Only start comparing for max after a certain number of fixes to allow kalman filter to have smoohed the data.

var emulator = (process.env.BOARD=="EMSCRIPTEN" || process.env.BOARD=="EMSCRIPTEN2")?1:0;  // 1 = running in emulator. Supplies test values;

var SATinView = 0;

function drawFix(dat) {
  g.reset().clearRect(0,screenYstart,screenW,screenH);

  var v = '';
  var u='';

  // Primary Display
  v = (cfg.primSpd)?dat.speed.toString():dat.alt.toString();

  // Primary Units
  u = (showMax ? 'max ' : '') + (cfg.primSpd?cfg.spd_unit:dat.alt_units);

  drawPrimary(v,u);

  // Secondary Display
  v = (cfg.primSpd)?dat.alt.toString():dat.speed.toString();

  // Secondary Units
  u = (cfg.primSpd)?dat.alt_units:cfg.spd_unit;

  drawSecondary(v,u);

  // Time
  drawTime();

  //Sats
  if ( dat.age > 10 ) {
    if ( dat.age > 90 ) dat.age = '>90';
    drawSats('Age:'+dat.age);
  }
  else if (!BANGLEJS2) {
    drawSats('Sats:'+dat.sats);
  } else {
    if (lf.fix) {
      drawSats('Sats:'+dat.sats);
    } else {
      drawSats('View:' + SATinView);
    }
  }
}


function drawPrimary(n,u) {
  //if(emulator)console.log("\n1: " + n +" "+ u);
  var s=40;    // Font size
  var l=n.length;

  if ( l <= 7 ) s=48;
  if ( l <= 6 ) s=55;
  if ( l <= 5 ) s=66;
  if ( l <= 4 ) s=85;
  if ( l <= 3 ) s=110;

  // X -1=left (default), 0=center, 1=right
  // Y -1=top (default), 0=center, 1=bottom
  g.setFontAlign(0,-1); // center, top
  if (lf.fix) g.setColor(col1); else g.setColor(colUncertain);
  if (BANGLEJS2) s *= fontFactorB2;
  g.setFontVector(s);
  g.drawString(n, screenW_Half - 10, screenYstart);

  // Primary Units
  s = 35;    // Font size
  g.setFontAlign(1,-1,3); // right, top, rotate
  g.setColor(col1);
  if (BANGLEJS2) s = 20;
  g.setFontVector(s);
  g.drawString(u, screenW - 20, screenYstart + 2);
}


function drawSecondary(n,u) {
  //if(emulator)console.log("2: " + n +" "+ u);

  if (calibrateCompass) hdngCompass = "CALIB!";
  else hdngCompass +="°";

  g.setFontAlign(0,1);
  g.setColor(col1);

  g.setFontVector(12).drawString("Altitude GPS / Barometer", screenW_Half - 5, screenY_Half - 10);
  g.setFontVector(20);
  g.drawString(n+" "+u+" / "+altiBaro+" "+u, screenW_Half, screenY_Half + 11);

  g.setFontVector(12).drawString("Heading GPS / Compass", screenW_Half - 10, screenY_Half + 26);
  g.setFontVector(20);
  g.drawString(hdngGPS+"° / "+hdngCompass, screenW_Half, screenY_Half + 47);
}


function drawTime() {
  var x = 0, y = screenH;
  g.setFontAlign(-1,1); // left, bottom
  g.setFont("6x8", 2);

  g.setColor(colbg);
  g.drawString(time,x+1,y); // clear old time

  time = require("locale").time(new Date(),1);

  g.setColor(colfg); // draw new time
  g.drawString(time,x+2,y);
}


function drawSats(sats) {

  g.setColor(col1);
  g.setFont("6x8", 2);
  g.setFontAlign(1,1); //right, bottom
  g.drawString(sats,screenW,screenH);
}

function onGPS(fix) {

 if ( emulator ) {
    fix.fix = 1;
    fix.speed = Math.random()*30; // calmed by Kalman filter if cfg.spdFilt
    fix.alt = Math.random()*200 -20; // calmed by Kalman filter if cfg.altFilt
    fix.lat = 50.59; // google.de/maps/@50.59,8.53,17z
    fix.lon = 8.53;
    fix.course = 365;
    fix.satellites = sec;
    fix.time = new Date();
    fix.smoothed = 0;
  }

  var m;

  var sp = '---';
  var al = '---';
  var age = '---';

  if (fix.fix) lf = fix;

  hdngGPS = lf.course;
  if (isNaN(hdngGPS)) hdngGPS = "---";
  else if (0 == hdngGPS) hdngGPS = "0?";
    else hdngGPS = hdngGPS.toFixed(0);

  if (emulator) hdngCompass = hdngGPS;
  if (emulator) altiBaro = lf.alt.toFixed(0);

  if (lf.fix) {

    if (BANGLEJS2 && !emulator) Bangle.removeListener('GPS-raw', onGPSraw);

    // Smooth data
    if ( lf.smoothed !== 1 ) {
      if ( cfg.spdFilt ) lf.speed = spdFilter.filter(lf.speed);
      if ( cfg.altFilt ) lf.alt = altFilter.filter(lf.alt);
      lf.smoothed = 1;
      if ( max.n <= 15 ) max.n++;
    }


    // Speed
    if ( cfg.spd == 0 ) {
      m = require("locale").speed(lf.speed).match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
      sp = parseFloat(m[1]);
      cfg.spd_unit = m[2];
    }
    else sp = parseFloat(lf.speed)/parseFloat(cfg.spd); // Calculate for selected units

    if ( sp < 10 ) sp = sp.toFixed(1);
    else sp = Math.round(sp);
    if (isNaN(sp)) sp = '---';

    if (parseFloat(sp) > parseFloat(max.spd) && max.n > 15 ) max.spd = parseFloat(sp);

    // Altitude
    al = lf.alt;
    al = Math.round(parseFloat(al)/parseFloat(cfg.alt));
    if (parseFloat(al) > parseFloat(max.alt) && max.n > 15 ) max.alt = parseFloat(al);

    // Age of last fix (secs)
    age = Math.max(0,Math.round(getTime())-(lf.time.getTime()/1000));
  } else {
    // populate spd_unit
    if (cfg.spd == 0) {
      m = require("locale").speed(0).match(/[0-9,\.]+(.*)/);
      cfg.spd_unit = m[1];
    }
  }

  if ( cfg.modeA == 1 ) {
    if ( showMax )
      drawFix({
        speed:max.spd,
        sats:lf.satellites,
        alt:max.alt,
        alt_units:cfg.alt_unit,
        age:age,
        fix:lf.fix
      }); // Speed and alt maximums
    else
      drawFix({
        speed:sp,
        sats:lf.satellites,
        alt:al,
        alt_units:cfg.alt_unit,
        age:age,
        fix:lf.fix
      }); // Show speed/altitude
  }
}

function updateClock() {
  g.reset();
  drawTime();

  if ( emulator ) {
    max.spd++; max.alt++;
    const d=new Date();
    sec=d.getSeconds();
    onGPS(lf);
  }
}


// =Main Prog

// Read settings.
let cfg = require('Storage').readJSON('bikespeedo.json',1)||{};

cfg.spd = cfg.localeUnits ? 0 : 1;  // Multiplier for speed unit conversions. 0 = use the locale values for speed
cfg.spd_unit = 'km/h';  // Displayed speed unit
cfg.alt = 1; // Multiplier for altitude unit conversions. (feet:'0.3048')
cfg.alt_unit = 'm';  // Displayed altitude units ('feet')
cfg.dist = 1000; // Multiplier for distnce unit conversions.
cfg.dist_unit = 'km';  // Displayed distnce units
cfg.modeA = 1;
cfg.primSpd = 1;    // 1 = Spd in primary, 0 = Spd in secondary

cfg.altDiff = cfg.altDiff==undefined?100:cfg.altDiff;
cfg.spdFilt = cfg.spdFilt==undefined?true:cfg.spdFilt;
cfg.altFilt = cfg.altFilt==undefined?false:cfg.altFilt;
// console.log("cfg.altDiff: " + cfg.altDiff);
// console.log("cfg.spdFilt: " + cfg.spdFilt);
// console.log("cfg.altFilt: " + cfg.altFilt);

if ( cfg.spdFilt ) var spdFilter = new KalmanFilter({R: 0.1 , Q: 1 });
if ( cfg.altFilt ) var altFilter = new KalmanFilter({R: 0.01, Q: 2 });

function onGPSraw(nmea) {
  var nofGP = 0, nofBD = 0, nofGL = 0;
  if (nmea.slice(3,6) == "GSV") {
    // console.log(nmea.slice(1,3) + "  " + nmea.slice(11,13));
    if (nmea.slice(0,7) == "$GPGSV,") nofGP = Number(nmea.slice(11,13));
    if (nmea.slice(0,7) == "$BDGSV,") nofBD = Number(nmea.slice(11,13));
    if (nmea.slice(0,7) == "$GLGSV,") nofGL = Number(nmea.slice(11,13));
    SATinView = nofGP + nofBD + nofGL;
  } }
if(BANGLEJS2) Bangle.on('GPS-raw', onGPSraw);

function onPressure(dat) {
  altiBaro = Number(dat.altitude.toFixed(0)) + Number(cfg.altDiff);
}

var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;
if (!CALIBDATA) calibrateCompass = true;
function Compass_tiltfixread(O,S){
  "ram";
  //console.log(O.x+" "+O.y+" "+O.z);
  var m = Bangle.getCompass();
  var g = Bangle.getAccel();
  m.dx =(m.x-O.x)*S.x; m.dy=(m.y-O.y)*S.y; m.dz=(m.z-O.z)*S.z;
  var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
  if (d<0) d+=360;
  var phi = Math.atan(-g.x/-g.z);
  var cosphi = Math.cos(phi), sinphi = Math.sin(phi);
  var theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
  var costheta = Math.cos(theta), sintheta = Math.sin(theta);
  var xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
  var yh = m.dz*sinphi - m.dx*cosphi;
  var psi = Math.atan2(yh,xh)*180/Math.PI;
  if (psi<0) psi+=360;
  return psi;
}
var Compass_heading = 0;
function Compass_newHeading(m,h){
    var s = Math.abs(m - h);
    var delta = (m>h)?1:-1;
    if (s>=180){s=360-s; delta = -delta;}
    if (s<2) return h;
    var hd = h + delta*(1 + Math.round(s/5));
    if (hd<0) hd+=360;
    if (hd>360)hd-= 360;
    return hd;
}
function Compass_reading() {
  "ram";
  var d = Compass_tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
  Compass_heading = Compass_newHeading(d,Compass_heading);
  hdngCompass = Compass_heading.toFixed(0);
}

function nextMode() {
  showMax = 1 - showMax;
}

function start() {
  Bangle.setBarometerPower(1); // needs some time...
  g.reset().clearRect(0,screenYstart,screenW,screenH);
  onGPS(lf);
  Bangle.setGPSPower(1);
  Bangle.on('GPS', onGPS);
  Bangle.on('pressure', onPressure);

  Bangle.setCompassPower(1);
  if (!calibrateCompass) setInterval(Compass_reading,200);

  if (emulator) setInterval(updateClock, 2000);
  else setInterval(updateClock, 10000);

  let createdRecording = false;
  Bangle.setUI({
    mode: "custom",
    touch: nextMode,
    btn: () => {
      const rec = WIDGETS["recorder"];
      if(rec){
        const active = rec.isRecording();
        if(active){
          createdRecording = true;
          rec.setRecording(false);
        }else{
          rec.setRecording(true, { force: createdRecording ? "append" : "new" });
        }
      }else{
        nextMode();
      }
    },
  });

  // can't delay loadWidgets til here - need to have already done so for recorder
  Bangle.drawWidgets();
}

Bangle.loadWidgets();
if (cfg.record && WIDGETS["recorder"]) {
  WIDGETS["recorder"]
    .setRecording(true)
    .then(start);

  if (cfg.recordStopOnExit)
    E.on('kill', () => WIDGETS["recorder"].setRecording(false));

} else {
  start();
}
