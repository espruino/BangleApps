{
  Bangle.on('charging',function(charging) {
    if(charging) Bangle.buzz();
    WIDGETS["bat"].draw();
    g.flip();
  });
  let batteryInterval = Bangle.isLCDOn() ? setInterval(()=>WIDGETS["bat"].draw(), 60000) : undefined;
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
    var x = this.x, y = this.y;
    g.reset().setColor(g.theme.fg).fillRect(x,y+2,x+35,y+21).clearRect(x+2,y+4,x+33,y+19).fillRect(x+36,y+10,x+39,y+14);
    var battery = E.getBattery();
    if(battery < 20) g.setColor("#f00");
    else if (battery < 40) g.setColor(g.theme.dark ? "#ff0" : "#f80");
    else g.setColor("#0f0");
    g.fillRect(x+4,y+6,x+4+battery*27/100,y+17);
    if (Bangle.isCharging()) 
      g.reset().drawImage(atob("FAqBAAHAAA8AAPwAB/D4f8P+Hw/gAD8AAPAAA4A="),x+8,y+7);
  }};
}
