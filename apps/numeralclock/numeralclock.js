const screen_center_x = g.getWidth()/2;
const screen_center_y = g.getHeight()/2;

require("FontCopasetic40x58Numeric").add(Graphics);

class Hand {
  constructor(centerX, 
               centerY, 
               length, 
               tolerance, 
               draw_test,
               red, 
               green, 
               blue){
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.last_x = centerX;
    this.last_y = centerY;
    this.tolerance = tolerance;
    this.draw_test = draw_test;
    this.angle = -1;
    this.last_draw_time = null;
  }
  // method to move the hand to a new angle
  moveTo(angle){
    if(Math.abs(angle - this.angle) > this.tolerance || this.draw_test(this.angle,this.last_draw_time) ){
      g.setColor(0,0,0);
      g.drawLine(this.centerX, this.centerY, this.last_x, this.last_y);
      g.setColor(this.red,this.green,this.blue);
      x2 = this.centerX + this.length*Math.cos(angle);
      y2 = this.centerY + this.length*Math.sin(angle);
      g.setColor(this.red,this.green,this.blue);
      g.drawLine(this.centerX, this.centerY, x2, y2);
      this.last_x = x2;
      this.last_y = y2;
      this.angle = angle;
      this.last_draw_time = new Date();
      return true;
    } else {
      return false;
    }
  }
}

class ThickHand {
  constructor(centerX,
               centerY,
               length,
               tolerance,
               draw_test,
               red,
               green,
               blue,
               start_height,
               thickness){
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.thickness = thickness;
    this.start_height = start_height;
    this.delta_top = Math.atan(thickness/(2*length));
    this.delta_base = Math.atan(thickness/(2*start_height));
    this.last_x1 = centerX;
    this.last_y1 = centerY;
    this.last_x2 = centerX;
    this.last_y2 = centerY;
    this.last_x3 = centerX;
    this.last_y3 = centerY;
    this.last_x4 = centerX;
    this.last_y4 = centerY;
    this.tolerance = tolerance;
    this.draw_test = draw_test;
    this.angle = -1;
    this.last_draw_time = null;
  }
  // method to move the hand to a new angle
  moveTo(angle){
    if(Math.abs(angle - this.angle) > this.tolerance || this.draw_test(this.angle - this.delta_base,this.angle + this.delta_base ,this.last_draw_time) ){
      g.setColor(0,0,0);
      g.fillPoly([this.last_x1,
                  this.last_y1,
                  this.last_x2,
                  this.last_y2,
                  this.last_x3,
                  this.last_y3,
                  this.last_x4,
                  this.last_y4
                 ]);
      g.setColor(this.red,this.green,this.blue);
      // bottom left
      x1 = this.centerX + 
        this.start_height*Math.cos(angle - this.delta_base);
      y1 = this.centerY + this.start_height*Math.sin(angle - this.delta_base);
      // bottom right
      x2 = this.centerX + 
        this.start_height*Math.cos(angle + this.delta_base);
      y2 = this.centerY + this.start_height*Math.sin(angle + this.delta_base);
      // top right
      x3 = this.centerX + this.length*Math.cos(angle + this.delta_top);
      y3 = this.centerY + this.length*Math.sin(angle + this.delta_top);
      // top left
      x4 = this.centerX + this.length*Math.cos(angle - this.delta_top);
      y4 = this.centerY + this.length*Math.sin(angle - this.delta_top);
      g.setColor(this.red,this.green,this.blue);
      g.fillPoly([x1,y1,
                  x2,y2,
                  x3,y3,
                  x4,y4
                 ]);
      this.last_x1 = x1;
      this.last_y1 = y1;
      this.last_x2 = x2;
      this.last_y2 = y2;
      this.last_x3 = x3;
      this.last_y3 = y3;
      this.last_x4 = x4;
      this.last_y4 = y4;
      this.angle = angle;
      this.last_draw_time = new Date();
      return true;
    } else {
      return false;
    }
  }
}

let seconds_hand = new Hand(screen_center_x, 
                           screen_center_y,
                           100,
                            0,
                            (angle, last_draw_time) => false,
                           0.5,0.5,0.5);

let minutes_hand_redraw = function(angle, last_draw_time){
  return seconds_hand.angle > angle &&
    Math.abs(seconds_hand.angle - angle) <2*Math.PI/25 &&
    new Date().getTime() - last_draw_time.getTime() > 500;
};

let minutes_hand = new Hand(screen_center_x, 
                           screen_center_y,
                           80,
                            2*Math.PI/250,
                           minutes_hand_redraw,
                           1.0,1.0,1.0);

let hour_hand_redraw = function(angle_from, angle_to, last_draw_time){
  return seconds_hand.angle >= angle_from &&
    seconds_hand.angle <= angle_to  &&
    new Date().getTime() - last_draw_time.getTime() > 500;
};
let hours_hand = new ThickHand(screen_center_x, 
                           screen_center_y,
                           40,
                            2*Math.PI/600,
                          hour_hand_redraw,
                           1.0,1.0,1.0,
                          5,
                          4);

function draw_clock(){
  date = new Date();
  draw_hour_digit(date);
  draw_seconds(date);
  draw_mins(date);
  draw_hours(date);
}

function draw_seconds(date){
  seconds = date.getSeconds() + date.getMilliseconds()/1000;
  seconds_frac = seconds / 60;
  seconds_angle = 2*Math.PI*seconds_frac - (Math.PI/2.0);
  seconds_hand.moveTo(seconds_angle);
}


function draw_mins(date,seconds_angle){
  mins = date.getMinutes() + date.getSeconds()/60 + date.getMilliseconds()/(60*1000);
  mins_frac = mins / 60;
  mins_angle = 2*Math.PI*mins_frac - (Math.PI/2.0);
  redraw = minutes_hand.moveTo(mins_angle);
  if(redraw){
    //console.log(date.getSeconds() + " redraw mins");
  }
}

function draw_hours(date){
  hours = (date.getHours() % 12) + date.getMinutes()/60 + date.getSeconds()/3600;
  hours_frac = hours / 12;
  hours_angle = 2*Math.PI*hours_frac - (Math.PI/2.0);
  redraw = hours_hand.moveTo(hours_angle);
  if(redraw){
    //console.log(date.getSeconds() + " redraw hours");
  }
}

let curr_hour_x = -1;
let curr_hour_y = -1;
let curr_hour_str = null;
const font_width = 40;
const font_height = 58; 
function draw_hour_digit(date){
  hours = date.getHours() % 12;
  mins = date.getMinutes();
  if(mins > 30){
    hours = (hours +1) % 12;
  }
  if(hours == 0){
    hours = 12;
  }
  hours_frac = hours / 12;
  angle = 2*Math.PI*hours_frac - (Math.PI/2.0);
  x = screen_center_x + 70*Math.cos(angle) - font_width/2;
  y = screen_center_y + 70*Math.sin(angle) - font_height/2;
  g.setFontCopasetic40x58Numeric();
  txt = hours.toString();
  if(curr_hour_str != null && curr_hour_str != txt){
    g.setColor(0,0,0);
    g.drawString(curr_hour_str,curr_hour_x,curr_hour_y);
    console.log("erasing old hour");
  }
  g.setColor(1,1,1);
  g.drawString(txt,x,y);
  curr_hour_x = x;
  curr_hour_y = y;
  curr_hour_str = txt;
}

// The interval reference for updating the clock
let intervalRef = null;

function clearTimers(){
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

function startTimers(){
  setTimeout(scheduleDrawClock,1000);
  draw_clock();
}

function scheduleDrawClock(){
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 100);
  draw_clock();
}

function reset_clock(){
  g.clear();
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

function button1pressed(){
  console.log("button 1 pressed");
}

// Handle button 1 being pressed
setWatch(button1pressed, BTN1,{repeat:true,edge:"falling"});

