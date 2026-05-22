WIDGETS["bat"]={area:"tr",width:40,draw() {
  var x = this.x, y = this.y;
  g.reset("widget").setColor(g.theme.fg).fillRect(x,y+2,x+35,y+21).clearRect(x+2,y+4,x+33,y+19).fillRect(x+36,y+10,x+39,y+14);
  var battery = E.getBattery();
  if(battery < 20) g.setBgColor("#f00"); 
  else if (battery < 40) g.setBgColor(g.theme.dark ? "#ff0" : "#f80");
  else g.setBgColor("#0f0");
  g.clearRect(x+4,y+6,x+4+battery*27/100,y+17);
  if (Bangle.isCharging())
    g.reset("widget").drawImage(atob("FAqBAAHAAA8AAPwAB/D4f8P+Hw/gAD8AAPAAA4A="),x+8,y+7);
}, remove() {
  Bangle.removeListener('charging', WIDGETS["bat"].onCharging);
  clearInterval(WIDGETS["bat"].interval);
  delete WIDGETS["bat"];
}, onCharging(charging) {
  WIDGETS["bat"].draw();
  g.flip();
}, interval : setInterval(()=>WIDGETS["bat"].draw(), 60000)};
Bangle.on('charging', WIDGETS["bat"].onCharging);