// Rings watch face
// for Bangle.js 2 
// by Amos Blanton
// Remixed from / inspired by Rinkulainen watch face by Jukio Kallio

// To Do:
// Make Month / year text buffer 1/2 size
// Optimize text positioning transforms 

const watch = { 
  x:0, y:0, w:0, h:0, 
  color:"#000000", 
  dateRing : { size:109, weight:20, color:"#00FF00", cursor:14, numbers: true },
  hourRing : { size:85, weight:20, color:"#00FFFF", cursor:14, numbers: true },
  minuteRing : { size:61, weight:20, color:"#FFFF00", cursor:14, numbers: true },
  screen : { width:g.getWidth(), height:g.getHeight(), centerX: g.getWidth() *0.5, centerY: g.getHeight() * 0.5, cursor: 14, font:"6x8:2" },
};

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

// Draws a time circle (date, hours, minutes)
function drawTimeCircle(color, size, weight, range, value ) {  
  // variables for vertex transformations and positioning time
  var tver, tobj, tran;
  var ttime = (value / range) * (Math.PI * 2);

  // draw circle and line
  g.setColor(color).fillCircle(watch.screen.centerX, watch.screen.centerY, size);
  g.setColor("#000000").fillCircle(watch.screen.centerX, watch.screen.centerY, size - weight);

  tver = [-watch.screen.cursor, 0, watch.screen.cursor, 0, watch.screen.cursor, -size*1.01, -watch.screen.cursor, -size*1.05];

  tobj = { x:watch.screen.centerX, y:watch.screen.centerY, scale:1, rotate:ttime };
  tran = g.transformVertices(tver, tobj);
  g.fillPoly(tran);
    
  // Draw numbers
  g.setFontAlign(0,0).setFont(watch.screen.font, 2).setColor(1,1,1);
  
  // size - 21 is the right offset to get the numbers aligned in the circle.
  tver = [-1, 0, 1, 0, 1, -size, -1, -(size -21)];
  tran = g.transformVertices(tver, tobj);
  g.setColor(1,1,1);
  g.drawString(value, (tran[4]+tran[6]) / 2 , (tran[5]+tran[7]) / 2 ); 
  
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
    monthCircleTextBuffer.setColor(0,0,0);

    for(z=0; z < text.length; z++){      
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
    drawTimeCircle(watch.dateRing.color, watch.dateRing.size + delta, watch.dateRing.weight, getDays(date.getFullYear(), date.getMonth()+1), date.getDate() );
    // Draw month and year in date ring
    drawMonthCircleText( month[date.getMonth()]+" "+date.getFullYear(), watch.dateRing.size - 24, getDays(date.getFullYear(), date.getMonth()+1), date.getDate()) ;
  }
  
  drawTimeCircle(watch.hourRing.color, watch.hourRing.size + delta, watch.hourRing.weight, 12, date.getHours() );
    
  drawTimeCircle(watch.minuteRing.color, watch.minuteRing.size + delta, watch.minuteRing.weight, 60, date.getMinutes() );
  
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
  if(!Bangle.isLocked()){
    unLockedOffset = 24;
    drawTimeCircle(watch.dateRing.color, watch.dateRing.size - unLockedOffset, watch.dateRing.weight, getDays(date.getFullYear(), date.getMonth()+1), date.getDate() );
    drawMonthCircleText( month[date.getMonth()]+" "+date.getFullYear(), watch.dateRing.size - unLockedOffset, getDays(date.getFullYear(), date.getMonth()+1), date.getDate()) ;
  }
  
  drawTimeCircle(watch.hourRing.color, watch.hourRing.size - unLockedOffset, watch.hourRing.weight, 12, date.getHours() );
  drawTimeCircle(watch.minuteRing.color, watch.minuteRing.size -unLockedOffset , watch.minuteRing.weight, 60, date.getMinutes() );

  queueDraw();
}

// Trigger shrink / expand animation on unlock / lock events 
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


// console.log("Whatevs");

// Show launcher when middle button pressed
Bangle.setUI("clock");