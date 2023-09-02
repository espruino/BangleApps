(function(){
  Bangle.on('charging',function(charging) {
    if(charging) Bangle.buzz();
    Bangle.drawWidgets(); // re-layout widgets
    g.flip();
  });
  var batteryInterval = Bangle.isLCDOn() ? setInterval(()=>WIDGETS["bat"].draw(), 60000) : undefined;
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
  WIDGETS["bat"]={area:"tr",width:40,draw:function() {
    var s = 39;
    var x = this.x, y = this.y;
    g.reset();
    g.setColor(g.theme.fg).fillRect(x,y+2,x+s-4,y+21).clearRect(x+2,y+4,x+s-6,y+19).fillRect(x+s-3,y+10,x+s,y+14);
    var battery = E.getBattery();
    if(battery < 20) {g.setColor("#f00");}
    else if (battery < 40) {g.setColor(g.theme.dark ? "#ff0" : "#f80");}
    else {g.setColor("#0f0");}
    g.fillRect(x+4,y+6,x+4+battery*(s-12)/100,y+17);
    if (Bangle.isCharging()) {
      let hy = y+11;
      let hx = x+s/2;
      let flash = [x+5,hy, hx-4,hy-1, hx,y+6, x+s-7,y+hy,
                   hx+4,y+hy+1, hx,y+17];
      g.setColor(g.theme.fg).fillPoly(flash);
    }
  }};
})()
