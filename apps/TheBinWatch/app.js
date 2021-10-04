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

/*
var x_step = 26;
var y_step = 34;

var TIME_Y_OFFSET = 30;
var HX = 35, HY = 0 + TIME_Y_OFFSET;
var MX = 10, MY = 40 + TIME_Y_OFFSET;
var SX = 10, SY = 80 + TIME_Y_OFFSET;
var BT_X = 30, BT_Y = 10;
var DX = 160, DY = 148;
*/
/* Bangle 1: 240 x 240 */

var x_step = 35;
var y_step = 46;

var TIME_Y_OFFSET = 41;
var HX = 48, HY = 0 + TIME_Y_OFFSET;
var MX = 14, MY = 55 + TIME_Y_OFFSET;
var SX = 14, SY = 110 + TIME_Y_OFFSET;
var BT_X = 41, BT_Y = 14;
//var BT_X = 20, BT_Y = 14;
var DX = 160, DY = 205;

var BAT_POS_X = 175, BAT_POS_Y = 21;
var BAT_SIZE_X = 3, BAT_SIZE_Y = 5;

/* global variables */


//var screen_size_x = 176;
//var screen_size_y = 176;

var screen_size_x = 240;
var screen_size_y = 240;

var showDateTime = 2;    /* show noting, time or date */
var cg = Graphics.createArrayBuffer(
  screen_size_x,screen_size_y, 1, {msb:true});
var cgimg = {width:screen_size_x, height:screen_size_y, bpp:1,
             transparent:0, buffer:cg.buffer};

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
  gfx.setColor(1);
  gfx.fillRect(0, 0, screen_size_x, screen_size_y);
  gfx.setColor(0);
  
  if(hour > 12) {
    hour -= 12;          /* we use for bit for hours so we only display 12 hours*/
  }
  drawSquare(gfx, HX, HY, hour, 4);    /* set hour */
  drawSquare(gfx, MX, MY, minute, 6);  /* set minute */
  drawSquare(gfx, SX, SY, second, 6);  /* set second */
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
  gfx.drawString(time, gfx.getWidth() / 2, DY, false /*clear background*/);

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
    + ("0" + d.getFullYear()).substr(-4)
  ;

  gfx.setFontAlign(0,-1); // align right bottom
  gfx.setFont("5x9Numeric7Seg",2); /* draw the current time font */
  gfx.drawString(dateString, gfx.getWidth() / 2, DY, false /*clear background*/);

//  gfx.setFont("6x8",2);
//   var date = locale.date(d, false);
//    gfx.drawString(date, DX, DY, false);
// draw the seconds (2x size 7 segment)
//  gfx.setFont("7x11Numeric7Seg",1);
//  gfx.drawString(("0"+s).substr(-2), X+30, Y, false /*clear background*/);
}

function toggleDateTime() {
  showDateTime++;
  if(showDateTime > 2){
    showDateTime = 0;
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
  var pos_x = BAT_POS_X + 5 * (BAT_SIZE_X + 2);
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
  console.log("stepLevel: " + stepLevel);
  for(i = 0; i < stepLevel; i++) {
    pos_x -= BAT_SIZE_X + 2;
    gfx.fillRect(pos_x, BAT_POS_Y, 
                 pos_x + BAT_SIZE_X, BAT_POS_Y + BAT_SIZE_Y);
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
function drawBT(status) {
}
var hour = 0, minute = 1, second = 50;
var batVLevel = 0;
function draw() {
 
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
//  gfx2(hour, minute, second);
  drawBinary(cg, h, m, s);
  cg.setColor(0);
 
  switch(showDateTime) {
    case 1:
//  drawTime(hour, minute, second);
      drawTime(cg, h, m, s);
      break;
    case 2:
      drawDate(cg, d);
      break;
    default:
      /* do nothing */
  }
  console.log("BatLevel: " + batVLevel);
  drawBattery(cg, batVLevel /*E.getBattery()*/);
  drawBT(1);
  
  batVLevel += 2;
  if(batVLevel > 100) {
    batVLevel = 0;
  }
  updateVTime();
  g.clear();
  g.drawImages([{image:cgimg},
//             {image:require("Storage").read("Background176_center.png")},
             {image:require("Storage").read("Background240_center.png")},
             { x:BT_X, y:BT_Y, rotate: 0, image:require("Storage").read("bt-icon.png")},
            ]);
}

g.clear();
setInterval(draw, 1000);
var x_size = g.getWidth();
console.log("Startup: X-W = " + x_size);
console.log("BatLevel: " + E.getBattery());

setWatch(toggleDateTime, BTN1, { repeat : true, edge: "falling"});

