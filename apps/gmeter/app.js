g.clear();
g.setFont("6x8",5);g.setFontAlign(-1,0);
Bangle.on('accel',function(accelData) {
  g.drawString(" "+accelData.mag.toFixed(1)+" ",75,105,true);
  g.drawString('G\'s',75,180,true);
});
