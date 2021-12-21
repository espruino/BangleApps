require("Font7x11Numeric7Seg").add(Graphics);

function draw() {
  var d = new Date();
  //d.setHours(22);
  //d.setMinutes(22);
  //d.setMonth(2);
  var size = Math.floor(g.getWidth()/(7*6));
  var x = (g.getWidth()/2) - size*6,
    y = (g.getHeight()/2) - size*7 - 0;
  var y_dop = 70 - 0;
  g.reset().clearRect(0,y,g.getWidth(),y+size*12+8);
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  //g.drawString(d.getHours()+''+("0"+d.getMinutes()).substr(-2)+''+("0"+d.getSeconds()).substr(-2), x+size*28, y);
  if (d.getHours() == '0') {
    g.drawString('0'+d.getHours(), 58, y);
  }
  else {
    g.drawString(d.getHours(), 58, y);
  }
  //g.setFontAlign(-1,-1);
  g.setFont("7x11Numeric7Seg",size/2).setFontAlign(1,-1);
  g.drawString(":",64,y_dop);
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  g.drawString(("0"+d.getMinutes()).substr(-2),118,y);
  g.setFont("7x11Numeric7Seg",size/2).setFontAlign(1,-1);
  g.drawString(":",124,y_dop);
  // draw seconds
  g.setFont("7x11Numeric7Seg",size).setFontAlign(1,-1);
  g.drawString(("0"+d.getSeconds()).substr(-2),178,y);
  // date
  g.setFont("6x8",size/2).setFontAlign(0,-1);
  var s_date_string = d.getDate()+' '+require('locale').month(new Date());
  g.drawString(require('locale').dow(new Date()),g.getWidth()/2, y + size*16);
  g.drawString(s_date_string,g.getWidth()/2, y + size*20);
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
