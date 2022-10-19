// Henkinen
//
// Bangle.js 2 breathing helper
// by Jukio Kallio
// www.jukiokallio.com

// settings
const breath = { 
  theme: "default", 
  x:0, y:0, w:0, h:0, 
  size: 60,
  
  bgcolor: {r: 1, g: 0.6, b: 0.3},
  incolor: {r: 1, g: 0.8, b: 0.5},
  keepcolor: {r: 1, g: 0.8, b: 0.5},
  outcolor: {r: 1, g: 0.8, b: 0.5},
  
  font: "Vector", fontsize: 14, 
  textcolor: {r: 1, g: 1, b: 1},
  texty: 16,
  
  in: 4000,
  keep: 7000,
  out: 8000
};

// set some additional settings
breath.w = g.getWidth(); // size of the background
breath.h = g.getHeight();
breath.x = breath.w * 0.5; // position of the circles
breath.y = breath.h * 0.45;
breath.texty = breath.y + breath.size + breath.texty; // text position

var wait = 100; // wait time, normally a minute
var time = 0; // for time keeping


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
  
  // update current time
  time += wait - (Date.now() % wait);
  if (time > breath.in + breath.keep + breath.out) time = 0; // reset time

  // Reset the state of the graphics library
  g.reset();
  
  // Clear the area where we want to draw the time
  g.setColor(breath.bgcolor.r, breath.bgcolor.g, breath.bgcolor.b);
  g.fillRect(0, 0, breath.w, breath.h);
  
  // calculate circle size
  var circle = 0;
  if (time < breath.in) {
    // breath in
    circle = time / breath.in;
    g.setColor(breath.incolor.r, breath.incolor.g, breath.incolor.b);
    
  } else if (time < breath.in + breath.keep) {
    // keep breath
    circle = 1;
    g.setColor(breath.keepcolor.r, breath.keepcolor.g, breath.keepcolor.b);
    
  } else if (time < breath.in + breath.keep + breath.out) {
    // breath out
    circle = ((breath.in + breath.keep + breath.out) - time) / breath.out;
    g.setColor(breath.outcolor.r, breath.outcolor.g, breath.outcolor.b);
    
  }
  
  // draw breath circle
  g.fillCircle(breath.x, breath.y, breath.size * circle);
  
  // breath area
  g.setColor(breath.textcolor.r, breath.textcolor.g, breath.textcolor.b);
  g.drawCircle(breath.x, breath.y, breath.size);
  
  // draw text
  g.setFontAlign(0,0).setFont(breath.font, breath.fontsize).setColor(breath.textcolor.r, breath.textcolor.g, breath.textcolor.b);
  
  if (time < breath.in) {
    // breath in
    g.drawString("Breath in", breath.x, breath.texty);
    
  } else if (time < breath.in + breath.keep) {
    // keep breath
    g.drawString("Keep it in", breath.x, breath.texty);
    
  } else if (time < breath.in + breath.keep + breath.out) {
    // breath out
    g.drawString("Breath out", breath.x, breath.texty);
    
  }
  
  // queue draw
  queueDraw();
}


// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();


// keep LCD on
Bangle.setLCDPower(1);

// Show launcher when middle button pressed
Bangle.setUI("clock");
