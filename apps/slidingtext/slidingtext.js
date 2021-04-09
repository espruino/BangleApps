/**
 * Adrian Kirk 2021-02
 * Sliding text clock inspired by the Pebble
 * clock with the same name
 */

const color_schemes = [
  {
    name: "black",
    background : [0.0,0.0,0.0],
    main_bar: [1.0,1.0,1.0],
    other_bars: [0.85,0.85,0.85],
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
      command_stack_low_priority.lenth > 0;
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
  reset(){
    //console.log("reset");
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
    g.setColor(this.color[0],this.color[1],this.color[2]);
    g.drawString(this.txt, this.x, this.y);
  }
  hide(){
    g.setFont(this.font_name,this.font_size);
    //console.log("bgcolor:" + this.bg_color);
    g.setColor(this.bg_color[0],this.bg_color[1],this.bg_color[2]);
    g.drawString(this.txt, this.x, this.y);
    /*g.fillPoly([this.x - 1, this.y,
              240, this.y,
              240, this.y + this.font_size,
              this.x -1 , this.y + this.font_size,
             ]);
             */
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

const CLOCK_TEXT_SPEED_X = 10;
// a list of display rows
let row_displays = [
  new ShiftText(240,50,'',"Vector",40,CLOCK_TEXT_SPEED_X,1,10,main_color(),bg_color()),
  new ShiftText(240,90,'',"Vector",30,CLOCK_TEXT_SPEED_X,1,10,other_color(),bg_color()),
  new ShiftText(240,120,'',"Vector",30,CLOCK_TEXT_SPEED_X,1,10,other_color(),bg_color()),
  new ShiftText(240,150,'',"Vector",30,CLOCK_TEXT_SPEED_X,1,10,other_color(),bg_color()),
  new ShiftText(240,180,'',"Vector",40,CLOCK_TEXT_SPEED_X,1,10,main_color(),bg_color())
];

function nextColorTheme(){
  //console.log("next color theme");
  color_scheme_index += 1;
  if(color_scheme_index > row_displays.length){
    color_scheme_index = 0;
  }
  var color_scheme = color_schemes[color_scheme_index];
  setColor(color_scheme.main_bar,
      color_scheme.other_bars,
      color_scheme.background);
  reset_clock();
  draw_clock();
}

function setColor(main_color,other_color,bg_color){
  row_displays[0].setColor(main_color);
  row_displays[0].setBgColor(bg_color);
  for(var i=1; i<row_displays.length - 1; i++){
    row_displays[i].setColor(other_color);
    row_displays[i].setBgColor(bg_color);
  }
  row_displays[row_displays.length - 1].setColor(main_color);
  row_displays[row_displays.length - 1].setBgColor(bg_color);
  g.setColor(bg_color[0],bg_color[1],bg_color[2]);
  g.fillPoly([0,25,
    0,240,
    240,240,
    240,25
  ]);
}

// load the date formats required
var locales = ["en","en2","fr","jp"];

let date_formatters = [];
for(var i=0; i< locales.length; i++){
  console.log("loading locale:" + locales[i]);
  var Formatter = require("slidingtext.local." + locales[i] + ".js");
  date_formatters.push(new Formatter());
}

// current index of the date formatter to display
let date_formatter_idx = 0;
let date_formatter = date_formatters[date_formatter_idx];

function changeFormatter(){
  date_formatter_idx += 1;
  if(date_formatter_idx >= date_formatters.length){
    date_formatter_idx = 0;
  }
  console.log("changing to formatter " + date_formatter_idx);
  date_formatter = date_formatters[date_formatter_idx];
  reset_clock();
  draw_clock();
  command_stack_high_priority.unshift(
      function() {
        //console.log("move in new:" + txt);
        // first select the top or bottom to display the formatter name
        // We choose the first spare row without text
        var format_name_display = row_displays[row_displays.length - 1];
        if (format_name_display.txt != '') {
          format_name_display = row_displays[0];
        }
        if (format_name_display.txt != ''){
          return;
        }
        format_name_display.speed_x = 3;
        format_name_display.onFinished(function(){
          format_name_display.speed_x = CLOCK_TEXT_SPEED_X;
          console.log("return speed to:" + format_name_display.speed_x)
          next_command();
        });
        format_name_display.setTextXPosition(date_formatter.name(),220);
        format_name_display.moveToX(-date_formatter.name().length * format_name_display.font_size);
      }
  );

}


function reset_clock(){
  //console.log("reset_clock");
  for (var i = 0; i < row_displays.length; i++) {
    row_displays[i].speed_x = CLOCK_TEXT_SPEED_X;
    row_displays[i].reset();
  }
  reset_commands();
}

let last_draw_time = null;
const next_minute_boundary_secs = 7.5;

function draw_clock(){
  var date = new Date();
  if(last_draw_time != null &&
      date.getTime() - last_draw_time.getTime() < next_minute_boundary_secs * 1000 &&
      has_commands() ){
    console.log("skipping draw clock");
    return;
  } else {
    last_draw_time = date;
  }
  reset_commands();
  console.log("draw_clock:" + date.toISOString());
  // we don't want the time to be displayed
  // and then immediately be trigger another time
  if(date.getSeconds() > 60 - next_minute_boundary_secs){
    console.log("forwarding to next minute");
    date = new Date(date.getTime() + next_minute_boundary_secs * 1000);
  }
  //date.setMinutes(37);
  var rows = date_formatter.formatDate(date);
  var display;
  for (var i = 0; i < rows.length; i++) {
    display = row_displays[i];
    var txt = rows[i];
    //console.log(i + "->" + txt);
    display_row(display,txt);
  }
  // If the dateformatter has not returned enough
  // rows then treat the reamining rows as empty
  for (j = i; j < row_displays.length; j++) {
    display = row_displays[j];
    //console.log(i + "->''(empty)");
    display_row(display,'');
  }
  next_command();
  //console.log(date);
}

function display_row(display,txt){
  if(display.txt == ''){
    if(txt != '') {
      command_stack_high_priority.unshift(
          function () {
            //console.log("move in new:" + txt);
            display.onFinished(next_command);
            display.setTextXPosition(txt, 240);
            display.moveToX(20);
          }
      );
    }
  } else if(txt != display.txt && display.txt != null){
    command_stack_high_priority.push(
        function(){
          //console.log("move out:" + txt);
          display.onFinished(next_command);
          display.moveToX(-display.txt.length * display.font_size);
        }
    );
    command_stack_low_priority.push(
        function(){
          //console.log("move in:" + txt);
          display.onFinished(next_command);
          display.setTextXPosition(txt,240);
          display.moveToX(20);
        }
    );
  } else {
    command_stack_high_priority.push(
        function(){
          //console.log("move in2:" + txt);
          display.setTextXPosition(txt,20);
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
    if(color_schemes[i].name == colorscheme_name){
      color_scheme_index = i;
      console.log("match");
      var color_scheme = color_schemes[color_scheme_index];
      setColor(color_scheme.main_bar,
          color_scheme.other_bars,
          color_scheme.background);
      break;
    }
  }
}

function set_dateformat(dateformat_name){
  console.log("setting date format:" + dateformat_name);
  for (var i=0; i < date_formatters.length; i++) {
    if(date_formatters[i].name() == dateformat_name){
      date_formatter_idx = i;
      date_formatter = date_formatters[date_formatter_idx];
      console.log("match");
    }
  }
}

const PREFERENCE_FILE = "slidingtext.settings.json";
/**
 * Called on startup to set the watch to the last preference settings
 */
function load_settings(){
  try{
    settings = require("Storage").readJSON(PREFERENCE_FILE);
    if(settings != null){
      console.log("loaded:" + JSON.stringify(settings));
      if(settings.color_scheme != null){
        set_colorscheme(settings.color_scheme);
      }
      if(settings.date_format != null){
        set_dateformat(settings.date_format);
      }
    } else {
      console.log("no settings to load");
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
    date_format : date_formatter.name(),
    color_scheme : color_schemes[color_scheme_index].name,
  };
  console.log("saving:" + JSON.stringify(settings));
  require("Storage").writeJSON(PREFERENCE_FILE,settings);
}

function button1pressed() {
  changeFormatter();
  save_settings();
}

function button3pressed() {
  console.log("button3pressed");
  nextColorTheme();
  reset_clock();
  draw_clock();
  save_settings();
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
  var date = new Date();
  var secs = date.getSeconds();
  var nextMinuteStart = 60 - secs;
  //console.log("scheduling clock draw in " + nextMinuteStart + " seconds");
  setTimeout(scheduleDrawClock,nextMinuteStart * 1000);
  draw_clock();
}

function scheduleDrawClock(){
  //console.log("scheduleDrawClock");
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
  //console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
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


// Handle button 1 being pressed
setWatch(button1pressed, BTN1,{repeat:true,edge:"falling"});

// Handle button 3 being pressed
setWatch(button3pressed, BTN3,{repeat:true,edge:"falling"});
