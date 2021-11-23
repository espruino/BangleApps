/**
 * Adrian Kirk 2021-07
 *
 * Solar Clock
 *
 * Using your current or chosen location the solar watch face shows the Sun's sky position,
 * time and date. Also allows you to wind backwards and forwards in time to see the sun's position
 **/

const DateUtils = require("solar_date_utils.js");
const Math2 = require("solar_math_utils.js");
const GraphicUtils = require("solar_graphic_utils.js");
const Colors = require("solar_colors.js");
const LocationUtils = require("solar_location.js");
const Locale = require('locale');

/**
 * The screen info data structure stores all of the
 * relevant screen information, such as the sun's position
 * where the sunrise line is, etc
 */
var screen_info = {
  screen_width : g.getWidth(),
  screen_start_x : 0,
  screen_centre_x: g.getWidth()/2,
  screen_height : (g.getHeight()-100),
  screen_start_y : 100,
  screen_centre_y : 90 + (g.getHeight()-100)/2,
  screen_bg_color : Colors.BLACK,
  sun_radius: 8,
  sun_x : null,
  sun_y : null,
  sunrise_y : null,
}
// we set up the image buffer with which we draw the sun with
const img_width=40;
const img_height=30;
var img_buffer = Graphics.createArrayBuffer(img_width,img_height,8);
var img = {width:img_width,height:img_height,bpp:8,transparent:0,buffer:img_buffer.buffer};
/**
 * We use an image buffer to do the sun animation.
 * We pass around the img_info structure with the
 * image buffer data
 */
var img_info = {
  x: null,
  y: null,
  img: img,
  img_buffer: img_buffer
}
const COSINE_COLOUR= Colors.GREY;
const HORIZON_COLOUR = Colors.GREY;
const SolarController = require("solar_controller.js");
var controller = new SolarController();
var curr_mode = null;
var draw_full_cosine = true;

// The draw sun function is responsible for
// drawing the whole sun animation which includes the
// sun, the cosine curve and the sunrise line.
function draw_sun(now, day_info) {

  var now_fraction = (now.getTime() - day_info.day_start.getTime())/DateUtils.DAY_MILLIS;
  var now_x = now_fraction * screen_info.screen_width;
  if(screen_info.sun_x != null && Math.abs(now_x- screen_info.sun_x) < 1){
    console.log("no sun movement now_x:" + now_x + " screen sun_x:" + screen_info.sun_x);
    return false;
  }
  // now calculate thew new sun coordinates
  var now_radians = Math2.TWO_PI *(now_x - screen_info.screen_centre_x)/screen_info.screen_width;
  var now_y = screen_info.screen_centre_y - (screen_info.screen_height * Math.cos(now_radians) / 2);
  if(screen_info.sun_x != null && Math.abs(now_x - screen_info.sun_x) > 5.0){
    clear_sun();
  } else if(screen_info.sun_y != null && Math.abs(now_y - screen_info.sun_y) > 5.0){
    clear_sun();
  }
  // update the screen info with the new sun info
  screen_info.sun_x = now_x;
  screen_info.sun_y = now_y;

  if(draw_full_cosine){
    //console.log("drawing full cosine");
    GraphicUtils.draw_cosine(screen_info.screen_start_x,
        screen_info.screen_width,
        COSINE_COLOUR,
        screen_info);
    draw_full_cosine = false;
  }
  if(curr_mode == null) {
    GraphicUtils.draw_sunrise_line(HORIZON_COLOUR, day_info, screen_info);
  }
  // decide on the new sun drawing mode and draw
  curr_mode = controller.mode(now,day_info,screen_info);
  img_info.img_buffer.clear();
  GraphicUtils.set_color(screen_info.screen_bg_color, img_info.img_buffer);
  img_info.img_buffer.fillRect(0,0,img_width, img_height);
  img_info.x = screen_info.sun_x - img_info.img.width/2;
  img_info.y = screen_info.sun_y - img_info.img.height/2;

  var cosine_dist = screen_info.sun_radius/Math.sqrt(2);
  GraphicUtils.draw_cosine(img_info.x,
      screen_info.sun_x - cosine_dist,
      COSINE_COLOUR,
      screen_info,
      img_info);
  GraphicUtils.draw_cosine(screen_info.sun_x + cosine_dist,
      screen_info.sun_x + img_width,
      COSINE_COLOUR,
      screen_info,
      img_info);

  curr_mode.draw(now,day_info,screen_info,img_info);

  var sunrise_dist = Math.abs(screen_info.sunrise_y-screen_info.sun_y);
  if( sunrise_dist <= img_height) {
    GraphicUtils.draw_sunrise_line(HORIZON_COLOUR, day_info, screen_info,img_info);
  } else if(sunrise_dist <= img_height*2.5) {
    GraphicUtils.draw_sunrise_line(HORIZON_COLOUR, day_info, screen_info);
  }
  // we draw a blank where the image is going to be drawn to clear out the area
  GraphicUtils.set_color(screen_info.screen_bg_color);
  g.fillRect(img_info.x,img_info.y-2,img_info.x+img_width,img_info.y + img_height + 2);
  g.drawImage(img,img_info.x,img_info.y);
  // paint the cosine curve back to the normal color where it just came from
  GraphicUtils.draw_cosine(img_info.x - 3,
      img_info.x,
      COSINE_COLOUR,
      screen_info);
  GraphicUtils.draw_cosine(img_info.x + img_width,
      img_info.x + img_width + 3,
      COSINE_COLOUR,
      screen_info);
  return true;
}

// clear sun is called when there is a large change in the sun's
// location, such as location change.
function clear_sun(){
  if(img_info.x != null && img_info.y != null) {
    GraphicUtils.set_color(screen_info.screen_bg_color);
    g.fillRect(img_info.x, img_info.y, img_info.x + img_width, img_info.y + img_width);
    GraphicUtils.draw_cosine(img_info.x - 4,
        img_info.x + img_width + 4,
        COSINE_COLOUR,
        screen_info);
  }
  GraphicUtils.draw_sunrise_line(HORIZON_COLOUR, day_info, screen_info);
  screen_info.sun_x = null;
  screen_info.sun_y = null;
}

var last_time = null;
var last_offset = null;
var last_date = null;

const time_color = Colors.WHITE;
const date_color = Colors.YELLOW;
const DATE_Y_COORD = 35;
const DATE_X_COORD = 5;
const TIME_X_COORD = 140;
const TIME_Y_COORD = 35;
const OFFSET_Y_COORD = 70;
const LOCATION_Y_COORD = 55;

function write_date(now){
  var new_date = now.getDate();
  if(last_date == null || new_date != last_date){
    GraphicUtils.set_color(screen_info.screen_bg_color);
    g.fillRect(DATE_X_COORD,DATE_Y_COORD, DATE_X_COORD+80,DATE_Y_COORD+15);

    g.setFont("Vector",15);
    g.setFontAlign(-1,-1,0);
    GraphicUtils.set_color(date_color);
    var date_str = Locale.dow(now,1) + " " + Math2.format00(now.getDate());
    //console.log("writing date:" + new_date)
    g.drawString(date_str, DATE_X_COORD,DATE_Y_COORD);
    last_date = new_date;
  }
}

// The info panels mid way down the screen on the left and right
const INFO_PANEL_LINE_Y1 = 90;
const INFO_PANEL_LINE_Y2 = 105;
var gps_status_requires_update = true;

// The GPS status panel shows the status of the GPS
// when the location is know it shows the
// longitude and latitude.
function write_GPS_status(){
  if(!gps_status_requires_update)
    return;

  var gps_coords = location.getCoordinates();
  var gps_coords_msg;

  if(location.isGPSLocation()) {
    if(gps_coords == null) {
      if (location.getGPSPower() > 0) {
        gps_coords_msg = ["Locating","GPS"];
      } else {
        gps_coords_msg = ["ERROR","GPS"];
      }
    } else {
      if (location.getGPSPower() > 0) {
        gps_coords_msg = ["Updating","GPS"];
      }
    }
  }

  if(gps_coords_msg == null){
    gps_coords_msg = ["N:" + Math2.format000_00(gps_coords[1]),
      "E:" + Math2.format000_00(gps_coords[0])];
  }

  GraphicUtils.set_color(screen_info.screen_bg_color);
  g.fillRect(DATE_X_COORD,INFO_PANEL_LINE_Y1,70,INFO_PANEL_LINE_Y2 + 13);
  g.setFont("Vector",13);
  g.setFontAlign(-1,-1,0);
  GraphicUtils.set_color(Colors.WHITE);
  g.drawString(gps_coords_msg[0], DATE_X_COORD, INFO_PANEL_LINE_Y1,1);
  g.drawString(gps_coords_msg[1], DATE_X_COORD, INFO_PANEL_LINE_Y2,1);

  gps_status_requires_update = false;
}

const TWILIGHT_X_COORD = 200;
const NO_TIME = "--:--";

var twilight_times_requires_update = true;
// The right panel shows the sun rise and sunset times.
// we make provision for when there is no times available
function write_twilight_times(){
  if(!twilight_times_requires_update)
    return;

  var twilight_msg;
  if(day_info != null) {
    twilight_msg = [format_time(day_info.sunrise_date), format_time(day_info.sunset_date)];
  } else {
    twilight_msg = [NO_TIME,NO_TIME];
  }
  GraphicUtils.set_color(screen_info.screen_bg_color);
  g.fillRect(TWILIGHT_X_COORD,INFO_PANEL_LINE_Y1,240,INFO_PANEL_LINE_Y2 + 13);
  g.setFont("Vector",13);
  g.setFontAlign(-1,-1,0);
  GraphicUtils.set_color(Colors.YELLOW);
  GraphicUtils.fill_circle_partial_y(TWILIGHT_X_COORD-15,
      INFO_PANEL_LINE_Y1+7,
      7,
      INFO_PANEL_LINE_Y1+7,
      INFO_PANEL_LINE_Y1);

  g.drawString(twilight_msg[0], TWILIGHT_X_COORD,INFO_PANEL_LINE_Y1,1);
  g.setColor(1,0.8,0);
  g.drawString(twilight_msg[1], TWILIGHT_X_COORD,INFO_PANEL_LINE_Y2,1);

  twilight_times_requires_update = false;
}

function write_time(now){
   var new_time = format_time(now);
   g.setFont("Vector",35);
   g.setFontAlign(-1,-1,0);
   if(last_time != null){
     GraphicUtils.set_color(screen_info.screen_bg_color);
    g.drawString(last_time, TIME_X_COORD,TIME_Y_COORD);
  }
  GraphicUtils.set_color(time_color);
  g.drawString(new_time, TIME_X_COORD,TIME_Y_COORD);
  last_time = new_time;
}

function format_time(now){
  var time = new Date(now.getTime() - time_offset);
  var hours = time.getHours() % 12;
  if(hours < 1){
    hours = 12;
  }
  return Math2.format00(hours) + ":" + Math2.format00(time.getMinutes());
}

function write_offset(){
  var new_offset = format_offset();
  g.setFont("Vector",15);
  g.setFontAlign(-1,-1,0);
  if(last_offset != null){
    GraphicUtils.set_color(screen_info.screen_bg_color);
    g.drawString(last_offset, TIME_X_COORD,OFFSET_Y_COORD);
  }
  GraphicUtils.set_color(time_color);
  g.drawString(new_offset, TIME_X_COORD,OFFSET_Y_COORD);
  last_offset = new_offset;
}

function format_offset(){
  if(time_offset == 0)
    return "";

  var hours_offset = Math.abs(time_offset) / DateUtils.HOUR_MILLIS;
  var mins_offset = Math.abs(time_offset) / DateUtils.MIN_MILLIS;
  var mins_offset_from_hour = mins_offset % 60;
  //console.log("mins offset=" + mins_offset + " mins_offset_from_hour=" + mins_offset_from_hour);
  var sign = "+";
  if(time_offset < 0)
    sign = "-";

  return sign + Math2.format00(hours_offset) + ":" + Math2.format00(mins_offset_from_hour);
}

let time_offset = 0;
var day_info = null;
var location = LocationUtils.load_locations();
var location_requires_update = true;

function write_location_name() {
  if(!location_requires_update)
    return;

  var new_location_name = location.getName();
  g.setFont("Vector", 20);
  g.setFontAlign(-1, -1, 0);

  GraphicUtils.set_color(screen_info.screen_bg_color);
  g.fillRect(DATE_X_COORD, LOCATION_Y_COORD, DATE_X_COORD + 105, LOCATION_Y_COORD + 20);

  if (new_location_name != "local") {
    GraphicUtils.set_color(time_color);
    g.drawString(new_location_name.replace("_", " "), DATE_X_COORD, LOCATION_Y_COORD);
  }
  location_requires_update = false;
}

location.addUpdateListener(
    (loc)=>{
      console.log("location update:" + JSON.stringify(loc));
      clear_sun();
      GraphicUtils.draw_sunrise_line(screen_info.screen_bg_color, day_info, screen_info);
      day_info = null;
      screen_info.sunrise_y = null;
      curr_mode = null;
      gps_status_requires_update = true;
      location_requires_update = true;
      twilight_times_requires_update = true;
      draw_clock();
    }
);

// day info is responsible for populating the day_info structure
// The day_info structure holds the sun set and sunset times
// The function also has to detect when the end of the solar
// day has been reached and flip the day over.
function dayInfo(now) {
  if (day_info == null || now > day_info.day_end || now < day_info.day_start) {
    var coords = location.getCoordinates();
    if(coords != null) {
      day_info = DateUtils.sunrise_sunset(now, coords[0], coords[1], location.getUTCOffset());
      twilight_times_requires_update = true;
      //console.log("day info:" + JSON.stringify(day_info));
    } else {
      day_info = null;
    }
  }
  return day_info;
}

function time_now() {
  var timezone_offset_hours = location.getUTCOffset();
  if(timezone_offset_hours != null) {
    var local_offset_hours = -new Date().getTimezoneOffset()/60;
    var timezone_offset_millis =
        (timezone_offset_hours - local_offset_hours) * DateUtils.HOUR_MILLIS;
    return new Date(Date.now() + time_offset + timezone_offset_millis);
  } else {
    return new Date(Date.now() + time_offset);
  }
}

// The main loop called everytime we want to refresh the
// clock
function draw_clock(){
  var start_time = Date.now();
  var now = time_now();

  write_location_name();
  write_GPS_status();
  var day_info = dayInfo(now);
  if(day_info != null) {
    draw_sun(now, day_info);
  }
  write_time(now);
  write_date(now);
  write_offset();
  write_twilight_times();
  log_memory_used();
  var time_taken = Date.now() - start_time;
  console.log("drawing clock:" + now.toISOString() + " time taken:" + time_taken );
}

function log_memory_used() {
  var memory = process.memory();
  console.log("memory used:" + memory.usage +
      " total:" + memory.total + "->" +
      " ->" + memory.usage/memory.total
  );
}

// Button has a short press action of resetting the offet
// and a long press set the GPS up for refreshing the current
// position.
// To accomodate the long and short press we record when the press
// starts and time to when it is released
var button1pressStart = null;
function button1pressed(){
  if(button1pressStart == null) {
    button1pressStart = Date.now();
  }
  //console.log("button 1 pressed for:" + (Date.now() - button1pressStart));
  if(BTN1.read()){
    // we look every 100 ms to see if the button is still pressed
    // (to makes the button responsive)
    setTimeout(button1pressed,100);
  } else {
    var buttonPressTime = Date.now() - button1pressStart;
    button1pressStart = null;
    console.log("button press time=" + buttonPressTime);
    if (buttonPressTime < 3000) {
      //console.log("offset reset");
      time_offset = 0;
      clear_sun();
      day_info = null;
    } else {
      //console.log("requesting gps update");
      location.requestGpsUpdate();
      gps_status_requires_update = true;
    }
    draw_clock();
  }
}

// button 3 kicks off a the change to the next location
function button3pressed() {
    console.log("button 3 pressed");
    time_offset = 0;
    location.nextLocation();
}

// button 4 moves the offset back
// keeping the button pressed repeats
// to give the sun the continuous animation
// to achieve this we put in a call back
// to see if its still presses after 50 ms.
function button4pressed(){
  time_offset -= DateUtils.HOUR_MILLIS/4;
  draw_clock();
  setTimeout(()=>{
        if(BTN4.read()){
          button4pressed();
        }
      },
      50
  )
}

// button 5 moves the offset forward
// keeping the button pressed repeats
// to give the sun the continuous animation
// to achieve this we put in a call back
// to see if its still presses after 50 ms.
function button5pressed(){
  time_offset += DateUtils.HOUR_MILLIS/4;
  draw_clock();
  setTimeout(()=>{
      if(BTN5.read()){
        button5pressed();
      }
    },
    50
  )
}

// The interval reference for updating the clock
let interval_ref = null;
function clear_timers(){
  if(interval_ref != null) {
    clearInterval(interval_ref);
    interval_ref = null;
  }
}

function start_timers(){
  console.log("start timers")
  var date = new Date();
  var secs = date.getSeconds();
  var nextMinuteStart = 60 - secs;
  setTimeout(schedule_draw_clock,nextMinuteStart * 1000);
  draw_clock();
}
function schedule_draw_clock(){
  clear_timers();
  if (Bangle.isLCDOn()) {
    interval_ref = setInterval(() => {
        if (!Bangle.isLCDOn()) {
          console.log("draw clock callback - skipped redraw");
        } else {
          draw_clock();
        }
      }, DateUtils.MIN_MILLIS
    );
    draw_clock();
  } else {
    console.log("scheduleDrawClock - skipped not visible");
  }
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    console.log("lcdPower: on");
    gps_status_requires_update = true;
    time_offset = 0;
    start_timers();
  } else {
    console.log("lcdPower: off");
    clear_timers();
  }
});

Bangle.on('faceUp',function(up){
  if (up && !Bangle.isLCDOn()) {
    clear_timers();
    Bangle.setLCDPower(true);
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

start_timers();

// When button 2 is pressed we return to the
// launcher. We run through a shutdown sequence
// we shutdown the location object, which
// shut down the GPS (if running)
// we deference the location and controller to
// to free up memory before the jump is made.
function button2pressed(){
  controller = null;

  location.shutdown();
  location = null;

  Bangle.showLauncher();
}
setWatch(button2pressed, BTN2,{repeat:false,edge:"falling"});
// we are timing button 1 so we put a callback in the the rising edge.
setWatch(button1pressed, BTN1,{repeat:true,edge:"rising"});
setWatch(button3pressed, BTN3,{repeat:true,edge:"falling"});
setWatch(button4pressed, BTN4,{repeat:true,edge:"rising"});
setWatch(button5pressed, BTN5,{repeat:true,edge:"rising"});