/*
Speed and Altitude [speedalt]
Ver : 1.01
Mike Bennett mike[at]kereru.com
*/

const dbg = 0;

var buf = Graphics.createArrayBuffer(240,160,2,{msb:true});

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);

var lastFix = {fix:0,satellites:0};
var primaryDisp = 1;      // 1 = Speed in primary display. 0 = alt/dist in primary
var altDisp = 1;            // 1 = alt, 0 = dist to wp
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
var maxPress = 0;      // Time max button pressed. Used to calculate short or long press.
var canDraw = 1;
var lastBuzz = 0;      // What sort of buzz was last performed. 0 = no fix, 1 = fix. 
var timerBuzz2 = 0;    // ID of timer for fix second buzz
var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.

var max = {};
max.spd = 0;
max.alt = 0;

var emulator = 0;
if (process.env.BOARD=="EMSCRIPTEN") emulator = 1;  // 1 = running in emulator. Supplies test values;

var waypoints = require("Storage").readJSON("waypoints.json")||[{name:"NONE"}];
var wpindex=0;
var wp = {};        // Waypoint to use for distance from cur position.

function nextwp(inc){
  if (altDisp) return;
  wpindex+=inc;
  if (wpindex>=waypoints.length) wpindex=0;
  if (wpindex<0) wpindex = waypoints.length-1;
  wp = waypoints[wpindex];
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

function drawFix(speed,units,sats,alt,alt_units) {
  if (!canDraw) return;

  buf.clear();

  drawLED(0);  // Use LED to indicate current mode
  
  var val = '';  
  var u='';
  
  // LED to distingush current mode
  
  // Primary Display
  val = speed.toString();
  if ( !primaryDisp ) val = alt.toString();
  
  // Primary Units
  u = settings.spd_unit;
  if ( !primaryDisp ) u = alt_units;

  drawPrimary(val,u);
  
  // Secondary Display
  val = alt.toString();
  if ( !primaryDisp ) val = speed.toString();

  // Secondary Units
  u = alt_units;
  if ( !primaryDisp ) u = settings.spd_unit;
  
  drawSecondary(val,u);
  
  // Time
  drawTime();

  // Waypoint name
  drawWP();
  
  //Sats
  drawSats(sats);

  g.reset();
  g.drawImage(img,0,40);
//  g.flip();

  
}


function drawNoFix(sats) {
  if (!canDraw) return;
  var u;

  buf.clear();

  drawLED(1);  
  
  buf.setFontAlign(0,0);
  buf.setColor(3);  
  
  buf.setFontVector(25);
  buf.drawString("Waiting for GPS",120,56);

  // Time
  drawTime();
  
  //Sats
  drawSats(sats);

  g.reset();
  g.drawImage(img,0,40);
//  g.flip();

  
}

function drawPrimary(n,u) {
 
  // Primary Display
  
  var s=40;    // Font size
  if ( n.length <= 7 ) s=48;
  if ( n.length <= 6 ) s=55;
  if ( n.length <= 5 ) s=68;
  if ( n.length <= 4 ) s=85;
  if ( n.length <= 3 ) s=110;
        
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
  if ( n.length <= 5 ) s=155;
  if ( n.length <= 4 ) s=125;
  if ( n.length <= 3 ) s=100;
  if ( n.length <= 2 ) s=65;
  if ( n.length <= 1 ) s=35;
  
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

function drawLED(rst) {
  LED1.reset();
  LED2.reset();
  if ( rst ) return;

  if ( altDisp ) LED2.set();    // green = Speed/Alt mode
  else LED1.set(); // red = Speed/Dist mode
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
  if ( altDisp ) nm='';
  
  
  buf.setFontAlign(-12,1); //left, bottom
  buf.setColor(2);  
//  buf.setFont("6x8", 1);
  buf.setFontVector(20);
  buf.drawString(nm.substring(0,6),77,160);  
 
}


function drawSats(sats) {
  buf.setFontAlign(1,1); //right, bottom
  buf.setColor(3);  
  buf.setFont("6x8", 2);
  if ( showMax && altDisp ) {
    buf.setColor(2); 
    buf.drawString("MAX",240,160);
  }
  else buf.drawString("Sats:"+sats,240,160);  
}

function onGPS(fix) {
  lastFix = fix;
  
  var m;

  if (fix.fix || emulator) {

    lastFix.fix=1; 

    doBuzz(1);

    //==== Speed ====
    if ( settings.spd == 0 ) {
      var strSpeed = require("locale").speed(fix.speed);
      m = strSpeed.match(/([0-9,\.]+)(.*)/); // regex splits numbers from units

      if ( emulator ) {
        speed = '125';  //testing only
        settings.spd_unit = 'kph';
      }
      else {
        speed = m[1];
        settings.spd_unit = m[2];
      }
    }
    // Calculate for selected units
    else {
      speed = fix.speed;
      if ( emulator ) speed = '100';
      speed = Math.round(parseFloat(speed)/parseFloat(settings.spd));
    }
    
    // ==== Altitude ====
    alt = fix.alt;
    if ( emulator ) alt = '360';
    alt = Math.round(parseFloat(alt)/parseFloat(settings.alt));
    
    // ==== Distance to waypoint ====
    if ( emulator ) {
      lastFix.lat = -38.92;
      lastFix.lon = 175.7613350;
    }
    
    dist = distance(lastFix,wp);
    if (isNaN(dist)) dist = 0;
    
    
    // Record max values
    if (parseFloat(speed) > parseFloat(max.spd) ) max.spd = parseFloat(speed);
    if (parseFloat(alt) > parseFloat(max.alt) ) max.alt = parseFloat(alt);
    
    if ( altDisp ) {
      if ( showMax ) {
        // Speed and alt maximums
        drawFix(max.spd,settings.spd_unit,fix.satellites,max.alt,settings.alt_unit);
      }
      else {
        // Show speed/altitude
        drawFix(speed,settings.spd_unit,fix.satellites,alt,settings.alt_unit);
      }
    }
    else {
      // Show speed/distance
      if ( dist <= 0 ) {
        // No WP selected
        drawFix(speed,settings.spd_unit,fix.satellites,'','');
      }
      else {
        drawFix(speed,settings.spd_unit,fix.satellites,dist,settings.dist_unit);
      }
    }
  } 
  else {
    lastFix.fix=0; 
    doBuzz(0);
    drawNoFix(fix.satellites);
  }

}

// Vibrate watch when fix lost or gained.
function doBuzz(hasFix) {

  // nothing to do
  if ( lastBuzz === hasFix || !settings.buzz ) {
    return;
  }
  
  // fix gained - double buzz
  if ( !lastBuzz && hasFix ) {
    if ( dbg ) print('Fix');
    lastBuzz = 1;
    Bangle.buzz();
    timerBuzz2 = setInterval(doBuzz2, 600); // Trigger a second buzz
    return;
  }
  
  // fix lost - single buzz
  if ( lastBuzz && !hasFix ) {
    if ( dbg ) print('Fix lost');
    lastBuzz = 0;
    Bangle.buzz();
    return;
  }
}

// Second buzz
function doBuzz2() {
    if ( dbg ) print('Buzz2');
    clearInterval(timerBuzz2);
    Bangle.buzz();
 }

function toggleDisplay() {
  primaryDisp = !primaryDisp;
  onGPS(lastFix);  // Update display
}

function toggleAltDist() {
  altDisp = !altDisp;
  onGPS(lastFix); 
}

function setButtons(){

  // Spd+Alt : Switch between fix and max display on short press or reset max values on long press
  // Spd+Dist : Select next waypoint
  setWatch(btnPressed, BTN1,{repeat:true,edge:"rising"});
  setWatch(btnReleased, BTN1,{repeat:true,edge:"falling"});

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

  // Touch left screen to toggle display
  setWatch(toggleDisplay, BTN4, {repeat:true,edge:"rising"});

  // Touch left screen to toggle between alt or dist
  setWatch(toggleAltDist, BTN5, {repeat:true,edge:"rising"});
  
}

function btnPressed() {
  if ( !lastFix.fix ) return; 
  maxPress = getTime();
}

function btnReleased() {
  if ( !lastFix.fix ) return; 
  var dur = getTime()-maxPress;
  if ( altDisp ) {
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
    nextwp(1);
  }
  onGPS(lastFix);
}

function updateClock() {
  if ( dbg ) print('Updating clock');
  if (!canDraw) return;

  drawTime(); 
  g.reset();
  g.drawImage(img,0,40);
//  g.flip();
  
  // Something different to display in the emulator
  if ( emulator ) {
    max.spd++;
    max.alt++;
  }
  
}

function startDraw(){
  canDraw=true;
  g.clear();
  Bangle.drawWidgets();
  onGPS(lastFix);  // draw app screen
}

function stopDraw() {
  canDraw=false;
}

// ===== Main Prog =====

// Read settings. 
let settings = require('Storage').readJSON('speedalt.json',1)||{};

settings.spd = settings.spd||0;  // Multiplier for speed unit conversions. 0 = use the locale values for speed
settings.spd_unit = settings.spd_unit||'';  // Displayed speed unit
settings.alt = settings.alt||0.3048;// Multiplier for altitude unit conversions.
settings.alt_unit = settings.alt_unit||'feet';  // Displayed altitude units
settings.dist = settings.dist||1000;// Multiplier for distnce unit conversions.
settings.dist_unit = settings.dist_unit||'km';  // Displayed altitude units
settings.colour = settings.colour||0;          // Colour scheme. 
settings.buzz = settings.buzz||0;          // Buzz when fix lost or gained. 

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


// Find speed unit if using locale speed
if ( settings.spd == 0 ) {
  var strSpeed = require("locale").speed(1);
  m = strSpeed.match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
  settings.spd_unit = m[2];
}

var SCREENACCESS = {
      withApp:true,
      request:function(){
        this.withApp=false;
        stopDraw();
        clearWatch();
      },
      release:function(){
        this.withApp=true;
        startDraw(); 
        setButtons();
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
Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setGPSPower(1);

onGPS(lastFix);
Bangle.on('GPS', onGPS);

setButtons();
setInterval(updateClock, 30000);
