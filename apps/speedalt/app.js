/*
Speed and Altitude [speedalt]
Ver : 0.1
*/

var buf = Graphics.createArrayBuffer(240,120,2,{msb:true});
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

var lastFix = {fix:0,satellites:0};
var mode = 's';     // s = Primary display speed. a = Altitude
var multi = 0;      // Multiplier for speed unit conversions. 0 = use the locale values for speed
var multi_alt = 1;  // Multiplier for altitude unit conversions. 
var units = '';     // Displayed speed unit
var units_alt = 'm'; // Displayed altitude units
var btnToggle=false;        // ID of the toggle display button
var btnMenu=false;        // ID of the menu button
var inMenu = 0;
var emulator = 1;    // 1 = running in emulator. Supplies test value;

/*

const storage = require('Storage');
let settings;

function updateSettings() {
  storage.write('speedalt.json', settings);
}

function resetSettings() {
  settings = {
    day : 17,
    month : 6,
    year: 1981
  };
  updateSettings();
}

*/

function drawFix(speed,units,sats,alt,alt_units) {

  var str = '';
  
  // Size fonts to always maximise the display fit
  var s;

  // Primary Display
  str = speed.toString();
  if ( mode == 'a' ) str = alt.toString();
  
  s=40;    // Font size
  if ( str.length <= 7 ) s=48;
  if ( str.length <= 6 ) s=55;
  if ( str.length <= 5 ) s=68;
  if ( str.length <= 4 ) s=85;
  if ( str.length <= 3 ) s=110;
        
  buf.setFontAlign(0,-1); //Centre 
  buf.setColor(1);  

  buf.setFontVector(s);
  buf.drawString(str,110,0);
    
    // Primary Units
  str = units;
  if ( mode == 'a' ) str = alt_units;
  buf.setFontAlign(1,-1,3); //right
  buf.setColor(2);  
  buf.setFontVector(25);
  buf.drawString(str,210,0);

  // Secondary Display
  str = alt.toString();
  if ( mode == 'a' ) str = speed.toString();

  s=115;    // minor units X position
  if ( str.length <= 7 ) s=120;
  if ( str.length <= 6 ) s=105;
  if ( str.length <= 5 ) s=87;
  if ( str.length <= 4 ) s=70;
  if ( str.length <= 3 ) s=55;
  if ( str.length <= 2 ) s=40;
  if ( str.length <= 1 ) s=25;
  
  buf.setFontAlign(-1,1); //left, bottom 
  buf.setColor(1);  
  buf.setFontVector(25);
  buf.drawString(str,5,120);
    
  // Secondary Units
  str = alt_units;
  if ( mode == 'a' ) str = units;
  buf.setFontAlign(-1,1); //left, bottom
  buf.setColor(2);  
  buf.setFontVector(20);
  buf.drawString(str,s,120);
  
  
  //Sats
  buf.setFontAlign(1,1); //right, bottom
  buf.setColor(3);  
  buf.setFontVector(18);
  buf.drawString(" Sats:"+sats,240,120);
  
}


function drawNoFix(sats) {

  buf.setFontAlign(0,0);
  buf.setColor(3);  

  buf.setFontVector(18);
  buf.drawString(" Sats:"+sats,120,10);
  
  buf.setFontVector(25);
  buf.drawString("Waiting for GPS",120,56);
  
}

function onGPS(fix) {

  lastFix = fix;
  buf.clear();
  
  var m;

  if (fix.fix || emulator) {
    //==== Speed ====
    // Default to locale speed units
    if ( multi == 0 ) {
      var strSpeed = require("locale").speed(fix.speed);
      m = strSpeed.match(/([0-9,\.]+)(.*)/); // regex splits numbers from units

      if ( emulator ) {
        speed = '125';  //testing only
        units = 'kph';
      }
      else {
        speed = m[1];
        units = m[2];
      }
    }
    // Calculate for selected units
    else {
      speed = fix.speed;
      if ( emulator ) speed = '100';
      speed = Math.round(parseFloat(speed)/parseFloat(multi),0);
    }
    
    // ==== Altitude ====
    alt = fix.alt;
    if ( emulator ) alt = '360';
    alt = Math.round(parseFloat(alt)/parseFloat(multi_alt),0);
    
    drawFix(speed,units,fix.satellites,alt,units_alt);

  } else {
    drawNoFix(fix.satellites);
  }
  
  g.reset();
  g.drawImage(img,0,70);
  g.flip();
}

function setUnits(m,u) {
  multi = m;
  units = u;

  inMenu = 0;
 
  E.showMenu(); // remove the menu
  onGPS(lastFix);  // Back to Speed display
}

function setUnitsAlt(m,u) {
  multi_alt = m;
  units_alt = u;

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

function toggleDisplay() {
  if ( inMenu ) return;
  if ( mode == 's' ) mode = 'a';
  else mode = 's';
  onGPS(lastFix);  // Back to Speed display
}

// How to disable these while in menu? Interim using inMenu flag.
function setButtons(){
  
  // Touch screen to toggle display
  btnToggle = setWatch(toggleDisplay, BTN4, {repeat:true,edge:"falling"});
  btnToggle = setWatch(toggleDisplay, BTN5, {repeat:true,edge:"falling"});
  
  // Units menu
  btnMenu = setWatch(enterMenu, BTN3,{repeat:true,edge:"falling"});

 // setWatch(nextwp.bind(null,1), BTN3, {repeat:true,edge:"falling"});
}

g.clear();
setUnitsAlt(0.3048,'feet');    // Default alt in feet

onGPS(lastFix);
Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.on('GPS', onGPS);
Bangle.setGPSPower(1);

setButtons();
