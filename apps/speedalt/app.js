/*
Speed and Altitude [speedalt]
Mike Bennett mike[at]kereru.com
1.00 : Use new GPS settings module
1.01 : Third mode large clock display
1.02 : add smoothing with kalman filter
*/
//var v = '1.02g';

const BANGLEJS2 = process.env.HWVERSION==2;
const screenH  = g.getHeight();
const screenH_Half        = screenH / 2;
const screenH_Third       = screenH / 3;
const screenH_TwoThirds   = screenH * 2 / 3;
const screenW  = g.getWidth();
const screenW_Half        = screenW / 2;
const fontFactorB2 = 2/3;

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



var buf = Graphics.createArrayBuffer(screenW,screenH_TwoThirds,2,{msb:true});

if (!BANGLEJS2)
require("Font7x11Numeric7Seg").add(Graphics); // Load fonts

var lf = {fix:0,satellites:0};
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var pwrSav = 1;         // 1 = default power saving with watch screen off and GPS to PMOO mode. 0 = screen kept on.
var canDraw = 1;
var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.
var tmrLP;            // Timer for delay in switching to low power after screen turns off

var max = {};
max.spd = 0;
max.alt = 0;
max.n = 0;    // counter. Only start comparing for max after a certain number of fixes to allow kalman filter to have smoohed the data.

var emulator = (process.env.BOARD=="EMSCRIPTEN" || process.env.BOARD=="EMSCRIPTEN2")?1:0;  // 1 = running in emulator. Supplies test values;

var wp = {};        // Waypoint to use for distance from cur position.
//var SATinView = 0;

function nxtWp(inc){
  cfg.wp+=inc;
  loadWp();
}

function loadWp() {
  var w = require("waypoints").load();
  if (cfg.wp>=w.length) cfg.wp=0;
  if (cfg.wp<0) cfg.wp = w.length-1;
  savSettings();
  wp = w[cfg.wp];
}

function radians(a) {
  return a*Math.PI/180;
}

function distance(a,b){
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);

  // Distance in selected units
  var d = Math.sqrt(x*x + y*y) * 6371000;
  d = (d/parseFloat(cfg.dist)).toFixed(2);
  if ( d >= 100 ) d = parseFloat(d).toFixed(1);
  if ( d >= 1000 ) d = parseFloat(d).toFixed(0);

  return d;
}

function drawFix(dat) {

  if (!canDraw) return;

  buf.clear();

  var v = '';
  var u='';

  // Primary Display
  v = (cfg.primSpd)?dat.speed.toString():dat.alt.toString();

  // Primary Units
  u = (cfg.primSpd)?cfg.spd_unit:dat.alt_units;

  drawPrimary(v,u);

  // Secondary Display
  v = (cfg.primSpd)?dat.alt.toString():dat.speed.toString();

  // Secondary Units
  u = (cfg.primSpd)?dat.alt_units:cfg.spd_unit;

  drawSecondary(v,u);

  // Time
  drawTime();

  // Waypoint name
  drawWP();

  //Sats
  if ( dat.age > 10 ) {
    if ( dat.age > 90 ) dat.age = '>90';
    drawSats('Age:'+dat.age);
  }
  else drawSats('Sats:'+dat.sats);

/*  else if (!BANGLEJS2) {
    drawSats('Sats:'+dat.sats);
  } else {
    if (lf.fix) {
      if(emulator)console.log("fix "+lf.fix);
      drawSats('Sats:'+dat.sats);
    } else {
      if(emulator)console.log("inView: "+SATinView);
      drawSats('View:' + SATinView);
    }
  }
*/
  g.reset();
  g.drawImage(img,0,40);

}

function drawClock() {
  if (!canDraw) return;
  buf.clear();
  drawTime();
  drawWP();
  g.reset();
  g.drawImage(img,0,40);
}

function drawPrimary(n,u) {
  if(emulator)console.log("drawPrimary: " + n +" "+ u);
  // Primary Display

  var s=40;    // Font size
  var l=n.length;

  if ( l <= 7 ) s=48;
  if ( l <= 6 ) s=55;
  if ( l <= 5 ) s=66;
  if ( l <= 4 ) s=85;
  if ( l <= 3 ) s=110;

  buf.setFontAlign(0,-1); //Centre
  buf.setColor(1);
  if (BANGLEJS2) s *= fontFactorB2;
  buf.setFontVector(s);
  buf.drawString(n,screenW_Half-10,0);

  // Primary Units
  s = 35;    // Font size
  buf.setFontAlign(1,-1,3); //right
  buf.setColor(2);
  if (BANGLEJS2) s = 20;
  buf.setFontVector(s);
  buf.drawString(u,screenW-30,0);
}

function drawSecondary(n,u) {
  if(emulator)console.log("drawSecondary: " + n +" "+ u);
  var xu = 180;    // units X position
  var l=n.length;
  if ( l <= 5 ) xu = 155;
  if ( l <= 4 ) xu = 125;
  if ( l <= 3 ) xu = 100;
  if ( l <= 2 ) xu = 65;
  if ( l <= 1 ) xu = 35;

  buf.setFontAlign(-1,1); //left, bottom
  buf.setColor(1);
  var s = 45;    // Font size
  if (BANGLEJS2) s *= fontFactorB2;
  buf.setFontVector(s);
  buf.drawString(n,5,screenH_TwoThirds-20);

  // Secondary Units
  buf.setFontAlign(-1,1); //left, bottom

  buf.setColor(2);
  s = 30;    // Font size
  if (BANGLEJS2) s *= fontFactorB2;
  buf.setFontVector(s);
  buf.drawString(u,xu - (BANGLEJS2*xu/5),screenH_TwoThirds-25);
}

function drawTime() {
  var x, y;

  if ( cfg.modeA == 2 ) {
    x = screenW_Half;
    y = 0;
    buf.setFontAlign(0,-1);
    buf.setFontVector(screenH_Third);
  }
  else {
    x = 0;
    y = screenH_TwoThirds;
    buf.setFontAlign(-1,1);
    if (!BANGLEJS2)
    buf.setFont("7x11Numeric7Seg", 2);
    else
    buf.setFont("6x8", 2);
  }


  buf.setColor(0);
  buf.drawString(time,x,y);
  time = require("locale").time(new Date(),1);
  buf.setColor(3);
  buf.drawString(time,x,y);
}

function drawWP() { // from  waypoints.json - see README.md
  var nm = wp.name;
  if ( nm == undefined || nm == 'NONE' || cfg.modeA ==1 ) nm = '';
  if (emulator) nm="waypoint";
  buf.setColor(2);
  var s = 20;    // Font size

  if ( cfg.modeA == 0 ) {  // dist mode
    if(emulator)console.log("drawWP() 0: "+nm);
    buf.setFontAlign(-1,1); //left, bottom
    if (BANGLEJS2) s *= fontFactorB2;
    buf.setFontVector(s);
    buf.drawString(nm.substring(0,6),72,screenH_TwoThirds-(BANGLEJS2 * 15));
  }

  if ( cfg.modeA == 2 ) {  // clock/large mode
    if(emulator)console.log("drawWP() 2: "+nm);
    s = 55;    // Font size
    buf.setFontAlign(0,1); //left, bottom
    if (BANGLEJS2) s *= fontFactorB2;
    buf.setFontVector(s);
    buf.drawString(nm.substring(0,6),screenW_Half,screenH_TwoThirds-(BANGLEJS2 * 20));
  }

}

function drawSats(sats) {

  buf.setColor(3);
  buf.setFont("6x8", 2);
  buf.setFontAlign(1,1); //right, bottom
  buf.drawString(sats,screenW,screenH_TwoThirds);

  s = 30;    // Font size
  if (BANGLEJS2) s = 18;
  buf.setFontVector(s);
  buf.setColor(2);

  if ( cfg.modeA == 1 ) {
    buf.drawString('A',screenW,140-(BANGLEJS2 * 40));
    if ( showMax ) {
      buf.setFontAlign(0,1); //centre, bottom
      buf.drawString('MAX',screenW_Half,screenH_TwoThirds + 4);
    }
  }
  if ( cfg.modeA == 0 ) buf.drawString('D',screenW,140-(BANGLEJS2 * 40));
}

function onGPS(fix) {

 if ( emulator ) {
    fix.fix = 1;
    fix.speed = 10 + (Math.random()*5);
    fix.alt = 354 + (Math.random()*50);
    fix.lat = -38.92;
    fix.lon = 175.7613350;
    fix.course = 245;
    fix.satellites = 12;
    fix.time = new Date();
    fix.smoothed = 0;
  }

  var m;

  var sp = '---';
  var al = '---';
  var di = '---';
  var age = '---';

  if (fix.fix) lf = fix;

    if (lf.fix) {

//    if (BANGLEJS2 && !emulator) Bangle.removeListener('GPS-raw', onGPSraw);

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
    if (parseFloat(sp) > parseFloat(max.spd) && max.n > 15 ) max.spd = parseFloat(sp);

    // Altitude
    al = lf.alt;
    al = Math.round(parseFloat(al)/parseFloat(cfg.alt));
    if (parseFloat(al) > parseFloat(max.alt) && max.n > 15 ) max.alt = parseFloat(al);

    // Distance to waypoint
    di = distance(lf,wp);
    if (isNaN(di)) di = 0;

    // Age of last fix (secs)
    age = Math.max(0,Math.round(getTime())-(lf.time.getTime()/1000));
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
  if ( cfg.modeA == 0 )  {
    // Show speed/distance
    if ( di <= 0 )
      drawFix({
        speed:sp,
        sats:lf.satellites,
        alt:'',
        alt_units:'',
        age:age,
        fix:lf.fix
      }); // No WP selected
    else
      drawFix({
        speed:sp,
        sats:lf.satellites,
        alt:di,
        alt_units:cfg.dist_unit,
        age:age,
        fix:lf.fix
      });
  }
  if ( cfg.modeA == 2 )  {
    // Large clock
    drawClock();
  }

}


function btn1press(longpress) {
    if(emulator) console.log("Btn1, long="+longpress);
    if ( cfg.modeA == 1 ) {  // Spd+Alt mode - Switch between fix and MAX
      if ( !longpress ) showMax = !showMax;   // Short press toggle fix/max display
      else { max.spd = 0; max.alt = 0; }      // Long press resets max values.
    }
    else nxtWp(1);           // Spd+Dist or Clock mode - Select next waypoint
    onGPS(lf);
  }
function btn2press(){
    if(emulator) console.log("Btn2");
    pwrSav=!pwrSav;
    if ( pwrSav ) {
      LED1.reset();
      var s = require('Storage').readJSON('setting.json',1)||{};
      var t = s.timeout||10;
      Bangle.setLCDTimeout(t);
    }
    else {
      Bangle.setLCDTimeout(0);
      Bangle.setLCDPower(1);
      LED1.set();
    }
  }
function btn3press(){
    if(emulator) console.log("Btn3");
    cfg.modeA = cfg.modeA+1;
    if ( cfg.modeA > 2 ) cfg.modeA = 0;
    if(emulator)console.log("cfg.modeA="+cfg.modeA);
    savSettings();
    onGPS(lf);
  }
function btn4press(){
    if(emulator) console.log("Btn4");
    cfg.primSpd = !cfg.primSpd;
    savSettings();
    onGPS(lf);  // Update display
  }


function setButtons(){
if (!BANGLEJS2) {                         // Buttons for Bangle.js 1
  setWatch(function(e) {
     btn1press(( e.time - e.lastTime) > 2); // > 2 sec. is long press
  }, BTN1, { edge:"falling",repeat:true});

  // Power saving on/off (red dot visible if off)
  setWatch(btn2press, BTN2, {repeat:true,edge:"falling"});

  // Toggle between alt or dist
  setWatch(btn3press, BTN3, {repeat:true,edge:"falling"});

  // Touch left screen to toggle display
  setWatch(btn4press, BTN4, {repeat:true,edge:"falling"});

} else {                                  // Buttons for Bangle.js 2
  setWatch(function(e) {
     btn1press(( e.time - e.lastTime) > 0.4); // > 0.4 sec. is long press
  }, BTN1, { edge:"falling",repeat:true});

  Bangle.on('touch', function(btn_l_r, e) {
    if(e.x < screenW_Half) btn4press();
    else
      if (e.y < screenH_Half)
        btn2press();
      else
        btn3press();
  });
  }
}


function updateClock() {
  if (!canDraw) return;
  drawTime();
  g.reset();
  g.drawImage(img,0,40);
  if ( emulator ) {max.spd++;max.alt++;}
}

function startDraw(){
  canDraw=true;
  setLpMode('SuperE'); // off
  g.clear();
  Bangle.drawWidgets();
  onGPS(lf);  // draw app screen
}

function stopDraw() {
  canDraw=false;
  if (!tmrLP) tmrLP=setInterval(function () {if (lf.fix) setLpMode('PSMOO');}, 10000);   //Drop to low power in 10 secs. Keep lp mode off until we have a  first fix.
}

function savSettings() {
  require("Storage").write('speedalt.json',cfg);
}

function setLpMode(m) {
  if (tmrLP) {clearInterval(tmrLP);tmrLP = false;} // Stop any scheduled drop to low power
  if ( !gpssetup ) return;
  gpssetup.setPowerMode({power_mode:m});
}

// =Main Prog

// Read settings.
let cfg = require('Storage').readJSON('speedalt.json',1)||{};

cfg.spd = cfg.spd||0;  // Multiplier for speed unit conversions. 0 = use the locale values for speed
cfg.spd_unit = cfg.spd_unit||'km/h';  // Displayed speed unit
cfg.alt = cfg.alt||1;// Multiplier for altitude unit conversions. (feet:'0.3048')
cfg.alt_unit = cfg.alt_unit||'meter';  // Displayed altitude units ('feet')
cfg.dist = cfg.dist||1000;// Multiplier for distnce unit conversions.
cfg.dist_unit = cfg.dist_unit||'km';  // Displayed altitude units
cfg.colour = cfg.colour||0;          // Colour scheme.
cfg.wp = cfg.wp||0;        // Last selected waypoint for dist
cfg.modeA = cfg.modeA||1;    // 0 = [D]ist, 1 = [A]ltitude, 2 = [C]lock
cfg.primSpd = cfg.primSpd||1;    // 1 = Spd in primary, 0 = Spd in secondary

cfg.spdFilt = cfg.spdFilt==undefined?true:cfg.spdFilt;
cfg.altFilt = cfg.altFilt==undefined?true:cfg.altFilt;

if ( cfg.spdFilt ) var spdFilter = new KalmanFilter({R: 0.1 , Q: 1 });
if ( cfg.altFilt ) var altFilter = new KalmanFilter({R: 0.01, Q: 2 });

loadWp();

/*
Colour Pallet Idx
0 : Background (black)
1 : Speed/Alt
2 : Units
3 : Sats
*/
const background = 0; // g.theme.bg = 0xFFFF = gelb!?
var img = {
  width:buf.getWidth(),
  height:buf.getHeight(),
  bpp:2,
  buffer:buf.buffer,
  palette:new Uint16Array([background,0x4FE0,0xEFE0,0x07DB]) // "Default"
};

if ( cfg.colour == 1 ) img.palette = new Uint16Array([background,0xFFFF,0xFFF6,0xDFFF]); // "Hi contrast"
if ( cfg.colour == 2 ) img.palette = new Uint16Array([background,0xFF800,0xFAE0,0xF813]); // "Night"

var SCREENACCESS = {
      withApp:true,
      request:function(){this.withApp=false;stopDraw();},
      release:function(){this.withApp=true;startDraw();}
};

Bangle.on('lcdPower',function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) startDraw();
  else stopDraw();
});


var gpssetup;
try {
  gpssetup = require("gpssetup");
} catch(e) {
  gpssetup = false;
}

// All set up. Lets go.
g.clear();
onGPS(lf);
Bangle.setGPSPower(1);

if ( gpssetup ) {
  gpssetup.setPowerMode({power_mode:"SuperE"}).then(function() { Bangle.setGPSPower(1); });
}
else {
  Bangle.setGPSPower(1);
}

Bangle.on('GPS', onGPS);

setButtons();
setInterval(updateClock, 10000);
Bangle.loadWidgets();
Bangle.drawWidgets();
