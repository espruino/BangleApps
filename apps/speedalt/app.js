/*
Speed and Altitude [speedalt]
Ver : 2.01 low power gps widget
Mike Bennett mike[at]kereru.com
process.memory()
*/
var v = '5';
var buf = Graphics.createArrayBuffer(240,160,2,{msb:true});

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);

var lf = {fix:0,satellites:0};
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var maxPress = 0;      // Time max button pressed. Used to calculate short or long press.
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
    else {
      // Calculate for selected units
      sp = lf.speed;
      sp = parseFloat(sp)/parseFloat(settings.spd);
    }
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
    if ( showMax ) {
      // Speed and alt maximums
      drawFix(max.spd,settings.spd_unit,lf.satellites,max.alt,settings.alt_unit,age,lf.fix);
    }
    else {
      // Show speed/altitude
      drawFix(sp,settings.spd_unit,lf.satellites,al,settings.alt_unit,age,lf.fix);
    }
  }
  else {
    // Show speed/distance
    if ( di <= 0 ) {
      // No WP selected
      drawFix(sp,settings.spd_unit,lf.satellites,'','',age,lf.fix);
    }
    else {
      drawFix(sp,settings.spd_unit,lf.satellites,di,settings.dist_unit,age,lf.fix);
    }
  }

}


function toggleDisplay() {
  settings.primSpd = !settings.primSpd;
  savSettings();
  onGPS(lf);  // Update display
}

function toggleAltDist() {
  settings.modeA = !settings.modeA;
  savSettings();
  onGPS(lf); 
}

function setButtons(){

  // Spd+Dist : Select next waypoint
  setWatch(btnPressed, BTN1,{repeat:true,edge:"rising"});
  setWatch(btnReleased, BTN1,{repeat:true,edge:"falling"});

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

  // Toggle between alt or dist
  setWatch(toggleAltDist, BTN3, {repeat:true,edge:"falling"});
  
  // Touch left screen to toggle display
  setWatch(toggleDisplay, BTN4, {repeat:true,edge:"falling"});

}

function btnPressed() {
  maxPress = getTime();
}

function btnReleased() {
  var dur = getTime()-maxPress;
  if ( settings.modeA ) {
    // Spd+Alt mode - Switch between fix and MAX
    if ( dur < 2 ) {
      showMax = !showMax;   // Short press toggle fix/max display
    }
    else {
      max.spd = 0;  // Long press resets max values.
      max.alt = 0;
    }
  }
  else {
    // Spd+Dist mode - Select next waypoint
    nxtWp(1);
  }
  onGPS(lf);
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
  setLpMode(0); // off
  g.clear();
  Bangle.drawWidgets();
  onGPS(lf);  // draw app screen
}

function stopDraw() {
  canDraw=false;
  if (!tmrLP) tmrLP=setInterval(function () {if (lf.fix) setLpMode(1);}, 30000);   //Drop to low power in 30 secs. Keep lp mode off until we have a  first fix.
}

function savSettings() {
  require("Storage").write('speedalt.json',settings);
}

// Is low power GPS service available to use?
function isLP() {
  if (WIDGETS.gpsservice == undefined) return(0);
  return(1);
}

function lpGetFix() {
  onGPS(WIDGETS.gpsservice.gps_get_fix());
}

function setLpMode(on) {
  if (tmrLP) {clearInterval(tmrLP);tmrLP = false;} // Stop any scheduled drop to low power
  if ( !lp ) return;
  var s = WIDGETS.gpsservice.gps_get_settings();
  s.gpsservice = true;
  s.power_mode = (on)?'PSMOO':'SuperE';
  WIDGETS.gpsservice.gps_set_settings(s);
  WIDGETS.gpsservice.reload();
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

if ( settings.colour == 1 ) img.palette = new Uint16Array([0,0xFFFF,0xFFFF,0xFFFF]);
if ( settings.colour == 2 ) img.palette = new Uint16Array([0,0xFF800,0xF800,0xF800]);

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

var lp = isLP();   // Low power GPS widget installed.


Bangle.setGPSPower(1);
onGPS(lf);

if ( lp ) setInterval(lpGetFix, 1000);
else Bangle.on('GPS', onGPS);

setButtons();
setInterval(updateClock, 30000);
