var img = require("heatshrink").decompress(atob("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"));

var hour_hand = {
  width : 61, height : 8, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////////////w=="))
};
var minute_hand = {
  width : 110, height : 4, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////w=="))
};

//g.fillRect(0,24,239,239); // Apps area
let intervalRef = null;
const p180 = Math.PI/180;
const clock_center = {x:Math.floor((g.getWidth()-1)/2), y:24+Math.floor((g.getHeight()-25)/2)};
// ={ x: 119, y: 131 }
const radius = Math.floor((g.getWidth()-24+1)/2); // =108

let tick0 = Graphics.createArrayBuffer(30,8,1,{msb:true});
tick0.fillRect(0,0,tick0.getWidth()-1, tick0.getHeight()-1);
let tick5 = Graphics.createArrayBuffer(20,6,1,{msb:true});
tick5.fillRect(0,0,tick5.getWidth()-1, tick5.getHeight()-1);
let tick1 = Graphics.createArrayBuffer(8,4,1,{msb:true});
tick1.fillRect(0,0,tick1.getWidth()-1, tick1.getHeight()-1);

// Adjust hand lengths to be within 'tick' points
minute_hand.width=radius-tick1.getWidth()-6;
hour_hand.width=radius-tick5.getWidth()-6;

function big_wheel_x(angle){
  return clock_center.x + radius * Math.cos(angle*p180);
}
function big_wheel_y(angle){
  return clock_center.y + radius * Math.sin(angle*p180);
}
function rotate_around_x(center_x, angle, tick){
  return center_x + Math.cos(angle*p180) * tick.getWidth()/2;
}
function rotate_around_y(center_y, angle, tick){
  return center_y + Math.sin(angle*p180) * tick.getWidth()/2;
}
function hour_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * hour_hand.width/2;
}
function hour_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * hour_hand.width/2;
}
function minute_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * minute_hand.width/2;
}
function minute_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * minute_hand.width/2;
}
function minute_angle(date){
  //let minutes = date.getMinutes() + date.getSeconds()/60;
  let minutes = date.getMinutes();
  return 6*minutes - 90;
}
function hour_angle(date){
  let hours= date.getHours() + date.getMinutes()/60;
  return 30*hours - 90;
}

function draw_clock(){
  //console.log("draw_clock");
  let date = new Date();
  g.reset();
  g.clearRect(0,24,239,239); // clear app area

  g.drawImage(img, 12, 24);
  
  // draw cross lines for testing
  // g.setColor(1,0,0);
  // g.drawLine(clock_center.x - radius, clock_center.y, clock_center.x + radius, clock_center.y);
  // g.drawLine(clock_center.x, clock_center.y - radius, clock_center.x, clock_center.y + radius);

  g.setColor(g.theme.dark ? g.theme.bg : g.theme.fg);
  let ticks = [0, 90, 180, 270];
  ticks.forEach((item)=>{
    let agl = item+180;
    g.drawImage(tick0.asImage(), rotate_around_x(big_wheel_x(item), agl, tick0), rotate_around_y(big_wheel_y(item), agl, tick0), {rotate:agl*p180});
  });
  ticks = [30, 60, 120, 150, 210, 240, 300, 330];
  ticks.forEach((item)=>{
    let agl = item+180;
    g.drawImage(tick5.asImage(), rotate_around_x(big_wheel_x(item), agl, tick5), rotate_around_y(big_wheel_y(item), agl, tick5), {rotate:agl*p180});
  });

  let hour_agl = hour_angle(date);
  let minute_agl = minute_angle(date);
  g.drawImage(hour_hand, hour_pos_x(hour_agl), hour_pos_y(hour_agl), {rotate:hour_agl*p180}); //
  g.drawImage(minute_hand, minute_pos_x(minute_agl), minute_pos_y(minute_agl), {rotate:minute_agl*p180}); //
  g.setColor(g.theme.dark ? g.theme.bg : g.theme.fg);
  g.fillCircle(clock_center.x, clock_center.y, 6);
  g.setColor(g.theme.dark ? g.theme.fg : g.theme.bg);
  g.fillCircle(clock_center.x, clock_center.y, 3);

  // draw minute ticks. Takes long time to draw!
  g.setColor(g.theme.dark ? g.theme.bg : g.theme.fg);
  for (var i=0; i<60; i++){
    let agl = i*6+180;
    g.drawImage(tick1.asImage(), rotate_around_x(big_wheel_x(i*6), agl, tick1), rotate_around_y(big_wheel_y(i*6), agl, tick1), {rotate:agl*p180});
  }

  g.flip();
  //console.log(date);
}
function clearTimers(){
  //console.log("clearTimers");
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    //console.log("interval is cleared");
  }
}
function startTimers(){
  //console.log("startTimers");
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 60*1000);
  //console.log("interval is set");
  draw_clock();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    //console.log("lcdPower: on");
    Bangle.drawWidgets();
    startTimers();
  } else {
    //console.log("lcdPower: off");
    clearTimers();
  }
});
g.clear();


// Show launcher when button pressed
Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();
startTimers();
