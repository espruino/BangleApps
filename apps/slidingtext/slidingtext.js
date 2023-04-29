/**
 * Adrian Kirk 2021-02
 * Sliding text clock inspired by the Pebble
 * clock with the same name
 */

const color_schemes = [
  {
    name: "black",
    background : [0.0,0.0,0.0],
    main_bar: [1.0,0.0,0.0],
    other_bars: [0.9,0.9,0.9],
  },
  {
    name: "white",
    background : [1.0,1.0,1.0],
    main_bar: [0.0,0.0,0.0],
    other_bars: [0.1,0.1,0.1],
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
    background : [0.3,0.0,0.6],
    main_bar: [1.0,1.0,0.0],
    other_bars: [0.85,0.85,0.85]
  },
  {
    name: "blue",
    background : [0.1,0.2,1.0],
    main_bar: [1.0,1.0,0.0],
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
  var command = command_stack_high_priority.pop();
  if(command == null){
    command = command_stack_low_priority.pop();
  }
  if(command != null){
    command.call();
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
              bg_color,
              row_context,
              rotation){
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
    this.row_context = row_context;
    this.rotation = rotation;
    this.finished_callback=null;
    this.timeoutId = null;
  }
  getRowContext(){ return this.row_context;}
  setColor(color){ this.color = color; }
  setBgColor(bg_color){ this.bg_color = bg_color; }
  reset(hard_reset) {
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
    g.setFontAlign(-1,-1,this.rotation);
    g.setFont(this.font_name,this.font_size);
    g.setColor(this.color[0],this.color[1],this.color[2]);
    g.drawString(this.txt, this.x, this.y);
  }
  hide(){
    g.setFontAlign(-1,-1,this.rotation);
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
  scrollInFromBottom(txt,to_y){
    if(to_y == null)
      to_y = this.init_y;

    this.setTextPosition(txt, this.init_x, g.getHeight()*2);
    this.moveTo(this.init_x,to_y);
  }
  scrollInFromLeft(txt,to_x){
    if(to_x == null)
      to_x = this.init_x;

    this.setTextPosition(txt, -txt.length * this.font_size - this.font_size, this.init_y);
    this.moveTo(to_x,this.init_y);
  }
  scrollInFromRight(txt,to_x){
    if(to_x == null)
      to_x = this.init_x;

    this.setTextPosition(txt, g.getWidth() + this.font_size, this.init_y);
    this.moveTo(to_x,this.init_y);
  }
  scrollOffToLeft(){
    this.moveTo(-this.txt.length * this.font_size, this.init_y);
  }
  scrollOffToRight(){
    this.moveTo(g.getWidth() + this.font_size, this.init_y);
  }
  scrollOffToBottom(){
    this.moveTo(this.init_x,g.getHeight()*2);
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
      this.finished_callback.call();
      this.finished_callback = null;
    }
  }
}

function bangleVersion(){
  return (g.getHeight()>200)? 1 : 2;
}

let row_displays;
function initDisplay(settings) {
  if(row_displays != null){
    return;
  }
  if(settings == null){
    settings = {};
  }
  var row_types = {
    large: {
      color: 'major',
      speed: 'medium',
      angle_to_horizontal: 0,
      scroll_off: ['left'],
      scroll_in: ['right'],
      size: 'large'
    },
    medium: {
      color: 'minor',
      speed: 'slow',
      angle_to_horizontal: 0,
      scroll_off: ['left'],
      scroll_in: ['right'],
      size: 'medium'
    },
    small: {
      color: 'minor',
      speed: 'superslow',
      angle_to_horizontal: 0,
      scroll_off: ['left'],
      scroll_in: ['right'],
      size: 'small'
    }
  };

  function mergeMaps(map1,map2){
    if(map2 == null){
      return;
    }
    Object.keys(map2).forEach(key => {
      if(map1.hasOwnProperty(key)){
        map1[key] = mergeObjects(map1[key], map2[key]);
      } else {
        map1[key] = map2[key];
      }
    });
  }

  function mergeObjects(obj1, obj2){
    const result = {};
    Object.keys(obj1).forEach(key => result[key] = (obj2.hasOwnProperty(key))? obj2[key] : obj1[key]);
    return result;
  }

  const row_type_overide = date_formatter.defaultRowTypes();
  mergeMaps(row_types,row_type_overide);
  mergeMaps(row_types,settings.row_types);
  var row_defs = (settings.row_defs != null && settings.row_defs.length > 0)?
      settings.row_defs : date_formatter.defaultRowDefs();

  var heights = {
    vvsmall: [15,13],
    vsmall: [20,15],
    ssmall: [22,17],
    small: [25,20],
    msmall: [29,22],
    medium: [40,25],
    mlarge: [45,35],
    large: [50,40],
    vlarge: [60,50],
    slarge: [110,90]
  };

  var rotations = {
    0: 0,
    90: 3,
    180: 2,
    270: 1,
  };

  var speeds = {
    fast: 20,
    medium: 10,
    slow: 5,
    vslow: 2,
    superslow: 1
  };

  function create_row_type(row_type, row_def){
    const speed = speeds[row_type.speed];
    const rotation = rotations[row_type.angle_to_horizontal];
    const height = heights[row_type.size];
    const scroll_ins = [];
    if(row_type.scroll_in.includes('left')){
      scroll_ins.push((row_display,txt)=> row_display.scrollInFromLeft(txt));
    }
    if(row_type.scroll_in.includes('right')){
      scroll_ins.push((row_display,txt)=> row_display.scrollInFromRight(txt));
    }
    if(row_type.scroll_in.includes('up')){
      scroll_ins.push((row_display,txt)=> row_display.scrollInFromBottom(txt));
    }
    var scroll_in;
    if(scroll_ins.length === 0){
      scroll_in = (row_display,txt)=> row_display.scrollInFromLeft(txt);
    } else if(scroll_ins.length === 1){
      scroll_in = scroll_ins[0];
    } else {
      scroll_in = (row_display,txt) =>{
        const idx = (Math.random() * scroll_ins.length) | 0;
        return scroll_ins[idx](row_display,txt);
      };
    }

    const scroll_offs = [];
    if(row_type.scroll_off.includes('left')){
      scroll_offs.push((row_display)=> row_display.scrollOffToLeft());
    }
    if(row_type.scroll_off.includes('right')){
      scroll_offs.push((row_display)=> row_display.scrollOffToRight());
    }
    if(row_type.scroll_off.includes('down')){
      scroll_offs.push((row_display)=> row_display.scrollOffToBottom());
    }
    var scroll_off;
    if(scroll_offs.length === 0){
      scroll_off = (row_display)=> row_display.scrollOffToLeft();
    } else if(scroll_offs.length === 1){
      scroll_off = scroll_offs[0];
    } else {
      scroll_off = (row_display) =>{
        var idx = (Math.random() * scroll_off.length) | 0;
        return scroll_offs[idx](row_display);
      };
    }

    var text_formatter = (txt)=>txt;
    const SPACES = '                                                ';
    if(row_def.hasOwnProperty("alignment")){
      const alignment = row_def.alignment;
      if(alignment.startsWith("centre")){
        const padding = parseInt(alignment.split("-")[1]);
        if(padding > 0){
          text_formatter = (txt) => {
            const front_spaces = (padding - txt.length)/2 | 0;
            return front_spaces > 0? SPACES.substring(0,front_spaces + 1) + txt : txt;
          };
        }
      }
    }

    const version = bangleVersion() - 1;
    const Y_RESERVED = 20;
    return {
      row_speed: speed,
      row_height: height[version],
      row_rotation: rotation,
      x: (row_no) => row_def.init_coords[0] * g.getWidth() + row_def.row_direction[0] * height[version] * row_no,
      y: (row_no) => Y_RESERVED + row_def.init_coords[1] * (g.getHeight() - Y_RESERVED) + row_def.row_direction[1] * height[version] * row_no,
      scroll_in: scroll_in,
      scroll_off: scroll_off,
      fg_color: () => (row_type.color === 'major')? main_color(): other_color(),
      row_text_formatter : text_formatter
    };
  }
  row_displays = [];
  row_defs.forEach(row_def =>{
    const row_type = create_row_type(row_types[row_def.type],row_def);
    // we now create the number of rows specified of that type
    for(var row_no=0; row_no<row_def.rows; row_no++){
      row_displays.push(new ShiftText(row_type.x(row_no),
          row_type.y(row_no),
          '',
          "Vector",
          row_type.row_height,
          row_type.row_speed,
          row_type.row_speed,
          10,
          row_type.fg_color(),
          bg_color(),
          row_type,
          row_type.row_rotation
        )
      );
    }
  });
  // dereference the setup variables to release the memory
  row_defs = null;
  row_types = null;
  heights = null;
  rotations = null;
  speeds = null;
}

function nextColorTheme(){
  color_scheme_index += 1;
  if(color_scheme_index >= color_schemes.length){
    color_scheme_index = 0;
  }
  updateColorScheme();
  resetClock(true);
  drawClock();
}

function updateColorScheme(){
  const bgcolor = bg_color();
  for(var i=0; i<row_displays.length; i++){
    row_displays[i].setColor(row_displays[i].getRowContext().fg_color());
    row_displays[i].setBgColor(bgcolor);
  }
  g.setColor(bgcolor[0],bgcolor[1],bgcolor[2]);
  g.fillRect(0, 24, g.getWidth(), g.getHeight());
}

function resetClock(hard_reset){
  console.log("reset_clock hard_reset:" + hard_reset);

  updateColorScheme();
  if(!hard_reset && last_draw_time != null){
    // If its not a hard reset then we want to reset the
    // rows set to the last time. If the last time is too long
    // ago then we fast forward to 1 min ago.
    // In this way the watch wakes by scrolling
    // off the last time and scroll on the new time
    var reset_time = last_draw_time;
    const last_minute_millis = Date.now() - 60000;
    if(reset_time.getTime() < last_minute_millis){
      reset_time = display_time(new Date(last_minute_millis));
    }
    const rows = date_formatter.formatDate(reset_time);
    for (var i = 0; i < rows.length; i++) {
      row_displays[i].hide();
      row_displays[i].x = row_displays[i].init_x;
      row_displays[i].y = row_displays[i].init_y;
      if(row_displays[i].timeoutId != null){
        clearTimeout(row_displays[i].timeoutId);
      }
      row_displays[i].setText(rows[i]);
      row_displays[i].show();
    }
  } else {
    // do a hard reset and clear everything out
    row_displays.forEach(row_display => row_display.reset(hard_reset));
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

function drawClock(){
  var date = new Date();

  // we don't want the time to be displayed
  // and then immediately be trigger another time
  if(last_draw_time != null &&
      date.getTime() - last_draw_time.getTime() < next_minute_boundary_secs * 1000 &&
      has_commands() ){
    console.log("skipping draw clock");
    return;
  } else {
    last_draw_time = date;
  }
  reset_commands();
  date = display_time(date);
  const mem = process.memory(false);
  console.log("draw_clock:" + last_draw_time.toISOString() + " display:" + date.toISOString() +
      " memory:" + mem.usage / mem.total);

  const rows = date_formatter.formatDate(date);
  for (var i = 0; i < rows.length; i++) {
    const display = row_displays[i];
    if(display != null){
      const txt = display.getRowContext().row_text_formatter(rows[i]);
      display_row(display,txt);
    }
  }
  // If the dateformatter has not returned enough
  // rows then treat the remaining rows as empty
  for (var j = i; j < row_displays.length; j++) {
    const display = row_displays[j];
    display_row(display,'');
  }
  next_command();
}

function display_row(display,txt){
  if(display == null) {
    return;
  }

  if(display.txt == null || display.txt === ''){
    if(txt !== '') {
      command_stack_high_priority.unshift(()=>{
            display.onFinished(next_command);
            display.getRowContext().scroll_in(display,txt);
          }
      );
    }
  } else if(txt !== display.txt && display.txt != null){
    command_stack_high_priority.push(()=>{
          display.onFinished(next_command);
          display.getRowContext().scroll_off(display);
        }
    );
    command_stack_low_priority.push(() => {
          display.onFinished(next_command);
          display.getRowContext().scroll_in(display,txt);
        }
    );
  } else {
    command_stack_high_priority.push(() => {
          display.setTextPosition(txt,display.init_x, display.init_y);
          next_command();
        }
    );
  }
}

/**
 * called from load_settings on startup to
 * set the color scheme to named value
 */
function setColorScheme(colorscheme_name){
  console.log("setting color scheme:" + colorscheme_name);
  for (var i=0; i < color_schemes.length; i++) {
    if(color_schemes[i].name === colorscheme_name){
      color_scheme_index = i;
      updateColorScheme();
      break;
    }
  }
}

var date_formatter;
function setDateformat(shortname){
  /**
   * Demonstration Date formatter so that we can see the
   * clock working in the emulator
   */
  class DigitDateTimeFormatter {
    constructor() {}

    format00(num){
      const value = (num | 0);
      if(value > 99 || value < 0)
        throw "must be between in range 0-99";
      if(value < 10)
        return "0" + value.toString();
      else
        return value.toString();
    }

    formatDate(now){
      const hours = now.getHours() ;
      const time_txt = this.format00(hours) + ":" + this.format00(now.getMinutes());
      const date_txt = require('locale').dow(now,1) + " " + this.format00(now.getDate());
      const month_txt = require('locale').month(now);
      return [time_txt, date_txt, month_txt];
    }

    defaultRowTypes(){
      return {
        large: {
          scroll_off: ['left', 'right', 'down'],
          scroll_in: ['left', 'right', 'up'],
          size: 'vlarge'
        },
        small: {
          angle_to_horizontal: 90,
          scroll_off: ['down'],
          scroll_in: ['up'],
          size: 'vvsmall'
        }
      };
    }

    defaultRowDefs() {
      return [
        {
          type: 'large',
          row_direction: [0.0,1.0],
          init_coords: [0.1,0.35],
          rows: 1
        },
        {
          type: 'small',
          row_direction: [1.0,0],
          init_coords: [0.85,0.99],
          rows: 2
        }
      ];
    }
  }
  console.log("setting date format:" + shortname);
  try {
    if (date_formatter == null) {
      if(shortname === "default"){
        date_formatter = new DigitDateTimeFormatter();
      } else {
        const date_formatter_class = require("slidingtext.locale." + shortname + ".js");
        date_formatter = new date_formatter_class();
      }
    }
  } catch(e){
    console.log("not loaded:" + shortname);
  }
  if(date_formatter == null){
    date_formatter = new DigitDateTimeFormatter();
  }
}

var enable_live_controls = false;
const PREFERENCE_FILE = "slidingtext.settings.json";
/**
 * Called on startup to set the watch to the last preference settings
 */
function loadSettings() {
  try {
    const settings = Object.assign({},
        require('Storage').readJSON(PREFERENCE_FILE, true) || {});
    if (settings.date_formatter == null) {
        settings.date_formatter = "en";
    }
    console.log("loaded settings:" + JSON.stringify(settings));
    setDateformat(settings.date_formatter);
    initDisplay(settings);
    if (settings.color_scheme != null) {
      setColorScheme(settings.color_scheme);
    } else {
      setColorScheme("black");
    }
    if (settings.enable_live_controls == null) {
      settings.enable_live_controls = (bangleVersion() <= 1);
    }
    enable_live_controls = settings.enable_live_controls;
    console.log("enable_live_controls=" + enable_live_controls);
  } catch (e) {
    console.log("failed to load settings:" + e);
  }
  // just set up as default
  if (row_displays === undefined) {
    setDateformat("default");
    initDisplay();
    updateColorScheme();
  }
  const mem = process.memory(true);
  console.log("init complete memory:" + mem.usage / mem.total);
}

function button3pressed() {
  if (enable_live_controls) {
    nextColorTheme();
    resetClock(true);
    drawClock();
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
  const date = new Date();
  const secs = date.getSeconds();
  const nextMinuteStart = 60 - secs;
  setTimeout(scheduleDrawClock,nextMinuteStart * 1000);
  drawClock();
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
        drawClock();
      }
    }, 60 * 1000
    );

    if (shouldRedraw()) {
      drawClock();
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
    resetClock(false);
    startTimers();
  } else {
    console.log("lcdPower: off");
    resetClock(false);
    clearTimers();
  }
});

g.clear();
loadSettings();
// Show launcher when button pressed
Bangle.setUI("clockupdown", d=>{
  if (d>0) button3pressed();
});
Bangle.loadWidgets();
Bangle.drawWidgets();

startTimers();

