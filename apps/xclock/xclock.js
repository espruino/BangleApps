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
              font_size,speed_x,speed_y,freq_millis, color){
    this.x = x;
    this.tgt_x = x;
    this.init_x = x;
    this.y = y;
    this.tgt_y = y;
    this.init_y = y;
    this.txt = txt;
    this.init_txt = txt;
    this.font_name = font_name;
    this.font_size = font_size;
    this.speed_x = Math.abs(speed_x);
    this.speed_y = Math.abs(speed_y);
    this.freq_millis = freq_millis;
    this.colour = color;
    this.finished_callback=null;
    this.timeoutId = null;
  }
  reset(){
    this.hide();
    this.x = this.init_x;
    this.y = this.init_y;
    this.txt = this.init_txt;
    this.show();
    if(this.timeoutId != null){
       clearTimeout(this.timeoutId);
    }
  }
  show() {
    g.setFont(this.font_name,this.font_size);
    g.setColor(this.colour[0],this.colour[1],this.colour[2]);
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
  setTextXPosition(txt,x){
    this.hide();
    this.x = x;
    this.txt = txt;
    this.show();
  }
  moveTo(new_x,new_y){
    this.tgt_x = new_x;
    this.tgt_y = new_y;
    this._doMove();
  }
  moveToX(new_x){
    this.tgt_x = new_x;
    this._doMove();
  }
  moveToY(new_y){
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
    this.timeoutId = null;
    finished = finished_x & finished_y;
    if(!finished){
      this.timeoutId = setTimeout(this._doMove.bind(this), this.freq_millis);
    } else if(this.finished_callback != null){
      this.finished_callback.call();
      this.finished_callback = null;
    }
  }
}


class DateFormatter { 
  formatDate(date){
    return ["","",""];
  }
}

class EnglishDateFormatter extends DateFormatter{
  formatDate(date){
    // First display the hours as a text number
    let hours = date.getHours();
    if(hours == 0){
      hours = 12;
    } else if(hours > 12){
      hours = hours - 12;
    }
    new_hours = numberStr[hours]; 
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
    return [new_hours,new_mins,new_mins_remainder];
  }
}

let row_displays = [ new ShiftText(240,50,'',"Vector",40,10,10,50,[1,1,1]),
  new ShiftText(240,100,'',"Vector",20,10,10,50,[0.85,0.85,0.85]),
  new ShiftText(240,120,'',"Vector",20,10,10,50,[0.85,0.85,0.85])
];

let date_formatter = new EnglishDateFormatter();

function reset_clock(){
  console.log("reset_clock");
  var i;
  for (i = 0; i < row_displays.length; i++) {
    row_displays[i].reset();
  }
}

function draw_clock(){
  console.log("draw_clock");
  let date = new Date();
  rows = date_formatter.formatDate(date);
  var i;
  for (i = 0; i < rows.length; i++) {
    display = row_displays[i];
    txt = rows[i];
    display_row(display,txt);
  }
  console.log(date);
}

function display_row(display,txt){
  if(display.txt == ''){
    display.setTextXPosition(txt,240);
    display.moveToX(20);
  } else if(txt != display.txt){
    display.moveToX(-100);
    display.onFinished(
      function(){
        display.setTextXPosition(txt,240);
        display.moveToX(20);
      }
    );
  } else {
    display.setTextXPosition(txt,20);
  }
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
    reset_clock();
    startTimers();
  } else {
    console.log("lcdPower: off");
    reset_clock();
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
