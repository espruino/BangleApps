require("Font7x11Numeric7Seg").add(Graphics);

function draw() {
  var d = new Date();
  var size = Math.floor(g.getWidth()/(7*6));
  //var x = (g.getWidth()/2) - size*6;
  var y = (g.getHeight()/2) - size*7 - 0;
  // y variable for ':'
  var y_dop = 70 - 0;
  g.reset().clearRect(0,y,g.getWidth(),y+size*28);
  // draw hours in 24h format
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  if (d.getHours().toString.length < 2) {
    g.drawString('0'+d.getHours(), 58, y);
  }
  else {
    g.drawString(d.getHours(), 58, y);
  }
  g.setFont("7x11Numeric7Seg",size/2).setFontAlign(1,-1);
  g.drawString(":",64,y_dop);
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  // draw minutes
  g.drawString(("0"+d.getMinutes()).substr(-2),118,y);
  g.setFont("7x11Numeric7Seg",size/2).setFontAlign(1,-1);
  g.drawString(":",124,y_dop);
  // draw seconds
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  g.drawString(("0"+d.getSeconds()).substr(-2),178,y);
  // date
  g.setFont("6x8",size/2).setFontAlign(0,-1);
  // draw name of day
  g.drawString(require('locale').dow(new Date()),g.getWidth()/2, y + size*16);
  // draw date and name of month
  g.drawString(d.getDate()+' '+require('locale').month(new Date()),g.getWidth()/2, y + size*20);
  // draw year
  g.drawString((d.getFullYear()),g.getWidth()/2, y + size*24);

}
// Only update when display turns on
if (process.env.BOARD!="SMAQ3") // hack for Q3 which is always-on
Bangle.on('lcdPower', function(on) {
  if (secondInterval)
    clearInterval(secondInterval);
  secondInterval = undefined;
  if (on)
    secondInterval = setInterval(draw, 1000);
  draw();
});

g.clear();
var secondInterval = setInterval(draw, 1000);
draw();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
