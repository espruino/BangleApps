(function(){
  let COLORS = {
    'white':    g.theme.dark ? "#000" : "#fff",
    'black':    g.theme.dark ? "#fff" : "#000",
    'charging': "#08f",
    'high':     g.theme.dark ? "#fff" : "#000",
    'low':      "#f00",
  };

  const levelColor = (l) => {
    if (Bangle.isCharging()) return COLORS.charging;
    if (l >= 30) return COLORS.high;
    return COLORS.low;
  };

  function draw() {
    var s = 29;
    var x = this.x, y = this.y;

    const l = E.getBattery();

    let xl = x+4+l*(s-12)/100;

    g.setColor(COLORS.white);
    g.fillRect(x+2,y+5,x+s-6,y+18);

    g.setColor(levelColor(l));
    g.fillRect(x+1,y+3,x+s-5,y+4);
    g.fillRect(x+1,y+19,x+s-5,y+20);
    g.fillRect(x,y+4,x+1,y+19);
    g.fillRect(x+s-5,y+4,x+s-4,y+19);
    g.fillRect(x+s-3,y+8,x+s-2,y+16); // tip of the battery
    g.fillRect(x+4,y+15,xl,y+16); // charging bar

    g.setColor(COLORS.black);
    g.setFontAlign(0,0);
    g.setFont('6x8');
    g.drawString(l, x + 14, y + 10);
  }

  Bangle.on('charging',function(charging) { draw(); });
  setInterval(()=>WIDGETS["wid_a_battery_widget"].draw(), 60000);

  WIDGETS["wid_a_battery_widget"]={area:"tr",width:30,draw:draw};
})();
