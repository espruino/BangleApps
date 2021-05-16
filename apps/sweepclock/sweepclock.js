/**
 * Adrian Kirk 2021-03
 * Simple Clock showing 1 numeral for the hour
 * with a smooth sweep second.
 */

const screen_center_x = g.getWidth()/2;
const screen_center_y = 10 + g.getHeight()/2;
const TWO_PI = 2*Math.PI;

require("FontCopasetic40x58Numeric").add(Graphics);

const color_schemes = [
  {
    name: "black",
    background : [0.0,0.0,0.0],
    second_hand: [1.0,0.0,0.0],
  },
  {
    name: "red",
    background : [1.0,0.0,0.0],
    second_hand: [1.0,1.0,0.0],
  },
  {
    name: "grey",
    background : [0.5,0.5,0.5],
    second_hand: [0.0,0.0,0.0],
  },
  {
    name: "purple",
    background : [1.0,0.0,1.0],
    second_hand: [1.0,1.0,0.0],
  },
  {
    name: "blue",
    background : [0.4,0.7,1.0],
    second_hand: [0.5,0.5,0.5],
  }
];

let color_scheme_index = 0;

const WHITE = [1.0,1.0,1.0];
function default_white(color){
  if(color == null){
    return WHITE;
  } else {
    return color;
  }
}

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
              color_theme){
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.color_theme = color_theme;
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
      var background = color_schemes[color_scheme_index].background;
      g.setColor(background[0],background[1],background[2]);
      g.drawLine(this.centerX, this.centerY, this.last_x, this.last_y);
      // Now draw the new hand line
      var hand_color = default_white(color_schemes[color_scheme_index][this.color_theme]);
      g.setColor(hand_color[0],hand_color[1],hand_color[2]);
      var x2 = this.centerX + this.length*Math.sin(angle);
      var y2 = this.centerY - this.length*Math.cos(angle);
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
              color_theme,
              base_height,
              thickness){
    super();
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.color_theme = color_theme;
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
      var background = color_schemes[color_scheme_index].background;
      g.setColor(background[0],background[1],background[2]);
      g.fillPoly([this.last_x1,
        this.last_y1,
        this.last_x2,
        this.last_y2,
        this.last_x3,
        this.last_y3,
        this.last_x4,
        this.last_y4
      ]);
      // bottom left
      var x1 = this.centerX +
          this.vertex_radius_base*Math.sin(angle - this.delta_base);
      var y1 = this.centerY - this.vertex_radius_base*Math.cos(angle - this.delta_base);
      // bottom right
      var x2 = this.centerX +
          this.vertex_radius_base*Math.sin(angle + this.delta_base);
      var y2 = this.centerY - this.vertex_radius_base*Math.cos(angle + this.delta_base);
      // top right
      var x3 = this.centerX + this.vertex_radius_top*Math.sin(angle + this.delta_top);
      var y3 = this.centerY - this.vertex_radius_top*Math.cos(angle + this.delta_top);
      // top left
      var x4 = this.centerX + this.vertex_radius_top*Math.sin(angle - this.delta_top);
      var y4 = this.centerY - this.vertex_radius_top*Math.cos(angle - this.delta_top);
      var hand_color = default_white(color_schemes[color_scheme_index][this.color_theme]);
      g.setColor(hand_color[0],hand_color[1],hand_color[2]);
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
    95,
    0,
    (angle, last_draw_time) => false,
    "second_hand");

// The minute hand is set to redraw at a 250th of a circle,
// when the second hand is ontop or slighly overtaking
// or when a force_redraw is called
let minutes_hand_redraw = function(angle, last_draw_time){
  return force_redraw || (seconds_hand.angle > angle &&
      Math.abs(seconds_hand.angle - angle) <TWO_PI/25 &&
      new Date().getTime() - last_draw_time.getTime() > 500);
};
let minutes_hand = new ThinHand(screen_center_x,
    screen_center_y,
    80,
    TWO_PI/250,
    minutes_hand_redraw,
    "minute_hand"
);
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
    TWO_PI/600,
    hour_hand_redraw,
    "hour_hand",
    5,
    4);

function draw_clock(){
  var date = new Date();
  draw_background();
  draw_hour_digit(date);
  draw_seconds(date);
  draw_mins(date);
  draw_hours(date);
  draw_date(date);
  force_redraw = false;
}

var local = require('locale');
var last_date = null;
var last_datestr = null;
var last_coords = null;
const date_coords = [
  { name: "topright", coords:[180,30]},
  { name: "bottomright", coords:[180,220]},
  { name: "bottomleft", coords: [5,220]},
  { name: "topleft", coords:[5,30]},
  { name: "offscreen", coords: [240,30]}
];

var date_coord_index = 0;

function draw_date(date){
  if(force_redraw || last_date == null || last_date.getDate() != date.getDate()){
    //console.log("redrawing date");
    g.setFontAlign(-1,-1,0);
    g.setFont("Vector",15);
    if(last_coords != null && last_datestr != null) {
      var background = color_schemes[color_scheme_index].background;
      g.setColor(background[0], background[1], background[2]);
      g.drawString(last_datestr, last_coords[0], last_coords[1]);
    }
    var coords = date_coords[date_coord_index].coords;
    if(coords != null) {
      var date_format = local.dow(date,1) + " " + date.getDate();
      var numeral_color = default_white(color_schemes[color_scheme_index].numeral);
      g.setColor(numeral_color[0], numeral_color[1], numeral_color[2]);
      g.drawString(date_format, coords[0], coords[1]);
      last_date = date;
      last_datestr = date_format;
      last_coords = coords;
    }
  }
}

function next_datecoords() {
  date_coord_index = date_coord_index + 1;
  if (date_coord_index >= date_coords.length) {
    date_coord_index = 0;
  }
  //console.log("date coord index->" + date_coord_index);
  force_redraw = true;
}

function set_datecoords(date_name){
  console.log("setting date:" + date_name);
  for (var i=0; i < date_coords.length; i++) {
    if(date_coords[i].name == date_name){
      date_coord_index = i;
      force_redraw = true;
      console.log("date match");
      break;
    }
  }
}

// drawing the second the millisecond as we need the fine gradation
// for the sweep second hand.
function draw_seconds(date){
  var seconds = date.getSeconds() + date.getMilliseconds()/1000;
  var seconds_frac = seconds / 60;
  var seconds_angle = TWO_PI*seconds_frac;
  seconds_hand.moveTo(seconds_angle);
}
// drawing the minute includes the second and millisec to make the
// movement as continuous as possible.
function draw_mins(date,seconds_angle){
  var mins = date.getMinutes() + date.getSeconds()/60 + date.getMilliseconds()/(60*1000);
  var mins_frac = mins / 60;
  var mins_angle = TWO_PI*mins_frac;
  var redraw = minutes_hand.moveTo(mins_angle);
  if(redraw){
    //console.log("redraw mins");
  }
}

function draw_hours(date){
  var hours = (date.getHours() % 12) + date.getMinutes()/60 + date.getSeconds()/3600;
  var hours_frac = hours / 12;
  var hours_angle = TWO_PI*hours_frac;
  var redraw = hours_hand.moveTo(hours_angle);
  if(redraw){
    //console.log("redraw hours");
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
  /**
   * Called from the settings loader to identify the font
   */
  getName(){return "";}
}

class NoFont extends NumeralFont{
  constructor(){super();}
  getDimensions(hour){return [0,0];}
  hour_txt(hour){ return ""; }
  draw(hour_txt,x,y){ return "";}
  getName(){return "NoFont";}
}

const COPASET_DIM_20x58 = [20,58];
const COPASET_DIM_30x58 = [30,58];
const COPASET_DIM_40x58 = [40,58];
const COPASET_DIM_50x58 = [50,58];

class CopasetFont extends NumeralFont{
  constructor(){
    super();
  }
  getDimensions(hour){
    switch(hour){
      case 1: return COPASET_DIM_20x58;
      case 2:
      case 3:
      case 4:
      case 5:
      case 7:
        return COPASET_DIM_30x58;
      case 6:
      case 8:
      case 9:
      case 11:
      case 12:
        return COPASET_DIM_40x58;
      case 10:
        return COPASET_DIM_50x58;
      default:
        return COPASET_DIM_30x58;
    }
  }
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
    g.setFontAlign(-1,-1,0);
    g.setFontCopasetic40x58Numeric();
    g.drawString(hour_txt,x,y);
  }
  getName(){return "Copaset";}
}

const ROMAN_DIM_10x40 = [10,40];
const ROMAN_DIM_20x40 = [20,40];
const ROMAN_DIM_25x40 = [25,40];
const ROMAN_DIM_30x40 = [30,40];
const ROMAN_DIM_40x40 = [40,40];
const ROMAN_DIM_60x40 = [60,40];
const ROMAN_DIM_70x40 = [70,40];
class RomanNumeralFont extends NumeralFont{
  constructor(){
    super();
  }
  getText(hour){
    switch (hour){
      case 1 : return 'I';
      case 2 : return 'II';
      case 3 : return 'III';
      case 4 : return 'IV';
      case 5 : return 'V';
      case 6 : return 'VI';
      case 7 : return 'VII';
      case 8 : return 'VIII';
      case 9 : return 'IX';
      case 10: return 'X';
      case 11: return 'XI';
      case 12: return 'XII';
      default: return '';
    }
  }
  getDimensions(hour){
    switch (hour){
      case 1:
        return ROMAN_DIM_10x40;
      case 2:
        return ROMAN_DIM_25x40;
      case 3:
      case 4:
      case 6:
      case 9:
      case 11:
      case 12:
        return ROMAN_DIM_40x40;
      case 5:
        return ROMAN_DIM_30x40;
      case 7:
        return ROMAN_DIM_60x40;
      case 8:
        return ROMAN_DIM_70x40;
      case 10:
        return ROMAN_DIM_20x40;
      default:
        return ROMAN_DIM_40x40;
    }
  }
  hour_txt(hour){ return this.getText(hour); }
  draw(hour_txt,x,y){
    g.setFontAlign(-1,-1,0);
    g.setFont("Vector",40);
    g.drawString(hour_txt,x,y);
  }
  getName(){return "Roman";}
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
    return TWO_PI + asin_angle;
  }
}

// rebase and angle so be between -pi and pi
// rather than 0 to 2PI
function rebaseNegative(angle){
  if(angle > Math.PI){
    return angle - TWO_PI;
  } else {
    return angle;
  }
}

// rebase an angle so that it is between 0 to 2pi
// rather than -pi to pi
function rebasePositive(angle){
  if(angle < 0){
    return angle + TWO_PI;
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
    var changed = false;
    if(this.curr_hours != hours || this.curr_numeral_font !=this.numeral_font){
      var background = color_schemes[color_scheme_index].background;
      g.setColor(background[0],background[1],background[2]);
      this.curr_numeral_font.draw(this.curr_hour_str,
          this.curr_hour_x,
          this.curr_hour_y);
      //console.log("erasing old hour");
      var hours_frac = hours / 12;
      var angle = TWO_PI*hours_frac;
      var dimensions = this.numeral_font.getDimensions(hours);
      // we set the radial coord to be in the middle
      // of the drawn text.
      var width = dimensions[0];
      var height = dimensions[1];
      var delta_center_x = this.radius*Math.sin(angle) - width/2;
      var delta_center_y = this.radius*Math.cos(angle) + height/2;
      this.curr_hour_x  = screen_center_x + delta_center_x;
      this.curr_hour_y = screen_center_y - delta_center_y;
      this.curr_hour_str = this.numeral_font.hour_txt(hours);
      // now work out the angle of the beginning and the end of the
      // text box so we know when to redraw
      // bottom left angle
      var x1 = delta_center_x;
      var y1 = delta_center_y;
      var r1 = Math.sqrt(x1*x1 + y1*y1);
      var angle1 = reifyasin(x1,y1,Math.asin(x1/r1));
      // bottom right angle
      var x2 = delta_center_x;
      var y2 = delta_center_y - height;
      var r2 = Math.sqrt(x2*x2 + y2*y2);
      var angle2 = reifyasin(x2,y2,Math.asin(x2/r2));
      // top left angle
      var x3 = delta_center_x + width;
      var y3 = delta_center_y;
      var r3 = Math.sqrt(x3*x3 + y3*y3);
      var angle3 = reifyasin(x3,y3, Math.asin(x3/r3));
      // top right angle
      var x4 = delta_center_x + width;
      var y4 = delta_center_y - height;
      var r4 = Math.sqrt(x4*x4 + y4*y4);
      var angle4 = reifyasin(x4,y4,Math.asin(x4/r4));
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
      var numeral_color = default_white(color_schemes[color_scheme_index].numeral);
      g.setColor(numeral_color[0],numeral_color[1],numeral_color[2]);
      this.numeral_font.draw(this.curr_hour_str,this.curr_hour_x,this.curr_hour_y);
      this.last_draw_time = new Date();
      //console.log("redraw digit");
    }
  }
}

let numeral_fonts = [new CopasetFont(), new RomanNumeralFont(), new NoFont()];
let numeral_fonts_index = 0;
/**
 * predicate for deciding when the digit has to be redrawn
 */
let hour_numeral_redraw = function(angle_from, angle_to, last_draw_time){
  var seconds_hand_angle = seconds_hand.angle;
  // we have to cope with the 12 problem where the
  // left side of the box has a value almost 2PI and the right
  // side has a small positive value. The values are rebased so
  // that they can be compared
  if(angle_from > angle_to && angle_from > 1.5*Math.PI){
    angle_from = angle_from - TWO_PI;
    if(seconds_hand_angle > Math.PI)
      seconds_hand_angle = seconds_hand_angle - TWO_PI;
  }
  //console.log("initial:" + angle_from + "/" + angle_to  + " seconds " + seconds_hand_angle);
  var redraw = force_redraw ||
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
  var hours = date.getHours() % 12;
  var mins = date.getMinutes();
  if(mins > 30){
    hours = (hours +1) % 12;
  }
  if(hours == 0){
    hours = 12;
  }
  hour_scriber.drawHour(hours);
}

function draw_background(){
  if(force_redraw){
    var background = color_schemes[color_scheme_index].background;
    g.setColor(background[0],background[1],background[2]);
    g.fillPoly([0,25,
      0,240,
      240,240,
      240,25
    ]);
  }
}

function next_colorscheme(){
  color_scheme_index += 1;
  color_scheme_index = color_scheme_index % color_schemes.length;
  //console.log("color_scheme_index=" + color_scheme_index);
  force_redraw = true;
}

/**
 * called from load_settings on startup to
 * set the color scheme to named value
 */
function set_colorscheme(colorscheme_name){
  console.log("setting color scheme:" + colorscheme_name);
  for (var i=0; i < color_schemes.length; i++) {
    if(color_schemes[i].name == colorscheme_name){
      color_scheme_index = i;
      force_redraw = true;
      console.log("color scheme match");
      break;
    }
  }
}

/**
 * called from load_settings on startup
 * to set the font to named value
 */
function set_font(font_name){
  console.log("setting font:" + font_name);
  for (var i=0; i < numeral_fonts.length; i++) {
    if(numeral_fonts[i].getName() == font_name){
      numeral_fonts_index = i;
      force_redraw = true;
      console.log("font match");
      hour_scriber.setNumeralFont(numeral_fonts[numeral_fonts_index]);
      break;
    }
  }
}

/**
 * Called on startup to set the watch to the last preference settings
 */
function load_settings(){
  try{
    var settings = require("Storage").readJSON("sweepclock.settings.json");
    if(settings != null){
      console.log("loaded:" + JSON.stringify(settings));
      if(settings.color_scheme != null){
        set_colorscheme(settings.color_scheme);
      }
      if(settings.font != null){
        set_font(settings.font);
      }
      if(settings.date != null){
        set_datecoords(settings.date);
      }
    } else {
      console.log("no settings to load");
    }
  } catch(e){
    console.log("failed to load settings:" + e);
  }
}

function print_memoryusage(){
  var m = process.memory();
  var pc = Math.round(m.usage*100/m.total);
  console.log("memory usage: " + pc + "%");
}

/**
 * Called on button press to save down the last preference settings
 */
function save_settings(){
  var settings = {
    font : numeral_fonts[numeral_fonts_index].getName(),
    color_scheme : color_schemes[color_scheme_index].name,
    date: date_coords[date_coord_index].name
  };
  console.log("saving:" + JSON.stringify(settings));
  require("Storage").writeJSON("sweepclock.settings.json",settings);
  print_memoryusage();
}

// Boiler plate code for setting up the clock,
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
  force_redraw = true;
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    console.log("lcdPower: on");
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
load_settings();
Bangle.loadWidgets();
Bangle.drawWidgets();
startTimers();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2,{repeat:false,edge:"falling"});

function button1pressed(){
  next_font();
  save_settings();
}

function button3pressed(){
  next_colorscheme();
  save_settings();
}

function button4pressed(){
  //console.log("button 4 pressed");
  next_datecoords();
  save_settings();
}

// Handle button 1 being pressed
setWatch(button1pressed, BTN1,{repeat:true,edge:"falling"});

// Handle button 3 being pressed
setWatch(button3pressed, BTN3,{repeat:true,edge:"falling"});

// Handle button 3 being pressed
setWatch(button4pressed, BTN4,{repeat:true,edge:"falling"});
