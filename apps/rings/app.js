// Rings watch face
// for Bangle.js 2 
// by Amos Blanton
// Remixed from / inspired by Rinkulainen watch face by Jukio Kallio
// 2023: pinq- added new futures

// To Do:
// Make Month / year text buffer 1/2 size
// Optimize text positioning transforms 

const watch = {
  color:"#000000", 
  dateRing : { size:109, weight:20, color:"#00FF00", numbers: false, range: 30 },
  hourRing : { size:82, weight:20, color:"#00FFFF", numbers: false, range: 12},
  minuteRing : { size:55, weight:18, color:"#FFFF00", numbers: false, range: 60},
  batteryRing: { size :30, weight:10, color:"#ff3300", numbers: false, range: 100},
  screen : { width:g.getWidth(), height:g.getHeight(), centerX: g.getWidth() *0.5, centerY: g.getHeight() * 0.5, cursor: 14, font:"Vector:18", bubble:false },
};

var settings = require('Storage').readJSON("rings.settings.json", true) || {};

if(settings.minute){
  watch.minuteRing.numbers = settings.minute.numbers;
  watch.hourRing.numbers = settings.hour.numbers;
  watch.dateRing.numbers = settings.date.numbers;
  watch.screen.bubble = settings.bubble;
}
delete settings;
const month= ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY",
            "AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

var wait = 60000; // wait time, normally a minute
// timeout used to update every minute
var drawTimeout;
// Global for use in shrink / unshrink animations
var counter = 1;

// Buffer for month circle text, 1/2 screen size (will be scaled up)
var monthCircleTextBuffer= Graphics.createArrayBuffer(watch.screen.width,watch.screen.height,1,{msb:true});
var monthCircleTextImg = monthCircleTextBuffer.asImage();
monthCircleTextImg.transparent = 1;
var lastMonthCircleImageText = "";

// Calculate number of days in this month / year for date ring
const getDays = (year, thisMonth) => {
    return new Date(year, thisMonth, 0).getDate(); // getMonth() Jan = 0.
};

// Schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, wait - (Date.now() % wait));
}

// Draws a circles (date, hours, minutes)
function drawCircle(ringValues, offset, value ) {  
  // variables for vertex transformations and positioning time
  let tver, tobj, tran;
  let ttime = (value / ringValues.range) * (Math.PI * 2);

  // draw circle
  g.setColor(ringValues.color).fillCircle(watch.screen.centerX, watch.screen.centerY, ringValues.size + offset);
  g.setColor("#000000").fillCircle(watch.screen.centerX, watch.screen.centerY, ringValues.size - ringValues.weight + offset);

  tobj = { x:watch.screen.centerX, y:watch.screen.centerY, scale:1, rotate:ttime };
  if(watch.screen.bubble){
    tver = [-1, 0, 1, 0, 1, -ringValues.size-offset, -1, -(ringValues.size + offset -21)];
    tran = g.transformVertices(tver, tobj);
    if(ringValues.numbers){
      g.setColor("#000000").fillCircle((tran[4]+tran[6]) / 2 , (tran[5]+tran[7]) / 2, 17 + offset/10);
    }else{
      g.setColor("#000000").fillCircle((tran[4]+tran[6]) / 2 , (tran[5]+tran[7]) / 2, 10 + offset/10);
    }
  }else{
    if(ringValues.numbers){
      tver = [-watch.screen.cursor, 0, watch.screen.cursor, 0, watch.screen.cursor, -ringValues.size*1.01 - offset, -watch.screen.cursor, -ringValues.size*1.05 - offset];
    }else{
      tver = [-watch.screen.cursor * 0.4, 0, watch.screen.cursor * 0.4, 0, watch.screen.cursor *0.4, -ringValues.size*1.01 - offset, -watch.screen.cursor*0.4, -ringValues.size*1.05 - offset];
    }
    tran = g.transformVertices(tver, tobj);
    g.fillPoly(tran);
  
  }

  // Draw numbers
  if(ringValues.numbers){
  // size - 21 is the right offset to get the numbers aligned in the circle.
    tver = [-1, 0, 1, 0, 1, -ringValues.size-offset, -1, -(ringValues.size + offset -21)];
    tran = g.transformVertices(tver, tobj);
    //g.setColor(1,1,1);
    g.setFontAlign(0,0).setFont(watch.screen.font, 2).setColor(1,1,1);
    g.drawString(value, (tran[4]+tran[6]) / 2 , (tran[5]+tran[7]) / 2 );
  
  }
  
  
}

// For battery disable 
function drawArc(percent, color, ArchR) {
  let offset = 0;
  let end = 360;
  let radius = ArchR + 2;

  if (percent <= 0) return; // no gauge needed
  if (percent > 1) percent = 1;

  let startRotation = -offset;
  let endRotation = startRotation - (end * percent);

  g.setColor(color);
  // convert to radians
  startRotation *= Math.PI / 180;
  let amt = Math.PI / 10;
  endRotation = (endRotation * Math.PI / 180) - amt;
  // all we need to draw is an arc, because we'll fill the center
  let poly = [watch.screen.centerX, watch.screen.centerY];
  for (let r = startRotation; r > endRotation; r -= amt)
    poly.push(
      watch.screen.centerX - radius * Math.sin(r),
      watch.screen.centerY - radius * Math.cos(r)
    );
  g.fillPoly(poly);
  g.setColor("#000000").fillCircle(watch.screen.centerX, watch.screen.centerY, ArchR - 10);
  g.setColor(color).fillCircle(watch.screen.centerX - (radius -5) * Math.sin(endRotation + amt),  watch.screen.centerY - (radius -5) * Math.cos(endRotation + amt), 4);
}

// Draws text for month and year in date circle
function drawMonthCircleText( text, circleSize, range, value){

  // If the text isn't the same as last time, write it into a graphic object.
  if(text != lastMonthCircleImageText){

    monthCircleTextBuffer.clear();
    monthCircleTextBuffer.fillRect(0,0,watch.screen.width,watch.screen.height);
    var tver, tobj, tran;
    

    // From here: https://forum.espruino.com/comments/16781795/
    var gr = Graphics.createArrayBuffer(24,16,1,{msb:true});
    var grimg = gr.asImage();
    grimg.transparent = 1;  
    monthCircleTextBuffer.setColor(1,1,1);

    for(let z=0; z < text.length; z++){
      tobj = { x:watch.screen.centerX, y:watch.screen.centerY, scale:1, rotate: ((z + 1) / range) * (Math.PI * 2) };
      tver = [-1, 0, 1, 0, 1, -circleSize, -1, -(circleSize -21)];
      tran = monthCircleTextBuffer.transformVertices(tver, tobj);
      gr.clear().setColor(1,1,1).fillRect(0,0,24,16).setColor(0,0,0).setFont(watch.screen.font).setFontAlign(0,0).drawString(text[z],12,8);

      monthCircleTextBuffer.drawImage(grimg,
      (tran[4]+tran[6]) / 2,
      (tran[5]+tran[7]) / 2,
                  {rotate:((z+1) / range) * (Math.PI * 2) });
      }

    lastMonthCircleImageText = text;
    }
  
  // Determine correct rotation for text in ring ( opposite the date position )
  var offset = value + (range / 2) - (text.length / 2);
  if(offset > range)
    offset = offset - range;  
  var rotation = (offset / range) * (Math.PI * 2);     
  
  // Draw the image of text to the screen at that rotation
  g.drawImage(monthCircleTextImg, watch.screen.centerX, watch.screen.centerY, {scale:1, rotate:rotation });

}

// Animate by shrinking or expanding circles 
function shrinkCircles(toggle){   
  // If there's a queued draw operation,removeit so animation isn't interrupted.
  if (drawTimeout) clearTimeout(drawTimeout);
  var date = new Date();
  var delta = 1;
  
  if(counter > 12)    
  {
    counter = 1;
    // We're finished, so queue next draw.
    queueDraw();
    if(!toggle) drawArc(E.getBattery() / 100, watch.batteryRing.color, watch.batteryRing.size);
    return;
  } 
  
  if(toggle) // We are shrinking
     delta = counter * 2 * -1;
  else // We are expanding
    delta = counter *2 - 24;
  
  // Clear space on screen.
  g.setColor(watch.color);
  g.fillRect(0, 0, watch.screen.width, watch.screen.height);
  
  // Draw the date ring (unless it's the last run of an expansion).
  if(counter < 11 || toggle){

     drawCircle(watch.dateRing, delta, date.getDate()); 
    // Draw month and year in date ring
    drawMonthCircleText( date.getDate() + " " + month[date.getMonth()] + " " +date.getFullYear(), watch.dateRing.size - 24, getDays(date.getFullYear(), date.getMonth()+1), date.getDate()) ;
  }
  
  drawCircle(watch.hourRing, delta, date.getHours()); 
  drawCircle(watch.minuteRing, delta, date.getMinutes()); 
  
  counter += 1;
  setTimeout(shrinkCircles, 10, toggle);
}


// main draw function
function draw() {
  // make date object
  var date = new Date();
  var unLockedOffset = 0;

  // Reset the state of the graphics library
  g.reset();
  
  // Clear the area where we want to draw the time
  g.setColor(watch.color);
  g.fillRect(0, 0, watch.screen.width, watch.screen.height);
    
  // If unlocked, draw date ring and text and make hour and minute rings smaller
  var days_month = getDays(date.getFullYear(), date.getMonth()+1);
  if(!Bangle.isLocked()){
    unLockedOffset = 24;
    // if the day has changed
    if(watch.dateRing.range != days_month) watch.dateRing.range = days_month;
    drawCircle(watch.dateRing, -unLockedOffset, date.getDate());
    drawMonthCircleText( date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear(), watch.dateRing.size - 24, getDays(date.getFullYear(), date.getMonth()+1), date.getDate());
  }
  drawCircle(watch.hourRing, -unLockedOffset, date.getHours());
  drawCircle(watch.minuteRing, -unLockedOffset, date.getMinutes());
  if(Bangle.isLocked()){
    drawArc(E.getBattery() / 100, watch.batteryRing.color, watch.batteryRing.size);
  }
  queueDraw();
}

//drawArc(E.getBattery() / 100, watch.batteryRing.color, watch.batteryRing.size); Trigger shrink / expand animation on unlock / lock events 
Bangle.on('lock', on=>{
  if (on) { // locked, expand circles
      counter = 1;
      shrinkCircles(false);
    } else 
    { // unlocked, shrink circles and show date ring
      counter = 1;
      shrinkCircles(true);
    }
});


// End function definitions / start of initial execution.

// Clear the screen once, at startup
g.clear();

// draw immediately at first
draw();


// .log("Whatevs");

// Show launcher when middle button pressed
Bangle.setUI("clock");