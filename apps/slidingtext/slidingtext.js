/**
 * Adrian Kirk 2021-02
 * Sliding text clock inspired by the Pebble
 * clock with the same name
 */

const color_schemes = [
  {
    name: "white",
    background : [1.0,1.0,1.0],
    main_bar: [0.0,0.0,0.0],
    other_bars: [0.1,0.1,0.1],
  },
  {
    name: "black",
    background : [0.0,0.0,0.0],
    main_bar: [1.0,1.0,1.0],
    other_bars: [0.9,0.9,0.9],
  },
  {
    name: "red",
    background : [1.0,0.0,0.0],
    main_bar: [1.0,1.0,0.0],
    other_bars: [0.85,0.85,0.85]
  },
  {
    name: "grey",
    background : [0.5,0.5,0.5],
    main_bar: [1.0,1.0,1.0],
    other_bars: [0.0,0.0,0.0],
  },
  {
    name: "purple",
    background : [1.0,0.0,1.0],
    main_bar: [1.0,1.0,0.0],
    other_bars: [0.85,0.85,0.85]
  },
  {
    name: "blue",
    background : [0.4,0.7,1.0],
    main_bar: [1.0,1.0,1.0],
    other_bars: [0.9,0.9,0.9]
  }
];

let color_scheme_index = 0;


/**
 * The Watch Display
 */

function bg_color(){
  return color_schemes[color_scheme_index].background;
}

function main_color(){
  return color_schemes[color_scheme_index].main_bar;
}

function other_color(){
  return color_schemes[color_scheme_index].other_bars;
}

let command_stack_high_priority = [];
let command_stack_low_priority = [];

function next_command(){
  command = command_stack_high_priority.pop();
  if(command == null){
    //console.log("Low priority command");
    command = command_stack_low_priority.pop();
  } else {
    //console.log("High priority command");
  }
  if(command != null){
    command.call();
  } else {
    //console.log("no command");
  }
}

function reset_commands(){
  command_stack_high_priority = [];
  command_stack_low_priority = [];
}

function has_commands(){
  return  command_stack_high_priority.length > 0 ||
      command_stack_low_priority.length > 0;
}

class ShiftText {
  /**
   * Class Responsible for shifting text around the screen
   *
   * This is a object that initializes itself with a position and
   * text after which you can tell it where you want to move to
   * using the moveTo method and it will smoothly move the text across
   * at the selected frame rate and speed
   */
  constructor(x,y,txt,font_name,
              font_size,speed_x,speed_y,freq_millis,
              color,
              bg_color){
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
    this.color = color;
    this.bg_color = bg_color;
    this.finished_callback=null;
    this.timeoutId = null;
  }
  setColor(color){
    this.color = color;
  }
  setBgColor(bg_color){
    this.bg_color = bg_color;
  }
  reset(hard_reset) {
    //console.log("reset");
    this.hide();
    this.x = this.init_x;
    this.y = this.init_y;
    if (hard_reset) {
      this.txt = this.init_txt;
    }
    this.show();
    if(this.timeoutId != null){
      clearTimeout(this.timeoutId);
    }
  }
  show() {
    g.setFontAlign(-1,-1,0);
    g.setFont(this.font_name,this.font_size);
    g.setColor(this.color[0],this.color[1],this.color[2]);
    g.drawString(this.txt, this.x, this.y);
  }
  hide(){
    g.setFontAlign(-1,-1,0);
    g.setFont(this.font_name,this.font_size);
    //console.log("bgcolor:" + this.bg_color);
    g.setColor(this.bg_color[0],this.bg_color[1],this.bg_color[2]);
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
  setTextYPosition(txt,y){
    this.hide();
    this.y = y;
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
  scrollInFromLeft(txt,to_x){
    this.setTextXPosition(txt, -txt.length * this.font_size - 2*this.speed_x);
    this.moveToX(to_x);
  }
  scrollInFromRight(txt,to_x){
    this.setTextXPosition(txt, g.getWidth() + 2*this.speed_x);
    this.moveToX(to_x);
  }
  scrollOffToLeft(){
    this.moveToX(-this.txt.length * this.font_size);
  }
  scrollOffToRight(){
    this.moveToX(g.getWidth() + 2*this.speed_x);
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
    var diff_x = this.tgt_x - this.x;
    var finished_x = false;
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
    var diff_y = this.tgt_y - this.y;
    var finished_y = false;
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
    var finished = finished_x & finished_y;
    if(!finished){
      this.timeoutId = setTimeout(this._doMove.bind(this), this.freq_millis);
    } else if(this.finished_callback != null){
      //console.log("finished - calling:" + this.finished_callback);
      this.finished_callback.call();
      this.finished_callback = null;
    }
  }
}

function bangleVersion(){
  return (g.getHeight()>200)? 1 : 2;
}

var style = {
  fg_color: (row,no_rows)=>row === 0 || row >= Math.max(no_rows -1,2)? main_color(): other_color(),
  clock_text_speed_x: 10,
  y_init: (bangleVersion()<2)? 34 : 50,
  row_height: (row,no_rows)=>row === 0 || row >= Math.max(no_rows -1,2)?
      (bangleVersion()<2)? 40 : 30: (bangleVersion()<2)? 35 : 25,
  scrollIn: (d,txt,to_x)=>d.scrollInFromRight(txt,to_x),
  //scrollIn: (d,txt,to_x)=>d.scrollInFromLeft(txt,to_x),
  scrollOff: (d)=>d.scrollOffToLeft()
  //scrollOff: (d)=>d.scrollOffToRight()
};


// a list of display rows
var row_displays;

function init_display() {
  row_displays = [];
  y = style.y_init;
  var date_rows = date_formatter.formatDate(new Date());
  for (var i=0;i<date_rows.length;i++) {
    var row_height = style.row_height(i,date_rows.length);
    row_displays.push(
        new ShiftText(g.getWidth(),
            y,
            '',
            "Vector",
            row_height,
            style.clock_text_speed_x,
            1,
            10,
            style.fg_color(i,date_rows),
            bg_color()
        )
    );
    y += row_height;
  }
}


function nextColorTheme(){
  color_scheme_index += 1;
  if(color_scheme_index >= color_schemes.length){
    color_scheme_index = 0;
  }
  //console.log("changing color scheme to " + color_schemes[color_scheme_index].name)
  updateColorScheme();
  reset_clock(true);
  draw_clock();
}

function updateColorScheme(){
  var bgcolor = bg_color();
  for(var i=0; i<row_displays.length; i++){
    row_displays[i].setColor(style.fg_color(i,row_displays.length));
    row_displays[i].setBgColor(bgcolor);
  }
  g.setColor(bgcolor[0],bgcolor[1],bgcolor[2]);
  g.fillRect(0, 24, g.getWidth(), g.getHeight());
}

var DISPLAY_TEXT_X = 20;
function reset_clock(hard_reset){
  console.log("reset_clock hard_reset:" + hard_reset);

  updateColorScheme();
  if(!hard_reset && last_draw_time != null){
    // If its not a hard reset then we want to reset the
    // rows set to the last time. If the last time is too long
    // ago then we fast forward to 1 min ago.
    // In this way the watch wakes by scrolling
    // off the last time and scroll on the new time
    var reset_time = last_draw_time;
    var last_minute_millis = Date.now() - 60000;
    if(reset_time.getTime() < last_minute_millis){
      reset_time = display_time(new Date(last_minute_millis));
    }
    var rows = date_formatter.formatDate(reset_time);
    for (var i = 0; i < rows.length; i++) {
      row_displays[i].hide();
      row_displays[i].speed_x = style.clock_text_speed_x;
      row_displays[i].x = DISPLAY_TEXT_X;
      row_displays[i].y = row_displays[i].init_y;
      if(row_displays[i].timeoutId != null){
        clearTimeout(row_displays[i].timeoutId);
      }
      row_displays[i].setText(rows[i]);
      row_displays[i].show();
    }
  } else {
    // do a hard reset and clear everything out
    for (var i = 0; i < row_displays.length; i++) {
      row_displays[i].speed_x = style.clock_text_speed_x;
      row_displays[i].reset(hard_reset);
    }
  }
  reset_commands();
}

let last_draw_time = null;
const next_minute_boundary_secs = 10;

function display_time(date){
  if(date.getSeconds() > 60 - next_minute_boundary_secs){
    console.log("forwarding to next minute");
    return new Date(date.getTime() + next_minute_boundary_secs * 1000);
  } else {
    return date;
  }
}

function draw_clock(){
  var date = new Date();

  // we don't want the time to be displayed
  // and then immediately be trigger another time
  if(last_draw_time != null &&
      Date.now() - last_draw_time.getTime() < next_minute_boundary_secs * 1000 &&
      has_commands() ){
    console.log("skipping draw clock");
    return;
  } else {
    last_draw_time = date;
  }
  reset_commands();
  date = display_time(date);
  console.log("draw_clock:" + last_draw_time.toISOString() + " display:" + date.toISOString());

  var rows = date_formatter.formatDate(date);
  var display;
  for (var i = 0; i < rows.length; i++) {
    display = row_displays[i];
    var txt = rows[i];
    //console.log(i + "->" + txt);
    display_row(display,txt);
  }
  // If the dateformatter has not returned enough
  // rows then treat the remaining rows as empty
  for (var j = i; j < row_displays.length; j++) {
    display = row_displays[j];
    //console.log(i + "->''(empty)");
    display_row(display,'');
  }
  next_command();
  //console.log(date);
}

function display_row(display,txt){
  if(display == null) {
    console.log("no display for text:" + txt);
    return;
  }

  if(display.txt == null || display.txt === ''){
    if(txt !== '') {
      command_stack_high_priority.unshift(
          function () {
            //console.log("move in new:" + txt);
            display.onFinished(next_command);
            //display.scrollInFromRight(txt, DISPLAY_TEXT_X);
            style.scrollIn(display,txt,DISPLAY_TEXT_X)
          }
      );
    }
  } else if(txt !== display.txt && display.txt != null){
    command_stack_high_priority.push(
        function(){
          //console.log("move out:" + txt);
          display.onFinished(next_command);
          //display.moveToX(-display.txt.length * display.font_size);
          //display.scrollOffToLeft();
          style.scrollOff(display);
        }
    );
    command_stack_low_priority.push(
        function(){
          //console.log("move in:" + txt);
          display.onFinished(next_command);
          style.scrollIn(display,txt,DISPLAY_TEXT_X);
        }
    );
  } else {
    command_stack_high_priority.push(
        function(){
          //console.log("move in2:" + txt);
          display.setTextXPosition(txt,DISPLAY_TEXT_X);
          next_command();
        }
    );
  }
}

/**
 * called from load_settings on startup to
 * set the color scheme to named value
 */
function set_colorscheme(colorscheme_name){
  console.log("setting color scheme:" + colorscheme_name);
  for (var i=0; i < color_schemes.length; i++) {
    if(color_schemes[i].name === colorscheme_name){
      color_scheme_index = i;
      console.log("match");
      updateColorScheme();
      break;
    }
  }
}

const Locale = require('locale');
class DigitDateTimeFormatter {
  name(){return "Digital";}
  shortName(){return "digit";}

  format00(num){
    var value = (num | 0);
    if(value > 99 || value < 0)
      throw "must be between in range 0-99";
    if(value < 10)
      return "0" + value.toString();
    else
      return value.toString();
  }

  formatDate(now){
    var hours = now.getHours() ;

    var time_txt = this.format00(hours) + ":" + this.format00(now.getMinutes());
    var date_txt = Locale.dow(now,1) + " " + this.format00(now.getDate());
    return [time_txt,date_txt];
  }
}

var date_formatter = new DigitDateTimeFormatter();
function set_dateformat(shortname){
  console.log("setting date format:" + shortname);
  try {
    if (date_formatter == null || date_formatter.shortName() !== shortname) {
      date_formatter = require("slidingtext.locale." + shortname + ".js");
    }
  } catch(e){
    console.log("Failed to load " + shortname);
  }
}

var enable_live_controls = false;
const PREFERENCE_FILE = "slidingtext.settings.json";
/**
 * Called on startup to set the watch to the last preference settings
 */
function load_settings() {
  var setScheme = false;
  try {
    var settings = require("Storage").readJSON(PREFERENCE_FILE);
    if (settings != null) {
      console.log("loaded:" + JSON.stringify(settings));
      if (settings.date_format != null) {
        set_dateformat(settings.date_format);
        init_display();
      }
      if (settings.color_scheme != null) {
        set_colorscheme(settings.color_scheme);
        setScheme = true;
      }
      if (settings.enable_live_controls == null) {
        settings.enable_live_controls = (bangleVersion() <= 1);
      }
      enable_live_controls = settings.enable_live_controls;
    } else {
      console.log("no settings to load");
      enable_live_controls = (bangleVersion() <= 1);
    }
    console.log("enable_live_controls=" + enable_live_controls);
  } catch (e) {
    console.log("failed to load settings:" + e);
  }
  if(row_displays == null){
    init_display();
  }
  // just set up as default
  if (!setScheme) {
    init_display();
    updateColorScheme();
  }
  enable_live_controls = true
}

/**
 * Called on button press to save down the last preference settings
 */
function save_settings(){
  var settings = {
    date_format : date_formatter.shortName(),
    color_scheme : color_schemes[color_scheme_index].name,
    enable_live_controls: enable_live_controls
  };
  console.log("saving:" + JSON.stringify(settings));
  require("Storage").writeJSON(PREFERENCE_FILE,settings);
}

function button3pressed() {
  console.log("button3pressed enable_live_controls=" + enable_live_controls);
  if (enable_live_controls) {
    nextColorTheme();
    reset_clock(true);
    draw_clock();
    save_settings();
  }
}

// The interval reference for updating the clock
let intervalRef = null;

function clearTimers(){
  if(intervalRef != null) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

function startTimers(){
  var date = new Date();
  var secs = date.getSeconds();
  var nextMinuteStart = 60 - secs;
  //console.log("scheduling clock draw in " + nextMinuteStart + " seconds");
  setTimeout(scheduleDrawClock,nextMinuteStart * 1000);
  draw_clock();
}

/**
 * confirms that a redraw is needed by checking the last redraw time and
 * the lcd state of the UI
 * @returns {boolean|*}
 */
function shouldRedraw(){
  return last_draw_time != null &&
      Date.now() - last_draw_time.getTime() > next_minute_boundary_secs * 1000
      && Bangle.isLCDOn();
}

function scheduleDrawClock(){
  clearTimers();
  if (Bangle.isLCDOn()) {
    console.log("schedule draw of clock");
    intervalRef = setInterval(() => {
      if (!shouldRedraw()) {
        console.log("draw clock callback - skipped redraw");
      } else {
        console.log("draw clock callback");
        draw_clock();
      }
    }, 60 * 1000
    );

    if (shouldRedraw()) {
      draw_clock();
    } else {
      console.log("scheduleDrawClock - skipped redraw");
    }
  } else {
    console.log("scheduleDrawClock - skipped not visible");
  }
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    console.log("lcdPower: on");
    Bangle.drawWidgets();
    reset_clock(false);
    startTimers();
  } else {
    console.log("lcdPower: off");
    reset_clock(false);
    clearTimers();
  }
});

g.clear();
load_settings();
Bangle.loadWidgets();
Bangle.drawWidgets();

startTimers();
// Show launcher when button pressed
Bangle.setUI("clockupdown", d=>{
  if (d>0) button3pressed();
});
