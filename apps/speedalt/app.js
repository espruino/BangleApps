/*
Speed and Altitude [speedalt]
Ver : 0.03
Mike Bennett mike[at]kereru.com
*/

const dbg = 1;

var buf = Graphics.createArrayBuffer(240,160,2,{msb:true});

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);

/*
var mainmenu = {
  "" : { "title" : "-- Units --" },
  "default" : function() { setUnits(0,''); },
  "Kph (spd)" : function() { setUnits(1,'kph'); },
  "Knots (spd)" : function() { setUnits(1.852,'knots'); },
  "Mph (spd)" : function() { setUnits(1.60934,'mph'); },
  "m/s (spd)" : function() { setUnits(3.6,'m/s'); },
  "Meters (alt)" : function() { setUnitsAlt(1,'m'); },
  "Feet (alt)" : function() { setUnitsAlt(0.3048,'feet'); },
  "Exit" : function() { exitMenu(); }, // remove the menu and restore
};
*/

var lastFix = {fix:0,satellites:0};
var showSpeed = 1;      // 1 = Speed in primary display. 0 = alt in primary
var showMax = 0;        // 1 = display the max values. 0 = display the cur fix
//var inMenu = 0;
var maxPress = 0;      // Time max button pressed. Used to calculate short or long press.
var canDraw = 1;

var timeBright = 0;    // Time of last activity that keeps the display bright

var time = '';    // Last time string displayed. Re displayed in background colour to remove before drawing new time.

var max = {};
max.spd = 0;
max.alt = 0;

var emulator = 0;
if (process.env.BOARD=="EMSCRIPTEN") emulator = 1;  // 1 = running in emulator. Supplies test values;

function drawFix(speed,units,sats,alt,alt_units) {
  if (!canDraw) return;

  buf.clear();
  
  var val = '';  
  var u='';
  
  // Primary Display
  val = speed.toString();
  if ( !showSpeed ) val = alt.toString();
  
  // Primary Units
  u = settings.spd_unit;
  if ( !showSpeed ) u = alt_units;

  drawPrimary(val,u);
  
  // Secondary Display
  val = alt.toString();
  if ( !showSpeed ) val = speed.toString();

  // Secondary Units
  u = alt_units;
  if ( !showSpeed ) u = settings.spd_unit;
  
  drawSecondary(val,u);
  
  // Time
  drawTime();
  
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


function drawTime() {
  var x = 0;
  var y = 160;

  buf.setFont("7x11Numeric7Seg", 1);
  buf.setFontAlign(-1,1); //left, bottom

  buf.setColor(0);
  buf.drawString(time,x,y);
  time = require("locale").time(new Date(),1);
  buf.setColor(3);  
  buf.drawString(time,x,y);
}

function drawSats(sats) {
  buf.setFontAlign(1,1); //right, bottom
  buf.setColor(3);  
  buf.setFont("6x8", 1);
  if ( showMax ) {
    buf.setColor(2); 
    buf.drawString("MAX",240,160);
  }
  else buf.drawString("Sats:"+sats,240,160);  
}

/*
function drawClockLarge() {
    buf.clear();
    drawTime();
    g.reset();
    g.drawImage(img,0,40);
    g.flip();
}
*/


function onGPS(fix) {
  lastFix = fix;
  
  var m;

  if (fix.fix || emulator) {

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
      speed = Math.round(parseFloat(speed)/parseFloat(settings.spd),0);
    }
    
    // ==== Altitude ====
    alt = fix.alt;
    if ( emulator ) alt = '360';
    alt = Math.round(parseFloat(alt)/parseFloat(settings.alt),0);
    
    // Record max values
    if (parseFloat(speed) > parseFloat(max.spd) ) max.spd = parseFloat(speed);
    if (parseFloat(alt) > parseFloat(max.alt) ) max.alt = parseFloat(alt);
    
    if ( showMax ) drawFix(max.spd,settings.spd_unit,fix.satellites,max.alt,settings.alt_unit);
    else drawFix(speed,settings.spd_unit,fix.satellites,alt,settings.alt_unit);

  } else {
    drawNoFix(fix.satellites);
  }

}


/*
function setUnits(m,u) {
  settings.spd = m;
  settings.spd_unit = u;
  require('Storage').writeJSON('speedalt.json',settings);
  
  inMenu = 0;
 
  E.showMenu(); // remove the menu
  onGPS(lastFix);  // Back to Speed display
}
function setUnitsAlt(m,u) {
  settings.alt = m;
  settings.alt_unit = u;
  require('Storage').write('speedalt.json',settings);
  inMenu = 0;
  E.showMenu(); // remove the menu
  onGPS(lastFix);  // Back to Speed display
}
function enterMenu() {
  if ( inMenu ) return;
  inMenu = 1;
  E.showMenu(mainmenu);
}
function exitMenu() {
  inMenu = 0;
  E.showMenu(); 
  onGPS(lastFix); // remove the menu and restore
  
}
*/

function toggleDisplay() {
  showSpeed = !showSpeed;
  onGPS(lastFix);  // Back to Speed display
}

function toggleMax() {
//  if ( inMenu ) return;
  showMax = !showMax;
  onGPS(lastFix);  // Back to Speed display
}


// How to disable these while in menu? Interim using inMenu flag.
function setButtons(){
  
  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

  // Switch between fix and max display
  setWatch(maxPressed, BTN3,{repeat:true,edge:"rising"});
  setWatch(maxReleased, BTN3,{repeat:true,edge:"falling"});

  // Touch screen to toggle display
  setWatch(toggleDisplay, BTN4, {repeat:true,edge:"falling"});
  setWatch(toggleDisplay, BTN5, {repeat:true,edge:"falling"});
  
  
}

function maxPressed() {
  maxPress = getTime();
}

function maxReleased() {
  var dur = getTime()-maxPress;
  
  if ( dur < 2 ) toggleMax();   // Short press toggle fix/max display
  else {
    max.spd = 0;  // Long press resets max values.
    max.alt = 0;
    onGPS(lastFix);  // redraw display
  }
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
settings.colour = settings.colour||0;          // Colour scheme. 

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

Bangle.on('GPS', onGPS);

setButtons();
setInterval(updateClock, 30000);

