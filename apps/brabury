require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x9Numeric7Seg").add(Graphics);
require("Font8x12").add(Graphics);
require("FontDylex7x13").add(Graphics);
const X = 98, Y = 46;

function draw() {
  var d = new Date();
  var h = d.getHours() % 12 || 12, m = d.getMinutes(), yyyy = d.getFullYear(), mm = d.getMonth(), dd = d.getDate();
  var time = (""+h).substr(-2) + ":" + ("0"+m).substr(-2);
  g.reset();  // Reset the state of the graphics library
  g.clear();
  g.drawImage(require("Storage").read("Tigger4.gif"));
  //TIME
  g.setFont("7x11Numeric7Seg",2);
  g.setFontAlign(1,1);
  g.setColor(0,0,1);
  g.drawString(time, 97, 53, false /*clear background*/);
  g.setColor(0,0,0);
  g.drawString(time, 96, 52, false /*clear background*/);
  //SECONDS
  g.setFont("7x11Numeric7Seg",1);
  //g.setFont("5x9Numeric7Seg");
  g.setFontAlign(-1,1); // align right bottom
  g.setColor(0,0,1);
  g.drawString(("0"+d.getSeconds()).substr(-2), 100, 42, 0);
  g.setColor(0,0,0);
  g.drawString(("0"+d.getSeconds()).substr(-2), 99, 41, 0);
  //DATE
  g.setFont("5x9Numeric7Seg",1);
  g.setFontAlign(1,1);
  g.setColor(0,0,1);
  g.drawString(yyyy+" "+("0"+mm)+" "+dd, 100, 65, 0);
  g.setColor(0,0,0);
  g.drawString(yyyy+" "+("0"+mm)+" "+dd, 99, 64, 0);
  //BATTERY
  g.setColor(0,0,1);
  g.drawString(E.getBattery(), 137, 53, 0);
  g.setColor(0,0,0);
  g.drawString(E.getBattery(), 136, 52, 0);
  //STEPS
  g.setColor(0,0,1);
  g.drawString(Bangle.getHealthStatus("day").steps, 137, 65, 0);
  g.setColor(0,0,0);
  g.drawString(Bangle.getHealthStatus("day").steps, 136, 64, 0);
  //WEEK DAY
  g.setFont("8x12");
  g.setColor(0,0,1);
  if (d.getDay()==0) {
   g.drawString("Su", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("Su", 136, 42, 0); 
  } else if (d.getDay()==1) {
    g.drawString("M", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("M", 136, 42, 0);
  } else if (d.getDay()==2) {
    g.drawString("Tu", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("Tu", 136, 42, 0);
  } else if (d.getDay()==3) {
    g.drawString("W", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("W", 136, 42, 0);
  } else if (d.getDay()==4) {
    g.setFont("Dylex7x13");
    g.drawString("Th", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("Th", 136, 42, 0);
  } else if (d.getDay()==5) {
    g.drawString("F", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("F", 136, 42, 0);
  } else {
    g.drawString("Sa", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("Sa", 136, 42, 0);
  }
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
//Bangle.loadWidgets();
//Bangle.drawWidgets();
