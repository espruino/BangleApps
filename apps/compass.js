g.clear();
g.setColor(0,0.5,1);
g.fillCircle(120,130,80,80);
g.setColor(0,0,0);
g.fillCircle(120,130,70,70);

function arrow(r,c) {
  r=r*Math.PI/180;
  var p = Math.PI/2;
  g.setColor(c);
  g.fillPoly([
    120+60*Math.sin(r), 130-60*Math.cos(r),
    120+10*Math.sin(r+p), 130-10*Math.cos(r+p),
    120+10*Math.sin(r+-p), 130-10*Math.cos(r-p),
    ]);
}

var oldHeading = 0;
Bangle.on('mag', function(m) {
  if (!Bangle.isLCDOn()) return;
  g.setFont("6x8",3);
  g.setColor(0);
  g.fillRect(70,0,170,24);
  g.setColor(0xffff);
  g.setFontAlign(0,0);
  g.drawString(isNaN(m.heading)?"---":Math.round(m.heading),120,12);
  g.setColor(0,0,0);
  arrow(oldHeading,0);
  arrow(oldHeading+180,0);
  arrow(m.heading,0xF800);
  arrow(m.heading+180,0x001F);
  oldHeading = m.heading;
});
Bangle.setCompassPower(1);
