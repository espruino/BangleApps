/**
* Adrian Kirk 2021-03
* Simple Clock showing 1 numeral for the hour 
* with a smooth sweep second.
*/

var ThinHand = require("fontclock.thinhand.js");
var ThickHand = require("fontclock.thickhand.js");
var HourScriber = require("fontclock.hourscriber.js");

const screen_center_x = g.getWidth()/2;
const screen_center_y = 10 + (g.getHeight()+10)/2;
const TWO_PI = 2* Math.PI;


SETTING_PREFIX = "fontclock";
// load the date formats and languages required
const FONTS_FILE = SETTING_PREFIX +".font.json";
const DEFAULT_FONTS = [ "cpstc58" ];
const DEFAULT_NUMERALS = [12,3,6,9];
const DEFAULT_RADIUS = 70;
var color_schemes = [
  {
    name: "black",
    background : [0.0,0.0,0.0],
  }
];
var fonts = DEFAULT_NUMERALS;
var numerals = DEFAULT_NUMERALS;
var radius = DEFAULT_RADIUS;

var fonts_info = null;
try {
  fonts_info = require("Storage").readJSON(FONTS_FILE);
} catch(e){
  console.log("failed to load fonts file:" + FONTS_FILE + e);
}
if(fonts_info != null){
  console.log("loaded font:" + JSON.stringify(fonts_info));
  fonts = fonts_info.fonts;
  numerals = fonts_info.numerals;
  radius = fonts_info.radius;
  color_schemes = fonts_info.color_schemes;
} else {
  fonts = DEFAULT_FONTS;
  numerals = DEFAULT_NUMERALS;
  radius = DEFAULT_RADIUS;
  console.log("no fonts loaded defaulting to:" + fonts);
}

if(fonts == null || fonts.length == 0){
  fonts = DEFAULT_FONTS;
  console.log("defaulting fonts to locale:" + fonts);
}

let color_scheme_index = 0;

// The force draw is set to  true to force all objects to redraw themselves
let force_redraw = true;
let bg_colour_supplier = ()=>color_schemes[color_scheme_index].background;
var WHITE = [1.0,1.0,1.0];
function default_white(color){
  if(color == null){
    return WHITE
  } else {
    return color;
  }
}

// The seconds hand is the main focus and is set to redraw on every cycle
let seconds_hand = new ThinHand(screen_center_x, 
                           screen_center_y,
                           95,
                            0,
                            (angle, last_draw_time) => false,
                            bg_colour_supplier,
    ()=>default_white(color_schemes[color_scheme_index].second_hand));

// The minute hand is set to redraw at a 250th of a circle,
// when the second hand is ontop or slighly overtaking
// or when a force_redraw is called
const minute_hand_angle_tolerance = TWO_PI/25
let minutes_hand_redraw = function(angle, last_draw_time){
  return force_redraw || (seconds_hand.angle > angle &&
    Math.abs(seconds_hand.angle - angle) < minute_hand_angle_tolerance &&
    new Date().getTime() - last_draw_time.getTime() > 500);
};

let minutes_hand = new ThinHand(screen_center_x, 
                           screen_center_y,
                           80, minute_hand_angle_tolerance,
                           minutes_hand_redraw,
                            bg_colour_supplier,
    ()=>default_white(color_schemes[color_scheme_index].minute_hand));
// The hour hand is a thick hand so we have to redraw when the minute hand
// overlaps from its behind angle coverage to its ahead angle coverage.
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
                          bg_colour_supplier,
            () => default_white(color_schemes[color_scheme_index].hour_hand),
                          5,
                          4);

function draw_clock(){
  var date = new Date();
  draw_background();
  draw_hour_digits();
  draw_seconds(date);
  draw_mins(date);
  draw_hours(date);
  force_redraw = false;
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



let numeral_fonts = [];
for(var i=0; i< fonts.length; i++) {
  var file = SETTING_PREFIX +".font." + fonts[i] + ".js"
  console.log("loading font set:" + fonts[i] + "->" + file);
  var loaded_fonts = require(file);
  for (var j = 0; j < loaded_fonts[j]; j++) {
    var loaded_font = new loaded_fonts[j];
    numeral_fonts.push(loaded_font);
    console.log("loaded font name:" + loaded_font.getName())
  }
}

let numeral_fonts_index = 0;
const ONE_POINT_FIVE_PI = 1.5*Math.PI;
/**
* predicate for deciding when the digit has to be redrawn
*/
let hour_numeral_redraw = function(angle_from, angle_to, last_draw_time){ 
  var seconds_hand_angle = seconds_hand.angle;
  // we have to cope with the 12 problem where the 
  // left side of the box has a value almost 2PI and the right
  // side has a small positive value. The values are rebased so
  // that they can be compared
  if(angle_from > angle_to && angle_from > ONE_POINT_FIVE_PI){
    angle_from = angle_from - TWO_PI;
    if(seconds_hand_angle > Math.PI)
       seconds_hand_angle = seconds_hand_angle - TWO_PI;
  } 
  //console.log("initial:" + angle_from + "/" + angle_to  + " seconds " + seconds_hand_angle);
   var redraw = force_redraw ||
     (seconds_hand_angle >= angle_from && seconds_hand_angle <= angle_to && seconds_hand.last_draw_time.getTime() > last_draw_time.getTime()) ||
     (minutes_hand.last_draw_time.getTime() > last_draw_time.getTime());
  if(redraw){
     //console.log(angle_from + "/" + angle_to  + " seconds " + seconds_hand_angle);
  }
  return redraw;
};

// now add the numbers to the clock face
var numeral_colour_supplier = () => default_white(color_schemes[color_scheme_index].numeral);
var hour_scribers = [];
console.log("numerals:" + numerals + " length:" + numerals.length)
console.log("radius:" + radius)
for(var digit_idx=0; digit_idx<numerals.length; digit_idx++){
  var digit = numerals[digit_idx];
  var scriber = new HourScriber(radius,
      numeral_fonts[numeral_fonts_index],
      hour_numeral_redraw,
      bg_colour_supplier,
      numeral_colour_supplier,
      digit
  );
  hour_scribers.push(scriber);
  //console.log("digit:" + digit + "->" + scriber);
}
//console.log("hour_scribers:" + hour_scribers );

/**
* Called from button 1 to change the numerals that are
* displayed on the clock face
*/
function next_font() {
  var curr_font = numeral_fonts_index;
  numeral_fonts_index = numeral_fonts_index + 1;
  if (numeral_fonts_index >= numeral_fonts.length) {
    numeral_fonts_index = 0;
  }

  if (curr_font != numeral_fonts_index) {
    console.log("numeral font changed")
    for (var i = 0; i < hour_scribers.length; i++) {
      hour_scribers[i].setNumeralFont(
          numeral_fonts[numeral_fonts_index]);
    }
    force_redraw = true;
    return true;
  } else {
    return false;
  }
}

const hour_zone_angle = hour_scribers.length/TWO_PI;
function draw_hour_digits() {
  if(force_redraw){
    for(var i=0; i<hour_scribers.length; i++){
      var scriber = hour_scribers[i];
      //console.log("idx:" + i + "->" + scriber);
      scriber.draw();
    }
  } else {
    var hour_scriber_idx = (0.5 + (seconds_hand.angle * hour_zone_angle)) | 0;
    if (hour_scriber_idx >= hour_scribers.length)
      hour_scriber_idx = 0;

    //console.log("angle:" + seconds_hand.angle + " idx:" + hour_scriber_idx);
    if (hour_scriber_idx >= 0) {
      hour_scribers[hour_scriber_idx].draw();
    }
  }
}



function draw_background(){
  if(force_redraw){
    background = color_schemes[color_scheme_index].background;
    g.setColor(background[0],background[1],background[2]);
    g.fillPoly([0,25,
                0,240,
                240,240,
                240,25
               ]);
  }
}

function next_colorscheme(){
  var prev_color_scheme_index = color_scheme_index;
  color_scheme_index += 1;
  color_scheme_index = color_scheme_index % color_schemes.length;
  //console.log("color_scheme_index=" + color_scheme_index);
  force_redraw = true;
  if(prev_color_scheme_index == color_scheme_index){
    return false;
  } else {
    return true;
  }
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
      console.log("match");
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
    if(numeral_fonts[i].getName() == font_name) {
      numeral_fonts_index = i;
      force_redraw = true;
      console.log("match");
      for (var j = 0; j < hour_scribers.length; j++) {
        hour_scribers[j].setNumeralFont(numeral_fonts[numeral_fonts_index]);
      }
      break;
    }
  }
}

/**
* Called on startup to set the watch to the last preference settings
*/
function load_settings(){
  try{
    var file = SETTING_PREFIX + ".settings.json";
    settings = require("Storage").readJSON(file);
    if(settings != null){
      console.log(file + " loaded:" + JSON.stringify(settings));
      if(settings.color_scheme != null){
        set_colorscheme(settings.color_scheme);
      }
      if(settings.font != null){
        set_font(settings.font);
      }
    } else {
      console.log(file + " not found - no settings to load");
    }
  } catch(e){
    console.log("failed to load settings:" + e);
  }
}

/**
* Called on button press to save down the last preference settings
*/
function save_settings(){
  var settings = {
    font : numeral_fonts[numeral_fonts_index].getName(),
    color_scheme : color_schemes[color_scheme_index].name,
  };
  var file = SETTING_PREFIX + ".settings.json";
  console.log(file + ": saving:" + JSON.stringify(settings));
  require("Storage").writeJSON(file,settings);
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

function button1pressed() {
  if (next_font()) {
    save_settings();
  }
}

function button2pressed() {
  clearTimers();
  // the clock is being unloaded so we clear out the big
  // data structures for the launcher
  hour_scribers = [];
  Bangle.showLauncher();
}

function button3pressed(){
  if(next_colorscheme()) {
    save_settings();
  }
}

// Handle button 1 being pressed
setWatch(button1pressed, BTN1,{repeat:true,edge:"falling"});

// Handle button 1 being pressed
setWatch(button2pressed, BTN2,{repeat:true,edge:"falling"});

// Handle button 3 being pressed
setWatch(button3pressed, BTN3,{repeat:true,edge:"falling"});

