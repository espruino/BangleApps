/*
Speed and Altitude [speedalt]
Mike Bennett mike[at]kereru.com
1.16 : Use new GPS settings module
*/
var v = '1.20';
var buf = Graphics.createArrayBuffer(240,160,2,{msb:true});

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);

var lf = {fix:0,satellites:0};
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var pwrSav = 1;         // 1 = default power saving with watch screen off and GPS to PMOO mode. 0 = screen kept on.
var canDraw = 1;
var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.
var tmrLP;            // Timer for delay in switching to low power after screen turns off

var max = {};
max.spd = 0;
max.alt = 0;

var emulator = (process.env.BOARD=="EMSCRIPTEN")?1:0;  // 1 = running in emulator. Supplies test values;

var wp = {};        // Waypoint to use for distance from cur position.

function nxtWp(inc){
  if (cfg.modeA) return;
  cfg.wp+=inc;
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
  
  g.reset();
  g.drawImage(img,0,40);
  
}

function drawPrimary(n,u) {
 
  // Primary Display
  
  var s=40;    // Font size
  var l=n.length;
  
  if ( l <= 7 ) s=48;
  if ( l <= 6 ) s=55;
  if ( l <= 5 ) s=68;
  if ( l <= 4 ) s=85;
  if ( l <= 3 ) s=110;
        
  buf.setFontAlign(0,-1); //Centre 
  buf.setColor(1);  
  buf.setFontVector(s);
  buf.drawString(n,110,0);
    
    // Primary Units
  buf.setFontAlign(1,-1,3); //right
  buf.setColor(2);  
  buf.setFontVector(25);
  buf.drawString(u,210,0);  
}

function drawSecondary(n,u) {

  var s=180;    // units X position
  var l=n.length;
  if ( l <= 5 ) s=155;
  if ( l <= 4 ) s=125;
  if ( l <= 3 ) s=100;
  if ( l <= 2 ) s=65;
  if ( l <= 1 ) s=35;
  
  buf.setFontAlign(-1,1); //left, bottom 
  buf.setColor(1);  
  buf.setFontVector(45);
  buf.drawString(n,5,140);
    
  // Secondary Units
  buf.setFontAlign(-1,1); //left, bottom
  buf.setColor(2);  
  buf.setFontVector(25);
  buf.drawString(u,s,135);
}

function drawTime() {
  var x = 0;
  var y = 160;

  buf.setFont("7x11Numeric7Seg", 2);
  buf.setFontAlign(-1,1); //left, bottom

  buf.setColor(0);
  buf.drawString(time,x,y);
  time = require("locale").time(new Date(),1);
  buf.setColor(3);  
  buf.drawString(time,x,y);
}

function drawWP() {
  var nm = wp.name;
  if ( nm == undefined || nm == 'NONE' || cfg.modeA ) nm = '';
  
  buf.setFontAlign(-1,1); //left, bottom
  buf.setColor(2);  
  buf.setFontVector(20);
  buf.drawString(nm.substring(0,6),77,160);  
 
}

function drawSats(sats) {

  buf.setColor(3);  
  buf.setFont("6x8", 2);
  buf.setFontAlign(1,1); //right, bottom
  buf.drawString(sats,240,160);  

  buf.setFontVector(20);
  buf.setColor(2); 
  
  if ( cfg.modeA ) buf.drawString("A",240,140);
  else buf.drawString("D",240,140);
    
  if ( showMax && cfg.modeA ) {
    buf.setFontAlign(0,1); //centre, bottom
    buf.drawString("MAX",120,164);
  }
  

}

function onGPS(fix) {
  
 if ( emulator ) {
    fix.fix = 1;
    fix.speed = 10;
    fix.alt = 354;
    fix.lat = -38.92;
    fix.lon = 175.7613350;   
    fix.course = 245;
    fix.satellites = 12;
    fix.time = new Date();
  }

  var m;

  var sp = '---';        
  var al = '---';
  var di = '---';
  var age = '---';

  if (fix.fix) lf = fix;
  if (lf.fix) {
    
    // Speed
    if ( cfg.spd == 0 ) {
      m = require("locale").speed(lf.speed).match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
      sp = parseFloat(m[1]);
      cfg.spd_unit = m[2];
    }
    else sp = parseFloat(lf.speed)/parseFloat(cfg.spd); // Calculate for selected units
    
    if ( sp < 10 ) sp = sp.toFixed(1);
    else sp = Math.round(sp);
    if (parseFloat(sp) > parseFloat(max.spd) ) max.spd = parseFloat(sp);

    // Altitude
    al = lf.alt;
    al = Math.round(parseFloat(al)/parseFloat(cfg.alt));
    if (parseFloat(al) > parseFloat(max.alt) ) max.alt = parseFloat(al);

    // Distance to waypoint
    di = distance(lf,wp);
    if (isNaN(di)) di = 0;

    // Age of last fix (secs)
    age = Math.max(0,Math.round(getTime())-(lf.time.getTime()/1000));
  }
      
  if ( cfg.modeA ) {
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
  else {
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

}

function setButtons(){

  // Spd+Dist : Select next waypoint
  setWatch(function(e) {
    var dur = e.time - e.lastTime;
    if ( cfg.modeA ) {
      // Spd+Alt mode - Switch between fix and MAX
      if ( dur < 2 ) showMax = !showMax;   // Short press toggle fix/max display
      else { max.spd = 0; max.alt = 0; }  // Long press resets max values.
    }
    else nxtWp(1);  // Spd+Dist mode - Select next waypoint
    onGPS(lf);
  }, BTN1, { edge:"falling",repeat:true});
  
  // Power saving on/off 
  setWatch(function(e){
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
  }, BTN2, {repeat:true,edge:"falling"});
  
  // Toggle between alt or dist
  setWatch(function(e){
    cfg.modeA = !cfg.modeA;
    savSettings();
    onGPS(lf); 
  }, BTN3, {repeat:true,edge:"falling"});
  
  // Touch left screen to toggle display
  setWatch(function(e){
    cfg.primSpd = !cfg.primSpd;
    savSettings();
    onGPS(lf);  // Update display
  }, BTN4, {repeat:true,edge:"falling"});

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
  gpssetup.setPowerMode({power_mode:m})
}

// =Main Prog

// Read settings. 
let cfg = require('Storage').readJSON('speedalt.json',1)||{};

cfg.spd = cfg.spd||0;  // Multiplier for speed unit conversions. 0 = use the locale values for speed
cfg.spd_unit = cfg.spd_unit||'';  // Displayed speed unit
cfg.alt = cfg.alt||0.3048;// Multiplier for altitude unit conversions.
cfg.alt_unit = cfg.alt_unit||'feet';  // Displayed altitude units
cfg.dist = cfg.dist||1000;// Multiplier for distnce unit conversions.
cfg.dist_unit = cfg.dist_unit||'km';  // Displayed altitude units
cfg.colour = cfg.colour||0;          // Colour scheme.
cfg.wp = cfg.wp||0;        // Last selected waypoint for dist
cfg.modeA = cfg.modeA||0;    // 0 = [D], 1 = [A]
cfg.primSpd = cfg.primSpd||0;    // 1 = Spd in primary, 0 = Spd in secondary


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
if ( cfg.colour == 2 ) img.palette = new Uint16Array([0,0xFF800,0xFAE0,0xF813]);

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
setInterval(updateClock, 30000);
