// Pisteinen
//
// Bangle.js 2 watch face
// by Jukio Kallio
// www.jukiokallio.com


// settings
const watch = {  
  x:0, y:0, w:0, h:0, 
  bgcolor:g.theme.bg, 
  fgcolor:g.theme.fg, 
};

// set some additional settings
watch.w = g.getWidth(); // size of the background
watch.h = g.getHeight();
watch.x = watch.w * 0.5; // position of the circles
watch.y = watch.h * 0.5;

var wait = 60000; // wait time, normally a minute


// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, wait - (Date.now() % wait));
}


// main function
function draw() {
  // make date object
  var date = new Date();

  // Reset the state of the graphics library
  g.reset();
  
  // Clear the area where we want to draw the time
  g.setColor(watch.bgcolor);
  g.fillRect(0, 0, watch.w, watch.h);
  
  // setup watch face
  const hball = {
    size: 9,
    pad: 9,
  };
  const mball = {
    size: 3,
    pad: 4,
    pad2: 2, 
  };
  
  // get hours and minutes
  var hour = date.getHours();
  var minute = date.getMinutes();
  
  // calculate size of the hour face
  var hfacew = (hball.size * 2 + hball.pad) * 6 - hball.pad;
  var hfaceh = (hball.size * 2 + hball.pad) * 4 - hball.pad;
  var mfacew = (mball.size * 2 + mball.pad) * 15 - mball.pad + mball.pad2 * 2;
  var mfaceh = (mball.size * 2 + mball.pad) * 4 - mball.pad;
  var faceh = hfaceh + mfaceh + hball.pad + mball.pad;
  
  g.setColor(watch.fgcolor); // set foreground color
  
  // draw hour balls
  for (var i = 0; i < 24; i++) {
    var x = ((hball.size * 2 + hball.pad) * (i % 6)) + (watch.x - hfacew / 2) + hball.size;
    var y = watch.y - faceh / 2 + hball.size;
    if (i >= 6) y += hball.size * 2 + hball.pad;
    if (i >= 12) y += hball.size * 2 + hball.pad;
    if (i >= 18) y += hball.size * 2 + hball.pad;
    
    if (i < hour) g.fillCircle(x, y, hball.size); else g.drawCircle(x, y, hball.size);
  }
  
  // draw minute balls
  for (var j = 0; j < 60; j++) {
    var x2 = ((mball.size * 2 + mball.pad) * (j % 15)) + (watch.x - mfacew / 2) + mball.size;
    if (j % 15 >= 5) x2 += mball.pad2;
    if (j % 15 >= 10) x2 += mball.pad2;
    var y2 = watch.y - faceh / 2 + hfaceh + mball.size + hball.pad + mball.pad;
    if (j >= 15) y2 += mball.size * 2 + mball.pad;
    if (j >= 30) y2 += mball.size * 2 + mball.pad;
    if (j >= 45) y2 += mball.size * 2 + mball.pad;
    
    if (j < minute) g.fillCircle(x2, y2, mball.size); else g.drawCircle(x2, y2, mball.size);
  }
  
  
  // queue draw
  queueDraw();
}


// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();


// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});


// Show launcher when middle button pressed
Bangle.setUI("clock");
