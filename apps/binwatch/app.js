/***************************************************
* BINARY WATCH
* for Bangle 1 / 2
* inspired by RAL tec binary wrist watch
*
* TODO:
* - vibrate on full hour
* - 
****************************************************/

/* reuqirements */
require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x7Numeric7Seg").add(Graphics);

/* constants and definitions */

/* Bangle 2: 176 x 176 */

/* month images */

var month = [
  /* JAN */ {width : 53, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("AAMf/0D8AFBkM/9EvwMAgcM/3B30YgE4uEOh354EB4eAuFz90Ah0cgeDx9wgFw8Ecjk7wEDw8A8AIBgEcnEHg4IBgFh4EYnEDHYMF/8AwBID/BODgN/4EgAoI0BgODwExGgkDzg0FAII0D88A8PAnAIBAIMOgPBBAPAiBpCgPAQIOAmFwg0P/B5BwcAiE/JYYAHA"))},
  /* FEB */ {width : 51, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("v/8n/+g/+if/hP/wM/8c/4Of8Ez/FwgE4gEHgFOAYUA8Ed4ADBgEcge4AYMAgeAu4DCgFwhwQBEIMOgPcAYMAgPAjN/4G/8EX/kf/EP/kB/+F/8C/+Ar/xGQkBGTE7wADBMIMHMotMgEGv+A7/hEYOf/EH/hvBh6FBIIKYFA"))},
  /* MAR */ {width : 52, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("v/4j/+gf/hP/gV/6FP/HP8kz/cGv8OgHDwFwuEE8McnEHg8A905BgcO8ecBiM4BgMwuEGoeEi/8gX/wE4gH/4Ef/AMFx0QDIcA8BADnEOgIzCufABgk+Bglx+AMEh+OBgdwvnghk4gcGgfsgFDgEQoEeSgvg"))},
  /* APR */ {width : 52, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("v/4j/4gf/hP/oV/4FP/HP9kz/EGv8OgPDwEguEE8EcnEHg8A9wMCuFwhwMTgAMBmFwg1f+EX/kC/+D/8A//AJIIMFxwZCgFwgAmCgEHnBNDgFz4AMEnwMEuPwBgkPxwMDuF88EMBgMGgfsgFDRgNAjyUF8A="))},
  /* MAY */ {width : 52, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("v/4j/+AoMJ/8Cv/QAwPP8kz/cEgEugHDwFwsEG8McnEHg8A905BgVwh3jzgMRnAMBmAMBoeEi/8BgNgnEA//Ah/4BgcB/+OiAZCBgPgIARTB90BGYUAhwMahk4gYMBpkAocAiEP+CSDIAOAAwYMB"))},
  /* JUN */ {width : 53, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("AAcD8ADBkMAhEvwIJBhkA4O+jEAnFwh0O/PAgPDwFwufugEOjkDwePuEAuHgjkcneAgeHgHgBAMAjk4g8HBAMAsPAjE4gY7BggCBwBPLkACBGgMBweAmI0EgecGgoBBGgfngHh4E4BAIBBh0B4IIB4EQmEEBAPA/0An5qBg0P/ED/xNBiAKBh6PCAAw="))},
  /* JUL */ {width : 53, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("AA8hgEImAFBgcMgHB4AGBnFwh0OAoMB4eAuFwAwMOjkDweAAwNw8EcjggCw8A8HgAwMcnEHg40CsPAjE4AwUEAQIgCABMgGgcBGgMBGgo/BGggKBGgYBB8PAnA0BBQMOgJpC4EQmEENIX+gE/wFn/EP/ED/0Cv/gBQMP8EP/5QGA"))},
  /* AUG */ {width : 52, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("n/8AocE/+gAgMP/1n+0QgGA//HgHhwEYl/wuEOjkDw8Ag4MB4E4uEABilhBgcv/EcgOCgEB/+AwBBB/AMBAgMCj/ngFgAwNw/wmCgImBBgIzDhwzFBikGhkBgUAs0AkEf4EH+A3Bgf+gBLBAwIMD"))},
  /* SEP */ {width : 51, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("h/4j//g/+gf/wn/4M/8ABB5/wmf4mEAjkAg8Ap0AgeAgHgjvAgFwBwMD3EAhwOCu8AgIOCh3ggE4BwMB7gjCBwMYv/Ar/wi/8j/8IYMB/+BIYIODDwIyCLIMHGQYGB8JBDB4IyCAoMDw5BDB4JBDgEEMoZ6Cn/A8A6B8FP/kYgEf/EH/4eCA"))},
  /* OCT */ {width : 50, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("h/gg/+j//w/8gf/h//+H+gF/wP//OAkHADAXgjlwAoU4g8cAgMYh0B44pCgeAuIYBgfADAnwnEDDAUcghCDgRMIsACBkAYFGKZKDngYFgJjBwAYCPgX4DAMHPgQYBgB8C8EGgAA="))},
  /* NOV */ {width : 51, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("vkAgf4AoMX4GA/+ABIN8mEP8EggP350MgMGgF+vvDwFw8Ef4+4uEOjgiBu8OgIOBv8A8PAnFwEQMcnEHBwP8gOHgFh4EdHYNAgEQgJLFggFEhPAjFwg0cg4jDGQPnGQk8GQkPI4IyB8PDKwYOB+BWBMoMHnkOgHAn+A98BwEIh/4jnAHgX+gaGBAAcggAA=="))},
  /* DEC */ {width : 49, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("v/gj//gP/5/4iYFC2f4hn/CAOcgMHgEBwEOgPDwEB4AJB8PAgHggeAuHggFwBoM4uEAnANBjgDBjgNBgwDBh0AiEAgowBAAQ6BwEAggFBv/BwAwBsIwWhwwDnEHAYIiBjhhDgEN/0Dn/Aj/hO4M/+Ef/JABv/8g/+A=="))},
  /* MAI */ {width : 44, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("v/4j/+gEJ/8Cv/QgnP8kz/cA50A4eAuEc8McnEHgPOnIKD8ecBR04BQMwhlDwkX/kAoE4gH/4EABQlOiAVD8A2EgIrDBS0MnEDgHMGQMAiEEPwo="))},
  /* OKT */ {width : 51, height : 24, bpp : 1, buffer : require("heatshrink").decompress(atob("g/wAQMP//B/8DgPh//8j/AuF8n//jECh0fDAUA8PH4AGB8EcnIhBsEcgeHvkAj0DwFw98AgYjBh0dDAN4h0A4eAEgQDBl/4gFAE4MD/5OE3/ggIyBhk4gcAuAyCBIIyDIIIyDAgOAGQMBGQNwh8B4E4BwMB8BlCBIM8gF/AgMYg+Aj/wmA3B+EB/hBChiYGA"))},
  /* DEZ */ {width : 51, height : 23, bpp : 1, buffer : require("heatshrink").decompress(atob("n/wh//w//xP/gV/8F//Of4Fn/EH/04gUODAUHgHh4AFBnHgjk4BYUcgeHAoMB8eAuHgAwN4uEOjgFBh4jB4eAgED4ADBl/4gFwB4MD/4DBgQCB3/gC4PghgyBgPAGQl4gYyDjwgBGQQrBh0BGQVwDQM4F4MMLIJlEg3/gOfPAPgn/gk/+j/+h/8IoPh//gA="))}
];

var imgSquid = {width : 88, height : 26, bpp : 1, buffer : require("heatshrink").decompress(atob("gE/AYUYgEH////0B//gBQM8BQgDB/AKHh/A/gKBvwKBAgMOj8AnwKHBAIMBgH/BQgmCAoPnBQl4AoOAgPnwAKDuEAgYKB4YKIgfD4AKDMAMB4EDwIKIg+B8AKIgAKIh8A+AKHh0AuAKHj0AvBMG4EcgE4K458Bnh4HnEAjiOHBwMeBQpKBEgMOXQ/wBwIKDaAZQBg4KDcwT0BAAOHfgoKHgE/wDaBAAL8DA="))};

var imgNoBT = {width : 20, height : 20, bpp : 3, transparent : 0, buffer : require("heatshrink").decompress(atob("///8mSpM/AoP/yUT/8yuYGB5AMB/1MyYUBkmT/P85MP+USBwOT8mQ/8JBwXyoVnyGSv8//Mhk14pMn//8BYNMwmSp/+pFJkgyBDoMkkgODpOSuQOE5M/KgIOCsmfz/JknPhMyof5n+Ss/wzMhn4OBk1+smQLoWTn/mHAM/+VJz4KBwhZBEYJ/CkM8yZVBAAQxBCgP/A="))};

const V2_X_STEP = 26;
const V2_Y_STEP = 34;

const V2_TIME_Y_OFFSET = 8;
const V2_HX = 36;
const V2_HY = 0 + V2_TIME_Y_OFFSET;
const V2_MX = 10;
const V2_MY = 51 + V2_TIME_Y_OFFSET;
const V2_SX = 10;
const V2_SY = 95 + V2_TIME_Y_OFFSET;
const V2_BT_X = 137; /* 145, 35 */
const V2_BT_Y = 20;
const V2_DX = 100;
const V2_DY = 141;

const V2_BAT_POS_X = 21;
const V2_BAT_POS_Y = 40;
const V2_BAT_SIZE_X = 13;
const V2_BAT_SIZE_Y = 2;

const V2_SCREEN_SIZE_X = 176;
const V2_SCREEN_SIZE_Y = 176;
const V2_BACKGROUND_IMAGE = "binwatch.bg176.img";
//const V2_BG_COLOR = 0;
//const V2_FG_COLOR = 1;

/* Bangle 1: 240 x 240 */

const V1_X_STEP = 35;
const V1_Y_STEP = 46;

const V1_TIME_Y_OFFSET = 41;
const V1_HX = 48;
const V1_HY = 0 + V1_TIME_Y_OFFSET;
const V1_MX = 14;
const V1_MY = 55 + V1_TIME_Y_OFFSET;
const V1_SX = 14;
const V1_SY = 110 + V1_TIME_Y_OFFSET;
const V1_BT_X = 41;
const V1_BT_Y = 14;
//var BT_X = 20, BT_Y = 14;
const V1_DX = 160;
const V1_DY = 205;

const V1_BAT_POS_X = 175;
const V1_BAT_POS_Y = 21;
const V1_BAT_SIZE_X = 3;
const V1_BAT_SIZE_Y = 5;
const V1_SCREEN_SIZE_X = 240;
const V1_SCREEN_SIZE_Y = 240;
const V1_BACKGROUND_IMAGE = "binwatch.bg240.img";
//const V1_BG_COLOR = 1;
//const V1_FG_COLOR = 0;

/* runtime settings */

var x_step = 0;
var y_step = 0;

//var time_y_offset = 0;
var hx = 0, hy = 0;
var mx = 0, my = 0;
var sx = 0, sy = 0;
var bt_x = 0, bt_y = 0;
var dx = 0, dy = 0;

var bat_pos_x, bat_pos_y, bat_size_x, bat_size_y;
var backgroundImage = "";
var screen_size_x = 0;
var screen_size_y = 0;
//var bg_color = 0;
//var fg_color = 1;


var showDateTime = 2;    /* show noting, time or date */
var cg;
var cgimg;

/* local functions */

/**
 * function drawSquare(...)
 * 
 * go through all bits and draw a square if a bit
 * is set. So we get the binary representation
 * of the value
 * used to draw block for hours, mintutes, seconds, date
 *
 * @param gfx: graphic object to use
 * @param x: x-coordinate of 1st the square
 * @param y: y-coordinate of 1st the square
 * @param data: data conatining the bit information
 * @param numOfBits: number of bits to draw
*/
function drawSquare(gfx, x, y, data, numOfBits) {

  for(let i = numOfBits; i > 0 ; i--) {
    if( (data & 1) != 0) {
      gfx.fillRect(x + (i - 1) * x_step, y, 
                   x + i * x_step , y + y_step);
    }
    data >>= 1;    /* shift one bit right */
  }
}

/**
 * function drawBinary(...)
 * draw the time in binary format
 * default display for geeks and real men
 
 * @param h: hours
 * @param m: minutes
 * @param s: seconds
*/
function drawBinary(gfx, hour, minute, second) {
  gfx.clear(0);

  if(hour > 12) {
    hour -= 12;          /* we use for bit for hours so we only display 12 hours*/
  }
  drawSquare(gfx, hx, hy, hour, 4);    /* set hour */
  drawSquare(gfx, mx, my, minute, 6);  /* set minute */
  drawSquare(gfx, sx, sy, second, 6);  /* set second */
}

/**
 * function drawTime(...)
 * show time under the graphic
 * for wimps and commies
 *
 * @param h: hours
 * @param m: minutes
 * @param s: seconds
*/

function drawTime(gfx, h, m, s) {
  var time = (" "+h).substr(-2) + ":" + ("0"+m).substr(-2)+ ":" + ("0"+s).substr(-2);

  gfx.setFontAlign(0,-1); // align right bottom
  gfx.setFont("7x11Numeric7Seg", 2);
  gfx.drawString(time, gfx.getWidth() / 2, dy + 1, false /*clear background*/);
}

/**
 * function drawDate(...)
 * show date under the graphic
 * (optionally)
 *
 * @param gfx: graphic object to use
 * @param d: date object
*/
var vMonth = 0;
function drawDate(gfx, d) {
  var dateString = ""
    + ("0" + d.getDate()).substr(-2) 
//    + " " 
//    + ("0" + d.getMonth()).substr(-2) 
//    + " "
//    + ("0" + d.getFullYear()).substr(-2)
  ;

  gfx.setFontAlign(-1,-1); // align right bottom
  gfx.setFont("7x11Numeric7Seg",2); /* draw the current time font */
  gfx.drawString(dateString, dx, dy + 1, false /* don't clear background*/);
  gfx.drawImage(month[d.getMonth()], 40, dy);
}

function toggleDateTime() {
  showDateTime++;
  if(showDateTime > 2){
    showDateTime = 0;
  }
}

function updateVTime() {
  vMonth++;
  if(vMonth >= 12 + 3) {
    vMonth = 0;
  }
  second++;
  if(second > 59) {
    second = 0;
    minute++;
    if(minute > 59) {
      minute = 0;
      hour++;
      if(hour > 12) {
        hour = 0;
      }
    }
  }
}

/**
 * function drawBattery(...)
 * fill the battery symbol with blocks
 * according to the battery level
 *
 * @param gfx: graphic object
 * @param level: current battery level
*/
function drawBattery(gfx, level) {
  var pos_y = bat_pos_y - 1;
  var stepLevel = Math.round((level + 10) / 20);

  for(let i = 0; i < stepLevel; i++) {
    pos_y -= bat_size_y + 2;
    gfx.fillRect(bat_pos_x, pos_y, 
                 bat_pos_x + bat_size_x, pos_y + bat_size_y);
  }
}

/**
 * function drawBattery(...)
 * fill the battery symbol with blocks
 * according to the battery level
 *
 * @param gfx: graphic object
 * @param level: current battery level
*/
function drawBT(gfx, status) {
  if(!status) {
    gfx.drawImage(imgNoBT, bt_x, bt_y);
  }
}
function setRuntimeValues(resolution) {
  if(240 == resolution) {
    x_step = V1_X_STEP;
    y_step = V1_Y_STEP;

    //time_y_offset = V1_TIME_Y_OFFSET;
    hx = V1_HX;
    hy = V1_HY;
    mx = V1_MX;
    my = V1_MY;
    sx = V1_SX;
    sy = V1_SY;
    bt_x = V1_BT_X;
    bt_y = V1_BT_Y;
    dx = V1_DX;
    dy = V1_DY;

    screen_size_x = V1_SCREEN_SIZE_X;
    screen_size_y = V1_SCREEN_SIZE_Y;
    backgroundImage = V1_BACKGROUND_IMAGE;

    bat_pos_x = V1_BAT_POS_X;
    bat_pos_y = V1_BAT_POS_Y;
    bat_size_x = V1_BAT_SIZE_X;
    bat_size_y = V1_BAT_SIZE_Y;

    setWatch(toggleDateTime, BTN1, { repeat : true, edge: "falling"});

  } else {
    x_step = V2_X_STEP;
    y_step = V2_Y_STEP;

    //time_y_offset = V2_TIME_Y_OFFSET;

    hx = V2_HX;
    hy = V2_HY;
    mx = V2_MX;
    my = V2_MY;
    sx = V2_SX;
    sy = V2_SY;

    bt_x = V2_BT_X;
    bt_y = V2_BT_Y;

    dx = V2_DX;
    dy = V2_DY;

    screen_size_x = V2_SCREEN_SIZE_X;
    screen_size_y = V2_SCREEN_SIZE_Y;
    backgroundImage = V2_BACKGROUND_IMAGE;

    bat_pos_x = V2_BAT_POS_X;
    bat_pos_y = V2_BAT_POS_Y;
    bat_size_x = V2_BAT_SIZE_X;
    bat_size_y = V2_BAT_SIZE_Y;

    Bangle.on('swipe', function(direction) { toggleDateTime(direction);});
}
  cg = Graphics.createArrayBuffer(
    screen_size_x,screen_size_y, 1, {msb:true});

  cgimg = {width:screen_size_x, height:screen_size_y, bpp:1,
             transparent:0, buffer:cg.buffer};

}
var hour = 0, minute = 1, second = 50;
var batVLevel = 20;

Bangle.setUI("clock");

function draw() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  g.reset();

  drawBinary(cg, h, m, s);

  switch(showDateTime) {
    case 1:
      drawTime(cg, h, m, s);
      break;
    case 2:
      drawDate(cg, d);
      break;
    default:
      cg.drawImage(imgSquid, cg.getWidth() / 2 - 44, dy);
  }
  drawBattery(cg, /*batVLevel*/  E.getBattery());

  batVLevel += 2;
  if(batVLevel > 100) {
    batVLevel = 0;
  }
  updateVTime();
  g.clear();
  g.drawImages([{image:cgimg},
            {image:require("Storage").read(backgroundImage)}
            ]);
  drawBT(g, NRF.getSecurityStatus().connected);
//  Bangle.drawWidgets();
  const millis = d.getMilliseconds();
  setTimeout(draw, 1000-millis);
 // Bangle.loadWidgets();
}

// Show launcher when button pressed
setRuntimeValues(g.getWidth());
g.reset().clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
