(function(){
  var CHARGING = 0x07E0;

  function setWidth() {
    WIDGETS["bat"].width = 40 + (Bangle.isCharging()?16:0);
  }
  function draw() {
    var s = 39;
    var x = this.x, y = this.y;
    if (Bangle.isCharging()) {
      g.setColor(CHARGING).drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),x,y);
      x+=16;
    }
    g.setColor(-1);
    g.fillRect(x,y+2,x+s-4,y+21);
    g.clearRect(x+2,y+4,x+s-6,y+19);
    g.fillRect(x+s-3,y+10,x+s,y+14);
    g.setColor(CHARGING).fillRect(x+4,y+6,x+4+E.getBattery()*(s-12)/100,y+17);
    g.setColor(-1);
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
        batteryInterval = setInterval(()=>WIDGETS["bat"].draw(), 60000);
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
