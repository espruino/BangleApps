(function(){
const levelColor = (l) => {
  if (Bangle.isCharging()) return 0x07E0; // "Green"
  if (l >= 50) return 0x05E0; // slightly darker green
  if (l >= 15) return 0xFD20; // "Orange"
  return 0xF800; // "Red"
}

function setWidth() {
  WIDGETS["bat"].width = 40 + (Bangle.isCharging()?16:0);
}
function draw() {
  var s = 39;
  var x = this.x, y = this.y;
  const l = E.getBattery(), c = levelColor(l);
  if (Bangle.isCharging()) {
    g.setColor(c).drawImage(atob(
      "DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),x,y);
    x+=16;
  }
  g.setColor(-1);
  g.fillRect(x,y+2,x+s-4,y+21);
  g.clearRect(x+2,y+4,x+s-6,y+19);
  g.fillRect(x+s-3,y+10,x+s,y+14);
  g.setColor(c).fillRect(x+4,y+6,x+4+l*(s-12)/100,y+17);
  g.setColor(-1);
  g.setFontAlign(-1,-1);
  if (l >= 100) {
    g.setFont('4x6', 2);
    g.drawString(l, x + 6, y + 7);
  } else {
    if (l < 10) x+=6;
    g.setFont('6x8', 2);
    g.drawString(l, x + 6, y + 4);
  }
}
Bangle.on('charging',function(charging) {
  if(charging) Bangle.buzz();
  setWidth();
  Bangle.drawWidgets(); // relayout widgets
  g.flip();
});
var batteryInterval;
Bangle.on('lcdPower', function(on) {
  if (on) {
   WIDGETS["bat"].draw();
   // refresh once a minute if LCD on
   if (!batteryInterval)
     batteryInterval = setInterval(draw, 60000);
 } else {
   if (batteryInterval) {
     clearInterval(batteryInterval);
     batteryInterval = undefined;
   }
 }
});
WIDGETS["bat"]={area:"tr",width:40,draw:draw};
setWidth();
})()
