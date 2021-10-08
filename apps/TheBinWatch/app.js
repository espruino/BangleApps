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
var locale = require("locale");
require("Font5x9Numeric7Seg").add(Graphics);


/* constants and definitions */

/* Bangle 2: 176 x 176 */

const V2_X_STEP = 26;
const V2_Y_STEP = 34;

const V2_TIME_Y_OFFSET = 30;
const V2_HX = 35;
const V2_HY = 0 + V2_TIME_Y_OFFSET;
const V2_MX = 10;
const V2_MY = 40 + V2_TIME_Y_OFFSET;
const V2_SX = 10;
const V2_SY = 80 + V2_TIME_Y_OFFSET;
const V2_BT_X = 30;
const V2_BT_Y = 10;
const V2_DX = 160;
const V2_DY = 148;

const V2_BAT_POS_X = 127;
const V2_BAT_POS_Y = 15;
const V2_BAT_SIZE_X = 2;
const V2_BAT_SIZE_Y = 3;
const V2_SCREEN_SIZE_X = 176;
const V2_SCREEN_SIZE_Y = 176;
const V2_BACKGROUND_IMAGE = "Background176_center.png";
const V2_BG_COLOR = 0;
const V2_FG_COLOR = 1;

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
const V1_BACKGROUND_IMAGE = "Background240_center.png";
const V1_BG_COLOR = 1;
const V1_FG_COLOR = 0;

/* runtime settings */

var x_step = 0;
var y_step = 0;

var time_y_offset = 0;
var hx = 0, hy = 0;
var mx = 0, my = 0;
var sx = 0, sy = 0;
var bt_x = 0, bt_y = 0;
var dx = 0, dy = 0;

var bat_pos_x, bat_pos_y, bat_size_x, bat_size_y;
var backgroundImage = "";
var screen_size_x = 0;
var screen_size_y = 0;
var bg_color = 0;
var fg_color = 1;

/* global variables */

var showDateTime = 2;    /* show noting, time or date */
var cg;
var cgimg;
var btImage = null;

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
  
  for(i = numOfBits; i > 0 ; i--) {
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
  gfx.clear(1);
  gfx.setColor(bg_color);
  gfx.fillRect(0, 0, screen_size_x, screen_size_y);
  gfx.setColor(fg_color);
  
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
  gfx.setFont("5x9Numeric7Seg", 2);
  gfx.setColor(fg_color);

  gfx.drawString(time, gfx.getWidth() / 2, dy, false /*clear background*/);
}

/**
 * function drawDate(...)
 * show date under the graphic
 * (optionally)
 *
 * @param gfx: graphic object to use
 * @param d: date object
*/

function drawDate(gfx, d) {
  var dateString = ""
    + ("0" + d.getDate()).substr(-2) + " " 
    + ("0" + d.getMonth()).substr(-2) + " "
    + ("0" + d.getFullYear()).substr(-4);

  gfx.setFontAlign(0,-1); // align right bottom
  gfx.setFont("5x9Numeric7Seg",2); /* draw the current time font */
  gfx.setColor(fg_color);

  gfx.drawString(dateString, gfx.getWidth() / 2, dy, false /* don't clear background*/);
}
function toggleDateTimeUp() {
  toggleDateTime(1);
}
function toggleDateTime(adder) {
  showDateTime += adder;
  if(showDateTime > 2){
    showDateTime = 0;
  } else if(showDateTime < 0) {
    showDateTime = 2;
  }
  draw();
}

function updateVTime() {
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
  var pos_x = bat_pos_x + 5 * (bat_size_x + 2);
  var stepLevel = Math.round((level + 10) / 20);
/* 
  if(stepLevel < 2) {
    gfx.setColor(2);
  } else if(stepLevel < 4) {
    gfx.setColor(3);
  } else {
    gfx.setColor(4);
  }
*/ 
  gfx.setColor(fg_color);

  for(i = 0; i < stepLevel; i++) {
    pos_x -= bat_size_x + 2;
    gfx.fillRect(pos_x, bat_pos_y, 
                 pos_x + bat_size_x, bat_pos_y + bat_size_y);
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
function drawBT() {
  if (NRF.getSecurityStatus().connected) {
    btImage = "bt-icon.png";
  }  else {
    btImage = "nbt-icon.png";
  }
}
function setRuntimeValues(resolution) {
  if(240 == resolution) {
    x_step = V1_X_STEP;
    y_step = V1_Y_STEP;

    time_y_offset = V1_TIME_Y_OFFSET;
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
    bg_color = V1_BG_COLOR;
    fg_color = V1_FG_COLOR;
    
    bat_pos_x = V1_BAT_POS_X;
    bat_pos_y = V1_BAT_POS_Y;
    bat_size_x = V1_BAT_SIZE_X;
    bat_size_y = V1_BAT_SIZE_Y;
    
    /* use button 1 to change date / time / nothing display */
    setWatch(toggleDateTimeUp, BTN1, { repeat : true, edge: "falling"});

  } else {
    x_step = V2_X_STEP;
    y_step = V2_Y_STEP;

    time_y_offset = V2_TIME_Y_OFFSET;

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
    bg_color = V2_BG_COLOR;
    fg_color = V2_FG_COLOR;

    bat_pos_x = V2_BAT_POS_X;
    bat_pos_y = V2_BAT_POS_Y;
    bat_size_x = V2_BAT_SIZE_X;
    bat_size_y = V2_BAT_SIZE_Y;
    
    /* use swipe to change date / time / nothing display */
    Bangle.on('swipe', function(direction) { toggleDateTime(direction);});

  }
  
  dg = Graphics.createArrayBuffer(
    screen_size_x,screen_size_y, 1, {msb:true});
  dgimg = {width:screen_size_x, height:screen_size_y, bpp:1,
             transparent:0, buffer:dg.buffer};
 
  cg = Graphics.createArrayBuffer(
    screen_size_x,screen_size_y, 1, {msb:true});
  
  cgimg = {width:screen_size_x, height:screen_size_y, bpp:1,
             transparent:0, buffer:cg.buffer};

}
var hour = 0, minute = 1, second = 50;
var batVLevel = 20, batLevel = 0;


function draw() {
  if (!Bangle.isLCDOn()) {return;} // no drawing, also no new update scheduled 
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  
  drawBinary(cg, h, m, s);
  cg.setColor(fg_color);
 
  switch(showDateTime) {
    case 1:
      drawTime(cg, h, m, s);
      break;
    case 2:
      drawDate(cg, d);
      break;
    default:
      /* do nothing */
  }
  
  cg.setColor(fg_color);
  
  if (Bangle.isCharging()) {
    batVLevel += 20;
    if(batVLevel > 100) {
      batVLevel = 0;
    }
    batLevel = batVLevel;
  } else {
    batLevel = E.getBattery();
  }
  
  drawBattery(cg, batVLevel);
  drawBT();
  
  updateVTime();
  g.clear();
  g.drawImages([{image:cgimg},
             {image:require("Storage").read(backgroundImage)},
             { x:bt_x, y:bt_y, rotate: 0, image:require("Storage").read(btImage)}
        ]);
  const millis = d.getMilliseconds();
  setTimeout(draw, 1000-millis);
}

// Show launcher when button pressed
Bangle.setUI("clock");
setRuntimeValues(g.getWidth());
Bangle.on("lcdPower", function(on) {
  if (on) {
    draw();
  }
});
g.reset().clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

//setInterval(draw, 1000);
//var x_size = g.getWidth();

draw();
