// The interval reference for updating the clock
let intervalRef = null;

// String numbers
const numberStr = ["ZERO","ONE", "TWO", "THREE", "FOUR", "FIVE",
                 "SIX", "SEVEN","EIGHT", "NINE", "TEN",
                 "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
                  "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
                  "NINETEEN", "TWENTY"];
const tensStr = ["ZERO", "TEN", "TWENTY", "THIRTY", "FOURTY",
                 "FIFTY"];
/**
* This is a object that initializes itself with a position and
* text after which you can tell it where you want to move to
* using the moveTo method and it will smoothly move the text across
*/
class ShiftText {
  constructor(x,y,txt,font_name,
              font_size,speed_x,speed_y,freq_millis){
    this.x = x;
    this.tgt_x = x;
    this.y = y;
    this.tgt_y = y;
    this.txt = txt;
    this.font_name = font_name;
    this.font_size = font_size;
    this.speed_x = Math.abs(speed_x);
    this.speed_y = Math.abs(speed_y);
    this.freq_millis = freq_millis;
    this.finished_callback=null;
  }
  show() {
    g.setFont(this.font_name,this.font_size);
    g.setColor(1,1,1);
    g.drawString(this.txt, this.x, this.y);
  }
  hide(){
    g.setFont(this.font_name,this.font_size);
    g.setColor(0,0,0);
    g.drawString(this.txt, this.x, this.y);
  }
  setText(txt){
    this.txt = txt;
  }
  setTextPosition(txt,x,y){
    this.hide();
    this.x = x;
    this.y = y;
    this.txt = txt;
    this.show();
  }
  moveTo(new_x,new_y){
    this.tgt_x = new_x;
    this.tgt_y = new_y;
    this._doMove();
  }
  onFinished(finished_callback){
    this.finished_callback = finished_callback;
  }
  /**
  * private internal method for directing the text move.
  * It will see how far away we are from the target coords
  * and move towards the target at the defined speed.
  */
  _doMove(){
    this.hide();
    // move closer to the target in the x direction
    diff_x = this.tgt_x - this.x;
    finished_x = false;
    if(Math.abs(diff_x) <= this.speed_x){
      this.x = this.tgt_x;
      finished_x = true;
    } else {
      if(diff_x > 0){
        this.x += this.speed_x;
      } else {
        this.x -= this.speed_x;
      }
    }
    // move closer to the target in the y direction
    diff_y = this.tgt_y - this.y;
    finished_y = false;
    if(Math.abs(diff_y) <= this.speed_y){
      this.y = this.tgt_y;
      finished_y = true;
    } else {
      if(diff_y > 0){
        this.y += this.speed_y;
      } else {
        this.y -= this.speed_y;
      }
    }
    this.show();
    finished = finished_x & finished_y;
    if(!finished){
      setTimeout(this._doMove.bind(this), this.freq_millis);
    } else if(this.finished_callback != null){
      this.finished_callback.call();
      this.finished_callback = null;
    }
  }
}


let hour_shift_txt = new ShiftText(240,50,'',"Vector",40,5,5,100);
let min_shift_txt = new ShiftText(240,100,'',"Vector",20,5,5,100);
let min_remainder_shift_txt = new ShiftText(240,120,'',"Vector",20,5,5,125);

function draw_clock(){
  console.log("draw_clock");
  let date = new Date();
  // First display the hours as a text number
  let hours = date.getHours();
  if(hours == 0 ){
    hours = 12;
  } else if(hours > 12){
    hours = hours - 12;
  }
  // If the hour string has changed then we move out the old
  // hours and move in the new hour string
  // If its the first time through the text is empty
  // so we just display without movement (otherewise the user 
  // will think its not working
  new_hours = numberStr[hours];
  if(new_hours != hour_shift_txt.txt && hour_shift_txt.txt != ''){
    hour_shift_txt.moveTo(-100,50);
    hour_shift_txt.onFinished(
      function(){
        hour_shift_txt.setTextPosition(new_hours,240,50);
        hour_shift_txt.moveTo(20,50);
        hour_shift_txt.onFinished(function(){console.log("hour finished");});
      }
    );
  } else {
    hour_shift_txt.setTextPosition(new_hours,20,50);
  }
  // If the mins is over 20 we have to display the text on 2 lines
  // Otherwise we just output our defined numbers from 1 to 20
  let mins = date.getMinutes();
  new_mins = '';
  new_mins_remainder = '';
  if(mins > 20){
    tens = (mins / 10 | 0);
    new_mins = tensStr[tens];
    let remainder = mins - tens * 10;
    if(remainder > 0){
      new_mins_remainder = numberStr[remainder];
    }
  } else if(mins > 0) {
    new_mins = numberStr[mins];
  }
  // If its the first time through the the text is moved in from 
  // the right
  // If the minute text has changed we move the old text
  // off screen and the new text on. 
  if(min_shift_txt.txt == ''){
    min_shift_txt.setTextPosition(new_mins,240,100);
    min_shift_txt.moveTo(20,100);
  } else if(new_mins != min_shift_txt.txt){
    min_shift_txt.moveTo(-100,100);
    min_shift_txt.onFinished(
      function(){
        min_shift_txt.setTextPosition(new_mins,240,100);
        min_shift_txt.moveTo(20,100);
      }
    );
  } else {
    min_shift_txt.setTextPosition(new_mins,20,100);
  }
  // finally we deal with the remainder line in the same way.
  if(min_remainder_shift_txt.txt == ''){
    min_remainder_shift_txt.setTextPosition(new_mins_remainder,240,125);
    min_remainder_shift_txt.moveTo(20,125);
  } else if(new_mins_remainder != min_remainder_shift_txt.txt){
    min_remainder_shift_txt.moveTo(-100,125);
    min_remainder_shift_txt.onFinished(
      function(){
        min_remainder_shift_txt.setTextPosition(new_mins_remainder,240,125);
        min_remainder_shift_txt.moveTo(20,125);
      }
    );
  } else {
    min_remainder_shift_txt.setTextPosition(new_mins_remainder,240,125);
  }
  console.log(date);
}

function clearTimers(){
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

function startTimers(){
  let date = new Date();
  let secs = date.getSeconds();
  let nextMinuteStart = 60 - secs;
  console.log("scheduling clock draw in " + nextMinuteStart + " seconds");
  setTimeout(scheduleDrawClock,nextMinuteStart * 1000);
  draw_clock();
}

function scheduleDrawClock(){
  console.log("scheduleDrawClock");
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 60*1000);
  draw_clock();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    console.log("lcdPower: on");
    Bangle.drawWidgets();
    startTimers();
  } else {
    console.log("lcdPower: off");
    clearTimers();
  }
});
Bangle.on('faceUp',function(up){
  console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
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
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2,{repeat:false,edge:"falling"});
