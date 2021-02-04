/*
Speed and Altitude [speedalt]
Ver : 1.07
Mike Bennett mike[at]kereru.com
process.memory()
*/

var buf = Graphics.createArrayBuffer(240,160,2,{msb:true});

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);

var lf = {fix:0,satellites:0};
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var maxPress = 0;      // Time max button pressed. Used to calculate short or long press.
var canDraw = 1;
var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.

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
  v = speed.toString();
  if ( !settings.primSpd ) v = alt.toString();
  
  // Primary Units
  u = settings.spd_unit;
  if ( !settings.primSpd ) u = alt_units;

  drawPrimary(v,u);
  
  // Secondary Display
  v = alt.toString();
  if ( !settings.primSpd ) v = speed.toString();

  // Secondary Units
  u = alt_units;
  if ( !settings.primSpd ) u = settings.spd_unit;
  
  drawSecondary(v,u);
  
  // Time
  drawTime();

  // Waypoint name
  drawWP();
  
  //Sats
  if ( fix ) drawSats('Sats:'+sats);
  else drawSats('Age:'+age);

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
  if ( nm == undefined ) nm = '';
  if ( nm == 'NONE' ) nm = '';
  if ( settings.modeA ) nm='';
  
  buf.setFontAlign(-12,1); //left, bottom
  buf.setColor(2);  
//  buf.setFont("6x8", 1);
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
  
  if (fix.fix) lf = fix;

  var m;

  var speed = '---';        
  var alt = '---';
  var dist = '---';
  var age = '---';
  
    if (lf.fix == 1 ) {  
      // Speed
      if ( settings.spd == 0 ) {
        m = require("locale").speed(lf.speed).match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
        speed = parseFloat(m[1]);
        settings.spd_unit = m[2];
      }
      else {
        // Calculate for selected units
        speed = lf.speed;
        speed = parseFloat(speed)/parseFloat(settings.spd);
      }
      if ( speed < 10 ) speed = speed.toFixed(1);
      else speed = Math.round(speed);
      if (parseFloat(speed) > parseFloat(max.spd) ) max.spd = parseFloat(speed);

      // Altitude
      alt = lf.alt;
      alt = Math.round(parseFloat(alt)/parseFloat(settings.alt));
      if (parseFloat(alt) > parseFloat(max.alt) ) max.alt = parseFloat(alt);

      // Distance to waypoint
      dist = distance(lf,wp);
      if (isNaN(dist)) dist = 0;

      // Age of last fix (secs)
      age = Math.max(0,Math.round(getTime())-(lf.time.getTime()/1000));
      if ( age > 90 ) age = '>90';
    }
      
    if ( settings.modeA ) {
      if ( showMax ) {
        // Speed and alt maximums
        drawFix(max.spd,settings.spd_unit,fix.satellites,max.alt,settings.alt_unit,age,fix.fix);
      }
      else {
        // Show speed/altitude
        drawFix(speed,settings.spd_unit,fix.satellites,alt,settings.alt_unit,age,fix.fix);
      }
    }
    else {
      // Show speed/distance
      if ( dist <= 0 ) {
        // No WP selected
        drawFix(speed,settings.spd_unit,fix.satellites,'','',age,fix.fix);
      }
      else {
        drawFix(speed,settings.spd_unit,fix.satellites,dist,settings.dist_unit,age,fix.fix);
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
  g.clear();
  Bangle.drawWidgets();
  onGPS(lf);  // draw app screen
}

function stopDraw() {
  canDraw=false;
}

function savSettings() {
  require("Storage").write('speedalt.json',settings);
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
      request:function(){
        this.withApp=false;
        stopDraw();
      },
      release:function(){
        this.withApp=true;
        startDraw(); 
      }
}; 

Bangle.on('lcdPower',function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    startDraw();
  } else {
    stopDraw();
  }
});

// All set up. Lets go.
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setGPSPower(1);
onGPS(lf);
Bangle.on('GPS', onGPS);
setButtons();
setInterval(updateClock, 30000);
