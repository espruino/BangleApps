/*
Speed and Altitude [speedalt]
Mike Bennett mike[at]kereru.com
*/
var v = '1.08';
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
  if (settings.modeA) return;
  settings.wp+=inc;
  loadWp();
}

function loadWp() {
  var w = require("Storage").readJSON('waypoints.json')||[{name:"NONE"}];
  if (settings.wp>=w.length) settings.wp=0;
  if (settings.wp<0) settings.wp = w.length-1;
  savSettings();
  wp = w[settings.wp];
}

function radians(a) {
  return a*Math.PI/180;
}

function distance(a,b){
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  
  // Distance in selected units
  var d = Math.sqrt(x*x + y*y) * 6371000;
  d = (d/parseFloat(settings.dist)).toFixed(2);
  if ( d >= 100 ) d = parseFloat(d).toFixed(1);
  if ( d >= 1000 ) d = parseFloat(d).toFixed(0);

  return d;
}

function drawFix(speed,units,sats,alt,alt_units,age,fix) {
  if (!canDraw) return;

  buf.clear();

  var v = '';  
  var u='';
  
  // Primary Display
  v = (settings.primSpd)?speed.toString():alt.toString();
  
  // Primary Units
  u = (settings.primSpd)?settings.spd_unit:alt_units;

  drawPrimary(v,u);
  
  // Secondary Display
  v = (settings.primSpd)?alt.toString():speed.toString();

  // Secondary Units
  u = (settings.primSpd)?alt_units:settings.spd_unit;
  
  drawSecondary(v,u);
  
  // Time
  drawTime();

  // Waypoint name
  drawWP();
  
  //Sats
  if ( age > 10 ) {
    if ( age > 90 ) age = '>90';
    drawSats('Age:'+age);
  }
  else drawSats('Sats:'+sats);
  
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
  if ( nm == undefined || nm == 'NONE' || settings.modeA ) nm = '';
  
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
  
  if ( settings.modeA ) buf.drawString("A",240,140);
  else buf.drawString("D",240,140);
    
  if ( showMax && settings.modeA ) {
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

  if (fix.fix) { 
    lf = fix;
    
    // Speed
    if ( settings.spd == 0 ) {
      m = require("locale").speed(lf.speed).match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
      sp = parseFloat(m[1]);
      settings.spd_unit = m[2];
    }
    else sp = parseFloat(lf.speed)/parseFloat(settings.spd); // Calculate for selected units
    
    if ( sp < 10 ) sp = sp.toFixed(1);
    else sp = Math.round(sp);
    if (parseFloat(sp) > parseFloat(max.spd) ) max.spd = parseFloat(sp);

    // Altitude
    al = lf.alt;
    al = Math.round(parseFloat(al)/parseFloat(settings.alt));
    if (parseFloat(al) > parseFloat(max.alt) ) max.alt = parseFloat(al);

    // Distance to waypoint
    di = distance(lf,wp);
    if (isNaN(di)) di = 0;

    // Age of last fix (secs)
    age = Math.max(0,Math.round(getTime())-(lf.time.getTime()/1000));
  }
      
  if ( settings.modeA ) {
    if ( showMax ) drawFix(max.spd,settings.spd_unit,lf.satellites,max.alt,settings.alt_unit,age,lf.fix); // Speed and alt maximums
    else drawFix(sp,settings.spd_unit,lf.satellites,al,settings.alt_unit,age,lf.fix); // Show speed/altitude
   }
  else {
    // Show speed/distance
    if ( di <= 0 ) drawFix(sp,settings.spd_unit,lf.satellites,'','',age,lf.fix); // No WP selected
    else drawFix(sp,settings.spd_unit,lf.satellites,di,settings.dist_unit,age,lf.fix);
  }

}

function setButtons(){

  // Spd+Dist : Select next waypoint
  setWatch(function(e) {
    var dur = e.time - e.lastTime;
    if ( settings.modeA ) {
      // Spd+Alt mode - Switch between fix and MAX
      if ( dur < 2 ) showMax = !showMax;   // Short press toggle fix/max display
      else { max.spd = 0; max.alt = 0; }  // Long press resets max values.
    }
    else nxtWp(1);  // Spd+Dist mode - Select next waypoint
    onGPS(lf);
  }, BTN1, { edge:"falling",repeat:true,debounce:50});
  
  
  // Show launcher when middle button pressed
  // setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

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
  }, BTN2, {repeat:true,edge:"falling",debounce:50});
  
  // Toggle between alt or dist
  setWatch(function(e){
    settings.modeA = !settings.modeA;
    savSettings();
    onGPS(lf); 
  }, BTN3, {repeat:true,edge:"falling",debounce:50});
  
  // Touch left screen to toggle display
  setWatch(function(e){
    settings.primSpd = !settings.primSpd;
    savSettings();
    onGPS(lf);  // Update display
  }, BTN4, {repeat:true,edge:"falling",debounce:50});

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
  if (!tmrLP) tmrLP=setInterval(function () {if (lf.fix) setLpMode('PSMOO');}, 30000);   //Drop to low power in 30 secs. Keep lp mode off until we have a  first fix.
}

function savSettings() {
  require("Storage").write('speedalt.json',settings);
}

// Is low power GPS service available to use?
function isLP() {
  if (WIDGETS.gpsservice == undefined) return(0);
  return(1);
}

function setLpMode(m) {
  if (tmrLP) {clearInterval(tmrLP);tmrLP = false;} // Stop any scheduled drop to low power
  if ( !lp ) return;
  var s = WIDGETS.gpsservice.gps_get_settings();
  if ( m !== s.power_mode || !s.gpsservice ) {
    s.gpsservice = true;
    s.power_mode = m;
    WIDGETS.gpsservice.gps_set_settings(s);
    WIDGETS.gpsservice.reload();
  }
}

// =Main Prog

// Read settings. 
let settings = require('Storage').readJSON('speedalt.json',1)||{};

settings.spd = settings.spd||0;  // Multiplier for speed unit conversions. 0 = use the locale values for speed
settings.spd_unit = settings.spd_unit||'';  // Displayed speed unit
settings.alt = settings.alt||0.3048;// Multiplier for altitude unit conversions.
settings.alt_unit = settings.alt_unit||'feet';  // Displayed altitude units
settings.dist = settings.dist||1000;// Multiplier for distnce unit conversions.
settings.dist_unit = settings.dist_unit||'km';  // Displayed altitude units
settings.colour = settings.colour||0;          // Colour scheme.
settings.wp = settings.wp||0;        // Last selected waypoint for dist
settings.modeA = settings.modeA||0;    // 0 = [D], 1 = [A]
settings.primSpd = settings.primSpd||0;    // 1 = Spd in primary, 0 = Spd in secondary


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

if ( settings.colour == 1 ) img.palette = new Uint16Array([0,0xFFFF,0xFFF6,0xDFFF]);
if ( settings.colour == 2 ) img.palette = new Uint16Array([0,0xFF800,0xFAE0,0xF813]);

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

// All set up. Lets go.
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
onGPS(lf);

var lp = isLP();   // Low power GPS widget installed?
if ( lp ) {
  setLpMode('SuperE');
  setInterval(()=>onGPS(WIDGETS.gpsservice.gps_get_fix()), 1000);
}
else {
  Bangle.setGPSPower(1);
  Bangle.on('GPS', onGPS);
}

setButtons();
setInterval(updateClock, 30000);
