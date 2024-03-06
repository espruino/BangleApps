require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x9Numeric7Seg").add(Graphics);
require("Font8x12").add(Graphics);
require("FontDylex7x13").add(Graphics);
//const X = 98, Y = 46;
var wizible = 0;

function getImg() {
  return require("heatshrink").decompress(atob("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"));
}

function draw() {
  var d = new Date();
  var h = d.getHours() % 12 || 12, m = d.getMinutes(), yyyy = d.getFullYear(), mm = d.getMonth(), dd = d.getDate();
  var time = (""+h).substr(-2) + ":" + ("0"+m).substr(-2);
  g.reset();  // Reset the state of the graphics library
  g.clear();
  g.drawImage(getImg()); //load bg image
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
   g.drawString("SU", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("SU", 136, 42, 0); 
  } else if (d.getDay()==1) {
    g.drawString("MO", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("MO", 136, 42, 0);
  } else if (d.getDay()==2) {
    g.drawString("TU", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("TU", 136, 42, 0);
  } else if (d.getDay()==3) {
    g.drawString("WE", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("WE", 136, 42, 0);
  } else if (d.getDay()==4) {
    g.setFont("Dylex7x13");
    g.drawString("TH", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("TH", 136, 42, 0);
  } else if (d.getDay()==5) {
    g.drawString("FR", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("FR", 136, 42, 0);
  } else {
    g.drawString("SA", 137, 43, 0);
    g.setColor(0,0,0);
    g.drawString("SA", 136, 42, 0);
  }
  if(wizible==1){
     Bangle.drawWidgets();
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

//Toggle Widgets
Bangle.loadWidgets();
Bangle.on('touch', function(button) {
  if(wizible==0){
    wizible=1;
  }
  else if(wizible==1){
    wizible=0;
  }
});
