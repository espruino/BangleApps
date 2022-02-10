/**
 * Adrian Kirk 2021-10
 *
 * Matrix Clock
 *
 * A simple clock inspired by the movie. 
 * Text shards move down the screen as a background to the 
 * time and date
 **/
const Locale = require('locale');

const SHARD_COLOR =[0,1.0,0];
const SHARD_FONT_SIZE = 12;
const SHARD_Y_START = 30;
const w = g.getWidth();

/**
* The text shard object is responsible for creating the 
* shards of text that move down the screen. As the 
* shard moves down the screen the latest character added
* is brightest with characters being coloured darker and darker
* going back to the eldest
*/
class TextShard {

  constructor(x,y,length){
    // The x and y coords of the first character of the shard
    this.x = x;
    this.y = y;
    // The visible length of the shard. We don't make the
    // whole chain visible just to save on cpu time
    this.length = length;
    // the list of characters making up this shard
    this.txt = [];
  }
  /**
  * The add method call adds another random character to 
  * the chain
  */
  add(){
    this.txt.push(randomChar());
  }
  /**
  * The show method displays the latest shard image to the 
  * screen with the following rules:
  * - latest addition is brightest, oldest is darker
  * - display up to defined length of characters only 
  * of the shard to save cpu
  */
  show(){
    g.setFontAlign(-1,-1,0);
    for(var i=0; i<Math.min(this.txt.length, this.length + 1) ; i++){
      idx = this.txt.length - i - 1;
      var color_strength=1 - i/this.length;
      if(i > this.length - 2){
        color_strength = 0;
      } 
      g.setColor(color_strength*SHARD_COLOR[0],
                 color_strength*SHARD_COLOR[1],
                 color_strength*SHARD_COLOR[2]);
      g.setFont("Vector",SHARD_FONT_SIZE);
      g.drawString(this.txt[idx], this.x, this.y + idx*SHARD_FONT_SIZE); 
    }
  }
  /**
  * Method tests to see if any part of the shard chain is still 
  * visible on the screen
  */
  isVisible(){
     return (this.y + (this.txt.length - this.length - 2)*SHARD_FONT_SIZE < g.getHeight());
  }
  /**
  * resets the shard back to the top of the screen
  */
  reset(){
    this.y = SHARD_Y_START;
    this.txt = [];
  }
}

/**
* random character chooser to be called by the shard when adding characters
*/
const CHAR_CODE_START = 33;
const CHAR_CODE_LAST = 126;
const CHAR_CODE_LENGTH = CHAR_CODE_LAST - CHAR_CODE_START;
function randomChar(){
  return String.fromCharCode(Math.floor(Math.random() * CHAR_CODE_LENGTH)+ CHAR_CODE_START);
}

// Now set up the shards
// we are going to have a limited no of shards (to save cpu)
// but randomize the x value and length every reset to make it look as if there 
// are more
var shards = [];
const NO_SHARDS = 3;
const channel_width = g.getWidth()/NO_SHARDS;

function shard_x(i){
  return i*channel_width + Math.random() * channel_width;
}

function shard_length(){
  return Math.floor(Math.random()*5) + 3;
}

for(var i=0; i<NO_SHARDS; i++){
  shards.push(new TextShard(shard_x(i),50 + Math.random()*100,shard_length()) );
}

var timeStr = "";
var dateStr = "";
var last_draw_time = null;

const TIME_X_COORD = 20;
const TIME_Y_COORD = g.getHeight() / 2;
const DATE_X_COORD = 170;
const DATE_Y_COORD = 30;
const RESET_PROBABILITY = 0.5;
/**
* main loop to draw the clock face
*/
function draw_clock(){
  // first move all the shards down the screen
  for(var i=0; i<this.shards.length; i++){
    var visible = shards[i].isVisible();
    // once the shard is no longer visible we wait
    // a random no of loops before reseting
    if(!visible && Math.random() > RESET_PROBABILITY){
      shards[i].reset();
      shards[i].length = shard_length();
      shards[i].x = shard_x(i);
      if(shards[i].x > DATE_X_COORD - 20){
        shards[i].y = 50;
      }
    }
    // If its still visble then add to the shard and show to screen
    if(visible){
      shards[i].add();
    }
    // we still have to show the shard even though it may be off the screen to keep the speed constant
    shards[i].show();
  }
  var now = new Date();
  // draw time. Have to draw time on every loop

  g.setFont("Vector", g.getWidth() / 5);
  g.setFontAlign(0,-1);
  if(last_draw_time == null || now.getMinutes() != last_draw_time.getMinutes()){
    g.setColor(g.theme.bg);
    g.drawString(timeStr, w/2, TIME_Y_COORD);
    timeStr = format_time(now);
  }
  g.setColor(SHARD_COLOR[0], SHARD_COLOR[1], SHARD_COLOR[2]);
  g.drawString(timeStr, w/2, TIME_Y_COORD); 
  //
  // draw date when it changes
  g.setFont("Vector",15);
  g.setFontAlign(0,-1,0);
  if(last_draw_time == null || now.getDate() != last_draw_time.getDate()){
    g.setColor(g.theme.bg);
    g.drawString(dateStr, w/2, DATE_Y_COORD);
    dateStr = format_date(now);
  }
  g.setColor(SHARD_COLOR[0], SHARD_COLOR[1], SHARD_COLOR[2]);
  g.drawString(dateStr, w/2, DATE_Y_COORD);
  last_draw_time = now;
}

function format_date(now){
  return Locale.dow(now,1) + " " + format00(now.getDate());
}


function format_time(now){
  var time = new Date(now.getTime());
  var hours = time.getHours() % 12;
  if(hours < 1){
    hours = 12;
  }
  var am_pm;
  if(time.getHours() < 12){
    am_pm = "AM"; 
  } else {
    am_pm = "PM";
  }
  return format00(hours) + ":" + format00(time.getMinutes()) + " "+ am_pm;
}

function format00(num){
    var value = (num | 0);
    if(value > 99 || value < 0)
        throw "must be between in range 0-99";
    if(value < 10)
        return "0" + value.toString();
    else
        return value.toString();
}

// The interval reference for updating the clock
let intervalRef = null;

function clearTimers(){
  if(intervalRef != null) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

function shouldRedraw(){
  return Bangle.isLCDOn();
}

function startTimers(){
  clearTimers();
  if (Bangle.isLCDOn()) {
    intervalRef = setInterval(() => {
        if (!shouldRedraw()) {
          //console.log("draw clock callback - skipped redraw");
        } else {
          draw_clock();
        }
      }, 100
    );
    draw_clock();
  } else {
    console.log("scheduleDrawClock - skipped not visible");
  }
}


Bangle.on('lcdPower', (on) => {
  if (on) {
    //console.log("lcdPower: on");
    startTimers();
  } else {
    //console.log("lcdPower: off");
    clearTimers();
  }
});

Bangle.on('faceUp',function(up){
  //console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
  if (up && !Bangle.isLCDOn()) {
    //console.log("faceUp and LCD off");
    clearTimers();
    Bangle.setLCDPower(true);
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

startTimers();
Bangle.setUI("clock");


