/**
* Adrian Kirk 2021-03
* Simple Clock showing 1 numeral for the hour 
* with a smooth sweep second.
*/

const screen_center_x = g.getWidth()/2;
const screen_center_y = g.getHeight()/2;

require("FontCopasetic40x58Numeric").add(Graphics);

class Hand {
  /**
  * Pure virtual class for all Hand classes to extend.
  * a hand class will have 1 main function 
  * moveTo which will move the hand to the given angle.
  */
  moveTo(angle){}
}

class ThinHand extends Hand {
  /**
  * The thin hand is created from a simple line, so its easy and fast
  * to draw.
  */
  constructor(centerX,
               centerY,
               length,
               tolerance,
               draw_test,
               red,
               green,
               blue){
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.red = red;
    this.green = green;
    this.blue = blue;
    // The last x and y coordinates (not the centre) of the last draw
    this.last_x = centerX;
    this.last_y = centerY;
    // tolerance is the angle tolerance (from the last draw)
    // in radians for a redraw to be called.
    this.tolerance = tolerance;
    // draw test is a predicate (angle, time). This is called
    // when the hand thinks that it does not have to draw (from its internal tests)
    // to see if it has to draw because of another object.
    this.draw_test = draw_test;
    // The current angle of the hand. Set to -1 initially
    this.angle = -1;
    this.last_draw_time = null;
  }
  // method to move the hand to a new angle
  moveTo(angle){
    // first test to see of the angle called is beyond the tolerance
    // for a redraw
    if(Math.abs(angle - this.angle) > this.tolerance ||
       // and then call the predicate to see if a redraw is needed
       this.draw_test(this.angle,this.last_draw_time) ){
      // rub out the old hand line
      g.setColor(0,0,0);
      g.drawLine(this.centerX, this.centerY, this.last_x, this.last_y);
      // Now draw the new hand line
      g.setColor(this.red,this.green,this.blue);
      x2 = this.centerX + this.length*Math.sin(angle);
      y2 = this.centerY - this.length*Math.cos(angle);
      g.setColor(this.red,this.green,this.blue);
      g.drawLine(this.centerX, this.centerY, x2, y2);
      // and store the last draw details for the next call
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

class ThickHand extends Hand {
  /**
  * The thick hand is created from a filled polygone, so its slower to
  * draw so to be used sparingly with few redraws
  */
  constructor(centerX,
               centerY,
               length,
               tolerance,
               draw_test,
               red,
               green,
               blue,
               base_height,
               thickness){
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.thickness = thickness;
    this.base_height = base_height;
    // angle from the center to the top corners of the rectangle
    this.delta_top = Math.atan(thickness/(2*length));
    // angle from the center to the bottom corners of the rectangle
    this.delta_base = Math.atan(thickness/(2*base_height));
    // the radius that the bottom corners of the rectangle move through
    this.vertex_radius_base = Math.sqrt( (thickness*thickness/4) + base_height * base_height);
    // the radius that the top corners of the rectangle move through
    this.vertex_radius_top = Math.sqrt( (thickness*thickness/4) + length * length);
    // last records the last plotted values (so we don't have to keep recalculating
    this.last_x1 = centerX;
    this.last_y1 = centerY;
    this.last_x2 = centerX;
    this.last_y2 = centerY;
    this.last_x3 = centerX;
    this.last_y3 = centerY;
    this.last_x4 = centerX;
    this.last_y4 = centerY;
    // The change in angle from the last plotted angle before we actually redraw
    this.tolerance = tolerance;
    // predicate test that is called if the hand is not going to redraw to see
    // if there is an externally defined reason for redrawing (like another hand)
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
        this.vertex_radius_base*Math.sin(angle - this.delta_base);
      y1 = this.centerY - this.vertex_radius_base*Math.cos(angle - this.delta_base);
      // bottom right
      x2 = this.centerX +
        this.vertex_radius_base*Math.sin(angle + this.delta_base);
      y2 = this.centerY - this.vertex_radius_base*Math.cos(angle + this.delta_base);
      // top right
      x3 = this.centerX + this.vertex_radius_top*Math.sin(angle + this.delta_top);
      y3 = this.centerY - this.vertex_radius_top*Math.cos(angle + this.delta_top);
      // top left
      x4 = this.centerX + this.vertex_radius_top*Math.sin(angle - this.delta_top);
      y4 = this.centerY - this.vertex_radius_top*Math.cos(angle - this.delta_top);
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
// The force draw is set to  true to force all objects to redraw themselves
let force_redraw = false;
// The seconds hand is the main focus and is set to redraw on every cycle
let seconds_hand = new ThinHand(screen_center_x, 
                           screen_center_y,
                           100,
                            0,
                            (angle, last_draw_time) => false,
                           1.0,0.0,0.0);
// The minute hand is set to redraw at a 250th of a circle,
// when the second hand is ontop or slighly overtaking
// or when a force_redraw is called
let minutes_hand_redraw = function(angle, last_draw_time){
  return force_redraw || (seconds_hand.angle > angle &&
    Math.abs(seconds_hand.angle - angle) <2*Math.PI/25 &&
    new Date().getTime() - last_draw_time.getTime() > 500);
};
let minutes_hand = new ThinHand(screen_center_x, 
                           screen_center_y,
                           80,
                            2*Math.PI/250,
                           minutes_hand_redraw,
                           1.0,1.0,1.0);
// The hour hand is a thick hand so we have to redraw when the minute hand
// overlaps from its behind andle coverage to its ahead angle coverage.
let hour_hand_redraw = function(angle_from, angle_to, last_draw_time){
  return force_redraw || (seconds_hand.angle >= angle_from &&
    seconds_hand.angle <= angle_to  &&
    new Date().getTime() - last_draw_time.getTime() > 500);
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
  force_redraw = false;
}
// drawing the second the millisecond as we need the fine gradation
// for the sweep second hand.
function draw_seconds(date){
  seconds = date.getSeconds() + date.getMilliseconds()/1000;
  seconds_frac = seconds / 60;
  seconds_angle = 2*Math.PI*seconds_frac;
  seconds_hand.moveTo(seconds_angle);
}
// drawing the minute includes the second and millisec to make the
// movement as continuous as possible.
function draw_mins(date,seconds_angle){
  mins = date.getMinutes() + date.getSeconds()/60 + date.getMilliseconds()/(60*1000);
  mins_frac = mins / 60;
  mins_angle = 2*Math.PI*mins_frac;
  redraw = minutes_hand.moveTo(mins_angle);
  if(redraw){
    console.log("redraw mins");
  }
}

function draw_hours(date){
  hours = (date.getHours() % 12) + date.getMinutes()/60 + date.getSeconds()/3600;
  hours_frac = hours / 12;
  hours_angle = 2*Math.PI*hours_frac;
  redraw = hours_hand.moveTo(hours_angle);
  if(redraw){
    console.log("redraw hours");
  }
}

/**
* We want to be able to change the font so we set up
* pure virtual for all fonts implementtions to use
*/
class NumeralFont {
  /**
  *  The screen dimensions of what we are going to 
  * display for the given hour.
  */
  getDimensions(hour){return [0,0];}
  /**
   * The characters that are going to be returned for 
   * the hour.
   */
  hour_txt(hour){ return ""; }
  /**
   * method to draw text at the required coordinates
   */
  draw(hour_txt,x,y){ return "";}
}

class CopasetFont extends NumeralFont{
  constructor(){
    super();
    // dimesion map provides the dimesions of the character for 
    // each number for plotting and collision detection
    this.dimension_map = {
      1 : [20,58],
      2 : [30,58],
      3 : [30,58],
      4 : [30,58],
      5 : [30,58],
      6 : [40,58],
      7 : [30,58],
      8 : [40,58],
      9 : [40,58],
      10: [50,58],
      11: [40,58],
      12: [40,58]
    };
  }
  getDimensions(hour){return this.dimension_map[hour];}
  hour_txt(hour){ return hour.toString(); }
  draw(hour_txt,x,y){
    /* going to leave this in here for future testing.
     uncomment this so that it draws a box behind the string
     so we can guess the digit dimensions
    dim = [50,58];
    g.setColor(0.5,0,0);
    g.fillPoly([x,y,
                  x+dim[0],y,
                  x+dim[0],y+dim[1],
                  x,y+dim[1]
                 ]);
    g.setColor(1.0,1.0,1.0);*/
    g.setFontCopasetic40x58Numeric();
    g.drawString(hour_txt,x,y);
  }
}


class RomanNumeralFont extends NumeralFont{
  constructor(){
    super();
    // text map provides the mapping between hour and roman numeral
    this.txt_map = {
      1 : 'I',
      2 : 'II',
      3 : 'III',
      4 : 'IV',
      5 : 'V',
      6 : 'VI',
      7 : 'VII',
      8 : 'VIII',
      9 : 'IX',
      10: 'X',
      11: 'XI',
      12: 'XII'
    };
    // dimesion map provides the dimesions of the characters for 
    // each hour for plotting and collision detection
    this.dimension_map = {
      1 : [10,40],
      2 : [25,40],
      3 : [40,40],
      4 : [40,40],
      5 : [30,40],
      6 : [40,40],
      7 : [60,40],
      8 : [70,40],
      9 : [40,40],
      10: [20,40],
      11: [40,40],
      12: [60,40]
    };
  }
  getDimensions(hour){ return this.dimension_map[hour];}
  hour_txt(hour){ return this.txt_map[hour]; }
  draw(hour_txt,x,y){
    g.setFont("Vector",40);
    g.drawString(hour_txt,x,y);
  }
}

// The problem with the trig inverse functions on 
// a full circle is that the sector information will be lost
// Choosing to use arcsin because you can get back the 
// sector with the help of the original coordinates
function reifyasin(x,y,asin_angle){
  if(x >= 0 && y >= 0){
    return asin_angle;
  } else if(x >= 0 && y < 0){
    return Math.PI - asin_angle;
  } else if(x < 0 && y < 0){
    return Math.PI - asin_angle;
  } else {
    return 2*Math.PI + asin_angle;
  }
}

// rebase and angle so be between -pi and pi 
// rather than 0 to 2PI
function rebaseNegative(angle){
  if(angle > Math.PI){
    return angle - 2*Math.PI;
  } else {
    return angle;
  }
}

// rebase an angle so that it is between 0 to 2pi
// rather than -pi to pi
function rebasePositive(angle){
  if(angle < 0){
    return angle + 2*Math.PI;
  } else {
    return angle;
  }
}

/**
* The Hour Scriber is responsible for drawing the numeral
* on the screen at the requested angle.
* It allows for the font to be changed on the fly.
*/
class HourScriber {
  constructor(radius, numeral_font, draw_test){
    this.radius = radius;
    this.numeral_font = numeral_font;
    this.draw_test = draw_test;
    this.curr_numeral_font = numeral_font;
    this.curr_hour_x = -1;
    this.curr_hour_y = -1;
    this.curr_hours = -1;
    this.curr_hour_str = null;
    this.last_draw_time = null;
  }
  setNumeralFont(numeral_font){
    this.numeral_font = numeral_font;
  }
  drawHour(hours){
    changed = false;
    if(this.curr_hours != hours || this.curr_numeral_font !=this.numeral_font){
      g.setColor(0,0,0);
      this.curr_numeral_font.draw(this.curr_hour_str,
                             this.curr_hour_x,
                             this.curr_hour_y);
      console.log("erasing old hour");
      hours_frac = hours / 12;
      angle = 2*Math.PI*hours_frac;
      dimensions = this.numeral_font.getDimensions(hours);
      // we set the radial coord to be in the middle
      // of the drawn text.
      width = dimensions[0];
      height = dimensions[1];
      delta_center_x = this.radius*Math.sin(angle) - width/2;
      delta_center_y = this.radius*Math.cos(angle) + height/2;
      this.curr_hour_x  = screen_center_x + delta_center_x;
      this.curr_hour_y = screen_center_y - delta_center_y;
      this.curr_hour_str = this.numeral_font.hour_txt(hours);
      // now work out the angle of the beginning and the end of the 
      // text box so we know when to redraw
      // bottom left angle
      x1 = delta_center_x;
      y1 = delta_center_y;
      r1 = Math.sqrt(x1*x1 + y1*y1);
      angle1 = reifyasin(x1,y1,Math.asin(x1/r1));
      // bottom right angle
      x2 = delta_center_x;
      y2 = delta_center_y - height;
      r2 = Math.sqrt(x2*x2 + y2*y2);
      angle2 = reifyasin(x2,y2,Math.asin(x2/r2));
      // top left angle
      x3 = delta_center_x + width;
      y3 = delta_center_y;
      r3 = Math.sqrt(x3*x3 + y3*y3);
      angle3 = reifyasin(x3,y3, Math.asin(x3/r3));
      // top right angle
      x4 = delta_center_x + width;
      y4 = delta_center_y - height;
      r4 = Math.sqrt(x4*x4 + y4*y4);
      angle4 = reifyasin(x4,y4,Math.asin(x4/r4));
      if(Math.min(angle1,angle2,angle3,angle4) < Math.PI && Math.max(angle1,angle2,angle3,angle4) > 1.5*Math.PI){
        angle1 = rebaseNegative(angle1);
        angle2 = rebaseNegative(angle2);
        angle3 = rebaseNegative(angle3);
        angle3 = rebaseNegative(angle4);
        this.angle_from = rebasePositive( Math.min(angle1,angle2,angle3,angle4) );
        this.angle_to = rebasePositive( Math.max(angle1,angle2,angle3,angle4) ); 
      } else {
        this.angle_from = Math.min(angle1,angle2,angle3,angle4);
        this.angle_to = Math.max(angle1,angle2,angle3,angle4); 
      }
      //console.log(angle1 + "/" + angle2  + " / " + angle3 + " / " + angle4);
      //console.log( this.angle_from + " to " + this.angle_to);
      this.curr_hours = hours;
      this.curr_numeral_font = this.numeral_font;
      changed = true;
    }
    if(changed ||
       this.draw_test(this.angle_from, this.angle_to, this.last_draw_time) ){
      g.setColor(1,1,1);
      this.numeral_font.draw(this.curr_hour_str,this.curr_hour_x,this.curr_hour_y);
      this.last_draw_time = new Date();
      console.log("redraw digit");
    }
  }
}

let numeral_fonts = [new CopasetFont(), new RomanNumeralFont()];
let numeral_fonts_index = 0;
/**
* predicate for deciding when the digit has to be redrawn
*/
let hour_numeral_redraw = function(angle_from, angle_to, last_draw_time){ 
  seconds_hand_angle = seconds_hand.angle; 
  // we have to cope with the 12 problem where the 
  // left side of the box has a value almost 2PI and the right
  // side has a small positive value. The values are rebased so
  // that they can be compared
  if(angle_from > angle_to && angle_from > 1.5*Math.PI){
    angle_from = angle_from - 2*Math.PI;
    if(seconds_hand_angle > Math.PI)
       seconds_hand_angle = seconds_hand_angle - 2*Math.PI;
  } 
  //console.log("initial:" + angle_from + "/" + angle_to  + " seconds " + seconds_hand_angle);
   redraw = force_redraw ||
     (seconds_hand_angle >= angle_from && seconds_hand_angle <= angle_to) ||
     (minutes_hand.last_draw_time.getTime() > last_draw_time.getTime());
  if(redraw){
     //console.log(angle_from + "/" + angle_to  + " seconds " + seconds_hand_angle);
  }
  return redraw;
};
let hour_scriber = new HourScriber(70,
                                   numeral_fonts[numeral_fonts_index],
                                   hour_numeral_redraw
                                  );
/**
* Called from button 1 to change the numerals that are
* displayed on the clock face
*/
function next_font(){
  numeral_fonts_index = numeral_fonts_index + 1;
  if(numeral_fonts_index >= numeral_fonts.length){
    numeral_fonts_index = 0;
  }
  hour_scriber.setNumeralFont(
    numeral_fonts[numeral_fonts_index]);
  force_redraw = true;
}

function draw_hour_digit(date){
  hours = date.getHours() % 12;
  mins = date.getMinutes();
  if(mins > 30){
    hours = (hours +1) % 12;
  }
  if(hours == 0){
    hours = 12;
  }
  hour_scriber.drawHour(hours);
}

// Boiler plate code for setting up the clock
// below
let intervalRef = null;

function clearTimers(){
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

function startTimers(){
  setTimeout(scheduleDrawClock,100);
  draw_clock();
}

// The clock redraw is set to 100ms. This is the smallest number
// that give the (my) human eye the illusion of a continious sweep
// second hand.
function scheduleDrawClock(){
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 100);
  draw_clock();
}

function reset_clock(){
  g.clear();
  force_redraw = true;
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
  next_font(); 
}

// Handle button 1 being pressed
setWatch(button1pressed, BTN1,{repeat:true,edge:"falling"});

