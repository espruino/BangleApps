/*
Speed and Altitude [speedalt2]
Mike Bennett mike[at]kereru.com
1.10 : add inverted colours
*/
var v = '1.10';

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


var buf = Graphics.createArrayBuffer(240,160,2,{msb:true});

let LED = // LED as minimal and only definition (as instance / singleton)
{ isOn: false // status on / off, not needed if you don't need to ask for it
, set: function(v) { // turn on w/ no arg or truey, else off
   g.setColor((this.isOn=(v===undefined||!!v))?1:0,0,0).fillCircle(40,10,10); }
, reset: function() { this.set(false); } // turn off
, write: function(v) { this.set(v); }  // turn on w/ no arg or truey, else off
, toggle: function() { this.set( ! this.isOn); } // toggle the LED
}, LED1 = LED; // LED1 as 'synonym' for LED 

// Load fonts
//require("Font7x11Numeric7Seg").add(Graphics);

var lf = {fix:0,satellites:0};
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var pwrSav = 1;         // 1 = default power saving with watch screen off and GPS to PMOO mode. 0 = screen kept on.
var canDraw = 1;
var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.
var tmrLP;            // Timer for delay in switching to low power after screen turns off

var maxSpd = 0;
var maxAlt = 0;
var maxN = 0;    // counter. Only start comparing for max after a certain number of fixes to allow kalman filter to have smoohed the data.

var emulator = (process.env.BOARD=="EMSCRIPTEN")?1:0;  // 1 = running in emulator. Supplies test values;

var wp = {};        // Waypoint to use for distance from cur position.

function nxtWp(){
  cfg.wp++;
  loadWp();
}

function loadWp() {
  var w = require("Storage").readJSON('waypoints.json')||[{name:"NONE"}];
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

function drawScrn(dat) {

  if (!canDraw) return;

  buf.clear();
  buf.setBgColor(0);
  
  var n;
  n = dat.val.toString();
  
  var s=50;    // Font size
  var l=n.length;
  
  if ( l <= 7 ) s=55;
  if ( l <= 6 ) s=60;
  if ( l <= 5 ) s=80;
  if ( l <= 4 ) s=100;
  if ( l <= 3 ) s=120;
        
  buf.setFontAlign(0,0); //Centre 
  buf.setColor(1);  
  buf.setFontVector(s);
  buf.drawString(n,126,52);

  
  // Primary Units
  buf.setFontAlign(-1,1); //left, bottom
  buf.setColor(2);  
  buf.setFontVector(35);
  buf.drawString(dat.unit,5,164);  
  
  drawMax(dat.max); // MAX display indicator
  drawWP(dat.wp);  // Waypoint name
  drawSats(dat.sats);
   
  g.reset();
  g.drawImage(img,0,40);
  
  LED1.write(!pwrSav);

}

function drawPosn(dat) {
  if (!canDraw) return;
  buf.clear();
  buf.setBgColor(0);

  var x, y;
  x=210;
  y=0;
  buf.setFontAlign(1,-1); 
  buf.setFontVector(60);
  buf.setColor(1);

  buf.drawString(dat.lat,x,y);
  buf.drawString(dat.lon,x,y+70);

  x = 240;
  buf.setColor(2);
  buf.setFontVector(40);
  buf.drawString(dat.ns,x,y);
  buf.drawString(dat.ew,x,y+70);


  drawSats(dat.sats);

  g.reset();
  g.drawImage(img,0,40);

  LED1.write(!pwrSav);

}

function drawClock() {
  if (!canDraw) return;
  
  buf.clear();
  buf.setBgColor(0);
  
  var x, y;
  x=185;
  y=0;
  buf.setFontAlign(1,-1); 
  buf.setFontVector(94);
  time = require("locale").time(new Date(),1);
  
  buf.setColor(1);
  
  buf.drawString(time.substring(0,2),x,y);
  buf.drawString(time.substring(3,5),x,y+80);
  
  g.reset();
  g.drawImage(img,0,40);
  
  LED1.write(!pwrSav);
}

function drawWP(wp) {
  buf.setColor(3);  
  buf.setFontAlign(0,1); //left, bottom
  buf.setFontVector(48);
  buf.drawString(wp,120,140);  
}

function drawSats(sats) {
  buf.setColor(3);  
  buf.setFont("6x8", 2);
  buf.setFontAlign(1,1); //right, bottom
  buf.drawString(sats,240,160);  
}

function drawMax(max) {
  buf.setFontVector(30);
  buf.setColor(2); 
  buf.setFontAlign(0,1); //centre, bottom
  buf.drawString(max,120,164);
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
  var lat = '---.--';
  var ns = '';
  var ew = '';
  var lon = '---.--';
  var sats = '---';
  
  // Waypoint name
  var wpName = wp.name;
  if ( wpName == undefined || wpName == 'NONE' ) wpName = '';
  wpName = wpName.substring(0,8);  

  if (fix.fix) lf = fix;
  
  if (lf.fix) {

    // Smooth data
    if ( lf.smoothed !== 1 ) {
      if ( cfg.spdFilt ) lf.speed = spdFilter.filter(lf.speed);
      if ( cfg.altFilt ) lf.alt = altFilter.filter(lf.alt);
      lf.smoothed = 1;
      if ( maxN <= 15 ) maxN++;
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
    
    if (parseFloat(sp) > parseFloat(maxSpd) && maxN > 15 ) maxSpd = sp;

    // Altitude
    al = lf.alt;
    al = Math.round(parseFloat(al)/parseFloat(cfg.alt));
    if (parseFloat(al) > parseFloat(maxAlt) && maxN > 15 ) maxAlt = al;
    if (isNaN(al)) al = '---';

    // Distance to waypoint
    di = distance(lf,wp);
    if (isNaN(di)) di = '--------';

    // Age of last fix (secs)
    age = Math.max(0,Math.round(getTime())-(lf.time.getTime()/1000));

    // Lat / Lon
    ns = 'N';
    if ( lf.lat < 0 ) ns = 'S';
    lat = Math.abs(lf.lat.toFixed(2)); 

    ew = 'E';
    if ( lf.lon < 0 ) ew = 'W';
    lon = Math.abs(lf.lon.toFixed(2)); 
    
    // Sats
    if ( age > 10 ) {
      sats = 'Age:'+Math.round(age);
      if ( age > 90 ) sats = 'Age:>90';
    }
    else sats = 'Sats:'+lf.satellites;

  }

  if ( cfg.modeA == 0 )  {
    // Speed
    if ( showMax ) 
      drawScrn({
        val:maxSpd,
        unit:cfg.spd_unit,
        sats:sats,
        age:age,
        max:'MAX',
        wp:''
      }); // Speed maximums
    else
      drawScrn({
        val:sp,
        unit:cfg.spd_unit,
        sats:sats,
        age:age,
        max:'SPD',
        wp:''
      });
  }

  if ( cfg.modeA == 1 ) {
    // Alt
    if ( showMax ) 
      drawScrn({
        val:maxAlt,
        unit:cfg.alt_unit,
        sats:sats,
        age:age,
        max:'MAX',
        wp:''
      }); // Alt maximums
    else 
      drawScrn({
        val:al,
        unit:cfg.alt_unit,
        sats:sats,
        age:age,
        max:'ALT',
        wp:''
      });
  }

  if ( cfg.modeA == 2 ) {
    // Dist
      drawScrn({
        val:di,
        unit:cfg.dist_unit,
        sats:sats,
        age:age,
        max:'DST',
        wp:wpName
      });
  }

  if ( cfg.modeA == 3 ) {
    // Position
    drawPosn({
        sats:sats,
        age:age,
        lat:lat,
        lon:lon,
        ns:ns,
        ew:ew
      });
  }
  
  if ( cfg.modeA == 4 )  {
    // Large clock
    drawClock();
  }

}

function prevScrn() {
    cfg.modeA = cfg.modeA-1;
    if ( cfg.modeA < 0 ) cfg.modeA = 4;
    savSettings();
    onGPS(lf); 
}

function nextScrn() {
    cfg.modeA = cfg.modeA+1;
    if ( cfg.modeA > 4 ) cfg.modeA = 0;
    savSettings();
    onGPS(lf); 
}

// Next function on a screen
function nextFunc(dur) {
    if ( cfg.modeA == 0 || cfg.modeA == 1 ) {
      // Spd+Alt mode - Switch between fix and MAX
      if ( dur < 2 ) showMax = !showMax;   // Short press toggle fix/max display
      else { maxSpd = 0; maxAlt = 0; }  // Long press resets max values.
    }
    else  if ( cfg.modeA == 2) nxtWp();  // Dist mode - Select next waypoint
    onGPS(lf);
}


function updateClock() {
  if (!canDraw) return;
  if ( cfg.modeA != 4 )  return;
  drawClock(); 
  if ( emulator ) {maxSpd++;maxAlt++;}
}

function startDraw(){
  canDraw=true;
  g.clear();
  Bangle.drawWidgets();
  setLpMode('SuperE'); // off
  onGPS(lf);  // draw app screen
}

function stopDraw() {
  canDraw=false;
  if (!tmrLP) tmrLP=setInterval(function () {if (lf.fix) setLpMode('PSMOO');}, 10000);   //Drop to low power in 10 secs. Keep lp mode off until we have a  first fix.
}

function savSettings() {
  require("Storage").write('speedalt2.json',cfg);
}

function setLpMode(m) {
  if (tmrLP) {clearInterval(tmrLP);tmrLP = false;} // Stop any scheduled drop to low power
  if ( !gpssetup ) return;
  gpssetup.setPowerMode({power_mode:m});
}

// == Events

function setButtons(){

  // BTN1 - Max speed/alt or next waypoint
  setWatch(function(e) {
    var dur = e.time - e.lastTime;
    nextFunc(dur);
  }, BTN1, { edge:"falling",repeat:true});
  
  // Power saving on/off 
  setWatch(function(e){
    pwrSav=!pwrSav; 
    if ( pwrSav ) {
      var s = require('Storage').readJSON('setting.json',1)||{};
      var t = s.timeout||10;
      Bangle.setLCDTimeout(t);
    }
    else {
      Bangle.setLCDTimeout(0);
//      Bangle.setLCDPower(1);
    }
      LED1.write(!pwrSav);
  }, BTN2, {repeat:true,edge:"falling"});
  
  // BTN3 - next screen
  setWatch(function(e){
    nextScrn();
  }, BTN3, {repeat:true,edge:"falling"});
  
/* 
  // Touch screen same as BTN1 short
  setWatch(function(e){
    nextFunc(1);  // Same as BTN1 short
  }, BTN4, {repeat:true,edge:"falling"});
  setWatch(function(e){
    nextFunc(1);  // Same as BTN1 short
  }, BTN5, {repeat:true,edge:"falling"});
*/

}

Bangle.on('lcdPower',function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) startDraw(); 
  else stopDraw();
});

Bangle.on('swipe',function(dir) {
  if ( ! cfg.touch ) return;
  if(dir == 1) prevScrn();
  else nextScrn();
});

Bangle.on('touch', function(button){
  if ( ! cfg.touch ) return;
  nextFunc(0);  // Same function as short BTN1
/*  
    switch(button){
    case 1:    // BTN4
console.log('BTN4');
        prevScrn();
      break;
    case 2:    // BTN5
console.log('BTN5');
      nextScrn();
      break;
    case 3:
console.log('MDL');
      nextFunc(0);  // Centre - same function as short BTN1
      break;
    }
*/
  });



// == Main Prog

// Read settings. 
let cfg = require('Storage').readJSON('speedalt2.json',1)||{};

cfg.spd = cfg.spd||0;  // Multiplier for speed unit conversions. 0 = use the locale values for speed
cfg.spd_unit = cfg.spd_unit||'';  // Displayed speed unit
cfg.alt = cfg.alt||0.3048;// Multiplier for altitude unit conversions.
cfg.alt_unit = cfg.alt_unit||'feet';  // Displayed altitude units
cfg.dist = cfg.dist||1000;// Multiplier for distnce unit conversions.
cfg.dist_unit = cfg.dist_unit||'km';  // Displayed altitude units
cfg.colour = cfg.colour||0;          // Colour scheme.
cfg.wp = cfg.wp||0;        // Last selected waypoint for dist
cfg.modeA = cfg.modeA||0;    // 0=Speed 1=Alt 2=Dist 3=Position 4=Clock 
cfg.primSpd = cfg.primSpd||0;    // 1 = Spd in primary, 0 = Spd in secondary

cfg.spdFilt = cfg.spdFilt==undefined?true:cfg.spdFilt; 
cfg.altFilt = cfg.altFilt==undefined?true:cfg.altFilt;
cfg.touch = cfg.touch==undefined?true:cfg.touch;

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
var img = {
  width:buf.getWidth(),
  height:buf.getHeight(),
  bpp:2,
  buffer:buf.buffer,
  palette:new Uint16Array([0,0x4FE0,0xEFE0,0x07DB])
};

if ( cfg.colour == 1 ) img.palette = new Uint16Array([0,0xFFFF,0xFFF6,0xDFFF]);
if ( cfg.colour == 2 ) img.palette = new Uint16Array([0,0xF800,0xFAE0,0xF813]);
if ( cfg.colour == 3 ) img.palette = new Uint16Array([0xFFFF,0x007F,0x0054,0x0054]);

var SCREENACCESS = {
      withApp:true,
      request:function(){this.withApp=false;stopDraw();},
      release:function(){this.withApp=true;startDraw();}
}; 

var gpssetup;
try {
  gpssetup = require("gpssetup");
} catch(e) {
  gpssetup = false;
}

// All set up. Lets go.
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
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
